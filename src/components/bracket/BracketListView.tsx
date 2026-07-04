"use client";

import type { Match, Team } from "@/lib/types";
import { BRACKET_SECTORS } from "@/lib/data/tournament";
import { MatchCard } from "@/components/matches/MatchCard";
import { ROUND_LABELS } from "@/lib/types";

interface BracketListViewProps {
  matches: Match[];
  teamMap: Record<string, Team>;
  onTeamClick?: (teamId: string, matchId?: string) => void;
}

export function BracketListView({ matches, teamMap, onTeamClick }: BracketListViewProps) {
  const r16 = matches.filter((m) => m.round === "r16");
  const upcomingR32 = matches.filter((m) => m.round === "r32" && m.status === "not_started");

  return (
    <div className="mt-8 space-y-6 border-t border-black/10 pt-6 md:hidden dark:border-white/10">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
        Match list
      </p>
      {upcomingR32.length > 0 && (
        <section>
          <h3 className="font-display mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Round of 32
          </h3>
          <div className="space-y-3">
            {upcomingR32.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                home={teamMap[m.homeTeamId]}
                away={teamMap[m.awayTeamId]}
                onPickWinner={(id) => onTeamClick?.(id, m.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-display mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          {ROUND_LABELS.r16}
        </h3>
        <div className="space-y-3">
          {BRACKET_SECTORS.map((sector, i) => {
            const m = r16.find((x) => x.matchNumber === sector.r16MatchNumber);
            if (!m) return null;
            const [a, b] = sector.r16TeamIds;
            const label =
              a && b
                ? `${teamMap[a]?.code ?? "?"} vs ${teamMap[b]?.code ?? "?"}`
                : a
                  ? `${teamMap[a]?.code ?? "?"} vs TBD`
                  : "COL vs GHA";
            return (
              <div key={sector.r16MatchNumber}>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-wc-gold">
                  Match {sector.r16MatchNumber} · {label}
                </p>
                <MatchCard
                  match={m}
                  home={teamMap[m.homeTeamId]}
                  away={teamMap[m.awayTeamId]}
                  onPickWinner={(id) => onTeamClick?.(id, m.id)}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
