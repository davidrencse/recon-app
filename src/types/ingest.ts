/** A single post sent by an external collector. */
export type IngestPost = {
  source_post_id: string;
  source_url: string;
  text: string;
  /** Raw category string from the collector — will be normalized by the backend. */
  category: string;
  source_created_at: string;
  creator_handle?: string | null;
  raw_source?: Record<string, unknown> | null;
};

/** A batch of posts sent by an external collector for a single run. */
export type IngestBatch = {
  source: string;
  run_id: string;
  fetched_at: string;
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
