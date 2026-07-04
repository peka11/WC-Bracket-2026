"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, HeartCrack, Sparkles, Target } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { analyzeBracketSurvival } from "@/lib/predictions/survival";
import { getActiveTeamIds } from "@/lib/bracket/advance";
import { cn } from "@/lib/utils";

export function StillAliveBanner({ className }: { className?: string }) {
  const { matches, slots, teamMap } = useBracket();
  const { picks } = usePredictions();

  const survival = useMemo(() => {
    const activeIds = getActiveTeamIds(slots);
    for (const m of matches) {
      if (m.status === "finished" && m.winnerTeamId) {
        if (m.homeTeamId !== m.winnerTeamId) activeIds.delete(m.homeTeamId);
        if (m.awayTeamId !== m.winnerTeamId) activeIds.delete(m.awayTeamId);
      }
    }
    return analyzeBracketSurvival(matches, picks, activeIds, teamMap);
  }, [matches, picks, slots, teamMap]);

  if (survival.status === "no_picks") {
    return (
      <div className={cn("glass-card flex flex-wrap items-center justify-between gap-4 p-4", className)}>
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-wc-gold" />
          <div>
            <p className="font-semibold">No predictions yet</p>
            <p className="text-sm text-gray-500">Pick your bracket to track if you&apos;re still alive</p>
          </div>
        </div>
        <Link href="/predictions" className="btn-primary text-sm">
          Make picks
        </Link>
      </div>
    );
  }

  const champion = survival.championTeamId ? teamMap[survival.championTeamId] : null;

  const tone =
    survival.status === "perfect"
      ? "border-wc-gold/40 bg-wc-gold/10"
      : survival.status === "alive"
        ? "border-wc-green/40 bg-wc-green/10"
        : "border-red-500/30 bg-red-500/5";

  const Icon =
    survival.status === "perfect" ? Sparkles : survival.status === "alive" ? Heart : HeartCrack;

  const iconColor =
    survival.status === "perfect"
      ? "text-wc-gold"
      : survival.status === "alive"
        ? "text-wc-green"
        : "text-red-500";

  let headline = "";
  if (survival.status === "perfect") {
    headline = "Perfect so far — every pick correct!";
  } else if (survival.status === "alive" && champion) {
    headline = `${champion.name} still alive — your champion pick holds!`;
  } else if (survival.status === "alive") {
    headline = "Still in the hunt — keep watching your picks";
  } else if (champion) {
    headline = `Bracket busted — ${champion.code} eliminated`;
  } else {
    headline = "Bracket busted on a wrong pick";
  }

  return (
    <div className={cn("glass-card border p-4 sm:p-5", tone, className)}>
      <div className="flex flex-wrap items-start gap-4">
        <Icon className={cn("h-8 w-8 shrink-0", iconColor)} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold">{headline}</p>
          {survival.bustedMatchLabel && survival.status !== "perfect" && (
            <p className="mt-1 text-sm text-gray-500">
              First miss: {survival.bustedMatchLabel}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
              <strong className="text-wc-green">{survival.pointsEarned}</strong> pts earned
            </span>
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
              {survival.correctPicks}/{survival.totalScoredPicks} picks correct
            </span>
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
              {survival.matchingTeamsCount} teams match your bracket
            </span>
            {survival.maxPointsRemaining > 0 && (
              <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
                up to <strong>{survival.maxPointsRemaining}</strong> pts left
              </span>
            )}
          </div>
        </div>
        {champion && (
          <div className="flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 dark:bg-white/10">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image src={champion.flagUrl} alt="" fill className="object-cover" unoptimized />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Your champion</p>
              <p className="text-sm font-semibold">{champion.code}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
