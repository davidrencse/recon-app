import type { PinCategory, PinStatus } from "./pin";

// ─── processed_posts ────────────────────────────────────────────────────────

export type ProcessedPostStatus = "accepted" | "rejected" | "duplicate" | "error";

export type ProcessedPost = {
  id: string;
  source: string;
  postId: string;
  postUrl: string | null;
  creatorHandle: string | null;
  category: PinCategory | null;
  text: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  processingStatus: ProcessedPostStatus;
  rejectionReason: string | null;
  rawSource: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ProcessedPostInsert = {
  source: string;
  post_id: string;
  post_url?: string | null;
  creator_handle?: string | null;
  category?: PinCategory | null;
  text?: string | null;
  processing_status: ProcessedPostStatus;
  rejection_reason?: string | null;
  raw_source?: Record<string, unknown> | null;
};

// ─── cached_places ───────────────────────────────────────────────────────────

export type CachedPlace = {
  id: string;
  placeQuery: string;
  normalizedPlaceName: string | null;
  displayName: string | null;
  lat: number;
  lng: number;
  provider: string;
  confidence: number | null;
  manualOverride: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
};

export type CachedPlaceInsert = {
  place_query: string;
  normalized_place_name?: string | null;
  display_name?: string | null;
  lat: number;
  lng: number;
  provider?: string;
  confidence?: number | null;
  manual_override?: boolean;
};

// ─── ingestion_jobs ──────────────────────────────────────────────────────────

export type IngestionJobStatus = "running" | "completed" | "failed" | "partial";

export type IngestionJob = {
  id: string;
  source: string;
  status: IngestionJobStatus;
  startedAt: string;
  finishedAt: string | null;
  category: PinCategory | null;
  queryUsed: string | null;
  postsFetched: number;
  postsRejected: number;
  postsAccepted: number;
  pinsInserted: number;
  geocodeCallsMade: number;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type IngestionJobStart = {
  source: string;
  category?: PinCategory | null;
  query_used?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type IngestionJobFinish = {
  status: IngestionJobStatus;
  posts_fetched?: number;
  posts_rejected?: number;
  posts_accepted?: number;
  pins_inserted?: number;
  geocode_calls_made?: number;
  error_message?: string | null;
  metadata?: Record<string, unknown> | null;
};

// ─── pin_audit_log ───────────────────────────────────────────────────────────

export type PinAuditEventType =
  | "inserted"
  | "expired"
  | "hidden"
  | "deleted"
  | "restored"
  | "score_updated";

export type PinAuditLog = {
  id: string;
  pinId: string | null;
  postId: string | null;
  eventType: PinAuditEventType;
  previousStatus: PinStatus | null;
  newStatus: PinStatus | null;
  reason: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type PinAuditLogInsert = {
  pin_id?: string | null;
  post_id?: string | null;
  event_type: PinAuditEventType;
  previous_status?: PinStatus | null;
  new_status?: PinStatus | null;
  reason?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
};
