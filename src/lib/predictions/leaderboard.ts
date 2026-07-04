import type { Match } from "@/lib/types";
import type { UserPredictions } from "./types";
import { scoreMatchPrediction, SCORING } from "@/lib/scoring";
import { TEAMS_2026 } from "@/lib/data/tournament";

export interface LeaderboardRow {
  rank: number;
  name: string;
  points: number;
  accuracyPct: number;
  isYou?: boolean;
}

const teamRank = Object.fromEntries(TEAMS_2026.map((t) => [t.id, t.fifaRanking ?? 99]));

function favoriteId(homeId: string, awayId: string): string | null {
  const hr = teamRank[homeId];
  const ar = teamRank[awayId];
  if (!hr || !ar) return null;
  return hr < ar ? homeId : awayId;
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  points: number;
  accuracyPct: number;
  isYou?: boolean;
}

const DEMO_ENTRIES: Omit<LeaderboardRow, "rank">[] = [
  { name: "Alex Morgan", points: 142, accuracyPct: 78 },
  { name: "Jamie Lee", points: 128, accuracyPct: 72 },
  { name: "Sam Rivera", points: 115, accuracyPct: 68 },
  { name: "Chris Park", points: 87, accuracyPct: 61 },
];

export function scoreUserPredictions(picks: UserPredictions, matches: Match[]): LeaderboardRow {
  let points = 0;
  let scored = 0;
  let correct = 0;

  for (const match of matches) {
    if (match.status !== "finished" || !match.winnerTeamId) continue;
    const mp = picks.matchPicks[match.id];
    const winner = mp?.winner ?? picks.bracketPicks[match.id];
    if (!winner) continue;

    scored++;
    const earned = scoreMatchPrediction(
      winner,
      mp?.home,
      mp?.away,
      match.winnerTeamId,
      match.homeScore,
      match.awayScore,
      { confidence: mp?.confidence, favoriteId: favoriteId(match.homeTeamId, match.awayTeamId) }
    );
    if (earned > 0) correct++;
    points += earned;
  }

  if (picks.champion) {
    const final = matches.find((m) => m.round === "final" && m.status === "finished");
    if (final?.winnerTeamId && picks.champion === final.winnerTeamId) {
      points += SCORING.CORRECT_CHAMPION;
    }
  }

  const accuracyPct = scored > 0 ? Math.round((correct / scored) * 100) : 0;

  return {
    rank: 0,
    name: picks.displayName,
    points,
    accuracyPct,
    isYou: true,
  };
}

export function buildLeaderboard(picks: UserPredictions, matches: Match[]): LeaderboardRow[] {
  const you = scoreUserPredictions(picks, matches);
  const rows: LeaderboardRow[] = [...DEMO_ENTRIES.map((e) => ({ ...e, rank: 0 })), you];
  rows.sort((a, b) => b.points - a.points);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export const WEEKLY_POINTS = [
  { week: "R32", points: 42 },
  { week: "R16", points: 28 },
  { week: "QF", points: 0 },
  { week: "SF", points: 0 },
];
