"use client";

import { useMemo, useState } from "react";
import { draftClasses, organizationsById } from "@/lib/baseball/seed";
import { useScoutingReport } from "@/lib/useScoutingReport";
import { RoadCanvas } from "./RoadCanvas";
import { RoadLegend } from "./RoadLegend";
import { PlayerDrawer } from "./PlayerDrawer";

const years = [...new Set(draftClasses.map((c) => c.year))].sort((a, b) => a - b);

export function RoadView() {
  const [year, setYear] = useState(years[years.length - 1]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { isFavorite, toggle } = useScoutingReport();

  const cls = useMemo(
    () => draftClasses.find((c) => c.year === year) ?? draftClasses[0],
    [year],
  );
  const org = organizationsById[cls.team];
  const selected = cls.entries.find((e) => e.player.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            {org?.name ?? cls.team} — {cls.year} draft class
          </h2>
          <p className="text-sm text-[color:var(--road-muted)]">
            {cls.entries.length} picks · positioned by highest level reached · as
            of {cls.asOf}
          </p>
        </div>
        <div
          className="inline-flex rounded-lg border border-black/10 p-0.5"
          role="group"
          aria-label="Draft year"
        >
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                setYear(y);
                setSelectedId(null);
              }}
              aria-pressed={y === year}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                y === year
                  ? "bg-[color:var(--road-ink)] text-white"
                  : "text-[color:var(--road-muted)] hover:bg-black/5"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/10 shadow-sm">
        <RoadCanvas
          entries={cls.entries}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <RoadLegend />

      <PlayerDrawer
        entry={selected}
        currentOrg={
          selected?.player.currentOrganizationId
            ? organizationsById[selected.player.currentOrganizationId]
            : undefined
        }
        draftingOrgName={org?.name}
        isFavorite={selected ? isFavorite(selected.player.id) : false}
        onToggleFavorite={toggle}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
