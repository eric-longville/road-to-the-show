/**
 * Pure geometry for laying markers out along the road. No DOM here — the actual
 * path sampling (getPointAtLength) happens in RoadCanvas; these helpers turn a
 * sampled base point + tangent into final marker positions, and are unit-tested.
 */

export interface Point {
  x: number;
  y: number;
}

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function normalize(x: number, y: number): Point {
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
}

/** Unit vector 90° from the tangent (points to one side of the road). */
export function perpendicular(t: Point): Point {
  // Guard against negative zero so downstream equality stays clean.
  return { x: t.y === 0 ? 0 : -t.y, y: t.x };
}

/**
 * Signed lane offsets for `count` markers clustered at one stage, centered on
 * the road: [0], [0, 1, -1], [0, 1, -1, 2, -2], … so they fan out symmetrically
 * instead of stacking on top of each other.
 */
export function clusterOffsets(count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const k = Math.ceil(i / 2);
    const v = i % 2 === 1 ? k : -k;
    out.push(v === 0 ? 0 : v); // avoid -0
  }
  return out;
}

// Spacing constants (viewBox units).
export const LANE_STEP = 26; // between clustered on-road markers
export const SHOULDER_GAP = 60; // road edge → first parked marker
export const SHOULDER_STEP = 30; // between parked markers
export const EXIT_GAP = 70; // how far down the exit ramp

/** On the road at the stage, offset perpendicular by a signed lane index. */
export function placeOnRoad(base: Point, perp: Point, laneOffset: number): Point {
  return {
    x: base.x + perp.x * laneOffset * LANE_STEP,
    y: base.y + perp.y * laneOffset * LANE_STEP,
  };
}

/** Parked on the shoulder: pushed off one side of the road, stacked by index. */
export function placeShoulder(base: Point, perp: Point, index: number): Point {
  const d = SHOULDER_GAP + index * SHOULDER_STEP;
  return { x: base.x + perp.x * d, y: base.y + perp.y * d };
}

/** Off an exit ramp: forward along the road and off to the far side. */
export function placeExit(
  base: Point,
  perp: Point,
  tangent: Point,
  index: number,
): Point {
  const dir = normalize(tangent.x - perp.x, tangent.y - perp.y);
  const d = EXIT_GAP + index * SHOULDER_STEP;
  return { x: base.x + dir.x * d, y: base.y + dir.y * d };
}
