import type { Match, Team } from "@/lib/types";
import type { UserPredictions } from "@/lib/predictions/types";
import { getMatchLabel } from "@/lib/data/tournament";
import { scoreMatchPrediction, SCORING } from "@/lib/scoring";

export type SurvivalStatus = "perfect" | "alive" | "busted" | "no_picks";

export interface BracketSurvival {
  status: SurvivalStatus;
  championAlive: boolean;
  championTeamId: string | null;
  bustedMatchId: string | null;
  bustedMatchLabel: string | null;
  correctPicks: number;
  totalScoredPicks: number;
  pointsEarned: number;
  maxPointsRemaining: number;
  matchingTeamsCount: number;
}

function predictedWinner(picks: UserPredictions, matchId: string): string | null {
  return picks.matchPicks[matchId]?.winner ?? picks.bracketPicks[matchId] ?? null;
}

export function analyzeBracketSurvival(
  matches: Match[],
  picks: UserPredictions,
  activeTeamIds: Set<string>,
  teamMap: Record<string, Team>
): BracketSurvival {
  const finished = matches
    .filter((m) => m.status === "finished" && m.winnerTeamId)
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());

  let correctPicks = 0;
  let totalScoredPicks = 0;
  let pointsEarned = 0;
  let bustedMatchId: string | null = null;
  let bustedMatchLabel: string | null = null;

  for (const m of finished) {
    const predicted = predictedWinner(picks, m.id);
    if (!predicted) continue;

    totalScoredPicks++;
    const home = teamMap[m.homeTeamId];
    const away = teamMap[m.awayTeamId];
    const favoriteId =
      home?.fifaRanking && away?.fifaRanking
        ? home.fifaRanking < away.fifaRanking
          ? home.id
          : away.id
        : null;
    const mp = picks.matchPicks[m.id];
    const pts = scoreMatchPrediction(
      predicted,
      mp?.home,
      mp?.away,
      m.winnerTeamId,
      m.homeScore,
      m.awayScore,
      { confidence: mp?.confidence, favoriteId }
    );
    pointsEarned += pts;

    if (predicted === m.winnerTeamId) {
      correctPicks++;
    } else if (!bustedMatchId) {
      bustedMatchId = m.id;
      bustedMatchLabel = getMatchLabel(m);
    }
  }

  const championTeamId = picks.champion;
  const championAlive = championTeamId ? activeTeamIds.has(championTeamId) : false;

  const predictedTeamIds = new Set<string>(
    [
      ...Object.values(picks.bracketPicks),
      ...Object.values(picks.matchPicks).map((p) => p.winner).filter(Boolean) as string[],
      ...(championTeamId ? [championTeamId] : []),
    ]
  );
  const matchingTeamsCount = Array.from(activeTeamIds).filter((id) => predictedTeamIds.has(id)).length;

  const openMatches = matches.filter((m) => m.status === "not_started");
  let maxPointsRemaining = 0;
  if (championTeamId && championAlive) {
    maxPointsRemaining += SCORING.CORRECT_CHAMPION;
  }
  for (const m of openMatches) {
    const mp = picks.matchPicks[m.id];
    if (predictedWinner(picks, m.id)) {
      maxPointsRemaining += SCORING.CORRECT_WINNER * (mp?.confidence ?? 1) + SCORING.CORRECT_SCORE;
    }
  }

  if (totalScoredPicks === 0 && !championTeamId) {
    return {
      status: "no_picks",
      championAlive: false,
      championTeamId: null,
      bustedMatchId: null,
      bustedMatchLabel: null,
      correctPicks: 0,
      totalScoredPicks: 0,
      pointsEarned: 0,
      maxPointsRemaining,
      matchingTeamsCount: 0,
    };
  }

  let status: SurvivalStatus;
  if (championTeamId && !championAlive) {
    status = "busted";
  } else if (totalScoredPicks > 0 && correctPicks === totalScoredPicks && bustedMatchId === null) {
    status = "perfect";
  } else if (championAlive || (!championTeamId && bustedMatchId === null)) {
    status = "alive";
  } else {
    status = "busted";
  }

  return {
    status,
    championAlive,
    championTeamId,
    bustedMatchId,
    bustedMatchLabel,
    correctPicks,
    totalScoredPicks,
    pointsEarned,
    maxPointsRemaining,
    matchingTeamsCount,
  };
}
