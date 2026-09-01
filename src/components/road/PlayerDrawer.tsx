"use client";

import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { DraftClassEntry, Organization } from "@/lib/baseball";
import { LEVEL_LABELS } from "@/lib/baseball";
import { ageInYears } from "@/lib/age";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const MILESTONE_LABELS: Record<string, string> = {
  DRAFTED: "Drafted",
  SIGNED: "Signed",
  PRO_DEBUT: "Pro debut",
  MLB_DEBUT: "MLB debut",
};

const humanStatus = (s: string) =>
  s.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <dt className="text-[color:var(--road-muted)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/10 pt-3">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--road-muted)]">
        {title}
      </h4>
      {children}
    </section>
  );
}

export function PlayerDrawer({
  entry,
  currentOrg,
  draftingOrgName,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  entry: DraftClassEntry | null;
  currentOrg?: Organization;
  draftingOrgName?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const open = entry !== null;

  // Focus the close button on open; restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!entry) return null;
  const { player, pick } = entry;

  const traded =
    !!player.currentOrganizationId &&
    player.currentOrganizationId !== pick.draftingOrganizationId;
  const debut = player.milestones?.find((m) => m.type === "MLB_DEBUT");

  // Minimal focus trap: keep Tab within the panel.
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onKeyDown={onKeyDown}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-[color:var(--background)] p-5 shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={headingId} className="text-xl font-bold leading-tight">
              {player.firstName} {player.lastName}
            </h2>
            <p className="text-sm text-[color:var(--road-muted)]">
              {player.position} · bats {player.bats ?? "?"} / throws{" "}
              {player.throws ?? "?"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleFavorite(player.id)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? "Remove from scouting report"
                  : "Add to scouting report"
              }
              className="rounded-md px-2 py-1 text-lg leading-none hover:bg-black/5"
              title="Scouting report"
            >
              <span className={isFavorite ? "text-amber-500" : "text-[color:var(--road-muted)]"}>
                {isFavorite ? "★" : "☆"}
              </span>
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close player details"
              className="rounded-md px-2 py-1 text-[color:var(--road-muted)] hover:bg-black/5"
            >
              ✕
            </button>
          </div>
        </div>

        <Section title="Overview">
          <dl>
            <Row label="Date of birth" value={player.birthDate ?? "—"} />
            <Row
              label="Age"
              value={player.birthDate ? ageInYears(player.birthDate, new Date()) : "—"}
            />
            <Row
              label="Draft"
              value={`${pick.draftYear} · Round ${pick.round} · #${pick.pickNumber}`}
            />
            <Row label="Drafted by" value={draftingOrgName ?? pick.draftingOrganizationId} />
            <Row
              label="Current org"
              value={
                <span>
                  {currentOrg?.name ?? player.currentOrganizationId ?? "—"}
                  {traded && (
                    <span className="ml-1 rounded bg-indigo-100 px-1 text-xs font-semibold text-indigo-700">
                      traded
                    </span>
                  )}
                </span>
              }
            />
            <Row label="School" value={pick.school ?? "—"} />
            <Row
              label="Signing"
              value={
                pick.signed
                  ? pick.signingBonus
                    ? `Signed · ${money.format(pick.signingBonus)}`
                    : "Signed"
                  : "Unsigned"
              }
            />
          </dl>
        </Section>

        <Section title="Development">
          <dl>
            <Row label="Reached" value={LEVEL_LABELS[player.highestLevelReached]} />
            <Row label="Current level" value={LEVEL_LABELS[player.currentLevel]} />
            <Row label="Affiliate" value={player.currentAffiliateName ?? "—"} />
            <Row label="Status" value={humanStatus(player.status)} />
            {debut && <Row label="MLB debut" value={debut.occurredAt} />}
          </dl>
        </Section>

        <Section title="Statistics">
          <p className="text-sm text-[color:var(--road-muted)]">
            Season stats by level arrive with the data pipeline (M2 / M5).
          </p>
        </Section>

        {player.milestones?.length ? (
          <Section title="Timeline">
            <ol className="flex flex-col gap-1.5 text-sm">
              {player.milestones.map((m, i) => (
                <li key={`${m.type}-${i}`} className="flex justify-between gap-3">
                  <span>{MILESTONE_LABELS[m.type] ?? m.type}</span>
                  <span className="text-[color:var(--road-muted)]">{m.occurredAt}</span>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}
      </div>
    </div>
  );
}
