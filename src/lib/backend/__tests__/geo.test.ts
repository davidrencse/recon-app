import { describe, it, expect } from "vitest";
import { isInsideMetroVancouver, METRO_VANCOUVER_BOUNDS } from "../geo";

describe("isInsideMetroVancouver — inside Metro Vancouver", () => {
  it("Vancouver downtown", () => {
    expect(isInsideMetroVancouver(49.282, -123.120)).toBe(true);
  });
  it("Burnaby", () => {
    expect(isInsideMetroVancouver(49.248, -122.980)).toBe(true);
  });
  it("Richmond", () => {
    expect(isInsideMetroVancouver(49.166, -123.133)).toBe(true);
  });
  it("Surrey", () => {
    expect(isInsideMetroVancouver(49.190, -122.849)).toBe(true);
  });
  it("North Vancouver", () => {
    expect(isInsideMetroVancouver(49.319, -123.073)).toBe(true);
  });
  it("boundary lat min", () => {
    expect(isInsideMetroVancouver(METRO_VANCOUVER_BOUNDS.latMin, -123.000)).toBe(true);
  });
  it("boundary lat max", () => {
    expect(isInsideMetroVancouver(METRO_VANCOUVER_BOUNDS.latMax, -123.000)).toBe(true);
  });
  it("boundary lng min", () => {
    expect(isInsideMetroVancouver(49.200, METRO_VANCOUVER_BOUNDS.lngMin)).toBe(true);
  });
  it("boundary lng max", () => {
    expect(isInsideMetroVancouver(49.200, METRO_VANCOUVER_BOUNDS.lngMax)).toBe(true);
  });
  it("Coquitlam", () => {
    expect(isInsideMetroVancouver(49.284, -122.791)).toBe(true);
  });
});

describe("isInsideMetroVancouver — outside Metro Vancouver", () => {
  it("Seattle (too far south)", () => {
    expect(isInsideMetroVancouver(47.606, -122.332)).toBe(false);
  });
  it("Whistler (too far north)", () => {
    expect(isInsideMetroVancouver(50.119, -122.957)).toBe(false);
  });
  it("Toronto", () => {
    expect(isInsideMetroVancouver(43.651, -79.347)).toBe(false);
  });
  it("lat just below minimum", () => {
    expect(isInsideMetroVancouver(48.999, -123.000)).toBe(false);
  });
  it("lat just above maximum", () => {
    expect(isInsideMetroVancouver(49.401, -123.000)).toBe(false);
  });
  it("lng too far west", () => {
    expect(isInsideMetroVancouver(49.200, -123.351)).toBe(false);
  });
  it("lng too far east", () => {
    expect(isInsideMetroVancouver(49.200, -122.449)).toBe(false);
  });
  it("Abbotsford (outside east boundary)", () => {
    expect(isInsideMetroVancouver(49.052, -122.310)).toBe(false);
  });
});
