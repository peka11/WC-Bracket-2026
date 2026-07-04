"use client";

import { useState } from "react";
import Image from "next/image";
import { GitBranch } from "lucide-react";
import { TEAMS_2026, ELIMINATED_TEAM_IDS } from "@/lib/data/tournament";
import { analyzeMeetingPath } from "@/lib/bracket/path-visualizer";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function PathVisualizer() {
  const t = useTranslation();
  const active = TEAMS_2026.filter((t) => !ELIMINATED_TEAM_IDS.has(t.id));
  const [teamA, setTeamA] = useState(active[0]?.id ?? "arg");
  const [teamB, setTeamB] = useState(active[1]?.id ?? "fra");

  const result = analyzeMeetingPath(teamA, teamB);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
          <GitBranch className="h-8 w-8 text-wc-green" /> {t.path.title}
        </h1>
        <p className="mt-1 text-gray-500">{t.path.subtitle}</p>
      </div>

      <div className="glass-card grid gap-4 p-6 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          {t.path.teamA}
          <select value={teamA} onChange={(e) => setTeamA(e.target.value)} className="w-full rounded-xl border border-black/10 px-3 py-2 dark:border-white/10">
            {active.map((tm) => (
              <option key={tm.id} value={tm.id}>{tm.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          {t.path.teamB}
          <select value={teamB} onChange={(e) => setTeamB(e.target.value)} className="w-full rounded-xl border border-black/10 px-3 py-2 dark:border-white/10">
            {active.map((tm) => (
              <option key={tm.id} value={tm.id}>{tm.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div
        className={cn(
          "glass-card space-y-4 p-6",
          result.canMeetInFinal ? "ring-1 ring-wc-green/40" : "ring-1 ring-wc-gold/40"
        )}
      >
        <div className="flex items-center justify-center gap-6">
          {[teamA, teamB].map((id) => {
            const tm = TEAMS_2026.find((x) => x.id === id)!;
            return (
              <div key={id} className="text-center">
                <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full">
                  <Image src={tm.flagUrl} alt="" fill className="object-cover" unoptimized />
                </div>
                <p className="mt-2 font-bold">{tm.code}</p>
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-400">
          Earliest meeting: {result.earliestRound}
        </p>
        <p className="text-center text-lg">{result.explanation}</p>
        {result.canMeetInFinal && (
          <p className="text-center text-sm text-wc-green">✓ A final between these teams is bracket-possible</p>
        )}
      </div>
    </div>
  );
}
