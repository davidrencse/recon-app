import { supabaseServer } from "@/lib/supabase/server";
import { normalizeCategory } from "./normalize";
import { extractPlaceName } from "./places";
import { setCachedPlace } from "./cachedPlaces";
import { isInsideMetroVancouver } from "./geo";
import { calculateExpiry } from "./expiry";
import { validateUrl, validateText, validateSource } from "./validation";
import { isPostProcessed, recordProcessedPost } from "./processedPosts";
import { logPinEvent } from "./pinAuditLog";
import { startIngestionJob, finishIngestionJob, failIngestionJob } from "./ingestionJobs";
import { geocodePlace } from "./geocoder";
import type { IngestBatch, IngestPost, PostRejection, BatchSummary } from "@/types/ingest";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_SOURCES  = ["x"] as const;
const VALID_REGIONS  = ["metro_vancouver"] as const;
const MAX_PER_CATEGORY = 50;

// ─── Rejection reasons ────────────────────────────────────────────────────────

const R = {
  MISSING_FIELDS:   "rejected_missing_fields",
  INVALID_CATEGORY: "rejected_invalid_category",
  OVER_LIMIT:       "rejected_over_limit",
  NO_PLACE:         "rejected_no_place",
  BAD_GEOCODE:      "rejected_bad_geocode",
  INSERT_FAILED:    "rejected_insert_failed",
} as const;

// ─── Batch-level validation ───────────────────────────────────────────────────

export type BatchValidation =
  | { valid: true; batch: IngestBatch }
  | { valid: false; error: string };

export function validateIngestBatch(body: unknown): BatchValidation {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  // f19/f20: source
  const sourceErr = validateSource(typeof b.source === "string" ? b.source : "");
  if (sourceErr) return { valid: false, error: `source: ${sourceErr}` };
  if (!(VALID_SOURCES as readonly string[]).includes(b.source as string)) {
    return { valid: false, error: `source: unsupported value "${b.source}". Accepted: ${VALID_SOURCES.join(", ")}` };
  }

  if (!b.run_id || typeof b.run_id !== "string" || !b.run_id.trim()) {
    return { valid: false, error: "run_id is required" };
  }
  if (
    !b.fetched_at ||
    typeof b.fetched_at !== "string" ||
    isNaN(Date.parse(b.fetched_at))
  ) {
    return { valid: false, error: "fetched_at must be a valid ISO date string" };
  }

  // f19/f21: region
  if (!b.region || typeof b.region !== "string" || !b.region.trim()) {
    return { valid: false, error: "region is required" };
  }
  if (!(VALID_REGIONS as readonly string[]).includes(b.region as string)) {
    return { valid: false, error: `region: unsupported value "${b.region}". Accepted: ${VALID_REGIONS.join(", ")}` };
  }

  if (!Array.isArray(b.categories) || b.categories.length === 0) {
    return { valid: false, error: "categories must be a non-empty array" };
  }
  if (!Array.isArray(b.posts)) {
    return { valid: false, error: "posts must be an array" };
  }

  return { valid: true, batch: b as IngestBatch };
}

// ─── Per-post validation ──────────────────────────────────────────────────────

type PostCheck =
  | { valid: true; post: IngestPost }
  | { valid: false; errors: string[] };

function validatePost(raw: unknown): PostCheck {
  const errs: string[] = [];

  if (typeof raw !== "object" || raw === null) {
    return { valid: false, errors: ["post must be an object"] };
  }
  const p = raw as Record<string, unknown>;

  // f23: Required fields
  if (!p.source_post_id || typeof p.source_post_id !== "string" || !p.source_post_id.trim()) {
    errs.push("source_post_id required");
  }
  if (!p.source_url || typeof p.source_url !== "string") {
    errs.push("source_url required");
  } else {
    const urlErr = validateUrl(p.source_url);
    if (urlErr) errs.push(`source_url: ${urlErr}`);
  }
  const textErr = validateText(typeof p.text === "string" ? p.text : "");
  if (textErr) errs.push(`text: ${textErr}`);

  if (!p.category || typeof p.category !== "string" || !p.category.trim()) {
    errs.push("category required");
  }
  if (
    !p.source_created_at ||
    typeof p.source_created_at !== "string" ||
    isNaN(Date.parse(p.source_created_at as string))
  ) {
    errs.push("source_created_at must be a valid ISO date string");
  }

  if (errs.length > 0) return { valid: false, errors: errs };
  return { valid: true, post: p as IngestPost };
}

// ─── Place + coordinate resolution ───────────────────────────────────────────

type ResolveSuccess = { ok: true; lat: number; lng: number; placeName: string };
type ResolveFailure = { ok: false; reason: typeof R.NO_PLACE | typeof R.BAD_GEOCODE };
type ResolveResult  = ResolveSuccess | ResolveFailure;

async function resolveCoords(
  post: IngestPost,
  geocodeCounter: { count: number },
): Promise<ResolveResult> {
  // f29: place_hint > raw_geo.place_name > text extraction
  const placeName =
    (post.place_hint?.trim() || null) ??
    (post.raw_geo?.place_name?.trim() || null) ??
    extractPlaceName(post.text);

  if (!placeName) return { ok: false, reason: R.NO_PLACE };

  // f31a: raw_geo coordinates from collector (already geocoded by source) —
  //       write to cache so future batches skip Nominatim, then skip geocoder entirely.
  const rg = post.raw_geo;
  if (
    rg?.lat != null && rg?.lng != null &&
    typeof rg.lat === "number" && typeof rg.lng === "number"
  ) {
    if (!isInsideMetroVancouver(rg.lat, rg.lng)) {
      return { ok: false, reason: R.BAD_GEOCODE };
    }
    await setCachedPlace({
      place_query:           placeName.trim().toLowerCase(),
      normalized_place_name: placeName,
      display_name:          null,
      lat:                   rg.lat,
      lng:                   rg.lng,
      provider:              "source",
      confidence:            0.9,
    }).catch(() => {});
    return { ok: true, lat: rg.lat, lng: rg.lng, placeName };
  }

  // f30/f31b: geocodePlace handles cache-first lookup then Nominatim (Part G).
  //           Pass current Nominatim-call count for per-job cap enforcement.
  const geo = await geocodePlace(placeName, geocodeCounter.count);

  if (geo === null) return { ok: false, reason: R.NO_PLACE };

  if ("badBounds" in geo) return { ok: false, reason: R.BAD_GEOCODE };

  // Only count actual Nominatim calls (not cache hits) toward job stats.
  if (!geo.fromCache) geocodeCounter.count++;

  return { ok: true, lat: geo.lat, lng: geo.lng, placeName };
}

// ─── Main batch processor ─────────────────────────────────────────────────────

export async function processIngestBatch(batch: IngestBatch): Promise<BatchSummary> {
  const started = new Date().toISOString();
  const rejections: PostRejection[] = [];
  const errors: string[] = [];

  let accepted    = 0;
  let rejected    = 0;
  let duplicates  = 0;
  let inserted    = 0;
  const geocodeCounter = { count: 0 };

  const jobId = await startIngestionJob({
    source:     batch.source,
    query_used: batch.run_id,
    metadata:   { run_id: batch.run_id, fetched_at: batch.fetched_at, region: batch.region },
  });

  // f25: Track per-category post counts within this batch
  const categorySlots = new Map<string, number>();

  try {
    for (const rawPost of batch.posts) {
      const postId =
        typeof rawPost === "object" &&
        rawPost !== null &&
        typeof (rawPost as Record<string, unknown>).source_post_id === "string"
          ? ((rawPost as Record<string, unknown>).source_post_id as string)
          : "unknown";

      try {
        // f22/f23: Validate required fields
        const postCheck = validatePost(rawPost);
        if (!postCheck.valid) {
          const detail = postCheck.errors.join("; ");
          rejections.push({ source_post_id: postId, reason: R.MISSING_FIELDS, detail });
          rejected++;
          if (postId !== "unknown") {
            await safeRecord({
              source:             batch.source,
              post_id:            postId,
              processing_status:  "rejected",
              rejection_reason:   `${R.MISSING_FIELDS}: ${detail}`,
            });
          }
          continue;
        }
        const post = postCheck.post;

        // f24: Normalize category
        const category = normalizeCategory(post.category);
        if (!category) {
          rejections.push({
            source_post_id: post.source_post_id,
            reason:         R.INVALID_CATEGORY,
            detail:         post.category,
          });
          rejected++;
          await safeRecord({
            source:            batch.source,
            post_id:           post.source_post_id,
            post_url:          post.source_url,
            creator_handle:    post.creator_handle ?? null,
            category:          null,
            text:              post.text,
            processing_status: "rejected",
            rejection_reason:  `${R.INVALID_CATEGORY}: "${post.category}"`,
            raw_source:        post.raw_source ?? null,
          });
          continue;
        }

        // f27: Deduplication check before consuming a category slot
        const existing = await isPostProcessed(batch.source, post.source_post_id);
        if (existing) {
          duplicates++;
          await safeRecord({
            source:             batch.source,
            post_id:            post.source_post_id,
            processing_status:  existing.processingStatus,
            rejection_reason:   existing.rejectionReason,
          });
          continue;
        }

        // f25: Enforce max 50 posts per category per batch
        const slotCount = categorySlots.get(category) ?? 0;
        if (slotCount >= MAX_PER_CATEGORY) {
          rejections.push({ source_post_id: post.source_post_id, reason: R.OVER_LIMIT });
          rejected++;
          continue;
        }
        categorySlots.set(category, slotCount + 1);

        // f26/f29–f32: Resolve coordinates (place_hint > raw_geo > text > cache > geocoder)
        const resolved = await resolveCoords(post, geocodeCounter);
        if (!resolved.ok) {
          rejections.push({ source_post_id: post.source_post_id, reason: resolved.reason });
          rejected++;
          await safeRecord({
            source:            batch.source,
            post_id:           post.source_post_id,
            post_url:          post.source_url,
            creator_handle:    post.creator_handle ?? null,
            category,
            text:              post.text,
            processing_status: "rejected",
            rejection_reason:  resolved.reason,
            raw_source:        post.raw_source ?? null,
          });
          continue;
        }

        // f33: Insert pin
        const expiresAt = calculateExpiry(category);
        const placeName = resolved.placeName;

        const { data: pinData, error: pinErr } = await supabaseServer
          .from("pins")
          .insert({
            post_id:        post.source_post_id,
            source:         batch.source,
            post_url:       post.source_url,
            creator_handle: post.creator_handle ?? null,
            text:           post.text,
            category,
            place_name:     placeName,
            neighborhood:   null,
            lat:            resolved.lat,
            lng:            resolved.lng,
            expires_at:     expiresAt,
            status:         "active",
            activity_score: null,
            crowd_level:    null,
            tags:           [],
          })
          .select("id")
          .single();

        if (pinErr) {
          errors.push(`Pin insert failed for ${post.source_post_id}: ${pinErr.message}`);
          rejections.push({
            source_post_id: post.source_post_id,
            reason:         R.INSERT_FAILED,
            detail:         pinErr.message,
          });
          rejected++;
          await safeRecord({
            source:            batch.source,
            post_id:           post.source_post_id,
            post_url:          post.source_url,
            creator_handle:    post.creator_handle ?? null,
            category,
            text:              post.text,
            processing_status: "rejected",
            rejection_reason:  `${R.INSERT_FAILED}: ${pinErr.message}`,
            raw_source:        post.raw_source ?? null,
          });
          continue;
        }

        const pinId = (pinData as { id: string }).id;

        // f34: Audit log
        await logPinEvent({
          pin_id:     pinId,
          post_id:    post.source_post_id,
          event_type: "inserted",
          new_status: "active",
          reason:     "batch_ingest",
          source:     batch.source,
          metadata:   { run_id: batch.run_id, place: placeName },
        });

        // f28: Record accepted post
        await safeRecord({
          source:            batch.source,
          post_id:           post.source_post_id,
          post_url:          post.source_url,
          creator_handle:    post.creator_handle ?? null,
          category,
          text:              post.text,
          processing_status: "accepted",
          raw_source:        post.raw_source ?? null,
        });

        accepted++;
        inserted++;
      } catch (postErr) {
        const msg = postErr instanceof Error ? postErr.message : String(postErr);
        console.error("[ingestBatch] Unhandled post error:", msg, "post:", postId);
        errors.push(`Post ${postId}: ${msg}`);
        rejected++;
      }
    }
  } catch (fatalErr) {
    const msg = fatalErr instanceof Error ? fatalErr.message : String(fatalErr);
    errors.push(`Fatal: ${msg}`);
    console.error("[ingestBatch] Fatal error:", msg);
  }

  // f35: Update ingestion job
  const finished = new Date().toISOString();
  if (jobId) {
    const jobStatus: "success" | "failed" =
      errors.some((e) => e.startsWith("Fatal")) ? "failed" : "success";

    await finishIngestionJob(jobId, {
      status:             jobStatus,
      posts_fetched:      batch.posts.length,
      posts_rejected:     rejected,
      posts_accepted:     accepted,
      pins_inserted:      inserted,
      geocode_calls_made: geocodeCounter.count,
      error_message:      errors.length > 0 ? errors.slice(0, 3).join("; ") : null,
      metadata:           { run_id: batch.run_id, duplicates, region: batch.region },
    });
  } else {
    await failIngestionJob("", "startIngestionJob returned null").catch(() => {});
  }

  // f36: Return clean summary
  return {
    jobId,
    source:  batch.source,
    runId:   batch.run_id,
    started,
    finished,
    totals: {
      received:   batch.posts.length,
      accepted,
      rejected,
      duplicates,
      inserted,
    },
    rejections,
    errors,
  };
}

// ─── Non-fatal processed_posts write ─────────────────────────────────────────

async function safeRecord(input: Parameters<typeof recordProcessedPost>[0]): Promise<void> {
  try {
    await recordProcessedPost(input);
  } catch (err) {
    console.warn("[ingestBatch] recordProcessedPost failed:", err);
  }
}
