"use client";

import type { Match, MatchStats } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/I18nProvider";

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs tabular-nums text-gray-500">
        <span>{home}</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="bg-wc-green transition-all" style={{ width: `${homePct}%` }} />
        <div className="bg-gray-400 transition-all" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  );
}

export function MatchStatsPanel({
  match,
  homeCode,
  awayCode,
}: {
  match: Match;
  homeCode: string;
  awayCode: string;
}) {
  const t = useTranslation();
  const stats: MatchStats = match.stats ?? {
    homePossession: match.homePossession,
    awayPossession: match.awayPossession,
  };

  const rows: { label: string; home: number; away: number }[] = [];
  const add = (label: string, home?: number, away?: number) => {
    if (home != null && away != null) rows.push({ label, home, away });
  };
  add(t.match.possession, stats.homePossession, stats.awayPossession);
  add(t.match.xg, stats.homeXG, stats.awayXG);
  add(t.match.shots, stats.homeShots, stats.awayShots);
  add(t.match.onTarget, stats.homeShotsOnTarget, stats.awayShotsOnTarget);
  add(t.match.corners, stats.homeCorners, stats.awayCorners);

  if (!rows.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
        <span>{homeCode}</span>
        <span>{t.match.stats}</span>
        <span>{awayCode}</span>
      </div>
      {rows.map((r) => (
        <StatBar key={r.label} label={r.label} home={r.home} away={r.away} />
      ))}
    </div>
  );
}
