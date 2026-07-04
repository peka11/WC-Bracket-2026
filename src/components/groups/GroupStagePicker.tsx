"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRightLeft } from "lucide-react";
import { GROUP_STANDINGS, finishFirstProbability } from "@/lib/data/group-stage";
import { simulateGroupThirdPlace } from "@/lib/data/group-bracket-impact";
import { TEAMS_2026 } from "@/lib/data/tournament";
import { cn } from "@/lib/utils";

const teamMap = Object.fromEntries(TEAMS_2026.map((t) => [t.id, t]));

export function GroupStagePicker() {
  const [selectedGroup, setSelectedGroup] = useState("D");
  const [hypotheticalThird, setHypotheticalThird] = useState<string | null>(null);

  const group = GROUP_STANDINGS.find((g) => g.id === selectedGroup)!;
  const thirdPlaceOptions = group.standings.filter((s) => s.position >= 3);

  const explanation = useMemo(() => {
    if (!hypotheticalThird) return null;
    return simulateGroupThirdPlace(selectedGroup, hypotheticalThird);
  }, [selectedGroup, hypotheticalThird]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {GROUP_STANDINGS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              setSelectedGroup(g.id);
              setHypotheticalThird(null);
            }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              selectedGroup === g.id
                ? "bg-wc-green text-white"
                : "bg-black/5 hover:bg-black/10 dark:bg-white/10"
            )}
          >
            {g.id}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-x-auto p-4">
        <h3 className="font-display mb-3 font-semibold">{group.name} — Final standings</h3>
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="pb-2">#</th>
              <th className="pb-2">Team</th>
              <th className="pb-2">P</th>
              <th className="pb-2">GD</th>
              <th className="pb-2">Form</th>
              <th className="pb-2">Finish 1st</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((row) => {
              const t = teamMap[row.teamId];
              if (!t) return null;
              const firstPct = finishFirstProbability(row, group.standings);
              return (
                <tr
                  key={row.teamId}
                  className={cn(
                    "border-t border-black/5 dark:border-white/10",
                    row.advanced && "bg-wc-green/5"
                  )}
                >
                  <td className="py-2 font-medium">{row.position}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 overflow-hidden rounded-full">
                        <Image src={t.flagUrl} alt="" fill className="object-cover" unoptimized />
                      </div>
                      {t.code}
                      {row.advanced && row.position === 3 && (
                        <span className="text-[10px] text-wc-green">3rd→R32</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 tabular-nums">{row.points}</td>
                  <td className="py-2 tabular-nums">{row.gf - row.ga}</td>
                  <td className="py-2 font-mono text-xs">{row.form}</td>
                  <td className="py-2 tabular-nums text-gray-500">{firstPct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="glass-card space-y-3 p-5">
        <h3 className="font-display flex items-center gap-2 font-semibold">
          <ArrowRightLeft className="h-5 w-5 text-wc-gold" />
          What if 3rd place changed?
        </h3>
        <p className="text-sm text-gray-500">
          Toggle a different 3rd-place finisher to see how the Round of 32 bracket would shift.
        </p>
        <div className="flex flex-wrap gap-2">
          {thirdPlaceOptions.map((row) => {
            const t = teamMap[row.teamId];
            if (!t) return null;
            return (
              <button
                key={row.teamId}
                type="button"
                onClick={() => setHypotheticalThird(row.teamId)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition",
                  hypotheticalThird === row.teamId
                    ? "bg-wc-gold/20 ring-1 ring-wc-gold"
                    : "bg-black/5 hover:bg-black/10 dark:bg-white/10"
                )}
              >
                {t.name} (3rd)
              </button>
            );
          })}
        </div>

        {explanation && (
          <div className="rounded-xl border border-wc-gold/30 bg-wc-gold/5 p-4 text-sm">
            <p className="font-semibold text-wc-gold">{explanation.title}</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{explanation.body}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-black/5 p-2 dark:bg-white/5">
                <p className="text-[10px] uppercase text-gray-400">Was</p>
                <p className="font-medium">{explanation.fromMatchup}</p>
              </div>
              <div className="rounded-lg bg-wc-green/10 p-2">
                <p className="text-[10px] uppercase text-wc-green">Becomes</p>
                <p className="font-medium">{explanation.toMatchup}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">{explanation.affectedMatch}</p>
          </div>
        )}
      </div>
    </div>
  );
}
