"use client";

import { useMemo } from "react";
import Image from "next/image";
import { GitCompare, Check, X, Minus } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { getMatchLabel } from "@/lib/data/tournament";
import { cn } from "@/lib/utils";
import { scoreMatchPrediction } from "@/lib/scoring";

export default function ComparePage() {
  const { matches, teamMap } = useBracket();
  const { picks } = usePredictions();

  const rows = useMemo(() => {
    return matches
      .filter((m) => m.status === "finished" && m.winnerTeamId)
      .map((m) => {
        const mp = picks.matchPicks[m.id];
        const predicted = mp?.winner ?? picks.bracketPicks[m.id];
        const actual = m.winnerTeamId!;
        const home = teamMap[m.homeTeamId];
        const away = teamMap[m.awayTeamId];
        const favoriteId =
          home?.fifaRanking && away?.fifaRanking
            ? home.fifaRanking < away.fifaRanking
              ? home.id
              : away.id
            : null;
        const points = scoreMatchPrediction(
          predicted,
          mp?.home,
          mp?.away,
          actual,
          m.homeScore,
          m.awayScore,
          { confidence: mp?.confidence, favoriteId }
        );
        return { match: m, predicted, actual, points, home, away };
      });
  }, [matches, picks, teamMap]);

  const totalPoints = rows.reduce((s, r) => s + r.points, 0);
  const correct = rows.filter((r) => r.predicted === r.actual).length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
          <GitCompare className="h-8 w-8 text-wc-green" />
          My Bracket vs Actual
        </h1>
        <p className="mt-1 text-gray-500">Side-by-side comparison of your picks against real results</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-wc-green">{totalPoints}</p>
          <p className="text-xs text-gray-500">Points earned</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{correct}/{rows.length}</p>
          <p className="text-xs text-gray-500">Winners correct</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{picks.champion ? teamMap[picks.champion]?.code ?? "—" : "—"}</p>
          <p className="text-xs text-gray-500">Your champion</p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="text-center text-gray-500">No finished matches to compare yet.</p>
        )}
        {rows.map(({ match, predicted, actual, points, home, away }) => {
          const status =
            !predicted ? "missed" : predicted === actual ? "correct" : "wrong";
          return (
            <div key={match.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{getMatchLabel(match)}</span>
                <span className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  status === "correct" && "text-wc-green",
                  status === "wrong" && "text-red-500",
                  status === "missed" && "text-gray-400"
                )}>
                  {status === "correct" && <Check className="h-3.5 w-3.5" />}
                  {status === "wrong" && <X className="h-3.5 w-3.5" />}
                  {status === "missed" && <Minus className="h-3.5 w-3.5" />}
                  {points > 0 ? `+${points} pts` : "0 pts"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">You picked</p>
                  {predicted ? (
                    <TeamChip team={teamMap[predicted]} highlight={status === "correct"} />
                  ) : (
                    <span className="text-sm text-gray-400">No pick</span>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">Actual</p>
                  <TeamChip team={teamMap[actual]} highlight />
                  <p className="mt-1 text-xs text-gray-500">
                    {match.homeScore}–{match.awayScore} ({home?.code} vs {away?.code})
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamChip({ team, highlight }: { team?: { name: string; code: string; flagUrl: string }; highlight?: boolean }) {
  if (!team) return null;
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg px-2 py-1",
      highlight && "bg-wc-green/10"
    )}>
      <div className="relative h-6 w-6 overflow-hidden rounded-full">
        <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
      </div>
      <span className="text-sm font-medium">{team.name}</span>
    </div>
  );
}
