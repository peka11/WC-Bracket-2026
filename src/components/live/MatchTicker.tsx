"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { MATCH_STATUS_LABELS } from "@/lib/types";

export function MatchTicker() {
  const { matches, teamMap } = useBracket();
  const t = useTranslation();

  const items = useMemo(() => {
    return matches
      .filter((m) => ["live", "halftime", "extra_time", "penalties", "not_started"].includes(m.status))
      .sort((a, b) => {
        const liveA = a.status !== "not_started" ? 0 : 1;
        const liveB = b.status !== "not_started" ? 0 : 1;
        if (liveA !== liveB) return liveA - liveB;
        return new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
      })
      .slice(0, 12);
  }, [matches]);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-wc-green/30 bg-[#071a10]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-wc-gold">
          {t.ticker.live}
        </span>
        <div className="flex animate-marquee gap-6 whitespace-nowrap text-xs">
          {[...items, ...items].map((m, i) => {
            const home = teamMap[m.homeTeamId]?.code ?? "?";
            const away = teamMap[m.awayTeamId]?.code ?? "?";
            const score =
              m.homeScore != null ? `${m.homeScore}–${m.awayScore}` : new Date(m.kickoffAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <Link key={`${m.id}-${i}`} href={`/matches/${m.id}`} className="inline-flex items-center gap-2 hover:text-wc-gold">
                <span className={m.status !== "not_started" ? "text-red-400" : "text-gray-400"}>
                  {m.status !== "not_started" ? MATCH_STATUS_LABELS[m.status] : "·"}
                </span>
                <span className="font-medium">{home} {score} {away}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
