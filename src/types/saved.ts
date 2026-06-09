export type SavedItemStatus =
  | "active_now"
  | "active_tonight"
  | "updated_recently"
  | "closing_soon"
  | "expired";

export type SavedIntent = "want_to_go" | "been_here";

export type SavedFilter =
  | "all"
  | "want_to_go"
  | "been_here"
  | "events"
  | "food"
  | "alerts";

export type SavedPlace = {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  intent: SavedIntent;
  latestPost: string;
  freshness: string;
  status: SavedItemStatus;
  statusLabel: string;
  distance: string;
  filterTags: SavedFilter[];
};

export type SavedPost = {
  id: string;
  creatorHandle: string;
  source: "X";
  postUrl: string;
  text: string;
  attachedPlace: string;
  neighborhood: string;
  freshness: string;
  expiresIn: string;
  status: SavedItemStatus;
};

export type SavedCollection = {
  id: string;
  label: string;
  count: number;
  activeToday: number;
};
