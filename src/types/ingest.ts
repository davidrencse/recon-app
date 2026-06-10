/** Raw geo data attached by the external collector (e.g. already-geocoded lat/lng from Nominatim). */
export type IngestRawGeo = {
  lat?: number | null;
  lng?: number | null;
  place_name?: string | null;
};

/** A single post sent by an external collector. */
export type IngestPost = {
  source_post_id: string;
  source_url: string;
  text: string;
  /** Raw category string from the collector — will be normalized by the backend. */
  category: string;
  source_created_at: string;
  creator_handle?: string | null;
  /** Explicit place name hint from the collector (highest-confidence source). */
  place_hint?: string | null;
  /** Raw geo data from the source post — may include pre-resolved coordinates. */
  raw_geo?: IngestRawGeo | null;
  raw_source?: Record<string, unknown> | null;
};

/** A batch of posts sent by an external collector for a single run. */
export type IngestBatch = {
  source: string;
  run_id: string;
  fetched_at: string;
  /** Geographic region this batch covers. Must be "metro_vancouver". */
  region: string;
  /** Categories the collector was asked to fetch — informational only. */
  categories: string[];
  posts: IngestPost[];
};

export type PostRejection = {
  source_post_id: string;
  reason: string;
  detail?: string;
};

export type BatchSummary = {
  jobId: string | null;
  source: string;
  runId: string;
  started: string;
  finished: string;
  totals: {
    received: number;
    accepted: number;
    rejected: number;
    duplicates: number;
    inserted: number;
  };
  rejections: PostRejection[];
  errors: string[];
};
