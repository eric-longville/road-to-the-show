// build-class.mjs <year>
//
// Pulls a Cleveland (team 114) draft class from the MLB Stats API and resolves,
// for each pick: current level/org/affiliate, true highestLevelReached (from
// MiLB history), and a life-cycle status. Writes data/raw/guardians-<year>.json,
// which scripts/generate-seed.mjs then turns into the typed seed.
//
// This is the live-pull step (network). Re-run to refresh, bumping AS_OF.
// Model note: a *trade* is represented by currentOrganizationId != drafting org
// (CLE) — NOT by a status. Status is the life-cycle state only.
//
// It also demonstrates, at bounded scale, the "where are they now" resolution
// that M2's roster-sync generalizes (plan 0001, R2).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const YEAR = Number(process.argv[2]);
if (!YEAR) throw new Error("usage: node scripts/build-class.mjs <year>");

const CLE = 114;
const AS_OF = "2026-08-31"; // bump when refreshing current-status data
const OUT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "../data/raw");
const OUT = path.join(OUT_DIR, `guardians-${YEAR}.json`);
const H = { headers: { Accept: "application/json" } };
const get = async (u) => (await fetch(u, H)).json();

const SPORT_TO_LEVEL = { 1: "MLB", 11: "AAA", 12: "AA", 13: "HIGH_A", 14: "LOW_A", 16: "COMPLEX", 17: "COMPLEX" };
const LEVEL_RANK = { UNSIGNED: 0, SIGNED: 1, COMPLEX: 2, LOW_A: 3, HIGH_A: 4, AA: 5, AAA: 6, MLB: 7 };
const higher = (a, b) => (LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b);

// 1) Draft facts + bio.
const draft = await get(`https://statsapi.mlb.com/api/v1/draft/${YEAR}`);
const copyright = draft.copyright;
const picks = [];
for (const r of draft.drafts.rounds)
  for (const p of r.picks)
    if (p.team?.id === CLE) {
      const per = p.person || {};
      picks.push({
        pickNumber: p.pickNumber,
        round: String(p.pickRound),
        mlbamId: per.id,
        firstName: per.firstName,
        lastName: per.lastName,
        position: per.primaryPosition?.abbreviation ?? "",
        bats: per.batSide?.code,
        throws: per.pitchHand?.code,
        birthDate: per.birthDate,
        school: p.school?.name,
        signingBonus: p.signingBonus ? Number(p.signingBonus) : undefined,
        mlbDebutDate: per.mlbDebutDate || null,
      });
    }
const ids = picks.map((p) => p.mlbamId);

// 2) Current team + active flag.
const people = (await get(`https://statsapi.mlb.com/api/v1/people?personIds=${ids.join(",")}&hydrate=currentTeam`)).people;
const personById = Object.fromEntries(people.map((p) => [p.id, p]));

// 3) Team universe (the teamIds filter is ignored by this endpoint, so fetch
// all once and index by id) — gives level (sport) + parentOrgId per team.
const allTeams = (await get("https://statsapi.mlb.com/api/v1/teams?hydrate=sport,league")).teams;
const teamById = Object.fromEntries(allTeams.map((t) => [t.id, t]));

// 4) MiLB level history per player -> highest affiliated level.
const milbHighestById = {};
await Promise.all(
  ids.map(async (id) => {
    const j = await get(`https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=yearByYear&group=hitting,pitching&leagueListId=milb_all`);
    let best = null;
    for (const g of j.stats || [])
      for (const s of g.splits || []) {
        const lvl = SPORT_TO_LEVEL[s.sport?.id];
        if (lvl) best = best ? higher(best, lvl) : lvl;
      }
    milbHighestById[id] = best;
  }),
);

// 5) Resolve MLB-org id per player, then look those clubs up by exact id.
function orgMlbamOf(person) {
  const ct = person.currentTeam;
  if (!ct) return null;
  const team = teamById[ct.id] || {};
  const sportId = team.sport?.id;
  if (sportId === 1) return ct.id; // an MLB club is its own org
  if (SPORT_TO_LEVEL[sportId]) return team.parentOrgId ?? null; // affiliated MiLB
  return null; // independent / non-affiliated
}
const orgMlbamIds = [...new Set(people.map(orgMlbamOf).filter(Boolean))];
const orgByMlbam = {};
for (const id of orgMlbamIds) {
  const t = teamById[id];
  if (t) orgByMlbam[id] = { id: t.abbreviation, mlbamId: id, name: t.name, abbreviation: t.abbreviation };
}

// 6) Combine.
const combined = picks.map((pk) => {
  const person = personById[pk.mlbamId] || {};
  const ct = person.currentTeam || null;
  const team = ct ? teamById[ct.id] || {} : {};
  const affiliatedLevel = SPORT_TO_LEVEL[team.sport?.id] || null;
  const isIndependent = ct && !affiliatedLevel; // has a team, but not an affiliated level
  const reachedMLB = !!pk.mlbDebutDate;
  const signed = pk.signingBonus != null || affiliatedLevel != null || milbHighestById[pk.mlbamId] != null;

  let highest = milbHighestById[pk.mlbamId] || affiliatedLevel || "SIGNED";
  if (affiliatedLevel) highest = higher(highest, affiliatedLevel);
  if (reachedMLB) highest = "MLB";

  const currentLevel = affiliatedLevel || (signed ? highest : "UNSIGNED");

  const orgMlbam = orgMlbamOf(person);
  const currentOrganizationId = orgMlbam ? orgByMlbam[orgMlbam]?.id ?? null : null;

  let status;
  if (!signed) status = "UNSIGNED";
  else if (isIndependent) status = "INDEPENDENT";
  else if (person.active === false) status = "RELEASED";
  else if (reachedMLB) status = "MLB";
  else status = "ACTIVE";

  return {
    ...pk,
    active: person.active ?? null,
    signed,
    resolvedAsOf: AS_OF,
    currentTeamId: ct?.id ?? null,
    currentAffiliateName: ct?.name ?? null,
    currentLevel,
    highestLevelReached: highest,
    currentOrganizationId,
    status,
  };
});

// Organizations referenced by this class (CLE always present as the drafter).
const orgList = Object.values(orgByMlbam);
if (!orgList.some((o) => o.id === "CLE")) orgList.unshift({ id: "CLE", mlbamId: 114, name: "Cleveland Guardians", abbreviation: "CLE" });
orgList.sort((a, b) => (a.id === "CLE" ? -1 : b.id === "CLE" ? 1 : a.id.localeCompare(b.id)));

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      _provenance: {
        source: "MLB Stats API (statsapi.mlb.com)",
        copyright,
        draftEndpoint: `/api/v1/draft/${YEAR}`,
        statusResolvedAsOf: AS_OF,
        note: "Draft facts+bio from the draft feed; current level/org/affiliate from people+teams; highestLevelReached from MiLB history (leagueListId=milb_all) + MLB debut. Status is heuristic (life-cycle only; trades are org-derived). Personal/non-commercial use (plan 0001, R1).",
      },
      organizations: orgList,
      picks: combined,
    },
    null,
    2,
  ) + "\n",
);

const tally = (key) => combined.reduce((a, c) => ((a[c[key]] = (a[c[key]] || 0) + 1), a), {});
console.log(`wrote ${OUT} (${combined.length} picks); orgs=${orgList.map((o) => o.id).join(",")}`);
console.log("status:", tally("status"), "currentLevel:", tally("currentLevel"));
