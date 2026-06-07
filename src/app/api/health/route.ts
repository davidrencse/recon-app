import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 30_000;

type HealthCache = {
  db: "ok" | "error" | "not_configured";
  dbError: string | null;
  checkedAt: string;
  expiresAt: number;
};

let cache: HealthCache | null = null;

async function checkDb(): Promise<Pick<HealthCache, "db" | "dbError">> {
  try {
    const { error } = await supabaseServer
      .from("pins")
      .select("post_id")
      .limit(1);

    if (error) {
      return { db: "error", dbError: "Database query failed." };
    }
    return { db: "ok", dbError: null };
  } catch {
    return { db: "error", dbError: "Could not reach database." };
  }
}

export async function GET() {
  const now = Date.now();

  if (!cache || now >= cache.expiresAt) {
    const { db, dbError } = await checkDb();
    cache = {
      db,
      dbError,
      checkedAt: new Date(now).toISOString(),
      expiresAt: now + CACHE_TTL_MS,
    };
  }

  const env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    cronSecret: !!process.env.CRON_SECRET,
  };

  return NextResponse.json({
    app: "ok",
    db: cache.db,
    dbError: cache.dbError,
    env,
    cachedAt: cache.checkedAt,
    timestamp: new Date().toISOString(),
  });
}
