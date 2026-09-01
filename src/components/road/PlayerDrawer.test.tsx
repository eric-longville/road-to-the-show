import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerDrawer } from "./PlayerDrawer";
import { guardians2024, organizationsById } from "@/lib/baseball/seed";

const bazzana = guardians2024.entries.find((e) => e.player.id === "683953")!;

function renderDrawer(overrides: Partial<React.ComponentProps<typeof PlayerDrawer>> = {}) {
  const props = {
    entry: bazzana,
    currentOrg: organizationsById.CLE,
    draftingOrgName: "Cleveland Guardians",
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<PlayerDrawer {...props} />) };
}

describe("PlayerDrawer", () => {
  it("renders nothing when no player is selected", () => {
    render(
      <PlayerDrawer
        entry={null}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is a labelled modal dialog showing the player's development", () => {
    renderDrawer();
    const dialog = screen.getByRole("dialog", { name: /Travis Bazzana/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // Development section (Bazzana is MLB for both reached and current).
    expect(screen.getByText("Reached")).toBeInTheDocument();
    expect(screen.getByText("Current level")).toBeInTheDocument();
    expect(screen.getAllByText("MLB").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Round 1/)).toBeInTheDocument();
  });

  it("closes via the close button and Escape", () => {
    const { props, rerender } = renderDrawer();
    fireEvent.click(screen.getByRole("button", { name: /close player details/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);

    rerender(<PlayerDrawer {...props} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });

  it("toggles the scouting-report favorite", () => {
    const { props } = renderDrawer({ isFavorite: false });
    fireEvent.click(screen.getByRole("button", { name: /add to scouting report/i }));
    expect(props.onToggleFavorite).toHaveBeenCalledWith("683953");
  });

  it("reflects an already-favorited player as pressed", () => {
    renderDrawer({ isFavorite: true });
    expect(
      screen.getByRole("button", { name: /remove from scouting report/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
