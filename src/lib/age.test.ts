import { describe, it, expect } from "vitest";
import { ageInYears } from "./age";

describe("ageInYears", () => {
  const born = "2002-08-28"; // Travis Bazzana

  it("counts a birthday that has already passed this year", () => {
    expect(ageInYears(born, new Date("2026-09-01T00:00:00Z"))).toBe(24);
  });

  it("does not count a birthday still ahead this year", () => {
    expect(ageInYears(born, new Date("2026-08-01T00:00:00Z"))).toBe(23);
  });

  it("counts the birthday itself", () => {
    expect(ageInYears(born, new Date("2026-08-28T00:00:00Z"))).toBe(24);
  });
});
