"use client";

import { formatInTimeZone } from "date-fns-tz";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match, Team } from "@/lib/types";
import { MATCH_STATUS_LABELS } from "@/lib/types";
import type { MatchPickOverlay } from "@/lib/predictions/match-pick-status";

/** Fixed TZ so SSR and client render the same kickoff string */
const DISPLAY_TZ = "America/New_York";

interface MatchCardProps {
  match: Match;
  home: Team;
  away: Team;
  onPickWinner?: (teamId: string) => void;
  pickOverlay?: MatchPickOverlay | null;
}

export function MatchCard({ match, home, away, onPickWinner, pickOverlay }: MatchCardProps) {
  const isLive = match.status === "live";
  const kickoff = formatInTimeZone(new Date(match.kickoffAt), DISPLAY_TZ, "MMM d · h:mm a");
  const predictedTeam =
    pickOverlay?.predictedWinnerId === home.id
      ? home
      : pickOverlay?.predictedWinnerId === away.id
        ? away
        : null;

  return (
    <motion.div
      layout
      className={cn(
        "glass-card p-4 transition-shadow",
        isLive && "ring-2 ring-red-500/40 shadow-lg shadow-red-500/10",
        pickOverlay?.status === "correct" && "ring-1 ring-wc-green/40",
        pickOverlay?.status === "wrong" && "ring-1 ring-red-500/30"
      )}
    >
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">Match {match.matchNumber}</span>
        <div className="flex items-center gap-2">
          {pickOverlay && pickOverlay.status !== "none" && (
            <PickBadge overlay={pickOverlay} predictedTeam={predictedTeam} />
          )}
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {MATCH_STATUS_LABELS[match.status]}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {[home, away].map((team, idx) => {
          const isHome = idx === 0;
          const score = isHome ? match.homeScore : match.awayScore;
          const isWinner = match.winnerTeamId === team.id;
          const isYourPick = pickOverlay?.predictedWinnerId === team.id;
          return (
            <button
              key={team.id}
              type="button"
              disabled={!onPickWinner || match.status === "finished"}
              onClick={() => onPickWinner?.(team.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl p-2 transition",
                onPickWinner && match.status !== "finished" && "hover:bg-black/5",
                isWinner && "bg-wc-gold/10 ring-1 ring-wc-gold/30",
                isYourPick && !isWinner && "bg-wc-green/5 ring-1 ring-wc-green/30"
              )}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-black/10">
                <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
              </div>
              <span className="flex-1 text-left text-sm font-medium">
                {team.name}
                {isYourPick && (
                  <span className="ml-2 text-[10px] font-normal text-wc-green">Your pick</span>
                )}
              </span>
              <span className="tabular-nums text-lg font-bold">{score ?? "-"}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-xs text-gray-500 dark:border-white/10">
        <span>{kickoff}</span>
        {match.homePossession != null && (
          <span>Possession {match.homePossession}% – {match.awayPossession}%</span>
        )}
      </div>

      {match.events && match.events.length > 0 && (
        <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {match.events.map((e, i) => (
            <div key={i}>
              ⚽ {e.minute}&apos; {e.player} ({e.teamCode})
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PickBadge({
  overlay,
  predictedTeam,
}: {
  overlay: MatchPickOverlay;
  predictedTeam: Team | null;
}) {
  if (overlay.status === "correct" && overlay.pointsEarned != null) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-wc-green/15 px-2 py-0.5 text-[10px] font-bold text-wc-green">
        <Check className="h-3 w-3" />
        +{overlay.pointsEarned} pts
      </span>
    );
  }
  if (overlay.status === "wrong") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
        <X className="h-3 w-3" />
        Wrong pick
      </span>
    );
  }
  if (overlay.status === "live_winning") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-wc-green/15 px-2 py-0.5 text-[10px] font-bold text-wc-green">
        <Target className="h-3 w-3" />
        {predictedTeam?.code} winning
      </span>
    );
  }
  if (overlay.status === "live_losing") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
        <Target className="h-3 w-3" />
        {predictedTeam?.code} losing
      </span>
    );
  }
  if (overlay.status === "pending" && predictedTeam) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-wc-gold/15 px-2 py-0.5 text-[10px] font-medium text-wc-gold">
        <Target className="h-3 w-3" />
        Picked {predictedTeam.code}
      </span>
    );
  }
  return null;
}
