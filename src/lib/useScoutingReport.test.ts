import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useScoutingReport } from "./useScoutingReport";

const KEY = "rtts:scouting-report";

describe("useScoutingReport", () => {
  beforeEach(() => localStorage.clear());

  it("toggles a favorite on and off and persists it", () => {
    const { result } = renderHook(() => useScoutingReport());

    act(() => result.current.toggle("683953"));
    expect(result.current.isFavorite("683953")).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toContain("683953");

    act(() => result.current.toggle("683953"));
    expect(result.current.isFavorite("683953")).toBe(false);
    expect(JSON.parse(localStorage.getItem(KEY)!)).not.toContain("683953");
  });

  it("hydrates existing favorites from storage on mount", async () => {
    localStorage.setItem(KEY, JSON.stringify(["999"]));
    const { result } = renderHook(() => useScoutingReport());
    await waitFor(() => expect(result.current.isFavorite("999")).toBe(true));
  });
});
