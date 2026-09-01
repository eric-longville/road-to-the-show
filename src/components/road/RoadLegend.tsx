import { DEVELOPMENT_LEVELS, LEVEL_LABELS } from "@/lib/baseball";
import { LEVEL_COLORS } from "./roadStyle";

export function RoadLegend() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-[color:var(--road-muted)]">Level</span>
        {DEVELOPMENT_LEVELS.map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full ring-1 ring-black/20"
              style={{ backgroundColor: LEVEL_COLORS[level] }}
            />
            {LEVEL_LABELS[level]}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[color:var(--road-muted)]">
        <span>
          <span className="mr-1 inline-block h-3 w-3 translate-y-0.5 rounded-full border-2 border-slate-400 bg-slate-200" />
          Parked on the shoulder — released / unsigned / independent
        </span>
        <span>
          <span className="mr-1 inline-block h-4 w-4 translate-y-1 rounded-full bg-indigo-500 text-center text-[9px] font-bold leading-4 text-white">
            ⇄
          </span>
          Traded (now in another org)
        </span>
        <span>
          <span className="mr-1 inline-block h-4 w-4 translate-y-1 rounded-full bg-red-600 text-center text-[10px] font-bold leading-4 text-white">
            +
          </span>
          Injured
        </span>
        <span>Marker sits at the highest level reached — it never moves backward.</span>
      </div>
    </div>
  );
}
