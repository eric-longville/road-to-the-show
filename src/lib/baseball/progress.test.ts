import { describe, it, expect } from "vitest";
import { DEVELOPMENT_LEVELS } from "./levels";
import { PROGRESS_MAP, roadLevel, roadProgress } from "./progress";

describe("PROGRESS_MAP", () => {
  it("assigns a position to every level", () => {
    for (const level of DEVELOPMENT_LEVELS) {
      expect(typeof PROGRESS_MAP[level]).toBe("number");
    }
  });

  it("increases monotonically along the ladder within 0..1", () => {
    const positions = DEVELOPMENT_LEVELS.map((level) => PROGRESS_MAP[level]);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
    expect(positions[0]).toBeGreaterThanOrEqual(0);
    expect(positions[positions.length - 1]).toBeLessThanOrEqual(1);
  });
});

describe("roadLevel — never moves backward (the core invariant)", () => {
  it("positions by highest level when current is lower (injured/demoted/released)", () => {
    // Reached AA, currently back in HIGH-A → still an AA marker.
    expect(
      roadLevel({ currentLevel: "HIGH_A", highestLevelReached: "AA" }),
    ).toBe("AA");
  });

  it("uses the shared level when current equals highest", () => {
    expect(
      roadLevel({ currentLevel: "AAA", highestLevelReached: "AAA" }),
    ).toBe("AAA");
  });

  it("defends against malformed data where current exceeds highest", () => {
    expect(
      roadLevel({ currentLevel: "MLB", highestLevelReached: "AA" }),
    ).toBe("MLB");
  });
});

describe("roadProgress", () => {
  it("returns the position of the highest level reached", () => {
    expect(
      roadProgress({ currentLevel: "LOW_A", highestLevelReached: "AA" }),
    ).toBe(PROGRESS_MAP.AA);
  });
});
