import type { SavedPlace, SavedPost, SavedCollection } from "../types/saved";

export const mockSavedPlaces: SavedPlace[] = [
  {
    id: "sv1",
    name: "Kitsilano Beach",
    category: "Daily Life",
    neighborhood: "Kitsilano",
    intent: "want_to_go",
    latestPost: "Sunset crowd building near the water. Volleyball courts packed, great vibe.",
    freshness: "18 min ago",
    status: "active_now",
    statusLabel: "Active now",
    distance: "2.4 km",
    filterTags: ["all", "want_to_go"],
  },
  {
    id: "sv2",
    name: "Commodore Ballroom",
    category: "Special Events",
    neighborhood: "Downtown",
    intent: "want_to_go",
    latestPost: "Line forming outside before doors. Coat check is cash only tonight.",
    freshness: "12 min ago",
    status: "active_tonight",
    statusLabel: "Active tonight",
    distance: "1.8 km",
    filterTags: ["all", "want_to_go", "events"],
  },
  {
    id: "sv3",
    name: "Science World",
    category: "Weather",
    neighborhood: "False Creek",
    intent: "been_here",
    latestPost: "Rain reports nearby. Farmers market still running but winding down.",
    freshness: "45 min ago",
    status: "updated_recently",
    statusLabel: "Updated recently",
    distance: "3.1 km",
    filterTags: ["all", "been_here"],
  },
];

export const mockSavedPosts: SavedPost[] = [
  {
    id: "sp1",
    creatorHandle: "@VanNight",
    source: "X",
    postUrl: "https://x.com/VanNight/status/mock-004",
    text: "Sold out show at the Commodore tonight. Line forming at 7pm, doors at 8. Coat check is cash only.",
    attachedPlace: "Commodore Ballroom",
    neighborhood: "Downtown",
    freshness: "12 min ago",
    expiresIn: "8 hr",
    status: "active_tonight",
  },
  {
    id: "sp2",
    creatorHandle: "@KitsLocal",
    source: "X",
    postUrl: "https://x.com/KitsLocal/status/mock-005",
    text: "Kits Beach fully packed today. Volleyball courts full by 11am. Water is cold but people are in.",
    attachedPlace: "Kitsilano Beach",
    neighborhood: "Kitsilano",
    freshness: "30 min ago",
    expiresIn: "5 hr",
    status: "updated_recently",
  },
];

export const mockCollections: SavedCollection[] = [
  { id: "c1", label: "Date ideas",  count: 7, activeToday: 3 },
  { id: "c2", label: "Rainy day",   count: 5, activeToday: 1 },
  { id: "c3", label: "Late night",  count: 6, activeToday: 4 },
];
