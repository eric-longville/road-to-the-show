/**
 * Player status and how it renders on the road.
 *
 * Status is separate from level (see ./levels.ts). It maps to one of three road
 * treatments (plan 0001, "Road semantics"):
 *   - ON_ROAD   — at the marker's level; may carry a temporary overlay badge.
 *   - SHOULDER  — "parked on the shoulder" beside the last-known point; future
 *                 unknown (released / currently unsigned).
 *   - EXIT_RAMP — left baseball via an exit ramp (retired).
 *
 * Note: INJURED and TRADED are conceptually *overlays* on an otherwise-active,
 * on-road player rather than mutually-exclusive states. We keep them in the
 * single spec-compatible enum for now; M2 may promote them to flags. The trade
 * indicator is also derivable from organizations via `hasChangedOrganization`,
 * so the marker can show it regardless of the status value.
 */

export const PLAYER_STATUSES = [
  "ACTIVE",
  "MLB",
  "INJURED",
  "TRADED",
  "RELEASED",
  "UNSIGNED",
  "RETURNED_TO_SCHOOL",
  "INDEPENDENT",
  "RETIRED",
] as const;

export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export type RoadPlacement = "ON_ROAD" | "SHOULDER" | "EXIT_RAMP";

/** Temporary overlay indicator drawn on top of an on-road marker. */
export type MarkerBadge = "INJURY" | "TRADE";

export interface RoadTreatment {
  placement: RoadPlacement;
  badge: MarkerBadge | null;
}

/**
 * Map a status to its road treatment.
 *
 * RETURNED_TO_SCHOOL and INDEPENDENT are parked on the shoulder for now — their
 * final metaphor is an open question in plan 0001, to be settled during the
 * marker build.
 */
export function roadTreatment(status: PlayerStatus): RoadTreatment {
  switch (status) {
    case "ACTIVE":
    case "MLB":
      return { placement: "ON_ROAD", badge: null };
    case "INJURED":
      return { placement: "ON_ROAD", badge: "INJURY" };
    case "TRADED":
      return { placement: "ON_ROAD", badge: "TRADE" };
    case "RELEASED":
    case "UNSIGNED":
    case "RETURNED_TO_SCHOOL":
    case "INDEPENDENT":
      return { placement: "SHOULDER", badge: null };
    case "RETIRED":
      return { placement: "EXIT_RAMP", badge: null };
  }
}

/**
 * Whether a player currently sits with an organization other than the one that
 * drafted them — the signal behind the "changed org" trade indicator, usable
 * even when `status` is ACTIVE (a traded-but-still-developing player).
 */
export function hasChangedOrganization(
  draftingOrganizationId: string,
  currentOrganizationId?: string,
): boolean {
  return (
    currentOrganizationId != null &&
    currentOrganizationId !== draftingOrganizationId
  );
}
