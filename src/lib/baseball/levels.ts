/**
 * Development levels — how far a player has traveled along the road.
 *
 * Deliberately a *pure baseball-level* ladder with NO `INACTIVE` value: level
 * answers "how far have they traveled", never "what is their current status".
 * Status (injured / released / retired / …) lives separately in ./status.ts.
 * This is the plan's divergence from the spec's §25 example union — see
 * plan 0001, "Road semantics".
 */

export const DEVELOPMENT_LEVELS = [
  "UNSIGNED",
  "SIGNED",
  "COMPLEX",
  "LOW_A",
  "HIGH_A",
  "AA",
  "AAA",
  "MLB",
] as const;

export type DevelopmentLevel = (typeof DEVELOPMENT_LEVELS)[number];

/** Human-readable labels for road landmarks and the Development Lanes columns. */
export const LEVEL_LABELS: Record<DevelopmentLevel, string> = {
  UNSIGNED: "Unsigned",
  SIGNED: "Signed",
  COMPLEX: "Complex / Rookie",
  LOW_A: "Low-A",
  HIGH_A: "High-A",
  AA: "Double-A",
  AAA: "Triple-A",
  MLB: "MLB",
};

/** Ordinal rank of each level (UNSIGNED = 0 … MLB = 7), for comparisons. */
export const LEVEL_ORDER: Record<DevelopmentLevel, number> = Object.fromEntries(
  DEVELOPMENT_LEVELS.map((level, index) => [level, index]),
) as Record<DevelopmentLevel, number>;

/** Negative if `a` is lower than `b`, positive if higher, 0 if equal. */
export function compareLevels(a: DevelopmentLevel, b: DevelopmentLevel): number {
  return LEVEL_ORDER[a] - LEVEL_ORDER[b];
}

/** True when `level` is at least as advanced as `threshold` (e.g. "AA or higher"). */
export function isAtLeast(
  level: DevelopmentLevel,
  threshold: DevelopmentLevel,
): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[threshold];
}

/** The more-advanced of two levels. */
export function maxLevel(
  a: DevelopmentLevel,
  b: DevelopmentLevel,
): DevelopmentLevel {
  return LEVEL_ORDER[a] >= LEVEL_ORDER[b] ? a : b;
}
