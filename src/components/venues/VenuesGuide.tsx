"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { STADIUMS, getStadiumMeta } from "@/lib/data/stadiums";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function VenuesGuide() {
  const { matches, teamMap } = useBracket();
  const t = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [country, setCountry] = useState<"all" | "USA" | "Mexico" | "Canada">("all");

  const filtered = STADIUMS.filter((s) => country === "all" || s.country === country);
  const stadium = selected ? STADIUMS.find((s) => s.id === selected) : null;

  const venueMatches = useMemo(() => {
    if (!stadium) return [];
    return matches.filter((m) => {
      const meta = getStadiumMeta(m.venue);
      return meta?.city === stadium.city;
    });
  }, [matches, stadium]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{t.venues.title}</h1>
        <p className="mt-1 text-gray-500">{t.venues.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "USA", "Mexico", "Canada"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCountry(c)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              country === c ? "bg-wc-green text-white" : "bg-black/5 dark:bg-white/10"
            )}
          >
            {c === "all" ? "All hosts" : c}
          </button>
        ))}
      </div>

      {/* Simple map — positioned dots on NA bounding box */}
      <div className="glass-card relative aspect-[16/9] max-h-80 overflow-hidden rounded-2xl bg-[#0a1f14]">
        <p className="absolute left-3 top-3 text-xs text-gray-400">Host cities map</p>
        {filtered.map((s) => {
          const x = ((s.lng + 130) / 60) * 100;
          const y = ((50 - s.lat) / 28) * 100;
          return (
            <button
              key={s.id}
              type="button"
              title={s.city}
              onClick={() => setSelected(s.id)}
              className={cn(
                "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/50 transition hover:scale-150",
                selected === s.id ? "bg-wc-gold scale-125" : "bg-wc-green"
              )}
              style={{ left: `${Math.min(95, Math.max(5, x))}%`, top: `${Math.min(90, Math.max(10, y))}%` }}
            />
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={cn(
              "glass-card p-4 text-left transition",
              selected === s.id && "ring-2 ring-wc-gold"
            )}
          >
            <p className="font-display font-semibold">{s.name}</p>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" /> {s.city}, {s.country}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
              <Users className="h-3.5 w-3.5" /> {s.capacity.toLocaleString()} {t.venues.capacity.toLowerCase()}
            </p>
          </button>
        ))}
      </div>

      {stadium && (
        <div className="glass-card space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">{stadium.name}</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><dt className="text-gray-400">{t.venues.surface}</dt><dd className="font-medium">{stadium.surface}</dd></div>
            <div><dt className="text-gray-400">{t.venues.climate}</dt><dd className="font-medium">{stadium.climate}</dd></div>
            <div className="sm:col-span-2"><dt className="text-gray-400">{t.venues.gettingThere}</dt><dd className="font-medium">{stadium.gettingThere}</dd></div>
          </dl>
          {venueMatches.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">{t.venues.matchesHere}</p>
              <ul className="space-y-1 text-sm">
                {venueMatches.map((m) => (
                  <li key={m.id}>
                    <Link href={`/matches/${m.id}`} className="text-wc-green hover:underline">
                      {teamMap[m.homeTeamId]?.code} vs {teamMap[m.awayTeamId]?.code}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
