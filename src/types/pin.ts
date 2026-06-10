export type PinCategory = "trending" | "cafes" | "nightlife" | "pop" | "crime_safety";

export type PinStatus = "active" | "expired" | "hidden" | "rejected" | "deleted";

export type CrowdLevel = "low" | "medium" | "high";

/** Raw DB row as returned by GET /api/pins */
export type DbPin = {
  post_id: string;
  source: string;
  post_url: string | null;
  creator_handle: string | null;
  text: string;
  category: PinCategory;
  place_name: string;
  neighborhood: string | null;
  lat: number;
  lng: number;
  created_at: string;
  fetched_at: string;
  expires_at: string;
  status: PinStatus;
  activity_score: number | null;
  crowd_level: CrowdLevel | null;
  tags: string[];
};

/** Camel-case pin used throughout the frontend */
export type Pin = {
  postId: string;
  source: string;
  postUrl: string;
  creatorHandle: string;
  text: string;
  category: PinCategory;
  placeName: string;
  neighborhood: string | null;
  lat: number;
  lng: number;
  createdAt: string;
  fetchedAt: string;
  expiresAt: string;
  locationConfidence: number;
  status: PinStatus;
  activityScore: number | null;
  crowdLevel: CrowdLevel | null;
  tags: string[];
};

/** POST /api/pins request body */
export type PinCreateInput = {
  post_id: string;
  source: string;
  post_url?: string | null;
  creator_handle?: string | null;
  text: string;
  category: PinCategory;
  place_name: string;
  neighborhood?: string | null;
  lat: number;
  lng: number;
  expires_at?: string | null;
  activity_score?: number | null;
  crowd_level?: CrowdLevel | null;
  tags?: string[];
};

/** GET /api/pins JSON response */
export type PinsApiResponse = {
  pins: DbPin[];
};
