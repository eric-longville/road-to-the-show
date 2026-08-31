/**
 * Core domain types for the road (plan 0001, refined from spec §25).
 *
 * Key model rules:
 *   - `currentLevel` and `highestLevelReached` are separate (never move backward).
 *   - Drafting org (on the DraftPick) and current org (on the Player) are
 *     separate concepts — a trade never removes a player from their draft class.
 */

import { DevelopmentLevel } from "./levels";
import { PlayerStatus } from "./status";

export type SchoolType = "HIGH_SCHOOL" | "COLLEGE" | "JUCO" | "OTHER";
export type Bats = "L" | "R" | "S";
export type Throws = "L" | "R";

export interface Organization {
  id: string;
  mlbamId?: number;
  name: string;
  abbreviation: string;
}

export interface DraftPick {
  id: string;
  playerId: string;
  draftYear: number;
  /** Round label — a string because comp rounds exist (e.g. "1", "CB-A", "2"). */
  round: string;
  /** Overall pick number across the whole draft. */
  pickNumber: number;
  draftingOrganizationId: string;
  school?: string;
  schoolType?: SchoolType;
  signed: boolean;
  signingBonus?: number;
}

export type MilestoneType =
  | "DRAFTED"
  | "SIGNED"
  | "PRO_DEBUT"
  | "PROMOTED_COMPLEX"
  | "PROMOTED_LOW_A"
  | "PROMOTED_HIGH_A"
  | "PROMOTED_AA"
  | "PROMOTED_AAA"
  | "MLB_DEBUT"
  | "TRADED"
  | "INJURED"
  | "RELEASED"
  | "RETIRED"
  | "RETURNED_TO_SCHOOL";

export interface Milestone {
  type: MilestoneType;
  /** ISO date (yyyy-mm-dd). */
  occurredAt: string;
  organizationId?: string;
  note?: string;
}

export interface Player {
  id: string;
  mlbamId?: number;
  firstName: string;
  lastName: string;
  position: string;
  birthDate?: string;
  bats?: Bats;
  throws?: Throws;
  /** Where the player currently sits; absent implies unknown / unsigned. */
  currentOrganizationId?: string;
  /** Display name of the current affiliate/team (e.g. "Akron RubberDucks"). */
  currentAffiliateName?: string;
  currentLevel: DevelopmentLevel;
  highestLevelReached: DevelopmentLevel;
  status: PlayerStatus;
  /** Milestones-lite for the drawer timeline (M1); full history arrives in M2. */
  milestones?: Milestone[];
}

/** A draft pick joined with its player — the unit the road renders. */
export interface DraftClassEntry {
  pick: DraftPick;
  player: Player;
}

/** One team's draft class for a single year. */
export interface DraftClass {
  /** Drafting organization id (e.g. "CLE"). */
  team: string;
  year: number;
  /** Date the current-status fields were resolved (point-in-time snapshot). */
  asOf: string;
  entries: DraftClassEntry[];
}
