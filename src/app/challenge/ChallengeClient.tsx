"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swords, Trophy, Copy, Check, Share2 } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { decodePredictionsFromShare, encodePredictionsForShare } from "@/lib/predictions/store";
import { computeHeadToHead, getChallengeUrl } from "@/lib/predictions/head-to-head";
import { getMatchLabel } from "@/lib/data/tournament";
import { cn } from "@/lib/utils";
import type { UserPredictions } from "@/lib/predictions/types";

export function ChallengeClient() {
  const { matches, teamMap } = useBracket();
  const { picks } = usePredictions();
  const [opponent, setOpponent] = useState<UserPredictions | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const vs = new URLSearchParams(window.location.search).get("vs");
    if (vs) {
      const decoded = decodePredictionsFromShare(vs);
      if (decoded) setOpponent(decoded);
    }
  }, []);

  const h2h = useMemo(() => {
    if (!opponent) return null;
    return computeHeadToHead(picks, opponent, matches);
  }, [picks, opponent, matches]);

  const myChallengeUrl = useMemo(() => {
    const encoded = encodePredictionsForShare(picks);
    return getChallengeUrl(encoded);
  }, [picks]);

  const copyChallenge = async () => {
    await navigator.clipboard.writeText(myChallengeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!opponent || !h2h) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-16 text-center">
        <Swords className="mx-auto h-12 w-12 text-wc-gold" />
        <h1 className="font-display text-2xl font-bold">Head-to-Head Challenge</h1>
        <p className="text-gray-500">
          Open a friend&apos;s challenge link, or share yours so they can compare picks with you.
        </p>
        <button type="button" onClick={copyChallenge} className="btn-primary mx-auto inline-flex gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Link copied!" : "Copy my challenge link"}
        </button>
        <Link href="/predictions" className="block text-sm text-wc-green hover:underline">
          Make predictions first →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="font-display flex items-center justify-center gap-2 text-3xl font-bold">
          <Swords className="h-8 w-8 text-wc-gold" />
          Head-to-Head
        </h1>
        <p className="mt-1 text-gray-500">
          {picks.displayName} vs {opponent.displayName} — based on finished matches
        </p>
      </div>

      <div className="glass-card grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400">You</p>
          <p className="font-display text-lg font-bold">{picks.displayName}</p>
          <p className="font-display mt-1 text-3xl font-bold text-wc-green">{h2h.you.points}</p>
          <p className="text-xs text-gray-500">{h2h.you.accuracyPct}% accuracy</p>
        </div>
        <div className="font-display text-2xl font-bold text-gray-400">VS</div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400">Opponent</p>
          <p className="font-display text-lg font-bold">{opponent.displayName}</p>
          <p className="font-display mt-1 text-3xl font-bold">{h2h.them.points}</p>
          <p className="text-xs text-gray-500">{h2h.them.accuracyPct}% accuracy</p>
        </div>
      </div>

      <div
        className={cn(
          "rounded-2xl p-4 text-center font-semibold",
          h2h.youWinning && "bg-wc-green/15 text-wc-green",
          h2h.themWinning && "bg-red-500/10 text-red-500",
          h2h.tied && "bg-wc-gold/15 text-wc-gold"
        )}
      >
        {h2h.youWinning && `You're winning by ${h2h.you.points - h2h.them.points} points!`}
        {h2h.themWinning && `${opponent.displayName} is ahead by ${h2h.them.points - h2h.you.points} points`}
        {h2h.tied && "It's tied — dead heat!"}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={copyChallenge} className="btn-primary inline-flex gap-2 text-sm">
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Share my challenge link"}
        </button>
        <Link href="/compare" className="btn-ghost text-sm">
          Compare vs actual →
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Match-by-match</h2>
        {h2h.matchups.length === 0 && (
          <p className="text-center text-gray-500">No finished matches yet — check back after kickoff!</p>
        )}
        {h2h.matchups.map(({ match, yourPoints, theirPoints, youWon, theyWon }) => (
          <div key={match.id} className="glass-card p-4">
            <p className="text-sm text-gray-500">{getMatchLabel(match)}</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <ScoreCell
                label={picks.displayName}
                points={yourPoints}
                winner={youWon}
                teamId={picks.bracketPicks[match.id] ?? picks.matchPicks[match.id]?.winner}
                teamMap={teamMap}
              />
              <ScoreCell
                label={opponent.displayName}
                points={theirPoints}
                winner={theyWon}
                teamId={opponent.bracketPicks[match.id] ?? opponent.matchPicks[match.id]?.winner}
                teamMap={teamMap}
              />
            </div>
          </div>
        ))}
      </div>

      {(picks.champion || opponent.champion) && (
        <div className="glass-card p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-4 w-4 text-wc-gold" /> Champion picks
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">{picks.displayName}</p>
              <p className="font-bold">{picks.champion ? teamMap[picks.champion]?.code : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{opponent.displayName}</p>
              <p className="font-bold">{opponent.champion ? teamMap[opponent.champion]?.code : "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCell({
  label,
  points,
  winner,
  teamId,
  teamMap,
}: {
  label: string;
  points: number;
  winner: boolean;
  teamId?: string;
  teamMap: Record<string, { code: string; flagUrl: string; name: string }>;
}) {
  const team = teamId ? teamMap[teamId] : null;
  return (
    <div className={cn("rounded-xl p-3", winner && "bg-wc-green/10 ring-1 ring-wc-green/30")}>
      <p className="text-[10px] uppercase text-gray-400">{label}</p>
      {team && (
        <div className="mt-1 flex items-center justify-center gap-2">
          <div className="relative h-5 w-5 overflow-hidden rounded-full">
            <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
          </div>
          <span className="text-sm font-medium">{team.code}</span>
        </div>
      )}
      <p className="mt-1 font-bold text-wc-green">+{points} pts</p>
    </div>
  );
}
