import { NextResponse } from "next/server";
import type {
  WeatherData,
  WeatherConditionCode,
  HourForecast,
  CategoryImpact,
} from "@/types/dashboard";

export const dynamic = "force-dynamic";
// Cache one weather fetch for all users for 10 min — Open-Meteo is keyless but rate-limited.
export const revalidate = 600;

const VANCOUVER = { lat: 49.2827, lng: -123.1207 };

/** WMO weather interpretation code → our condition code + label. */
function mapWmo(code: number): { code: WeatherConditionCode; condition: string } {
  if (code === 0) return { code: "clear", condition: "Clear" };
  if (code === 1 || code === 2) return { code: "partly-cloudy", condition: "Partly cloudy" };
  if (code === 3) return { code: "overcast", condition: "Overcast" };
  if (code === 45 || code === 48) return { code: "fog", condition: "Fog" };
  if (code >= 51 && code <= 57) return { code: "drizzle", condition: "Drizzle" };
  if (code === 65 || code === 67 || code === 82) return { code: "heavy-rain", condition: "Heavy rain" };
  if ((code >= 61 && code <= 66) || code === 80 || code === 81) return { code: "rain", condition: "Rain" };
  if (code >= 71 && code <= 86) return { code: "rain", condition: "Snow" };
  if (code >= 95) return { code: "heavy-rain", condition: "Thunderstorm" };
  return { code: "overcast", condition: "Overcast" };
}

function hourLabel(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h} ${ampm}`;
}

function impactFor(rainChance: number): "low" | "moderate" | "high" {
  if (rainChance >= 60) return "high";
  if (rainChance >= 30) return "moderate";
  return "low";
}

function buildCategoryImpacts(isWet: boolean): CategoryImpact[] {
  if (isWet) {
    return [
      { key: "cafes", label: "Cafes", impact: "positive", note: "Rain drives indoor demand. Longer queues at coffee and study spots." },
      { key: "nightlife", label: "Nightlife", impact: "neutral", note: "Indoor venues unaffected. Outdoor lineups less comfortable." },
      { key: "popups", label: "Pop-ups", impact: "negative", note: "Outdoor markets and street programming likely winding down early." },
      { key: "outdoor", label: "Outdoor events", impact: "negative", note: "Seawall and park trails wet. Outdoor turnout reduced." },
    ];
  }
  return [
    { key: "cafes", label: "Cafes", impact: "neutral", note: "Normal demand. Patios usable." },
    { key: "nightlife", label: "Nightlife", impact: "positive", note: "Dry conditions support outdoor lineups and patio overflow." },
    { key: "popups", label: "Pop-ups", impact: "positive", note: "Good conditions for outdoor markets and street events." },
    { key: "outdoor", label: "Outdoor events", impact: "positive", note: "Seawall, parks, and beaches in good shape." },
  ];
}

const FALLBACK: WeatherData = {
  condition: "Unavailable",
  conditionCode: "overcast",
  temperature: 0,
  rainChance: 0,
  windSpeed: 0,
  visibility: "—",
  outdoorEventImpact: "low",
  hourlyForecast: [],
  affectedAreas: [],
  categoryImpacts: buildCategoryImpacts(false),
};

export async function GET() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${VANCOUVER.lat}&longitude=${VANCOUVER.lng}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&hourly=temperature_2m,weather_code,precipitation_probability,visibility` +
      `&timezone=America%2FVancouver&forecast_days=2`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return NextResponse.json(FALLBACK);

    const j = await res.json();
    const cur = j.current ?? {};
    const hourly = j.hourly ?? {};
    const times: string[] = hourly.time ?? [];

    // Index of the first hourly slot at or after "now".
    const now = Date.now();
    let idx = times.findIndex((t) => new Date(t).getTime() >= now);
    if (idx < 0) idx = 0;

    const { code, condition } = mapWmo(Number(cur.weather_code ?? hourly.weather_code?.[idx] ?? 3));
    const rainChance = Math.round(hourly.precipitation_probability?.[idx] ?? 0);
    const visMeters = hourly.visibility?.[idx];
    const visibility = typeof visMeters === "number" ? `${Math.round(visMeters / 1000)} km` : "—";
    const isWet = code === "rain" || code === "heavy-rain" || code === "drizzle" || rainChance >= 50;

    const hourlyForecast: HourForecast[] = times.slice(idx, idx + 6).map((t, i) => ({
      hour: hourLabel(t),
      temp: Math.round(hourly.temperature_2m?.[idx + i] ?? 0),
      conditionCode: mapWmo(Number(hourly.weather_code?.[idx + i] ?? 3)).code,
    }));

    const data: WeatherData = {
      condition,
      conditionCode: code,
      temperature: Math.round(cur.temperature_2m ?? hourly.temperature_2m?.[idx] ?? 0),
      rainChance,
      windSpeed: Math.round(cur.wind_speed_10m ?? 0),
      visibility,
      outdoorEventImpact: impactFor(rainChance),
      hourlyForecast,
      affectedAreas: isWet
        ? ["Stanley Park", "Kitsilano Beach", "Granville Island", "Outdoor patios"]
        : ["Seawall", "Beaches", "Park trails"],
      categoryImpacts: buildCategoryImpacts(isWet),
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
