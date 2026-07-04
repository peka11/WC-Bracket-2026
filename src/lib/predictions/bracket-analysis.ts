import type { Match, Team } from "@/lib/types";
import type { UserPredictions } from "@/lib/predictions/types";
import type { ConsensusData } from "@/lib/predictions/consensus-types";
import { TEAMS_2026 } from "@/lib/data/tournament";
import { favoriteTeamId, isUpsetPick, upsetRankGap, winProbabilityFromRankings } from "@/lib/odds/probability";

const ROUND_DEPTH: Record<string, number> = {
  r32: 1,
  r16: 2,
  qf: 3,
  sf: 4,
  final: 5,
  champion: 6,
};

const CONFEDERATION_LABELS: Record<string, string> = {
  UEFA: "European",
  CONMEBOL: "South American",
  CONCACAF: "North/Central American",
  AFC: "Asian",
  CAF: "African",
};

export interface BracketAnalysis {
  championTeamId: string | null;
  runnerUpTeamId: string | null;
  darkHorseTeamId: string | null;
  biggestUpset: { matchId: string; label: string; gap: number } | null;
  riskScore: number;
  riskLabel: "Conservative" | "Balanced" | "Risky" | "Chaos Mode";
  riskBarPct: number;
  commonPicks: string[];
  uniquePicks: string[];
  predictedGoalsByConfederation: Record<string, number>;
  totalPredictedGoals: number;
  averageFifaRank: number | null;
  upsetCount: number;
  reviewLines: string[];
  championConsensusPct: number | null;
}

function predictedWinner(picks: UserPredictions, matchId: string): string | null {
  return picks.matchPicks[matchId]?.winner ?? picks.bracketPicks[matchId] ?? null;
}

function teamMap(): Record<string, Team> {
  return Object.fromEntries(TEAMS_2026.map((t) => [t.id, t]));
}

export function analyzeBracket(
  picks: UserPredictions,
  matches: Match[],
  consensus?: ConsensusData | null
): BracketAnalysis {
  const teams = teamMap();
  let upsetCount = 0;
  let upsetWeight = 0;
  let biggestUpset: BracketAnalysis["biggestUpset"] = null;
  const pickedTeamIds = new Set<string>();
  let totalPredictedGoals = 0;
  const goalsByConf: Record<string, number> = {};
  const ranks: number[] = [];

  for (const m of matches) {
    const home = teams[m.homeTeamId];
    const away = teams[m.awayTeamId];
    if (!home || !away || home.id === "tbd" || away.id === "tbd") continue;

    const winner = predictedWinner(picks, m.id);
    const mp = picks.matchPicks[m.id];
    if (mp?.home != null && mp?.away != null) {
      totalPredictedGoals += mp.home + mp.away;
    }

    if (winner) {
      pickedTeamIds.add(winner);
      const w = teams[winner];
      if (w?.fifaRanking) ranks.push(w.fifaRanking);
      if (w?.confederation) {
        const label = CONFEDERATION_LABELS[w.confederation] ?? w.confederation;
        goalsByConf[label] = (goalsByConf[label] ?? 0) + (mp?.home != null && mp?.away != null ? mp.home + mp.away : 2);
      }

      if (isUpsetPick(home, away, winner)) {
        upsetCount++;
        const conf = picks.matchPicks[m.id]?.confidence ?? 1;
        upsetWeight += conf * (1 + upsetRankGap(home, away, winner) / 20);
        const gap = upsetRankGap(home, away, winner);
        if (!biggestUpset || gap > biggestUpset.gap) {
          biggestUpset = {
            matchId: m.id,
            label: `${teams[winner]?.name} over ${winner === home.id ? away.name : home.name}`,
            gap,
          };
        }
      }
    }
  }

  if (picks.champion) {
    pickedTeamIds.add(picks.champion);
    const c = teams[picks.champion];
    if (c?.fifaRanking) ranks.push(c.fifaRanking);
  }

  const openMatches = matches.filter((m) => m.status === "not_started");
  let darkHorseTeamId: string | null = null;
  let darkHorseDepth = 0;
  let darkHorseRank = 0;

  for (const m of openMatches) {
    const winner = predictedWinner(picks, m.id);
    if (!winner) continue;
    const home = teams[m.homeTeamId];
    const away = teams[m.awayTeamId];
    if (!home || !away) continue;
    const depth = ROUND_DEPTH[m.round] ?? 0;
    const t = teams[winner];
    const rank = t?.fifaRanking ?? 99;
    const isUnderdog = isUpsetPick(home, away, winner) || rank > 25;
    if (isUnderdog && depth >= darkHorseDepth && rank >= darkHorseRank) {
      darkHorseDepth = depth;
      darkHorseRank = rank;
      darkHorseTeamId = winner;
    }
  }

  const finalMatch = matches.find((m) => m.round === "final");
  const runnerUpTeamId =
    finalMatch && picks.bracketPicks[finalMatch.id]
      ? picks.bracketPicks[finalMatch.id] === finalMatch.homeTeamId
        ? finalMatch.awayTeamId
        : finalMatch.homeTeamId
      : null;

  const riskRaw = Math.min(100, Math.round(upsetWeight * 8 + upsetCount * 6 + (picks.champion && (teams[picks.champion]?.fifaRanking ?? 1) > 15 ? 15 : 0)));
  let riskLabel: BracketAnalysis["riskLabel"] = "Conservative";
  if (riskRaw >= 75) riskLabel = "Chaos Mode";
  else if (riskRaw >= 50) riskLabel = "Risky";
  else if (riskRaw >= 25) riskLabel = "Balanced";

  const commonChampionIds = ["arg", "fra", "bra", "esp", "eng"];
  const commonPicks = commonChampionIds.filter((id) => pickedTeamIds.has(id) || picks.champion === id);

  const uniquePicks: string[] = [];
  for (const id of Array.from(pickedTeamIds)) {
    const champPct = consensus?.champions?.[id] ?? 0;
    const isRareChamp = picks.champion === id && champPct > 0 && champPct < 8;
    const t = teams[id];
    if (!t) continue;
    if (isRareChamp || (t.fifaRanking && t.fifaRanking > 30)) {
      uniquePicks.push(id);
    }
  }
  if (darkHorseTeamId && !uniquePicks.includes(darkHorseTeamId)) {
    uniquePicks.unshift(darkHorseTeamId);
  }

  const reviewLines: string[] = [];
  if (upsetCount === 0) {
    reviewLines.push("Your bracket plays it safe — mostly favorites advancing.");
  } else if (upsetCount >= 5) {
    reviewLines.push(`Very aggressive: ${upsetCount} upset picks across the bracket.`);
  } else {
    reviewLines.push(`Balanced approach with ${upsetCount} upset pick${upsetCount === 1 ? "" : "s"}.`);
  }

  if (picks.champion) {
    const c = teams[picks.champion];
    const champPct = consensus?.champions?.[picks.champion];
    if (champPct != null && champPct < 10) {
      reviewLines.push(`Only ~${champPct}% of users picked ${c?.code} as champion — bold call.`);
    } else if (c) {
      reviewLines.push(`${c.name} is a popular champion choice — you're with the crowd.`);
    }
  }

  if (biggestUpset) {
    reviewLines.push(`Biggest upset on your card: ${biggestUpset.label}.`);
  }

  if (riskLabel === "Chaos Mode") {
    reviewLines.push("Chaos Mode activated — expect plenty of bracket busts if favorites win.");
  }

  const championConsensusPct = picks.champion
    ? consensus?.champions?.[picks.champion] ?? null
    : null;

  return {
    championTeamId: picks.champion,
    runnerUpTeamId: runnerUpTeamId !== "tbd" ? runnerUpTeamId : null,
    darkHorseTeamId,
    biggestUpset,
    riskScore: riskRaw,
    riskLabel,
    riskBarPct: riskRaw,
    commonPicks,
    uniquePicks: Array.from(new Set(uniquePicks)).slice(0, 5),
    predictedGoalsByConfederation: goalsByConf,
    totalPredictedGoals,
    averageFifaRank: ranks.length ? Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 10) / 10 : null,
    upsetCount,
    reviewLines,
    championConsensusPct,
  };
}

export function getMatchWinProbabilities(home: Team, away: Team) {
  return winProbabilityFromRankings(home, away);
}

export { CONFEDERATION_LABELS };
