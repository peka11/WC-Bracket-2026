"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Lock, Trophy, Save } from "lucide-react";
import { BracketPanel } from "@/components/bracket/BracketPanel";
import { ShareBracket } from "@/components/bracket/ShareBracket";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { SCORING } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { getMatchLabel } from "@/lib/data/tournament";

export default function PredictionsPage() {
  const { teamMap, matches, activeTeams } = useBracket();
  const { picks, setMatchPick, setBracketPick, setConfidence, setChampion, save, saved, cloudSynced } = usePredictions();

  const openMatches = useMemo(
    () => matches.filter((m) => m.status === "not_started"),
    [matches]
  );

  const locked = false;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Your Predictions</h1>
          <p className="mt-1 text-gray-500">
            Pick winners, scores, confidence, and your champion
            {cloudSynced && <span className="ml-2 text-wc-green">· synced to cloud</span>}
          </p>
        </div>
        <ShareBracket />
      </div>

      <div className="glass-card overflow-visible p-4 sm:p-6">
        <h2 className="font-display mb-2 text-lg font-semibold">Interactive bracket</h2>
        <p className="mb-4 text-sm text-gray-500">Click a team in an upcoming match to pick the winner</p>
        <BracketPanel
          interactive
          onPickWinner={(matchId, winnerId) => setBracketPick(matchId, winnerId)}
        />
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-wc-gold" />
          Predict the Champion
        </h2>
        <p className="mt-1 text-sm text-gray-500">+{SCORING.CORRECT_CHAMPION} points if correct</p>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {activeTeams.map((team) => (
            <button
              key={team.id}
              type="button"
              disabled={locked}
              onClick={() => setChampion(team.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2 transition",
                picks.champion === team.id ? "bg-wc-gold/15 ring-2 ring-wc-gold" : "hover:bg-black/5"
              )}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
              </div>
              <span className="text-[10px] font-medium">{team.code}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Match predictions</h2>
        {openMatches.map((m) => {
          const home = teamMap[m.homeTeamId];
          const away = teamMap[m.awayTeamId];
          const pick = picks.matchPicks[m.id] ?? {};
          const picked = picks.bracketPicks[m.id] ?? pick.winner;
          return (
            <div key={m.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{getMatchLabel(m)}</span>
                {locked && <Lock className="h-4 w-4 text-gray-400" />}
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setMatchPick(m.id, { ...pick, winner: home.id });
                    setBracketPick(m.id, home.id);
                  }}
                  className={cn(
                    "rounded-xl p-3 text-center transition",
                    picked === home.id ? "bg-wc-green/10 ring-1 ring-wc-green" : "hover:bg-black/5"
                  )}
                >
                  {home.name}
                </button>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    disabled={locked}
                    value={pick.home ?? ""}
                    onChange={(e) =>
                      setMatchPick(m.id, { ...pick, home: parseInt(e.target.value) || 0 })
                    }
                    className="w-12 rounded-lg border border-black/10 px-2 py-1 text-center text-sm dark:border-white/10"
                    placeholder="H"
                  />
                  <span className="self-center text-gray-400">–</span>
                  <input
                    type="number"
                    min={0}
                    disabled={locked}
                    value={pick.away ?? ""}
                    onChange={(e) =>
                      setMatchPick(m.id, { ...pick, away: parseInt(e.target.value) || 0 })
                    }
                    className="w-12 rounded-lg border border-black/10 px-2 py-1 text-center text-sm dark:border-white/10"
                    placeholder="A"
                  />
                </div>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setMatchPick(m.id, { ...pick, winner: away.id });
                    setBracketPick(m.id, away.id);
                  }}
                  className={cn(
                    "rounded-xl p-3 text-center transition",
                    picked === away.id ? "bg-wc-green/10 ring-1 ring-wc-green" : "hover:bg-black/5"
                  )}
                >
                  {away.name}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xs text-gray-400">Confidence:</span>
                {([1, 2, 3] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    disabled={locked}
                    onClick={() => setConfidence(m.id, level)}
                    className={cn(
                      "rounded-lg px-2 py-0.5 text-xs transition",
                      (pick.confidence ?? 1) === level
                        ? "bg-wc-gold/20 font-medium text-wc-gold ring-1 ring-wc-gold/40"
                        : "text-gray-400 hover:bg-black/5"
                    )}
                  >
                    {level === 1 ? "Low" : level === 2 ? "Med" : "High"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                Winner up to +{SCORING.CORRECT_WINNER * 3} (confidence) · High-confidence upset +{SCORING.UPSET_BONUS} bonus · Exact score +{SCORING.CORRECT_SCORE}
              </p>
            </div>
          );
        })}
      </div>

      <button type="button" className="btn-primary flex w-full items-center justify-center gap-2 py-3" disabled={locked} onClick={save}>
        <Save className="h-4 w-4" />
        {saved ? "Saved!" : "Save predictions"}
      </button>
    </div>
  );
}
