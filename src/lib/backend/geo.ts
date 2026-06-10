export const METRO_VANCOUVER_BOUNDS = {
  latMin: 49.000,
  latMax: 49.400,
  lngMin: -123.350,
  lngMax: -122.450,
} as const;

export function isInsideMetroVancouver(lat: number, lng: number): boolean {
  return (
    lat >= METRO_VANCOUVER_BOUNDS.latMin &&
    lat <= METRO_VANCOUVER_BOUNDS.latMax &&
    lng >= METRO_VANCOUVER_BOUNDS.lngMin &&
    lng <= METRO_VANCOUVER_BOUNDS.lngMax
  );
}
