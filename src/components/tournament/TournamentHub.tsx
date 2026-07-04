"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Trophy, TrendingDown, Globe2 } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import {
  getGoldenBootLeaderboard,
  getCinderellaTeam,
  getConfederationSurvival,
  getBiggestUpsets,
  TOURNAMENT_TIMELINE,
  teamsRemainingCount,
} from "@/lib/tournament/narrative";

export function TournamentHub() {
  const { matches, teamMap } = useBracket();
  const t = useTranslation();

  const goldenBoot = useMemo(() => getGoldenBootLeaderboard(matches), [matches]);
  const cinderella = getCinderellaTeam();
  const confs = getConfederationSurvival();
  const upsets = useMemo(() => getBiggestUpsets(matches), [matches]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">{t.tournament.title}</h1>
        <p className="mt-2 text-2xl font-semibold text-wc-green">
          {teamsRemainingCount()} {t.tournament.teamsLeft}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-wc-gold" /> {t.tournament.goldenBoot}
        </h2>
        <div className="glass-card divide-y divide-black/5 dark:divide-white/10">
          {goldenBoot.slice(0, 8).map((g, i) => (
            <div key={g.player} className="flex items-center gap-3 p-3">
              <span className="w-6 text-center font-bold text-gray-400">{i + 1}</span>
              <span className="flex-1 font-medium">{g.player}</span>
              <span className="text-sm text-gray-500">{g.teamCode}</span>
              <span className="font-display text-lg font-bold text-wc-gold">{g.goals}</span>
            </div>
          ))}
          {goldenBoot.length === 0 && <p className="p-4 text-sm text-gray-500">No goals recorded yet</p>}
        </div>
      </section>

      {cinderella && (
        <section className="glass-card flex items-center gap-4 p-5">
          <TrendingDown className="h-8 w-8 text-wc-green" />
          <div>
            <p className="text-sm text-gray-500">{t.tournament.cinderella}</p>
            <Link href={`/teams/${cinderella.teamId}`} className="font-display text-xl font-bold hover:text-wc-green">
              {cinderella.code} · FIFA #{cinderella.ranking}
            </Link>
            <p className="text-sm text-gray-500">Lowest-ranked team still in the knockout stage</p>
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-semibold">
          <Globe2 className="h-5 w-5" /> {t.tournament.confederations}
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {confs.map((c) => (
            <div key={c.confederation} className="glass-card p-4">
              <p className="text-sm text-gray-500">{c.confederation}</p>
              <p className="font-display text-2xl font-bold">{c.active}<span className="text-base text-gray-400">/{c.total}</span></p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">{t.tournament.upsets}</h2>
        <div className="space-y-2">
          {upsets.map((m) => (
            <Link key={m.id} href={`/matches/${m.id}`} className="glass-card block p-4 hover:ring-1 hover:ring-wc-gold/40">
              {teamMap[m.homeTeamId]?.code} {m.homeScore}–{m.awayScore} {teamMap[m.awayTeamId]?.code}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Timeline</h2>
        {TOURNAMENT_TIMELINE.map((day) => (
          <div key={day.day} className="glass-card p-5">
            <p className="text-xs text-wc-gold">Day {day.day} · {day.date}</p>
            <p className="font-display font-semibold">{day.title}</p>
            <ul className="mt-2 list-inside list-disc text-sm text-gray-500">
              {day.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
