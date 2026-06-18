import type { Pin, PinCategory } from "@/types/pin";
import type {
  DashboardFilter,
  EventTimeBlock,
  EventItem,
  TimeBlock,
  CategoryStat,
  CategoryKey,
  SafetyItem,
  CautionType,
  HourlyPost,
  AreaStats,
  AreaFilter,
} from "@/types/dashboard";

/* ── Time helpers ─────────────────────────────────────────────── */
function hourOf(p: Pin): number {
  return new Date(p.createdAt).getHours();
}

function timeBlockForHour(h: number): TimeBlock {
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "late-night";
}

function clockLabel(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function cleanText(text: string): string {
  return text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
}

/* ── Filter (today / tonight / weekend) ───────────────────────── */
export function filterPins(pins: Pin[], filter: DashboardFilter): Pin[] {
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

  if (filter === "today") {
    return pins.filter((p) => new Date(p.createdAt) >= startOfDay);
  }
  if (filter === "tonight") {
    const evening = new Date(now); evening.setHours(18, 0, 0, 0);
    return pins.filter((p) => {
      const t = new Date(p.createdAt);
      return t >= evening && t <= endOfDay;
    });
  }
  // weekend: Sat + Sun of the current week
  const day = now.getDay();
  const toSat = (6 - day + 7) % 7;
  const satStart = new Date(now); satStart.setDate(now.getDate() + toSat); satStart.setHours(0, 0, 0, 0);
  const sunEnd = new Date(satStart); sunEnd.setDate(satStart.getDate() + 1); sunEnd.setHours(23, 59, 59, 999);
  return pins.filter((p) => {
    const t = new Date(p.createdAt);
    return t >= satStart && t <= sunEnd;
  });
}

/* ── Time blocks ──────────────────────────────────────────────── */
const BLOCK_META: { block: TimeBlock; label: string; hours: string }[] = [
  { block: "morning", label: "Morning", hours: "6am – 12pm" },
  { block: "afternoon", label: "Afternoon", hours: "12pm – 6pm" },
  { block: "evening", label: "Evening", hours: "6pm – 10pm" },
  { block: "late-night", label: "Late night", hours: "10pm – 2am" },
];

export function buildTimeBlocks(pins: Pin[]): EventTimeBlock[] {
  const counts: Record<TimeBlock, number> = { morning: 0, afternoon: 0, evening: 0, "late-night": 0 };
  for (const p of pins) counts[timeBlockForHour(hourOf(p))]++;
  return BLOCK_META.map((m) => ({ ...m, count: counts[m.block] }));
}

/* ── Events (derived from pins) ───────────────────────────────── */
export function buildEvents(pins: Pin[]): EventItem[] {
  return pins.map((p) => ({
    id: p.postId,
    title: cleanText(p.text).slice(0, 80) || p.placeName,
    venue: p.placeName,
    area: p.neighborhood ?? p.placeName,
    timeBlock: timeBlockForHour(hourOf(p)),
    time: clockLabel(p.createdAt),
  }));
}

/* ── Category breakdown ───────────────────────────────────────── */
const PIN_TO_KEY: Partial<Record<PinCategory, CategoryKey>> = {
  trending: "trending",
  cafes: "cafes",
  nightlife: "nightlife",
  pop: "popups",
};

const CATEGORY_META: { key: CategoryKey; label: string; description: string }[] = [
  { key: "nightlife", label: "Nightlife", description: "Bars, shows, clubs, late food across Granville and Gastown." },
  { key: "trending", label: "Trending", description: "High-volume city activity and buzz across Downtown and the core." },
  { key: "cafes", label: "Cafes", description: "Coffee, study spots, brunch, and bakeries citywide." },
  { key: "popups", label: "Pop-ups", description: "Markets, drops, and temporary events around the city." },
];

export function buildCategoryStats(pins: Pin[]): CategoryStat[] {
  const counts: Record<CategoryKey, number> = { trending: 0, cafes: 0, nightlife: 0, popups: 0 };
  for (const p of pins) {
    const key = PIN_TO_KEY[p.category];
    if (key) counts[key]++;
  }
  return CATEGORY_META.map((m) => ({ ...m, count: counts[m.key] }));
}

/* ── Safety (from crime_safety pins) ──────────────────────────── */
const HIGH_WORDS = ["knife", "gun", "weapon", "shoot", "stab", "fire", "assault", "armed"];
const LOW_WORDS = ["minor", "caution", "advisory", "delay"];

function cautionType(text: string): { type: CautionType; label: string } {
  const t = text.toLowerCase();
  if (/(clos|road|lane|detour)/.test(t)) return { type: "road-closure", label: "Road closure" };
  if (/(crowd|gather|line|queue|capacity)/.test(t)) return { type: "large-crowd", label: "Large crowd" };
  if (/(police|rcmp|arrest|officer|vpd)/.test(t)) return { type: "police-activity", label: "Police activity" };
  if (/(skytrain|bus|station|transit|translink)/.test(t)) return { type: "transit-entrance", label: "Transit delay" };
  if (/(congest|traffic|backup|jam)/.test(t)) return { type: "event-congestion", label: "Event congestion" };
  return { type: "police-activity", label: "Incident" };
}

function severityOf(text: string): "low" | "medium" | "high" {
  const t = text.toLowerCase();
  if (HIGH_WORDS.some((w) => t.includes(w))) return "high";
  if (LOW_WORDS.some((w) => t.includes(w))) return "low";
  return "medium";
}

export function buildSafetyItems(pins: Pin[]): SafetyItem[] {
  return pins
    .filter((p) => p.category === "crime_safety")
    .slice(0, 12)
    .map((p) => {
      const { type, label } = cautionType(p.text);
      return {
        id: p.postId,
        type,
        typeLabel: label,
        area: p.neighborhood ?? p.placeName,
        description: cleanText(p.text).slice(0, 160),
        time: clockLabel(p.createdAt),
        severity: severityOf(p.text),
      };
    });
}

/* ── Posts-by-hour (for the pulse chart) ──────────────────────── */
export function buildPostsByHour(pins: Pin[]): HourlyPost[] {
  const hours: HourlyPost[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  for (const p of pins) hours[hourOf(p)].count++;
  return hours;
}

/* ── Top neighborhoods ────────────────────────────────────────── */
function slug(name: string): AreaFilter {
  const s = name.toLowerCase();
  if (s.includes("downtown")) return "downtown";
  if (s.includes("gastown")) return "gastown";
  if (s.includes("kitsilano") || s.includes("kits")) return "kitsilano";
  if (s.includes("mount pleasant") || s.includes("mt pleasant")) return "mount-pleasant";
  if (s.includes("ubc")) return "ubc";
  if (s.includes("granville")) return "granville";
  if (s.includes("robson")) return "robson";
  if (s.includes("stanley")) return "stanley-park";
  return "all";
}

export function buildAreaStats(pins: Pin[]): AreaStats[] {
  const map = new Map<string, AreaStats>();
  for (const p of pins) {
    const label = p.neighborhood ?? p.placeName;
    if (!label) continue;
    const existing = map.get(label);
    if (existing) {
      existing.total++;
      if (p.category === "pop") existing.events++;
      else if (p.category === "cafes") existing.food++;
      else if (p.category === "nightlife") existing.nightlife++;
      else if (p.category === "crime_safety") existing.safety++;
    } else {
      map.set(label, {
        key: slug(label),
        label,
        events: p.category === "pop" ? 1 : 0,
        food: p.category === "cafes" ? 1 : 0,
        nightlife: p.category === "nightlife" ? 1 : 0,
        safety: p.category === "crime_safety" ? 1 : 0,
        transit: 0,
        total: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
