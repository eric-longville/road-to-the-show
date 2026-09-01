import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoadCanvas } from "./RoadCanvas";
import { guardians2024 } from "@/lib/baseball/seed";

beforeAll(() => {
  // jsdom implements no SVG geometry; stub it on SVGElement so path instances
  // inherit it, letting the layout effect run.
  Object.defineProperty(SVGElement.prototype, "getTotalLength", {
    configurable: true,
    value: () => 1000,
  });
  Object.defineProperty(SVGElement.prototype, "getPointAtLength", {
    configurable: true,
    value: (len: number) => ({ x: len, y: 100 }),
  });
});

describe("RoadCanvas", () => {
  it("renders one interactive marker per player in the class", async () => {
    render(
      <RoadCanvas entries={guardians2024.entries} selectedId={null} onSelect={() => {}} />,
    );
    const markers = await screen.findAllByRole("button");
    expect(markers).toHaveLength(guardians2024.entries.length);
  });

  it("labels a reached-MLB player with their name and MLB", async () => {
    render(
      <RoadCanvas entries={guardians2024.entries} selectedId={null} onSelect={() => {}} />,
    );
    const bazzana = await screen.findByRole("button", { name: /Travis Bazzana/i });
    expect(bazzana).toHaveAttribute("aria-label", expect.stringMatching(/MLB/));
  });

  it("calls onSelect with the player id when a marker is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <RoadCanvas entries={guardians2024.entries} selectedId={null} onSelect={onSelect} />,
    );
    const bazzana = await screen.findByRole("button", { name: /Travis Bazzana/i });
    fireEvent.click(bazzana);
    expect(onSelect).toHaveBeenCalledWith("683953");
  });
});
