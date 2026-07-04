"use client";

import { useMemo } from "react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { useConsensus } from "@/lib/predictions/useConsensus";
import { evaluateAchievements } from "@/lib/achievements/evaluate";
import { cn } from "@/lib/utils";

export function AchievementsGrid() {
  const { matches } = useBracket();
  const { picks } = usePredictions();
  const { consensus } = useConsensus();

  const achievements = useMemo(
    () => evaluateAchievements(picks, matches, consensus),
    [picks, matches, consensus]
  );

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Achievements</h2>
        <span className="text-sm text-gray-500">
          {unlocked}/{achievements.length} unlocked
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={cn(
              "flex items-start gap-3 rounded-xl p-3 transition",
              a.unlocked
                ? "bg-wc-green/10 ring-1 ring-wc-green/30"
                : "bg-black/[0.03] opacity-60 dark:bg-white/5"
            )}
          >
            <span className="text-2xl">{a.icon}</span>
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-gray-500">{a.description}</p>
              {a.progress && (
                <p className="mt-1 text-[10px] text-wc-green">{a.progress}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
