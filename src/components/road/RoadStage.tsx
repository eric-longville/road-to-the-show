import type { DevelopmentLevel } from "@/lib/baseball";
import { LEVEL_LABELS } from "@/lib/baseball";
import type { Point } from "./layout";
import { LEVEL_COLORS } from "./roadStyle";

/** A milepost landmark for one development level, with its label and count. */
export function RoadStage({
  level,
  point,
  count,
  labelBelow,
}: {
  level: DevelopmentLevel;
  point: Point;
  count: number;
  /** Put the label below the road instead of above (avoids the shoulder). */
  labelBelow?: boolean;
}) {
  const color = LEVEL_COLORS[level];
  const dy = labelBelow ? 40 : -30;
  return (
    <g aria-hidden="true">
      <circle cx={point.x} cy={point.y} r={7} fill={color} stroke="#0f172a" strokeWidth={2} />
      <g transform={`translate(${point.x}, ${point.y + dy})`}>
        <text
          textAnchor="middle"
          fontSize={15}
          fontWeight={700}
          fill="var(--road-ink)"
        >
          {LEVEL_LABELS[level]}
        </text>
        <text textAnchor="middle" y={16} fontSize={12} fill="var(--road-muted)">
          {count} {count === 1 ? "player" : "players"}
        </text>
      </g>
    </g>
  );
}
