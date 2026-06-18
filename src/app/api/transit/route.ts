import { NextResponse } from "next/server";
import type { TransitRoute, DelayLevel } from "@/types/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 300;

/**
 * TransLink service alerts.
 *
 * TransLink's real-time feed (gtfsapi.translink.ca) requires a registered API
 * key and is served as GTFS-realtime protobuf. When `TRANSLINK_API_KEY` is set
 * we map its JSON alerts endpoint; otherwise we return an empty list and the
 * TransitDisruption card renders its "all clear" state. This keeps the route a
 * real data source without shipping fabricated disruptions.
 */

function delayFromSeverity(sev: string | undefined): DelayLevel {
  switch ((sev ?? "").toUpperCase()) {
    case "SEVERE": return "severe";
    case "WARNING": return "moderate";
    case "INFO": return "minor";
    default: return "minor";
  }
}

export async function GET() {
  const key = process.env.TRANSLINK_API_KEY;
  if (!key) {
    // No key configured — no disruptions to report.
    return NextResponse.json({ routes: [] as TransitRoute[] });
  }

  try {
    const res = await fetch(
      `https://gtfsapi.translink.ca/v3/servicealerts?apikey=${key}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json({ routes: [] as TransitRoute[] });

    const j = await res.json();
    const entities: unknown[] = Array.isArray(j?.entity) ? j.entity : [];

    const routes: TransitRoute[] = entities.slice(0, 8).map((raw, i) => {
      const e = raw as Record<string, unknown>;
      const alert = (e.alert ?? {}) as Record<string, unknown>;
      const header = (alert.header_text as { translation?: { text?: string }[] })?.translation?.[0]?.text ?? "Service notice";
      const desc = (alert.description_text as { translation?: { text?: string }[] })?.translation?.[0]?.text ?? "";
      const informed = (alert.informed_entity as { route_id?: string }[]) ?? [];
      const routeId = informed[0]?.route_id ?? "—";
      const delayLevel = delayFromSeverity(alert.severity_level as string);
      return {
        id: String(e.id ?? `tr-${i}`),
        name: header,
        shortName: routeId,
        delayLevel,
        delayMinutes: delayLevel === "severe" ? 20 : delayLevel === "moderate" ? 10 : 5,
        affectedStation: "",
        affectedArea: desc.slice(0, 80),
        disruptionType: header,
        until: "Ongoing",
        stationsBefore: 0,
        stationsAfter: 0,
      };
    });

    return NextResponse.json({ routes });
  } catch {
    return NextResponse.json({ routes: [] as TransitRoute[] });
  }
}
