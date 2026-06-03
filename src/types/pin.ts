export type PinCategory =
  | "weather"
  | "crime_safety"
  | "daily_life"
  | "locations"
  | "special_events";

export type Pin = {
  postId: string;
  source: "X";
  postUrl: string;
  creatorHandle: string;
  text: string;
  category: PinCategory;
  placeName: string;
  lat: number;
  lng: number;
  createdAt: string;
  fetchedAt: string;
  expiresAt: string;
  locationConfidence: number;
  status: "active";
};
