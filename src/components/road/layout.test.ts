import { describe, it, expect } from "vitest";
import {
  clamp01,
  clusterOffsets,
  normalize,
  perpendicular,
  placeOnRoad,
  placeShoulder,
  LANE_STEP,
  SHOULDER_GAP,
} from "./layout";

describe("clusterOffsets", () => {
  it("fans markers out symmetrically around the road", () => {
    expect(clusterOffsets(0)).toEqual([]);
    expect(clusterOffsets(1)).toEqual([0]);
    expect(clusterOffsets(3)).toEqual([0, 1, -1]);
    expect(clusterOffsets(5)).toEqual([0, 1, -1, 2, -2]);
  });

  it("keeps the cluster centered (offsets sum to ~0 for odd counts)", () => {
    const sum = clusterOffsets(7).reduce((a, b) => a + b, 0);
    expect(sum).toBe(0);
  });
});

describe("perpendicular / normalize", () => {
  it("is 90° from the tangent", () => {
    expect(perpendicular({ x: 1, y: 0 })).toEqual({ x: 0, y: 1 });
    expect(perpendicular({ x: 0, y: 1 })).toEqual({ x: -1, y: 0 });
  });

  it("normalize returns a unit vector", () => {
    const n = normalize(3, 4);
    expect(Math.hypot(n.x, n.y)).toBeCloseTo(1);
  });
});

describe("clamp01", () => {
  it("clamps progress into [0,1]", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(0.3)).toBe(0.3);
  });
});

describe("placement", () => {
  const base = { x: 100, y: 100 };
  const perp = { x: 0, y: 1 };

  it("places on-road markers by signed lane step", () => {
    expect(placeOnRoad(base, perp, 0)).toEqual({ x: 100, y: 100 });
    expect(placeOnRoad(base, perp, 1)).toEqual({ x: 100, y: 100 + LANE_STEP });
    expect(placeOnRoad(base, perp, -2)).toEqual({ x: 100, y: 100 - 2 * LANE_STEP });
  });

  it("parks shoulder markers off the road edge", () => {
    expect(placeShoulder(base, perp, 0)).toEqual({ x: 100, y: 100 + SHOULDER_GAP });
    expect(placeShoulder(base, perp, 1).y).toBeGreaterThan(100 + SHOULDER_GAP);
  });
});
