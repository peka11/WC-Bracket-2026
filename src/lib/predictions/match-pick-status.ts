import type { Match, Team } from "@/lib/types";
import type { UserPredictions } from "@/lib/predictions/types";
import { scoreMatchPrediction } from "@/lib/scoring";

export type PickOverlayStatus = "pending" | "live_winning" | "live_losing" | "correct" | "wrong" | "none";

export interface MatchPickOverlay {
  predictedWinnerId: string | null;
  pointsEarned: number | null;
  status: PickOverlayStatus;
}

function predictedWinner(picks: UserPredictions, matchId: string): string | null {
  return picks.matchPicks[matchId]?.winner ?? picks.bracketPicks[matchId] ?? null;
}

export function getMatchPickOverlay(
  match: Match,
  picks: UserPredictions,
  teamMap: Record<string, Team>
): MatchPickOverlay {
  const predictedWinnerId = predictedWinner(picks, match.id);
  if (!predictedWinnerId) {
    return { predictedWinnerId: null, pointsEarned: null, status: "none" };
  }

  const home = teamMap[match.homeTeamId];
  const away = teamMap[match.awayTeamId];
  const favoriteId =
    home?.fifaRanking && away?.fifaRanking
      ? home.fifaRanking < away.fifaRanking
        ? home.id
        : away.id
      : null;
  const mp = picks.matchPicks[match.id];

  if (match.status === "finished" && match.winnerTeamId) {
    const pointsEarned = scoreMatchPrediction(
      predictedWinnerId,
      mp?.home,
      mp?.away,
      match.winnerTeamId,
      match.homeScore,
      match.awayScore,
      { confidence: mp?.confidence, favoriteId }
    );
    return {
      predictedWinnerId,
      pointsEarned,
      status: predictedWinnerId === match.winnerTeamId ? "correct" : "wrong",
    };
  }

  if (
    match.status === "live" ||
    match.status === "halftime" ||
    match.status === "extra_time" ||
    match.status === "penalties"
  ) {
    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    const winningId =
      homeScore > awayScore
        ? match.homeTeamId
        : awayScore > homeScore
          ? match.awayTeamId
          : null;
    if (winningId) {
      return {
        predictedWinnerId,
        pointsEarned: null,
        status: predictedWinnerId === winningId ? "live_winning" : "live_losing",
      };
    }
    return { predictedWinnerId, pointsEarned: null, status: "pending" };
  }

  return { predictedWinnerId, pointsEarned: null, status: "pending" };
}
