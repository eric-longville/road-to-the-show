import type { KeyboardEvent } from "react";
import type { DraftClassEntry, RoadPlacement } from "@/lib/baseball";
import { LEVEL_LABELS, roadLevel } from "@/lib/baseball";
import type { Point } from "./layout";
import { LEVEL_COLORS, MARKER_R } from "./roadStyle";

export interface MarkerBadges {
  injury: boolean;
  trade: boolean;
}

function ariaLabel(entry: DraftClassEntry, badges: MarkerBadges): string {
  const p = entry.player;
  const name = `${p.firstName} ${p.lastName}`;
  const high = LEVEL_LABELS[p.highestLevelReached];
  const parts = [`${name}, ${p.position}`, `reached ${high}`];
  if (p.currentLevel !== p.highestLevelReached) {
    parts.push(`currently ${LEVEL_LABELS[p.currentLevel]}`);
  }
  parts.push(p.status.toLowerCase().replace(/_/g, " "));
  if (badges.trade) parts.push("traded");
  if (badges.injury) parts.push("injured");
  return parts.join(", ");
}

export function PlayerMarker({
  entry,
  point,
  placement,
  badges,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  entry: DraftClassEntry;
  point: Point;
  placement: RoadPlacement;
  badges: MarkerBadges;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const { player } = entry;
  const id = player.id;
  const color = LEVEL_COLORS[roadLevel(player)];
  const offRoad = placement !== "ON_ROAD";

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <g
      transform={`translate(${point.x}, ${point.y})`}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel(entry, badges)}
      aria-pressed={selected}
      onClick={() => onSelect(id)}
      onKeyDown={handleKey}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
      style={{ cursor: "pointer", outline: "none" }}
    >
      <g
        transform={hovered || selected ? "scale(1.18)" : "scale(1)"}
        style={{ transition: "transform 120ms ease" }}
      >
        {selected && (
          <circle r={MARKER_R + 5} fill="none" stroke="var(--road-ink)" strokeWidth={2.5} />
        )}
        <circle
          r={MARKER_R}
          fill={offRoad ? "#e2e8f0" : color}
          stroke={offRoad ? color : "#0f172a"}
          strokeWidth={2}
          strokeDasharray={placement === "SHOULDER" || placement === "EXIT_RAMP" ? "3 2" : undefined}
          opacity={offRoad ? 0.9 : 1}
        />
        <text
          textAnchor="middle"
          dy={4}
          fontSize={10}
          fontWeight={700}
          fill={offRoad ? "#334155" : "#0b1220"}
          style={{ pointerEvents: "none" }}
        >
          {player.position}
        </text>

        {badges.trade && (
          <g transform={`translate(${-MARKER_R}, ${-MARKER_R})`} aria-hidden="true">
            <circle r={6} fill="#6366f1" stroke="#fff" strokeWidth={1.5} />
            <text textAnchor="middle" dy={3} fontSize={8} fontWeight={700} fill="#fff">
              ⇄
            </text>
          </g>
        )}
        {badges.injury && (
          <g transform={`translate(${MARKER_R}, ${-MARKER_R})`} aria-hidden="true">
            <circle r={6} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
            <text textAnchor="middle" dy={3} fontSize={9} fontWeight={700} fill="#fff">
              +
            </text>
          </g>
        )}
      </g>
    </g>
  );
}
