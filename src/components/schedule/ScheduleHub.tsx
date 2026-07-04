"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Download, Printer } from "lucide-react";
import type { Match, BracketRound } from "@/lib/types";
import { ROUND_LABELS } from "@/lib/types";
import { TEAMS_2026 } from "@/lib/data/tournament";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { getStadiumMeta } from "@/lib/data/stadiums";
import { downloadMatchesCalendar } from "@/lib/calendar/ics";
import { cn } from "@/lib/utils";
import { isSameDay } from "date-fns";

type ViewMode = "today" | "tomorrow" | "round" | "all";

function Countdown({ kickoffAt }: { kickoffAt: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = new Date(kickoffAt).getTime() - now;
  if (diff <= 0) return <span className="text-red-400">Soon</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span className="font-mono tabular-nums text-wc-gold">
      {h}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export function ScheduleHub() {
  const { matches, teamMap } = useBracket();
  const { formatKickoff, timezoneLabel } = useTimezone();
  const t = useTranslation();
  const [view, setView] = useState<ViewMode>("all");
  const [teamFilter, setTeamFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [roundFilter, setRoundFilter] = useState<BracketRound | "">("");

  const sorted = useMemo(
    () => [...matches].sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()),
    [matches]
  );

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const filtered = useMemo(() => {
    return sorted.filter((m) => {
      const d = new Date(m.kickoffAt);
      if (view === "today" && !isSameDay(d, new Date())) return false;
      if (view === "tomorrow" && !isSameDay(d, tomorrow)) return false;
      if (view === "round" && roundFilter && m.round !== roundFilter) return false;
      if (teamFilter && m.homeTeamId !== teamFilter && m.awayTeamId !== teamFilter) return false;
      if (cityFilter) {
        const city = getStadiumMeta(m.venue)?.city;
        if (city !== cityFilter) return false;
      }
      return true;
    });
  }, [sorted, view, teamFilter, cityFilter, roundFilter, tomorrow]);

  const nextThree = sorted.filter((m) => m.status === "not_started").slice(0, 3);
  const cities = Array.from(
    new Set(sorted.map((m) => getStadiumMeta(m.venue)?.city).filter((c): c is string => !!c))
  );

  const exportIcs = () => {
    downloadMatchesCalendar(
      filtered
        .filter((m) => m.status === "not_started")
        .map((m) => ({
          match: m,
          homeName: teamMap[m.homeTeamId]?.name ?? "TBD",
          awayName: teamMap[m.awayTeamId]?.name ?? "TBD",
        })),
      "wc-2026-knockout-schedule"
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{t.schedule.title}</h1>
        <p className="mt-1 text-gray-500">{t.schedule.subtitle}</p>
      </div>

      {nextThree.length > 0 && (
        <div className="glass-card grid gap-3 p-4 sm:grid-cols-3">
          <p className="col-span-full text-sm font-semibold text-wc-gold">{t.schedule.nextKickoffs}</p>
          {nextThree.map((m) => (
            <Link key={m.id} href={`/matches/${m.id}`} className="rounded-xl bg-black/5 p-3 dark:bg-white/5">
              <p className="text-sm font-medium">
                {teamMap[m.homeTeamId]?.code} vs {teamMap[m.awayTeamId]?.code}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatKickoff(m.kickoffAt, "EEE MMM d · h:mm a")} {timezoneLabel}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <Countdown kickoffAt={m.kickoffAt} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["today", "tomorrow", "round", "all"] as ViewMode[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              view === v ? "bg-wc-green text-white" : "bg-black/5 dark:bg-white/10"
            )}
          >
            {v === "today" ? t.schedule.today : v === "tomorrow" ? t.schedule.tomorrow : v === "round" ? t.schedule.byRound : t.schedule.all}
          </button>
        ))}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-lg border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
        >
          <option value="">{t.schedule.filterTeam}</option>
          {TEAMS_2026.map((tm) => (
            <option key={tm.id} value={tm.id}>{tm.name}</option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
        >
          <option value="">{t.schedule.filterCity}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {view === "round" && (
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value as BracketRound)}
            className="rounded-lg border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
          >
            <option value="">Round</option>
            {(Object.keys(ROUND_LABELS) as BracketRound[]).filter((r) => r !== "champion").map((r) => (
              <option key={r} value={r}>{ROUND_LABELS[r]}</option>
            ))}
          </select>
        )}
        <button type="button" onClick={exportIcs} className="btn-ghost ml-auto text-sm">
          <Download className="h-4 w-4" /> {t.schedule.exportIcs}
        </button>
        <button type="button" onClick={() => window.print()} className="btn-ghost text-sm print:hidden">
          <Printer className="h-4 w-4" /> {t.schedule.exportPrint}
        </button>
      </div>

      <div className="space-y-2 print:block">
        {filtered.length === 0 ? (
          <p className="text-gray-500">{t.schedule.noMatches}</p>
        ) : (
          filtered.map((m) => (
            <Link
              key={m.id}
              href={`/matches/${m.id}`}
              className="glass-card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:ring-1 hover:ring-wc-green/30"
            >
              <div>
                <p className="text-xs text-gray-400">{ROUND_LABELS[m.round]}</p>
                <p className="font-display text-lg font-semibold">
                  {teamMap[m.homeTeamId]?.name} vs {teamMap[m.awayTeamId]?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {getStadiumMeta(m.venue)?.city} · {m.venue?.split(",")[0]}
                </p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-sm">
                  <Calendar className="h-4 w-4 text-wc-green" />
                  {formatKickoff(m.kickoffAt, "EEE MMM d · h:mm a")} {timezoneLabel}
                </p>
                {m.status === "not_started" && <Countdown kickoffAt={m.kickoffAt} />}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
