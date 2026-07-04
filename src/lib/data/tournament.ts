import type { Team, BracketSlot, Match, BracketRound } from "@/lib/types";
import { flagUrl } from "@/lib/utils";

/** Snapshot: 4 July 2026 — R32 complete except COL–GHA; R16 starts today */
export const TOURNAMENT_ID = "wc-2026";
export const TOURNAMENT_START = "2026-06-11T17:00:00Z";
export const DATA_AS_OF = "2026-07-04T10:44:00Z";

function t(
  id: string,
  name: string,
  code: string,
  iso: string,
  group: string,
  confederation: string,
  ranking?: number
): Team {
  return {
    id,
    name,
    code,
    flagUrl: flagUrl(iso),
    group,
    confederation,
    fifaRanking: ranking,
  };
}

/** All 32 Round-of-32 teams (fixed bracket) */
export const TEAMS_2026: Team[] = [
  t("can", "Canada", "CAN", "ca", "B", "CONCACAF", 48),
  t("rsa", "South Africa", "RSA", "za", "A", "CAF", 59),
  t("bra", "Brazil", "BRA", "br", "D", "CONMEBOL", 5),
  t("jpn", "Japan", "JPN", "jp", "E", "AFC", 17),
  t("par", "Paraguay", "PAR", "py", "C", "CONMEBOL", 56),
  t("ger", "Germany", "GER", "de", "C", "UEFA", 16),
  t("mar", "Morocco", "MAR", "ma", "F", "CAF", 15),
  t("ned", "Netherlands", "NED", "nl", "F", "UEFA", 7),
  t("nor", "Norway", "NOR", "no", "E", "UEFA", 46),
  t("civ", "Ivory Coast", "CIV", "ci", "G", "CAF", 38),
  t("fra", "France", "FRA", "fr", "I", "UEFA", 2),
  t("swe", "Sweden", "SWE", "se", "I", "UEFA", 26),
  t("mex", "Mexico", "MEX", "mx", "A", "CONCACAF", 14),
  t("ecu", "Ecuador", "ECU", "ec", "F", "CONMEBOL", 30),
  t("eng", "England", "ENG", "gb-eng", "L", "UEFA", 4),
  t("cod", "DR Congo", "COD", "cd", "K", "CAF", 61),
  t("bel", "Belgium", "BEL", "be", "G", "UEFA", 8),
  t("sen", "Senegal", "SEN", "sn", "I", "CAF", 18),
  t("usa", "United States", "USA", "us", "D", "CONCACAF", 11),
  t("bih", "Bosnia & Herzegovina", "BIH", "ba", "B", "UEFA", 62),
  t("esp", "Spain", "ESP", "es", "H", "UEFA", 3),
  t("aut", "Austria", "AUT", "at", "J", "UEFA", 22),
  t("por", "Portugal", "POR", "pt", "K", "UEFA", 6),
  t("cro", "Croatia", "CRO", "hr", "L", "UEFA", 10),
  t("sui", "Switzerland", "SUI", "ch", "B", "UEFA", 20),
  t("alg", "Algeria", "ALG", "dz", "J", "CAF", 37),
  t("aus", "Australia", "AUS", "au", "D", "AFC", 24),
  t("egy", "Egypt", "EGY", "eg", "G", "CAF", 36),
  t("arg", "Argentina", "ARG", "ar", "J", "CONMEBOL", 1),
  t("cpv", "Cape Verde", "CPV", "cv", "H", "CAF", 65),
  t("col", "Colombia", "COL", "co", "K", "CONMEBOL", 13),
  t("gha", "Ghana", "GHA", "gh", "L", "CAF", 60),
];

/** Eliminated from the tournament (group stage + Round of 32) */
export const ELIMINATED_TEAM_IDS = new Set([
  "rsa", "jpn", "ger", "ned", "civ", "swe", "ecu", "cod", "sen", "bih",
  "aut", "cro", "alg", "aus", "cpv", "gha",
]);

export function getActiveTeams(): Team[] {
  return TEAMS_2026.filter((team) => !ELIMINATED_TEAM_IDS.has(team.id));
}

/** Round-of-32 fixture list (FIFA fixed bracket) */
export const R32_FIXTURES: Omit<Match, "id">[] = [
  { round: "r32", matchNumber: 1, homeTeamId: "can", awayTeamId: "rsa", homeScore: 1, awayScore: 0, winnerTeamId: "can", status: "finished", kickoffAt: "2026-06-28T19:00:00-07:00", venue: "SoFi Stadium, Los Angeles" },
  { round: "r32", matchNumber: 2, homeTeamId: "bra", awayTeamId: "jpn", homeScore: 2, awayScore: 1, winnerTeamId: "bra", status: "finished", kickoffAt: "2026-06-29T17:00:00-05:00", venue: "NRG Stadium, Houston" },
  { round: "r32", matchNumber: 3, homeTeamId: "par", awayTeamId: "ger", homeScore: 1, awayScore: 1, winnerTeamId: "par", status: "finished", kickoffAt: "2026-06-29T20:00:00-04:00", venue: "Gillette Stadium, Foxborough", events: [{ type: "goal", minute: 90, teamCode: "PAR", detail: "Won 4-3 on penalties" }] },
  { round: "r32", matchNumber: 4, homeTeamId: "mar", awayTeamId: "ned", homeScore: 1, awayScore: 1, winnerTeamId: "mar", status: "finished", kickoffAt: "2026-06-30T20:00:00-06:00", venue: "Estadio BBVA, Guadalupe", events: [{ type: "goal", minute: 90, teamCode: "MAR", detail: "Won 3-2 on penalties" }] },
  { round: "r32", matchNumber: 5, homeTeamId: "nor", awayTeamId: "civ", homeScore: 2, awayScore: 1, winnerTeamId: "nor", status: "finished", kickoffAt: "2026-06-30T17:00:00-05:00", venue: "AT&T Stadium, Arlington" },
  { round: "r32", matchNumber: 6, homeTeamId: "fra", awayTeamId: "swe", homeScore: 3, awayScore: 0, winnerTeamId: "fra", status: "finished", kickoffAt: "2026-06-30T20:00:00-04:00", venue: "MetLife Stadium, New Jersey" },
  { round: "r32", matchNumber: 7, homeTeamId: "mex", awayTeamId: "ecu", homeScore: 2, awayScore: 0, winnerTeamId: "mex", status: "finished", kickoffAt: "2026-07-01T20:00:00-06:00", venue: "Estadio Azteca, Mexico City" },
  { round: "r32", matchNumber: 8, homeTeamId: "eng", awayTeamId: "cod", homeScore: 2, awayScore: 1, winnerTeamId: "eng", status: "finished", kickoffAt: "2026-07-01T17:00:00-04:00", venue: "Mercedes-Benz Stadium, Atlanta" },
  { round: "r32", matchNumber: 9, homeTeamId: "bel", awayTeamId: "sen", homeScore: 3, awayScore: 2, winnerTeamId: "bel", status: "finished", kickoffAt: "2026-07-01T20:00:00-07:00", venue: "Lumen Field, Seattle" },
  { round: "r32", matchNumber: 10, homeTeamId: "usa", awayTeamId: "bih", homeScore: 2, awayScore: 0, winnerTeamId: "usa", status: "finished", kickoffAt: "2026-07-02T17:00:00-07:00", venue: "Levi's Stadium, Santa Clara" },
  { round: "r32", matchNumber: 11, homeTeamId: "esp", awayTeamId: "aut", homeScore: 3, awayScore: 0, winnerTeamId: "esp", status: "finished", kickoffAt: "2026-07-02T20:00:00-07:00", venue: "SoFi Stadium, Inglewood" },
  { round: "r32", matchNumber: 12, homeTeamId: "por", awayTeamId: "cro", homeScore: 2, awayScore: 1, winnerTeamId: "por", status: "finished", kickoffAt: "2026-07-02T20:00:00-04:00", venue: "BMO Field, Toronto", events: [{ type: "goal", minute: 68, teamCode: "POR", player: "C. Ronaldo", detail: "Penalty" }, { type: "goal", minute: 90, teamCode: "POR", player: "G. Ramos", detail: "90+4'" }] },
  { round: "r32", matchNumber: 13, homeTeamId: "sui", awayTeamId: "alg", homeScore: 2, awayScore: 0, winnerTeamId: "sui", status: "finished", kickoffAt: "2026-07-02T20:00:00-07:00", venue: "BC Place, Vancouver" },
  { round: "r32", matchNumber: 14, homeTeamId: "aus", awayTeamId: "egy", homeScore: 1, awayScore: 1, winnerTeamId: "egy", status: "finished", kickoffAt: "2026-07-03T12:00:00-05:00", venue: "AT&T Stadium, Arlington", events: [{ type: "goal", minute: 90, teamCode: "EGY", detail: "Won 4-2 on penalties" }] },
  { round: "r32", matchNumber: 15, homeTeamId: "arg", awayTeamId: "cpv", homeScore: 1, awayScore: 0, winnerTeamId: "arg", status: "finished", kickoffAt: "2026-07-03T18:00:00-04:00", venue: "Hard Rock Stadium, Miami", events: [{ type: "goal", minute: 29, teamCode: "ARG", player: "L. Messi" }] },
  { round: "r32", matchNumber: 16, homeTeamId: "col", awayTeamId: "gha", homeScore: 2, awayScore: 0, winnerTeamId: "col", status: "finished", kickoffAt: "2026-07-04T01:30:00-05:00", venue: "Arrowhead Stadium, Kansas City" },
];

/** Round-of-16 schedule (starts 4 July) */
export const R16_FIXTURES: Omit<Match, "id">[] = [
  { round: "r16", matchNumber: 1, homeTeamId: "can", awayTeamId: "mar", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-04T12:00:00-05:00", venue: "NRG Stadium, Houston" },
  { round: "r16", matchNumber: 2, homeTeamId: "par", awayTeamId: "fra", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-04T17:00:00-04:00", venue: "Lincoln Financial Field, Philadelphia" },
  { round: "r16", matchNumber: 3, homeTeamId: "bra", awayTeamId: "nor", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-05T16:00:00-04:00", venue: "MetLife Stadium, New Jersey" },
  { round: "r16", matchNumber: 4, homeTeamId: "mex", awayTeamId: "eng", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-05T18:00:00-06:00", venue: "Estadio Azteca, Mexico City" },
  { round: "r16", matchNumber: 5, homeTeamId: "por", awayTeamId: "esp", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-06T14:00:00-05:00", venue: "AT&T Stadium, Arlington" },
  { round: "r16", matchNumber: 6, homeTeamId: "usa", awayTeamId: "bel", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-06T17:00:00-07:00", venue: "Lumen Field, Seattle" },
  { round: "r16", matchNumber: 7, homeTeamId: "arg", awayTeamId: "egy", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-07T12:00:00-04:00", venue: "Mercedes-Benz Stadium, Atlanta" },
  { round: "r16", matchNumber: 8, homeTeamId: "sui", awayTeamId: "col", homeScore: null, awayScore: null, status: "not_started", kickoffAt: "2026-07-07T13:00:00-07:00", venue: "BC Place, Vancouver" },
];

/** Quarterfinals — teams fill as R16 completes */
export const QF_FIXTURES: Omit<Match, "id">[] = [
  { round: "qf", matchNumber: 1, homeTeamId: "tbd", awayTeamId: "tbd", status: "not_started", kickoffAt: "2026-07-10T16:00:00-04:00", venue: "MetLife Stadium, New Jersey" },
  { round: "qf", matchNumber: 2, homeTeamId: "tbd", awayTeamId: "tbd", status: "not_started", kickoffAt: "2026-07-10T20:00:00-04:00", venue: "Lincoln Financial Field, Philadelphia" },
  { round: "qf", matchNumber: 3, homeTeamId: "tbd", awayTeamId: "tbd", status: "not_started", kickoffAt: "2026-07-11T17:00:00-04:00", venue: "Hard Rock Stadium, Miami" },
  { round: "qf", matchNumber: 4, homeTeamId: "tbd", awayTeamId: "tbd", status: "not_started", kickoffAt: "2026-07-11T20:00:00-07:00", venue: "SoFi Stadium, Inglewood" },
];

export const SF_FIXTURES: Omit<Match, "id">[] = [
  { round: "sf", matchNumber: 1, homeTeamId: "tbd", awayTeamId: "tbd", status: "not_started", kickoffAt: "2026-07-14T20:00:00-04:00", venue: "AT&T Stadium, Arlington" },
  { round: "sf", matchNumber: 2, homeTeamId: "tbd", awayTeamId: "tbd", status: "not_started", kickoffAt: "2026-07-15T20:00:00-04:00", venue: "Mercedes-Benz Stadium, Atlanta" },
];

export const FINAL_FIXTURES: Omit<Match, "id">[] = [
  { round: "final", matchNumber: 1, homeTeamId: "tbd", awayTeamId: "tbd", status: "not_started", kickoffAt: "2026-07-19T15:00:00-04:00", venue: "MetLife Stadium, New Jersey" },
];

/** Placeholder team for TBD knockout slots */
export const TBD_TEAM: Team = {
  id: "tbd",
  name: "TBD",
  code: "TBD",
  flagUrl: "/icon.svg",
  confederation: "",
};

/** Which R32 match winner feeds each R16 slot (0-indexed) */
export const R32_TO_R16: Record<number, { slot: number; teamId: string }> = {
  1: { slot: 0, teamId: "can" },
  4: { slot: 0, teamId: "mar" },
  6: { slot: 1, teamId: "fra" },
  3: { slot: 1, teamId: "par" },
  2: { slot: 2, teamId: "bra" },
  5: { slot: 2, teamId: "nor" },
  7: { slot: 3, teamId: "mex" },
  8: { slot: 3, teamId: "eng" },
  11: { slot: 4, teamId: "esp" },
  12: { slot: 4, teamId: "por" },
  10: { slot: 5, teamId: "usa" },
  9: { slot: 5, teamId: "bel" },
  15: { slot: 6, teamId: "arg" },
  14: { slot: 6, teamId: "egy" },
  13: { slot: 7, teamId: "sui" },
  16: { slot: 7, teamId: "col" },
};

/** One sector = one R16 match; two R32 fixtures feed each sector */
export const BRACKET_SECTORS: {
  r16MatchNumber: number;
  r32MatchNumbers: [number, number];
  /** Confirmed R16 qualifiers only; null = still playing R32 */
  r16TeamIds: [string | null, string | null];
}[] = [
  { r16MatchNumber: 1, r32MatchNumbers: [4, 1], r16TeamIds: ["mar", "can"] },
  { r16MatchNumber: 2, r32MatchNumbers: [6, 3], r16TeamIds: ["fra", "par"] },
  { r16MatchNumber: 3, r32MatchNumbers: [2, 5], r16TeamIds: ["bra", "nor"] },
  { r16MatchNumber: 4, r32MatchNumbers: [7, 8], r16TeamIds: ["mex", "eng"] },
  { r16MatchNumber: 5, r32MatchNumbers: [11, 12], r16TeamIds: ["esp", "por"] },
  { r16MatchNumber: 6, r32MatchNumbers: [10, 9], r16TeamIds: ["usa", "bel"] },
  { r16MatchNumber: 7, r32MatchNumbers: [15, 14], r16TeamIds: ["arg", "egy"] },
  { r16MatchNumber: 8, r32MatchNumbers: [13, 16], r16TeamIds: ["sui", "col"] },
];

const SECTOR_DEGREES = 360 / BRACKET_SECTORS.length;

/** Angle for a team within an R16 bracket sector (0 = top, clockwise) */
export function angleInSector(
  sectorIndex: number,
  positionInSector: number,
  positionsInSector: number
): number {
  const slice = SECTOR_DEGREES / positionsInSector;
  return sectorIndex * SECTOR_DEGREES + slice * positionInSector + slice / 2;
}

export function buildInitialMatches(): Match[] {
  const r32 = R32_FIXTURES.map((m, i) => ({ ...m, id: `r32-${m.matchNumber ?? i + 1}` }));
  const r16 = R16_FIXTURES.map((m) => ({ ...m, id: `r16-${m.matchNumber}` }));
  const qf = QF_FIXTURES.map((m) => ({ ...m, id: `qf-${m.matchNumber}` }));
  const sf = SF_FIXTURES.map((m) => ({ ...m, id: `sf-${m.matchNumber}` }));
  const fin = FINAL_FIXTURES.map((m) => ({ ...m, id: `final-${m.matchNumber}` }));
  return [...r32, ...r16, ...qf, ...sf, ...fin];
}

export function buildInitialSlots(): BracketSlot[] {
  const slots: BracketSlot[] = [];
  let r32SlotIndex = 0;

  BRACKET_SECTORS.forEach((sector, sectorIndex) => {
    sector.r32MatchNumbers.forEach((matchNum, matchIdx) => {
      const fixture = R32_FIXTURES.find((m) => m.matchNumber === matchNum)!;
      [fixture.homeTeamId, fixture.awayTeamId].forEach((teamId, teamIdx) => {
        const posInSector = matchIdx * 2 + teamIdx;
        slots.push({
          id: `r32-${teamId}`,
          round: "r32",
          slotIndex: r32SlotIndex++,
          teamId,
          sourceMatchId: `r32-${matchNum}`,
          angleDegrees: angleInSector(sectorIndex, posInSector, 4),
          isEliminated: ELIMINATED_TEAM_IDS.has(teamId),
        });
      });
    });
  });

  let r16SlotIndex = 0;
  BRACKET_SECTORS.forEach((sector, sectorIndex) => {
    sector.r16TeamIds.forEach((teamId, posInSector) => {
      slots.push({
        id: `r16-${r16SlotIndex}`,
        round: "r16",
        slotIndex: r16SlotIndex,
        teamId,
        angleDegrees: angleInSector(sectorIndex, posInSector, 2),
      });
      r16SlotIndex++;
    });
  });

  return slots;
}

export function getTeamMap(teams: Team[] = TEAMS_2026): Record<string, Team> {
  return Object.fromEntries([...teams, TBD_TEAM].map((t) => [t.id, t]));
}

export function nextRound(round: BracketRound): BracketRound | null {
  const order: BracketRound[] = ["r32", "r16", "qf", "sf", "final", "champion"];
  const idx = order.indexOf(round);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

export function slotsForRound(round: BracketRound): number {
  const counts: Record<BracketRound, number> = {
    r32: 32, r16: 16, qf: 8, sf: 4, third: 2, final: 2, champion: 1,
  };
  return counts[round];
}

export function radiusForRound(round: BracketRound): number {
  const radii: Record<BracketRound, number> = {
    r32: 340, r16: 270, qf: 205, sf: 145, third: 100, final: 70, champion: 0,
  };
  return radii[round];
}

export function getMatchLabel(match: Match): string {
  if (match.round === "r32") return `Round of 32 · Match ${match.matchNumber}`;
  if (match.round === "r16") return `Round of 16 · Match ${match.matchNumber}`;
  if (match.round === "qf") return `Quarterfinal · Match ${match.matchNumber}`;
  if (match.round === "sf") return `Semifinal · Match ${match.matchNumber}`;
  if (match.round === "final") return "Final";
  return match.round.toUpperCase();
}
