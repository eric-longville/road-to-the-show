import { describe, it, expect } from "vitest";
import {
  PLAYER_STATUSES,
  roadTreatment,
  hasChangedOrganization,
  type PlayerStatus,
} from "./status";

describe("roadTreatment", () => {
  it("keeps active and MLB players on the road with no badge", () => {
    expect(roadTreatment("ACTIVE")).toEqual({ placement: "ON_ROAD", badge: null });
    expect(roadTreatment("MLB")).toEqual({ placement: "ON_ROAD", badge: null });
  });

  it("keeps injured players on the road with a temporary injury badge", () => {
    // Injury is a temporary overlay — the player stays at their level.
    expect(roadTreatment("INJURED")).toEqual({
      placement: "ON_ROAD",
      badge: "INJURY",
    });
  });

  it("keeps traded players on the road with a trade badge", () => {
    expect(roadTreatment("TRADED")).toEqual({
      placement: "ON_ROAD",
      badge: "TRADE",
    });
  });

  it("parks released and unsigned players on the shoulder", () => {
    expect(roadTreatment("RELEASED").placement).toBe("SHOULDER");
    expect(roadTreatment("UNSIGNED").placement).toBe("SHOULDER");
  });

  it("sends retired players off the exit ramp", () => {
    expect(roadTreatment("RETIRED")).toEqual({
      placement: "EXIT_RAMP",
      badge: null,
    });
  });

  it("returns a defined treatment for every status", () => {
    for (const status of PLAYER_STATUSES) {
      const treatment = roadTreatment(status as PlayerStatus);
      expect(["ON_ROAD", "SHOULDER", "EXIT_RAMP"]).toContain(
        treatment.placement,
      );
    }
  });
});

describe("hasChangedOrganization", () => {
  it("is true only when the current org differs from the drafting org", () => {
    expect(hasChangedOrganization("CLE", "PIT")).toBe(true);
    expect(hasChangedOrganization("CLE", "CLE")).toBe(false);
  });

  it("is false when the current org is unknown", () => {
    expect(hasChangedOrganization("CLE", undefined)).toBe(false);
  });
});
