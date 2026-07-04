"use client";

import { cn } from "@/lib/utils";
import type { Team } from "@/lib/types";

interface WinProbabilityBarProps {
  home: Team;
  away: Team;
  homePct: number;
  awayPct: number;
  pickedId?: string | null;
  showLabels?: boolean;
  compact?: boolean;
}

export function WinProbabilityBar({
  home,
  away,
  homePct,
  awayPct,
  pickedId,
  showLabels = true,
  compact = false,
}: WinProbabilityBarProps) {
  return (
    <div className={cn("space-y-1", compact && "space-y-0.5")}>
      {showLabels && (
        <div className="flex justify-between text-xs">
          <span className={cn("font-medium", pickedId === home.id && "text-wc-green")}>
            {home.code} {homePct}%
          </span>
          <span className={cn("font-medium", pickedId === away.id && "text-wc-green")}>
            {awayPct}% {away.code}
          </span>
        </div>
      )}
      <div className="flex h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className={cn(
            "bg-wc-green/70 transition-all",
            pickedId === home.id && "bg-wc-green"
          )}
          style={{ width: `${homePct}%` }}
        />
        <div
          className={cn(
            "bg-gray-300/80 transition-all dark:bg-gray-600/80",
            pickedId === away.id && "bg-wc-gold"
          )}
          style={{ width: `${awayPct}%` }}
        />
      </div>
      {!compact && (
        <p className="text-[10px] text-gray-400">
          Implied from FIFA rankings · community % shown when available
        </p>
      )}
    </div>
  );
}

interface CommunityPickBarProps {
  home: Team;
  away: Team;
  homePct: number;
  awayPct: number;
  pickedId?: string | null;
}

export function CommunityPickBar({ home, away, homePct, awayPct, pickedId }: CommunityPickBarProps) {
  const withCrowd =
    pickedId === home.id ? homePct >= 50 : pickedId === away.id ? awayPct >= 50 : null;

  return (
    <div className="rounded-lg bg-black/[0.03] p-2.5 dark:bg-white/5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Community picks
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className={pickedId === home.id ? "font-semibold text-wc-green" : ""}>
            {home.code}
          </span>
          <span className="tabular-nums font-medium">{homePct}%</span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="bg-wc-green/60" style={{ width: `${homePct}%` }} />
          <div className="bg-gray-400/50" style={{ width: `${awayPct}%` }} />
        </div>
        <div className="flex justify-between">
          <span className={pickedId === away.id ? "font-semibold text-wc-green" : ""}>
            {away.code}
          </span>
          <span className="tabular-nums font-medium">{awayPct}%</span>
        </div>
      </div>
      {pickedId && withCrowd != null && (
        <p className="mt-1.5 text-[10px] text-gray-500">
          {withCrowd ? "You're with the crowd" : "Contrarian pick — against the majority"}
        </p>
      )}
    </div>
  );
}

interface ChampionConsensusProps {
  items: { teamId: string; code: string; name: string; pct: number; flagUrl: string }[];
  userChampionId?: string | null;
}

export function ChampionConsensusList({ items, userChampionId }: ChampionConsensusProps) {
  return (
    <div className="space-y-2">
      {items.slice(0, 8).map((item) => (
        <div key={item.teamId} className="flex items-center gap-2">
          <span className="w-8 text-xs tabular-nums text-gray-400">{item.pct}%</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className={cn(
                "h-full rounded-full bg-wc-green/70",
                userChampionId === item.teamId && "bg-wc-gold"
              )}
              style={{ width: `${Math.min(100, item.pct)}%` }}
            />
          </div>
          <span
            className={cn(
              "w-12 text-xs font-medium",
              userChampionId === item.teamId && "text-wc-gold"
            )}
          >
            {item.code}
          </span>
        </div>
      ))}
    </div>
  );
}

interface RiskMeterProps {
  score: number;
  label: string;
}

export function RiskMeter({ score, label }: RiskMeterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Risk score</span>
        <span className="font-display text-2xl font-bold tabular-nums text-wc-gold">{score}/100</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score >= 75 ? "bg-red-500" : score >= 50 ? "bg-orange-500" : score >= 25 ? "bg-wc-gold" : "bg-wc-green"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-sm font-semibold">
        {label}
        {label === "Chaos Mode" && " 🔥"}
      </p>
    </div>
  );
}
