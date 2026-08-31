/**
 * Road position — maps a development level to a normalized 0..1 position along
 * the SVG road path, and computes where a player's marker sits.
 *
 * Core invariant (plan 0001, principle #4 / spec §4): a marker is positioned by
 * `highestLevelReached`, so an injured / demoted / released player NEVER appears
 * to move backward. `currentLevel` and `status` drive styling, not position.
 */

import { DevelopmentLevel, maxLevel } from "./levels";

/**
 * Normalized position of each level along the road path (0 = start, 1 = the
 * stadium at the end). Base values from spec §18; the road step will feed these
 * into `path.getPointAtLength(totalLength * progress)`.
 */
export const PROGRESS_MAP: Record<DevelopmentLevel, number> = {
  UNSIGNED: 0.02,
  SIGNED: 0.12,
  COMPLEX: 0.25,
  LOW_A: 0.4,
  HIGH_A: 0.55,
  AA: 0.7,
  AAA: 0.84,
  MLB: 0.98,
};

/** The minimal shape needed to place a player on the road. */
export interface RoadPositionable {
  currentLevel: DevelopmentLevel;
  highestLevelReached: DevelopmentLevel;
}

/**
 * The level a marker is rendered at: the more-advanced of current and highest.
 * Normally this is `highestLevelReached`; taking the max also defends against
 * malformed data where `currentLevel` exceeds the recorded highest.
 */
export function roadLevel(player: RoadPositionable): DevelopmentLevel {
  return maxLevel(player.currentLevel, player.highestLevelReached);
}

/** Normalized 0..1 road position for a player's marker. */
export function roadProgress(player: RoadPositionable): number {
  return PROGRESS_MAP[roadLevel(player)];
}
