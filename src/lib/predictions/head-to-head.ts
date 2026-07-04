import type { Match } from "@/lib/types";
import type { UserPredictions } from "./types";
import { scoreUserPredictions } from "./leaderboard";
import { scoreMatchPrediction } from "@/lib/scoring";
import { TEAMS_2026 } from "@/lib/data/tournament";

const teamRank = Object.fromEntries(TEAMS_2026.map((t) => [t.id, t.fifaRanking ?? 99]));

function favoriteId(homeId: string, awayId: string): string | null {
  const hr = teamRank[homeId];
  const ar = teamRank[awayId];
  if (!hr || !ar) return null;
  return hr < ar ? homeId : awayId;
}

function matchPoints(picks: UserPredictions, match: Match): number {
  const mp = picks.matchPicks[match.id];
  const winner = mp?.winner ?? picks.bracketPicks[match.id];
  if (!winner || !match.winnerTeamId) return 0;
  return scoreMatchPrediction(
    winner,
    mp?.home,
    mp?.away,
    match.winnerTeamId,
    match.homeScore,
    match.awayScore,
    { confidence: mp?.confidence, favoriteId: favoriteId(match.homeTeamId, match.awayTeamId) }
  );
}

export interface HeadToHeadResult {
  you: ReturnType<typeof scoreUserPredictions>;
  them: ReturnType<typeof scoreUserPredictions>;
  youWinning: boolean;
  themWinning: boolean;
  tied: boolean;
  matchups: {
    match: Match;
    yourPoints: number;
    theirPoints: number;
    youWon: boolean;
    theyWon: boolean;
    tied: boolean;
  }[];
}

export function computeHeadToHead(
  you: UserPredictions,
  them: UserPredictions,
  matches: Match[]
): HeadToHeadResult {
  const finished = matches.filter((m) => m.status === "finished" && m.winnerTeamId);
  const yourTotal = scoreUserPredictions(you, matches);
  const theirTotal = scoreUserPredictions(them, matches);

  const matchups = finished.map((match) => {
    const yourPoints = matchPoints(you, match);
    const theirPoints = matchPoints(them, match);
    return {
      match,
      yourPoints,
      theirPoints,
      youWon: yourPoints > theirPoints,
      theyWon: theirPoints > yourPoints,
      tied: yourPoints === theirPoints,
    };
  });

  return {
    you: yourTotal,
    them: theirTotal,
    youWinning: yourTotal.points > theirTotal.points,
    themWinning: theirTotal.points > yourTotal.points,
    tied: yourTotal.points === theirTotal.points,
    matchups,
  };
}

export function getSharePageUrl(encoded: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/share?b=${encodeURIComponent(encoded)}`;
}

export function getChallengeUrl(encoded: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/challenge?vs=${encodeURIComponent(encoded)}`;
}
