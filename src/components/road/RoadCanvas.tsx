"use client";

import { useEffect, useRef, useState } from "react";
import type {
  DevelopmentLevel,
  DraftClassEntry,
  RoadPlacement,
} from "@/lib/baseball";
import {
  DEVELOPMENT_LEVELS,
  LEVEL_LABELS,
  PROGRESS_MAP,
  hasChangedOrganization,
  roadLevel,
  roadTreatment,
} from "@/lib/baseball";
import {
  clamp01,
  clusterOffsets,
  normalize,
  perpendicular,
  placeExit,
  placeOnRoad,
  placeShoulder,
  type Point,
} from "./layout";
import { LEVEL_COLORS, MARKER_R, ROAD_PATH_D, VIEW_H, VIEW_W } from "./roadStyle";
import { RoadStage } from "./RoadStage";
import { PlayerMarker, type MarkerBadges } from "./PlayerMarker";

const DRAFTING_ORG = "CLE";

interface MarkerModel {
  entry: DraftClassEntry;
  point: Point;
  placement: RoadPlacement;
  badges: MarkerBadges;
}
interface StageModel {
  level: DevelopmentLevel;
  point: Point;
  count: number;
}
interface Geometry {
  stages: StageModel[];
  markers: MarkerModel[];
  end: Point;
}

function badgesFor(entry: DraftClassEntry): MarkerBadges {
  return {
    injury: entry.player.status === "INJURED",
    trade: hasChangedOrganization(DRAFTING_ORG, entry.player.currentOrganizationId),
  };
}

export function RoadCanvas({
  entries,
  selectedId,
  onSelect,
}: {
  entries: DraftClassEntry[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const hasLen = typeof path.getTotalLength === "function";
    const total = hasLen ? path.getTotalLength() : 1;

    const sample = (progress: number): Point => {
      const pr = clamp01(progress);
      if (hasLen) {
        const p = path.getPointAtLength(total * pr);
        return { x: p.x, y: p.y };
      }
      return { x: 70 + pr * (VIEW_W - 140), y: VIEW_H / 2 }; // straight-line fallback
    };
    const tangentAt = (progress: number): Point => {
      if (!hasLen) return { x: 1, y: 0 };
      const l = clamp01(progress) * total;
      const a = path.getPointAtLength(Math.max(0, l - 1));
      const b = path.getPointAtLength(Math.min(total, l + 1));
      return normalize(b.x - a.x, b.y - a.y);
    };

    const byLevel = new Map<DevelopmentLevel, DraftClassEntry[]>();
    for (const e of entries) {
      const lvl = roadLevel(e.player);
      const arr = byLevel.get(lvl) ?? [];
      arr.push(e);
      byLevel.set(lvl, arr);
    }

    const stages: StageModel[] = DEVELOPMENT_LEVELS.map((level) => ({
      level,
      point: sample(PROGRESS_MAP[level]),
      count: byLevel.get(level)?.length ?? 0,
    }));

    const markers: MarkerModel[] = [];
    for (const level of DEVELOPMENT_LEVELS) {
      const group = byLevel.get(level);
      if (!group?.length) continue;
      const base = sample(PROGRESS_MAP[level]);
      const t = tangentAt(PROGRESS_MAP[level]);
      const perp = perpendicular(t);
      const sorted = [...group].sort((a, b) => a.pick.pickNumber - b.pick.pickNumber);
      const placeOf = (e: DraftClassEntry) => roadTreatment(e.player.status).placement;
      const onRoad = sorted.filter((e) => placeOf(e) === "ON_ROAD");
      const shoulder = sorted.filter((e) => placeOf(e) === "SHOULDER");
      const exit = sorted.filter((e) => placeOf(e) === "EXIT_RAMP");
      const lanes = clusterOffsets(onRoad.length);
      onRoad.forEach((e, i) =>
        markers.push({ entry: e, point: placeOnRoad(base, perp, lanes[i]), placement: "ON_ROAD", badges: badgesFor(e) }),
      );
      shoulder.forEach((e, i) =>
        markers.push({ entry: e, point: placeShoulder(base, perp, i), placement: "SHOULDER", badges: badgesFor(e) }),
      );
      exit.forEach((e, i) =>
        markers.push({ entry: e, point: placeExit(base, perp, t, i), placement: "EXIT_RAMP", badges: badgesFor(e) }),
      );
    }

    setGeo({ stages, markers, end: sample(1) });
  }, [entries]);

  const markers = geo?.markers ?? [];
  const rank = (id: string) => (id === selectedId ? 2 : id === hoveredId ? 1 : 0);
  const ordered = [...markers].sort(
    (a, b) => rank(a.entry.player.id) - rank(b.entry.player.id),
  );
  const hovered = markers.find((m) => m.entry.player.id === hoveredId) ?? null;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      role="group"
      aria-label={`Road to the Show — ${entries.length} players by highest level reached`}
      style={{ display: "block", height: "auto", maxWidth: "100%", touchAction: "manipulation" }}
    >
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="var(--road-surface)" />

      {/* Road: asphalt casing (sampled) + dashed center line. */}
      <path ref={pathRef} d={ROAD_PATH_D} fill="none" stroke="var(--road-asphalt)" strokeWidth={36} strokeLinecap="round" />
      <path d={ROAD_PATH_D} fill="none" stroke="var(--road-line)" strokeWidth={3} strokeDasharray="14 16" strokeLinecap="round" opacity={0.9} />

      {/* Stadium at the end of the road. */}
      {geo && (
        <g transform={`translate(${geo.end.x}, ${geo.end.y})`} aria-hidden="true">
          <path d="M -26 6 a 26 20 0 0 1 52 0 Z" fill="#ef4444" stroke="#0f172a" strokeWidth={2} />
          <path d="M -20 6 h 40 v 10 h -40 Z" fill="#b91c1c" />
          <text textAnchor="middle" y={-14} fontSize={12} fontWeight={800} fill="var(--road-ink)">
            THE SHOW
          </text>
        </g>
      )}

      {/* Stage landmarks. */}
      {geo?.stages.map((s, i) => (
        <RoadStage key={s.level} level={s.level} point={s.point} count={s.count} labelBelow={i % 2 === 1} />
      ))}

      {/* Player markers (selected/hovered rendered last, on top). */}
      {ordered.map((m) => (
        <PlayerMarker
          key={m.entry.player.id}
          entry={m.entry}
          point={m.point}
          placement={m.placement}
          badges={m.badges}
          selected={m.entry.player.id === selectedId}
          hovered={m.entry.player.id === hoveredId}
          onSelect={(id) => onSelect(id === selectedId ? null : id)}
          onHover={setHoveredId}
        />
      ))}

      {/* Hover preview. */}
      {hovered && <HoverCard model={hovered} />}
    </svg>
  );
}

function HoverCard({ model }: { model: MarkerModel }) {
  const player = model.entry.player;
  const w = 216;
  const h = 54;
  const x = Math.max(8, Math.min(VIEW_W - w - 8, model.point.x - w / 2));
  const above = model.point.y - MARKER_R - h - 10;
  const y = above < 8 ? model.point.y + MARKER_R + 12 : above;
  const detail =
    LEVEL_LABELS[player.highestLevelReached] +
    (player.currentLevel !== player.highestLevelReached
      ? ` · now ${LEVEL_LABELS[player.currentLevel]}`
      : "");
  const sub = player.currentAffiliateName ?? player.status.replace(/_/g, " ");
  return (
    <g pointerEvents="none" transform={`translate(${x}, ${y})`}>
      {/* Always a dark card (not theme --road-ink) so the light text keeps
          contrast in both light and dark themes. */}
      <rect width={w} height={h} rx={8} fill="#0f172a" opacity={0.97} />
      <rect width={4} height={h} rx={2} fill={LEVEL_COLORS[roadLevel(player)]} />
      <text x={14} y={20} fontSize={13} fontWeight={700} fill="#ffffff">
        {player.firstName} {player.lastName}
      </text>
      <text x={14} y={37} fontSize={11} fill="#cbd5e1">
        {player.position} · {detail}
      </text>
      <text x={14} y={49} fontSize={10} fill="#94a3b8">
        {sub}
      </text>
    </g>
  );
}
