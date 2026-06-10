import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { PinCategory, PinCreateInput } from "@/types/pin";
import { isInsideMetroVancouver } from "@/lib/backend/geo";
import { VALID_CATEGORIES } from "@/lib/backend/normalize";

export const dynamic = "force-dynamic";

const VALID_CATEGORY_SET = new Set<PinCategory>(VALID_CATEGORIES);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") as PinCategory | null;
  const neighborhood = searchParams.get("neighborhood");
  const limitParam = searchParams.get("limit");
  const bboxParam = searchParams.get("bbox");

  const limit = limitParam ? Number(limitParam) : 100;

  if (Number.isNaN(limit) || limit < 1 || limit > 200) {
    return NextResponse.json(
      { error: "Invalid limit. Use a number from 1 to 200." },
      { status: 400 }
    );
  }

  if (category && !VALID_CATEGORY_SET.has(category)) {
    return NextResponse.json(
      { error: `Invalid category. Valid: ${[...VALID_CATEGORY_SET].join(", ")}` },
      { status: 400 }
    );
  }

  // Parse ?bbox=minLat,minLng,maxLat,maxLng
  let bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number } | null = null;
  if (bboxParam) {
    const parts = bboxParam.split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      bbox = { minLat: parts[0], minLng: parts[1], maxLat: parts[2], maxLng: parts[3] };
    } else {
      return NextResponse.json(
        { error: "Invalid bbox. Use: minLat,minLng,maxLat,maxLng" },
        { status: 400 }
      );
    }
  }

  let query = supabaseServer
    .from("pins")
    .select(
      `post_id, source, post_url, creator_handle, text, category,
       place_name, neighborhood, lat, lng,
       created_at, fetched_at, expires_at,
       status, activity_score, crowd_level, tags`
    )
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category", category);
  if (neighborhood) query = query.eq("neighborhood", neighborhood);
  if (bbox) {
    query = query
      .gte("lat", bbox.minLat)
      .lte("lat", bbox.maxLat)
      .gte("lng", bbox.minLng)
      .lte("lng", bbox.maxLng);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to load pins.", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ pins: data ?? [] });
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");

  if (!cronSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: PinCreateInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.post_id || !body.source || !body.text || !body.category || !body.place_name) {
    return NextResponse.json(
      { error: "Missing required pin fields." },
      { status: 400 }
    );
  }

  if (!VALID_CATEGORY_SET.has(body.category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  if (
    typeof body.lat !== "number" ||
    typeof body.lng !== "number" ||
    !isInsideMetroVancouver(body.lat, body.lng)
  ) {
    return NextResponse.json(
      { error: "Coordinates must be within Metro Vancouver bounds." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("pins")
    .insert({
      post_id: body.post_id,
      source: body.source,
      post_url: body.post_url ?? null,
      creator_handle: body.creator_handle ?? null,
      text: body.text,
      category: body.category,
      place_name: body.place_name,
      neighborhood: body.neighborhood ?? null,
      lat: body.lat,
      lng: body.lng,
      expires_at: body.expires_at ?? null,
      status: "active",
      activity_score: body.activity_score ?? null,
      crowd_level: body.crowd_level ?? null,
      tags: body.tags ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create pin.", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ pin: data }, { status: 201 });
}
