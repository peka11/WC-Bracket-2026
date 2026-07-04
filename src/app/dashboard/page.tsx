"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Star, Target, TrendingUp, Trophy } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { useConsensus } from "@/lib/predictions/useConsensus";
import { analyzeBracket } from "@/lib/predictions/bracket-analysis";
import { StillAliveBanner } from "@/components/bracket/StillAliveBanner";
import { BracketFormatExplainer } from "@/components/bracket/BracketFormatExplainer";
import { ChampionConsensusList, RiskMeter } from "@/components/predictions/OddsDisplay";
import { ShareBracket } from "@/components/bracket/ShareBracket";
import { AiReviewPanel } from "@/components/predictions/AiReviewPanel";
import { AchievementsGrid } from "@/components/achievements/AchievementsGrid";
import { TEAMS_2026 } from "@/lib/data/tournament";

export default function DashboardPage() {
  const { matches, teamMap } = useBracket();
  const { picks } = usePredictions();
  const { consensus } = useConsensus();

  const analysis = useMemo(
    () => analyzeBracket(picks, matches, consensus),
    [picks, matches, consensus]
  );

  const championItems = useMemo(() => {
    if (!consensus) return [];
    return consensus.championList.map((c) => {
      const t = teamMap[c.teamId] ?? TEAMS_2026.find((x) => x.id === c.teamId);
      return {
        teamId: c.teamId,
        pct: c.pct,
        code: t?.code ?? c.teamId.toUpperCase(),
        name: t?.name ?? c.teamId,
        flagUrl: t?.flagUrl ?? "/icon.svg",
      };
    });
  }, [consensus, teamMap]);

  const hasPicks =
    picks.champion ||
    Object.keys(picks.bracketPicks).length > 0 ||
    Object.keys(picks.matchPicks).length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
            <Trophy className="h-8 w-8 text-wc-gold" />
            My Bracket Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Risk profile, crowd comparison, and stats for your picks
          </p>
        </div>
        <ShareBracket />
      </div>

      <StillAliveBanner />

      {!hasPicks ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-500">Save some predictions first to unlock your dashboard.</p>
          <Link href="/predictions" className="btn-primary mt-4 inline-flex">
            Make predictions
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card space-y-4 p-6">
              <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-wc-green" />
                Your picks
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <PickTile
                  label="Champion"
                  teamId={analysis.championTeamId}
                  teamMap={teamMap}
                />
                <PickTile
                  label="Dark horse"
                  teamId={analysis.darkHorseTeamId}
                  teamMap={teamMap}
                  highlight="gold"
                />
              </div>
              {analysis.biggestUpset && (
                <div className="rounded-xl bg-wc-gold/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-wc-gold">Upset pick</p>
                  <p className="mt-1 text-sm font-medium">{analysis.biggestUpset.label}</p>
                </div>
              )}
              <RiskMeter score={analysis.riskScore} label={analysis.riskLabel} />
            </div>

            <div className="glass-card space-y-4 p-6">
              <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-wc-green" />
                Bracket review
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {analysis.reviewLines.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-wc-gold" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="border-t border-black/5 pt-4 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Common picks</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.commonPicks.map((id) => (
                    <span key={id} className="rounded-full bg-wc-green/10 px-2 py-0.5 text-xs font-medium text-wc-green">
                      ✔ {teamMap[id]?.code ?? id}
                    </span>
                  ))}
                  {analysis.commonPicks.length === 0 && (
                    <span className="text-xs text-gray-400">No mainstream favorites selected yet</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Unique picks</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.uniquePicks.map((id) => (
                    <span key={id} className="rounded-full bg-wc-gold/15 px-2 py-0.5 text-xs font-medium text-wc-gold">
                      ⭐ {teamMap[id]?.code ?? id}
                    </span>
                  ))}
                  {analysis.uniquePicks.length === 0 && (
                    <span className="text-xs text-gray-400">All mainstream so far</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card p-6">
              <h2 className="font-display mb-4 text-lg font-semibold">Champion picks</h2>
              {consensus && (
                <p className="mb-3 text-xs text-gray-400">
                  {consensus.source === "community"
                    ? `Based on ${consensus.totalBrackets} saved brackets`
                    : "Estimated from FIFA rankings until more brackets are saved"}
                </p>
              )}
              <ChampionConsensusList
                items={championItems}
                userChampionId={picks.champion}
              />
            </div>

            <div className="glass-card p-6">
              <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold">
                <Star className="h-5 w-5 text-wc-gold" />
                Bracket statistics
              </h2>
              <dl className="space-y-3 text-sm">
                <StatRow label="Upset picks" value={String(analysis.upsetCount)} />
                <StatRow
                  label="Predicted total goals"
                  value={analysis.totalPredictedGoals > 0 ? String(analysis.totalPredictedGoals) : "—"}
                />
                <StatRow
                  label="Avg FIFA rank (your picks)"
                  value={analysis.averageFifaRank != null ? String(analysis.averageFifaRank) : "—"}
                />
                {Object.entries(analysis.predictedGoalsByConfederation).map(([conf, goals]) => (
                  <StatRow key={conf} label={`${conf} teams (goals)`} value={String(goals)} />
                ))}
              </dl>
            </div>
          </div>

          <AiReviewPanel />
          <AchievementsGrid />
        </>
      )}

      <BracketFormatExplainer />
    </div>
  );
}

function PickTile({
  label,
  teamId,
  teamMap,
  highlight,
}: {
  label: string;
  teamId: string | null;
  teamMap: Record<string, { name: string; code: string; flagUrl: string; fifaRanking?: number }>;
  highlight?: "gold";
}) {
  const team = teamId ? teamMap[teamId] : null;
  return (
    <div
      className={`rounded-xl p-3 ${highlight === "gold" ? "bg-wc-gold/10 ring-1 ring-wc-gold/30" : "bg-black/[0.03] dark:bg-white/5"}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {team ? (
        <div className="mt-2 flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
          </div>
          <div>
            <p className="font-semibold">{team.name}</p>
            {team.fifaRanking && (
              <p className="text-[10px] text-gray-400">FIFA #{team.fifaRanking}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-400">Not set</p>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-black/5 pb-2 last:border-0 dark:border-white/10">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
