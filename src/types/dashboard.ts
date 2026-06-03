/* ── New module types ─────────────────────────────────────────── */
export type DashboardFilter = "today" | "tonight" | "weekend";
export type TimeBlock = "morning" | "afternoon" | "evening" | "late-night";

export type EventTimeBlock = {
  block: TimeBlock;
  label: string;
  hours: string;
  count: number;
};

export type EventItem = {
  id: string;
  title: string;
  venue: string;
  area: string;
  timeBlock: TimeBlock;
  time: string;
};

export type CategoryKey = "trending" | "cafes" | "nightlife" | "popups";

export type CategoryStat = {
  key: CategoryKey;
  label: string;
  count: number;
  description: string;
};

export type WeatherConditionCode =
  | "rain"
  | "heavy-rain"
  | "drizzle"
  | "overcast"
  | "fog"
  | "clear"
  | "partly-cloudy";

export type ImpactLevel = "positive" | "neutral" | "negative";

export type CategoryImpact = {
  key: string;
  label: string;
  impact: ImpactLevel;
  note: string;
};

export type HourForecast = {
  hour: string;
  temp: number;
  conditionCode: WeatherConditionCode;
};

export type WeatherData = {
  condition: string;
  conditionCode: WeatherConditionCode;
  temperature: number;
  rainChance: number;
  windSpeed: number;
  visibility: string;
  outdoorEventImpact: "low" | "moderate" | "high";
  hourlyForecast: HourForecast[];
  affectedAreas: string[];
  categoryImpacts: CategoryImpact[];
};

export type CautionType =
  | "road-closure"
  | "large-crowd"
  | "police-activity"
  | "transit-entrance"
  | "event-congestion";

export type SafetyItem = {
  id: string;
  type: CautionType;
  typeLabel: string;
  area: string;
  description: string;
  time: string;
  severity: "low" | "medium" | "high";
};

export type DelayLevel = "none" | "minor" | "moderate" | "severe";

export type TransitRoute = {
  id: string;
  name: string;
  shortName: string;
  delayLevel: DelayLevel;
  delayMinutes: number;
  affectedStation: string;
  affectedArea: string;
  disruptionType: string;
  until: string;
  stationsBefore: number;
  stationsAfter: number;
};

export type DashboardFilterData = {
  timeBlocks: EventTimeBlock[];
  events: EventItem[];
  categoryStats: CategoryStat[];
  weather: WeatherData;
  safetyItems: SafetyItem[];
};

/* ── Legacy top-section types (Live card, Pulse, Neighborhoods) ─ */
export type AreaFilter =
  | "all"
  | "downtown"
  | "gastown"
  | "kitsilano"
  | "mount-pleasant"
  | "ubc"
  | "granville"
  | "robson"
  | "stanley-park";

export type HourlyPost = { hour: number; count: number };

export type AreaStats = {
  key: AreaFilter;
  label: string;
  events: number;
  food: number;
  nightlife: number;
  safety: number;
  transit: number;
  total: number;
};

/* ── Full dashboard data ──────────────────────────────────────── */
export type DashboardData = {
  today: DashboardFilterData;
  tonight: DashboardFilterData;
  weekend: DashboardFilterData;
  transitRoutes: TransitRoute[];
  postsByHour: Record<DashboardFilter, HourlyPost[]>;
  areaStats: AreaStats[];
};
