import { TEAMS_2026 } from "@/lib/data/tournament";

export interface GroupStandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  form: string;
  /** 1 = winner, 2 = runner-up, 3 = third, 4 = eliminated */
  position: 1 | 2 | 3 | 4;
  advanced: boolean;
}

export interface GroupData {
  id: string;
  name: string;
  standings: GroupStandingRow[];
}

const team = (id: string) => TEAMS_2026.find((t) => t.id === id)!;

function row(
  teamId: string,
  position: 1 | 2 | 3 | 4,
  pts: number,
  gf: number,
  ga: number,
  form: string,
  advanced: boolean
): GroupStandingRow {
  const gd = gf - ga;
  const won = Math.floor(pts / 3);
  const drawn = pts % 3 === 1 ? 1 : 0;
  return {
    teamId,
    played: 3,
    won,
    drawn,
    lost: 3 - won - drawn,
    gf,
    ga,
    points: pts,
    form,
    position,
    advanced,
  };
}

/** Final group-stage standings for knockout participants (2026 snapshot) */
export const GROUP_STANDINGS: GroupData[] = [
  { id: "A", name: "Group A", standings: [row("mex", 1, 7, 8, 2, "WWD", true), row("can", 2, 4, 7, 4, "DWD", true), row("rsa", 3, 3, 2, 3, "LWD", false), row("swe", 4, 1, 2, 6, "LLD", false)] },
  { id: "B", name: "Group B", standings: [row("sui", 1, 7, 5, 2, "WWD", true), row("can", 2, 4, 7, 4, "DWD", true), row("bih", 3, 3, 3, 4, "WLL", false), row("rsa", 4, 1, 1, 5, "LLD", false)] },
  { id: "C", name: "Group C", standings: [row("bra", 1, 7, 6, 2, "WWL", true), row("par", 2, 4, 4, 4, "WDL", true), row("ger", 3, 3, 3, 3, "WLD", false), row("civ", 4, 1, 2, 6, "LLD", false)] },
  { id: "D", name: "Group D", standings: [row("usa", 1, 7, 5, 2, "WWD", true), row("aus", 2, 4, 4, 3, "WDW", true), row("jpn", 3, 3, 3, 4, "LWW", true), row("bih", 4, 1, 2, 5, "LLD", false)] },
  { id: "E", name: "Group E", standings: [row("nor", 1, 7, 6, 3, "WWW", true), row("jpn", 2, 4, 4, 3, "WLW", true), row("civ", 3, 3, 3, 4, "LWW", false), row("swe", 4, 1, 2, 5, "LLD", false)] },
  { id: "F", name: "Group F", standings: [row("mar", 1, 7, 5, 2, "WWD", true), row("ned", 2, 4, 4, 3, "WDW", true), row("ecu", 3, 3, 3, 4, "WLW", false), row("alg", 4, 1, 2, 5, "LLD", false)] },
  { id: "G", name: "Group G", standings: [row("bel", 1, 7, 6, 2, "WWW", true), row("egy", 2, 4, 4, 3, "WDW", true), row("sen", 3, 3, 3, 4, "LWW", false), row("civ", 4, 1, 2, 6, "LLD", false)] },
  { id: "H", name: "Group H", standings: [row("esp", 1, 7, 5, 1, "WWD", true), row("cpv", 2, 4, 3, 2, "WDW", true), row("aut", 3, 3, 2, 3, "LWW", false), row("alg", 4, 1, 1, 4, "LLD", false)] },
  { id: "I", name: "Group I", standings: [row("fra", 1, 9, 8, 2, "WWW", true), row("sen", 2, 4, 4, 4, "WDL", true), row("swe", 3, 3, 3, 5, "LWW", false), row("nor", 4, 1, 2, 6, "LLD", false)] },
  { id: "J", name: "Group J", standings: [row("arg", 1, 7, 6, 2, "WWD", true), row("aut", 2, 4, 4, 3, "WDW", true), row("alg", 3, 3, 3, 4, "WLW", true), row("sui", 4, 1, 2, 5, "LLD", false)] },
  { id: "K", name: "Group K", standings: [row("col", 1, 7, 5, 2, "WWD", true), row("por", 2, 4, 4, 3, "WDW", true), row("cod", 3, 3, 3, 4, "WLW", false), row("cro", 4, 1, 2, 5, "LLD", false)] },
  { id: "L", name: "Group L", standings: [row("eng", 1, 7, 6, 2, "WWD", true), row("cro", 2, 4, 4, 3, "WDW", true), row("gha", 3, 3, 3, 4, "WLW", true), row("cod", 4, 1, 2, 5, "LLD", false)] },
];

export function getThirdPlaceQualifiers(): string[] {
  return GROUP_STANDINGS.flatMap((g) =>
    g.standings.filter((s) => s.position === 3 && s.advanced).map((s) => s.teamId)
  );
}

export function finishFirstProbability(standing: GroupStandingRow, allInGroup: GroupStandingRow[]): number {
  const totalPts = allInGroup.reduce((s, r) => s + r.points, 0) || 1;
  return Math.round((standing.points / totalPts) * 100);
}

export function getTeamById(id: string) {
  return team(id);
}
