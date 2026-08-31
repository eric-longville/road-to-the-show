import { describe, it, expect } from "vitest";
import {
  draftClasses,
  guardians2021,
  organizations,
  organizationsById,
} from ".";
import { DEVELOPMENT_LEVELS, LEVEL_ORDER } from "../levels";
import { roadLevel } from "../progress";
import { PLAYER_STATUSES, roadTreatment, hasChangedOrganization } from "../status";

const allEntries = draftClasses.flatMap((c) => c.entries);
const orgIds = new Set(organizations.map((o) => o.id));

describe("seed — structure & integrity (all classes)", () => {
  it("has the 2021 and 2024 Guardians classes, 21 picks each", () => {
    expect(draftClasses.map((c) => c.year).sort()).toEqual([2021, 2024]);
    for (const c of draftClasses) expect(c.entries).toHaveLength(21);
  });

  it("has globally-unique player ids and pick ids", () => {
    const playerIds = allEntries.map((e) => e.player.id);
    const pickIds = allEntries.map((e) => e.pick.id);
    expect(new Set(playerIds).size).toBe(playerIds.length);
    expect(new Set(pickIds).size).toBe(pickIds.length);
  });

  it("was drafted entirely by Cleveland (drafting org never changes)", () => {
    for (const c of draftClasses) expect(c.team).toBe("CLE");
    for (const { pick } of allEntries) {
      expect(pick.draftingOrganizationId).toBe("CLE");
    }
  });

  it("uses valid levels and statuses, referencing known orgs", () => {
    for (const { player } of allEntries) {
      expect(DEVELOPMENT_LEVELS).toContain(player.currentLevel);
      expect(DEVELOPMENT_LEVELS).toContain(player.highestLevelReached);
      expect(PLAYER_STATUSES).toContain(player.status);
      if (player.currentOrganizationId) {
        expect(orgIds).toContain(player.currentOrganizationId);
      }
    }
  });

  it("never records a current level above the highest reached", () => {
    for (const { player } of allEntries) {
      expect(LEVEL_ORDER[player.currentLevel]).toBeLessThanOrEqual(
        LEVEL_ORDER[player.highestLevelReached],
      );
      expect(roadLevel(player)).toBe(player.highestLevelReached);
    }
  });

  it("starts every timeline with DRAFTED", () => {
    for (const { player } of allEntries) {
      expect(player.milestones?.[0]?.type).toBe("DRAFTED");
    }
  });

  it("resolves every referenced org id to an organization record", () => {
    for (const id of orgIds) expect(organizationsById[id]).toBeDefined();
  });
});

describe("seed — the notable real cases", () => {
  const find = (id: string) => allEntries.find((e) => e.player.id === id)!;

  it("2024: Travis Bazzana reached MLB (#1 overall)", () => {
    const { player, pick } = find("683953");
    expect(pick.draftYear).toBe(2024);
    expect(pick.pickNumber).toBe(1);
    expect(player.status).toBe("MLB");
    expect(player.milestones?.some((m) => m.type === "MLB_DEBUT")).toBe(true);
  });

  it("2024: Jacob Cozart is an active prospect traded out of the org (org, not status)", () => {
    const { player } = find("695524");
    expect(player.status).toBe("ACTIVE");
    expect(player.currentOrganizationId).toBe("LAA");
    // Trade is derived from the org mismatch, not a status value.
    expect(hasChangedOrganization("CLE", player.currentOrganizationId)).toBe(true);
  });

  it("2021: Doug Nikhazy reached MLB then dropped to Complex — the marker stays at MLB", () => {
    const { player } = find("680951");
    expect(player.highestLevelReached).toBe("MLB");
    expect(player.currentLevel).toBe("COMPLEX");
    expect(roadLevel(player)).toBe("MLB"); // never moves backward
    expect(player.currentOrganizationId).toBe("CHC"); // and was traded
  });

  it("2021: released players park on the shoulder", () => {
    const released = guardians2021.entries.filter(
      (e) => e.player.status === "RELEASED",
    );
    expect(released.length).toBeGreaterThanOrEqual(1);
    for (const { player } of released) {
      expect(roadTreatment(player.status).placement).toBe("SHOULDER");
    }
  });

  it("2021: the independent-league player parks on the shoulder", () => {
    const indy = guardians2021.entries.filter(
      (e) => e.player.status === "INDEPENDENT",
    );
    expect(indy.length).toBeGreaterThanOrEqual(1);
    for (const { player } of indy) {
      expect(roadTreatment(player.status).placement).toBe("SHOULDER");
    }
  });
});
