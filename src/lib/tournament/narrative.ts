import type { Match } from "@/lib/types";
import { TEAMS_2026, ELIMINATED_TEAM_IDS } from "@/lib/data/tournament";

export interface GoalScorer {
  player: string;
  teamId: string;
  teamCode: string;
  goals: number;
  minutes: number[];
}

export interface ConfederationSurvival {
  confederation: string;
  active: number;
  total: number;
}

export interface TournamentDay {
  day: number;
  date: string;
  title: string;
  highlights: string[];
}

export function countGoalsFromMatches(matches: Match[]): GoalScorer[] {
  const map = new Map<string, GoalScorer>();
  for (const m of matches) {
    for (const e of m.events ?? []) {
      if (e.type !== "goal" || !e.player) continue;
      const team = TEAMS_2026.find((t) => t.code === e.teamCode);
      if (!team) continue;
      const key = `${team.id}:${e.player}`;
      const cur = map.get(key) ?? {
        player: e.player,
        teamId: team.id,
        teamCode: team.code,
        goals: 0,
        minutes: [],
      };
      cur.goals += 1;
      cur.minutes.push(e.minute);
      map.set(key, cur);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player));
}

export function getGoldenBootLeaderboard(matches: Match[], limit = 10): GoalScorer[] {
  return countGoalsFromMatches(matches).slice(0, limit);
}

export function getCinderellaTeam(): { teamId: string; code: string; ranking: number } | null {
  const active = TEAMS_2026.filter((t) => !ELIMINATED_TEAM_IDS.has(t.id) && t.fifaRanking != null);
  if (!active.length) return null;
  const sorted = [...active].sort((a, b) => (b.fifaRanking ?? 99) - (a.fifaRanking ?? 99));
  const cinderella = sorted[sorted.length - 1];
  return {
    teamId: cinderella.id,
    code: cinderella.code,
    ranking: cinderella.fifaRanking ?? 99,
  };
}

export function getConfederationSurvival(): ConfederationSurvival[] {
  const confs = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"] as const;
  return confs.map((confederation) => {
    const teams = TEAMS_2026.filter((t) => t.confederation === confederation);
    const active = teams.filter((t) => !ELIMINATED_TEAM_IDS.has(t.id)).length;
    return { confederation, active, total: teams.length };
  }).filter((c) => c.total > 0);
}

export function getBiggestUpsets(matches: Match[], limit = 5): Match[] {
  const rank = (id: string) => TEAMS_2026.find((t) => t.id === id)?.fifaRanking ?? 50;
  return matches
    .filter((m) => m.status === "finished" && m.winnerTeamId)
    .map((m) => {
      const winnerRank = rank(m.winnerTeamId!);
      const loserId = m.homeTeamId === m.winnerTeamId ? m.awayTeamId : m.homeTeamId;
      const loserRank = rank(loserId);
      return { m, gap: loserRank - winnerRank };
    })
    .filter((x) => x.gap >= 15)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, limit)
    .map((x) => x.m);
}

export const TOURNAMENT_TIMELINE: TournamentDay[] = [
  {
    day: 1,
    date: "2026-06-11",
    title: "Opening day",
    highlights: ["48-team format kicks off across USA, Mexico & Canada", "Host nations debut in group stage"],
  },
  {
    day: 18,
    date: "2026-06-28",
    title: "Knockout begins",
    highlights: ["Round of 32 opens — Canada edge South Africa 1-0", "16 matches across 15 host cities"],
  },
  {
    day: 24,
    date: "2026-07-04",
    title: "Round of 16 weekend",
    highlights: [
      "8 R16 ties over Independence Day weekend",
      "Paraguay shock Germany on penalties",
      "Morocco eliminate Netherlands in Monterrey",
    ],
  },
];

export function teamsRemainingCount(): number {
  return TEAMS_2026.filter((t) => !ELIMINATED_TEAM_IDS.has(t.id)).length;
}
