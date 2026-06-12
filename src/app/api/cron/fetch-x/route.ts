import { NextRequest, NextResponse } from "next/server";
import {
  startIngestionJob,
  finishIngestionJob,
  failIngestionJob,
  checkFailureThreshold,
} from "@/lib/backend/ingestionJobs";
import { expireOldPins } from "@/lib/backend/expirePins";
import { pruneOldRows } from "@/lib/backend/pruneOldRows";

export const dynamic = "force-dynamic";

type CronJobSummary = {
  jobId: string | null;
  started: string;
  finished: string;
  expiredCount: number;
  insertedCount: number;
  rejectedCount: number;
  warningCount: number;
  warnings: string[];
  errors: string[];
  pruned: {
    processedPosts: number;
    ingestionJobs: number;
    geocodingFailures: number;
  };
};

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel cron: GET with Authorization: Bearer <secret>
  const bearer = request.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;
  // Manual trigger: POST/GET with x-cron-secret header
  if (request.headers.get("x-cron-secret") === secret) return true;
  return false;
}

async function runCronJob(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const started = new Date().toISOString();
  const warnings: string[] = [];
  const errors: string[] = [];

  // e8: Log job start
  const jobId = await startIngestionJob({ source: "x" });

  let expiredCount = 0;
  let fatalError   = false;
  let pruned       = { processedPosts: 0, ingestionJobs: 0, geocodingFailures: 0 };

  try {
    // e10: Failure-threshold check before running
    const failureCheck = await checkFailureThreshold(5, 3);
    if (failureCheck.suspicious) {
      const msg = `High failure rate: ${failureCheck.failedCount}/${failureCheck.total} recent jobs failed`;
      warnings.push(msg);
      console.warn("[fetch-x]", msg);
    }

    // e9: Expire stale active pins
    const expiry = await expireOldPins();
    expiredCount = expiry.expiredCount;
    errors.push(...expiry.errors);

    // Prune stale rows to keep tables lean
    const pruneResult = await pruneOldRows();
    pruned = {
      processedPosts:    pruneResult.processedPostsPruned,
      ingestionJobs:     pruneResult.ingestionJobsPruned,
      geocodingFailures: pruneResult.geocodingFailuresPruned,
    };
    errors.push(...pruneResult.errors);

    // Ingestion is now handled by POST /api/ingest/source-batch from an external collector.
    // This route only runs expiry cleanup, pruning, and job health monitoring.
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);
    fatalError = true;
    console.error("[fetch-x] Unhandled error:", msg);
  }

  const finished = new Date().toISOString();
  const jobStatus: "success" | "failed" = fatalError ? "failed" : "success";

  // e8: Log job end
  if (jobId) {
    if (fatalError) {
      await failIngestionJob(jobId, errors[errors.length - 1] ?? "Unknown error");
    } else {
      await finishIngestionJob(jobId, {
        status: jobStatus,
        posts_fetched: 0,
        posts_rejected: 0,
        posts_accepted: 0,
        pins_inserted: 0,
        geocode_calls_made: 0,
        error_message: errors.length > 0 ? errors.join("; ") : null,
        metadata: warnings.length > 0 ? { warnings } : null,
      });
    }
  }

  // e13: Return clean job summary
  const summary: CronJobSummary = {
    jobId,
    started,
    finished,
    expiredCount,
    insertedCount: 0,
    rejectedCount: 0,
    warningCount: warnings.length,
    warnings,
    errors,
    pruned,
  };

  return NextResponse.json(summary, { status: fatalError ? 500 : 200 });
}

// Vercel cron fires GET with Authorization: Bearer header
export async function GET(request: NextRequest): Promise<NextResponse> {
  return runCronJob(request);
}

// Manual trigger via POST with x-cron-secret header
export async function POST(request: NextRequest): Promise<NextResponse> {
  return runCronJob(request);
}
