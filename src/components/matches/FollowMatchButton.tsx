"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFollowedMatches } from "@/lib/match/followed-matches";

export function FollowMatchButton({ matchId, compact }: { matchId: string; compact?: boolean }) {
  const { isFollowed, toggleFollow } = useFollowedMatches();
  const on = isFollowed(matchId);

  return (
    <button
      type="button"
      onClick={() => toggleFollow(matchId)}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg text-sm transition",
        compact ? "p-1.5" : "px-3 py-1.5",
        on ? "bg-wc-gold/20 text-wc-gold" : "bg-black/5 hover:bg-black/10 dark:bg-white/10"
      )}
      aria-pressed={on}
      title={on ? "Unfollow match" : "Follow for goal alerts"}
    >
      <Star className={cn("h-4 w-4", on && "fill-current")} />
      {!compact && (on ? "Following" : "Follow")}
    </button>
  );
}
