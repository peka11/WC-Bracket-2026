"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Lock, Trophy, Save } from "lucide-react";
import { AddToCalendarButton } from "@/components/calendar/AddToCalendarButton";
import { BracketPanel } from "@/components/bracket/BracketPanel";
import { ShareBracket } from "@/components/bracket/ShareBracket";
import { StillAliveBanner } from "@/components/bracket/StillAliveBanner";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { SCORING } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { getMatchLabel } from "@/lib/data/tournament";
import { fireConfetti } from "@/components/effects/Confetti";
import { isMatchLocked } from "@/lib/predictions/lock";
import { useConsensus } from "@/lib/predictions/useConsensus";
import { getMatchConsensusPct } from "@/lib/predictions/consensus-utils";
import { getMatchWinProbabilities } from "@/lib/predictions/bracket-analysis";
import { WinProbabilityBar, CommunityPickBar } from "@/components/predictions/OddsDisplay";
import Link from "next/link";

export default function PredictionsPage() {
  const { teamMap, matches, activeTeams } = useBracket();
  const { picks, setMatchPick, setBracketPick, setConfidence, setChampion, save, saved, cloudSynced } = usePredictions();
  const { consensus } = useConsensus();
  const [now, setNow] = useState(() => Date.now());
  const [flashPick, setFlashPick] = useState<{ matchId: string; teamId: string } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!flashPick) return;
    const t = setTimeout(() => setFlashPick(null), 700);
    return () => clearTimeout(t);
  }, [flashPick]);

  const openMatches = useMemo(
    () => matches.filter((m) => m.status === "not_started" && !isMatchLocked(m, now)),
    [matches, now]
  );

  const canPickMatch = useCallback(
    (matchId: string) => {
      const m = matches.find((x) => x.id === matchId);
      return m ? !isMatchLocked(m, now) : false;
    },
    [matches, now]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Your Predictions</h1>
          <p className="mt-1 text-gray-500">
            Pick winners, scores, confidence, and your champion
            {cloudSynced && <span className="ml-2 text-wc-green">· synced to cloud</span>}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Picks lock at kickoff · Odds from FIFA rankings + community picks
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="btn-ghost text-sm">
            My dashboard
          </Link>
          <ShareBracket />
        </div>
      </div>

      <StillAliveBanner />

      <div className="glass-card overflow-visible p-4 sm:p-6">
        <h2 className="font-display mb-2 text-lg font-semibold">Interactive bracket</h2>
        <p className="mb-4 text-sm text-gray-500">Click a team in an upcoming match to pick the winner</p>
        <BracketPanel
          interactive
          canPickMatch={canPickMatch}
          flashPick={flashPick}
          onPickWinner={(matchId, winnerId) => {
            if (!canPickMatch(matchId)) return;
            setBracketPick(matchId, winnerId);
            setFlashPick({ matchId, teamId: winnerId });
          }}
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
              onClick={() => {
                setChampion(team.id);
                fireConfetti();
              }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2 transition",
                picks.champion === team.id ? "bg-wc-gold/15 ring-2 ring-wc-gold" : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
              </div>
              <span className="text-[10px] font-medium">{team.code}</span>
              {team.fifaRanking != null && (
                <span className="text-[9px] text-gray-400">#{team.fifaRanking}</span>
              )}
              {consensus?.champions[team.id] != null && (
                <span className="text-[9px] text-wc-green">{consensus.champions[team.id]}%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Match predictions</h2>
        {openMatches.length === 0 && (
          <p className="glass-card p-4 text-center text-sm text-gray-500">
            All upcoming matches are locked or finished. Check back before the next kickoff window.
          </p>
        )}
        {openMatches.map((m) => {
          const home = teamMap[m.homeTeamId];
          const away = teamMap[m.awayTeamId];
          const pick = picks.matchPicks[m.id] ?? {};
          const picked = picks.bracketPicks[m.id] ?? pick.winner;
          const locked = isMatchLocked(m, now);
          const odds = getMatchWinProbabilities(home, away);
          const community = consensus
            ? getMatchConsensusPct(consensus, m.id, home.id, away.id)
            : odds;
          return (
            <div key={m.id} className="glass-card space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500">{getMatchLabel(m)}</span>
                <div className="flex items-center gap-2">
                  <AddToCalendarButton match={m} homeName={home.name} awayName={away.name} compact />
                  {locked && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="h-3.5 w-3.5" /> Locked
                    </span>
                  )}
                </div>
              </div>
              <WinProbabilityBar
                home={home}
                away={away}
                homePct={odds.homePct}
                awayPct={odds.awayPct}
                pickedId={picked}
                compact
              />
              <CommunityPickBar
                home={home}
                away={away}
                homePct={community.homePct}
                awayPct={community.awayPct}
                pickedId={picked}
              />
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setMatchPick(m.id, { ...pick, winner: home.id });
                    setBracketPick(m.id, home.id);
                  }}
                  className={cn(
                    "rounded-xl p-3 text-center transition",
                    picked === home.id ? "bg-wc-green/10 ring-1 ring-wc-green" : "hover:bg-black/5 dark:hover:bg-white/5",
                    locked && "opacity-60"
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
                    className="score-input"
                    placeholder="H"
                  />
                  <span className="self-center text-gray-400 dark:text-gray-500">–</span>
                  <input
                    type="number"
                    min={0}
                    disabled={locked}
                    value={pick.away ?? ""}
                    onChange={(e) =>
                      setMatchPick(m.id, { ...pick, away: parseInt(e.target.value) || 0 })
                    }
                    className="score-input"
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
                    picked === away.id ? "bg-wc-green/10 ring-1 ring-wc-green" : "hover:bg-black/5 dark:hover:bg-white/5",
                    locked && "opacity-60"
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
                        : "text-gray-400 hover:bg-black/5 dark:hover:bg-white/5",
                      locked && "opacity-60"
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

      <button type="button" className="btn-primary flex w-full items-center justify-center gap-2 py-3" onClick={save}>
        <Save className="h-4 w-4" />
        {saved ? "Saved!" : "Save predictions"}
      </button>
    </div>
  );
}
