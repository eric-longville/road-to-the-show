import { describe, it, expect } from "vitest";
import {
  DEVELOPMENT_LEVELS,
  LEVEL_LABELS,
  LEVEL_ORDER,
  compareLevels,
  isAtLeast,
  maxLevel,
} from "./levels";

describe("development levels", () => {
  it("is the 8-stage ladder with no INACTIVE value", () => {
    expect(DEVELOPMENT_LEVELS).toEqual([
      "UNSIGNED",
      "SIGNED",
      "COMPLEX",
      "LOW_A",
      "HIGH_A",
      "AA",
      "AAA",
      "MLB",
    ]);
    // INACTIVE is a status, not a level (plan 0001 divergence from spec §25).
    expect(DEVELOPMENT_LEVELS).not.toContain("INACTIVE");
  });

  it("labels every level", () => {
    for (const level of DEVELOPMENT_LEVELS) {
      expect(LEVEL_LABELS[level]).toBeTruthy();
    }
  });

  it("orders levels 0..7 in ladder order", () => {
    expect(LEVEL_ORDER.UNSIGNED).toBe(0);
    expect(LEVEL_ORDER.MLB).toBe(7);
    DEVELOPMENT_LEVELS.forEach((level, index) => {
      expect(LEVEL_ORDER[level]).toBe(index);
    });
  });
});

describe("compareLevels", () => {
  it("is negative / positive / zero by ladder rank", () => {
    expect(compareLevels("LOW_A", "AA")).toBeLessThan(0);
    expect(compareLevels("MLB", "AAA")).toBeGreaterThan(0);
    expect(compareLevels("HIGH_A", "HIGH_A")).toBe(0);
  });
});

describe("isAtLeast", () => {
  it("treats equal and higher as satisfying the threshold", () => {
    expect(isAtLeast("AA", "AA")).toBe(true);
    expect(isAtLeast("AAA", "AA")).toBe(true);
    expect(isAtLeast("HIGH_A", "AA")).toBe(false);
  });
});

describe("maxLevel", () => {
  it("returns the more-advanced level regardless of argument order", () => {
    expect(maxLevel("LOW_A", "AAA")).toBe("AAA");
    expect(maxLevel("AAA", "LOW_A")).toBe("AAA");
    expect(maxLevel("MLB", "MLB")).toBe("MLB");
  });
});
