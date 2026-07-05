"use client";

import { useMemo } from "react";
import { Radio, Clock, MapPin, Target } from "lucide-react";
import { AddToCalendarButton, AddAllToCalendarButton } from "@/components/calendar/AddToCalendarButton";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { MatchCard } from "@/components/matches/MatchCard";
import { StillAliveBanner } from "@/components/bracket/StillAliveBanner";
import { MATCH_STATUS_LABELS, ROUND_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TBD_TEAM } from "@/lib/data/tournament";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { getMatchPickOverlay } from "@/lib/predictions/match-pick-status";

export default function LivePage() {
  const { matches, teamMap, refresh, isSyncing, lastUpdate } = useBracket();
  const { picks } = usePredictions();
  const { formatKickoff, timezoneLabel } = useTimezone();

  const overlays = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getMatchPickOverlay>>();
    for (const m of matches) {
      map.set(m.id, getMatchPickOverlay(m, picks, teamMap));
    }
    return map;
  }, [matches, picks, teamMap]);

  const live = useMemo(
    () => matches.filter((m) => ["live", "halftime", "extra_time", "penalties"].includes(m.status)),
    [matches]
  );

  const upcoming = useMemo(
    () =>
      matches
        .filter((m) => m.status === "not_started")
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
        .slice(0, 8),
    [matches]
  );

  const recent = useMemo(
    () =>
      matches
        .filter((m) => m.status === "finished")
        .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
        .slice(0, 6),
    [matches]
  );

  const nextKickoff = upcoming[0];
  const pickedUpcoming = upcoming.filter((m) => overlays.get(m.id)?.status !== "none").length;

  const calendarEvents = useMemo(
    () =>
      upcoming.map((m) => ({
        match: m,
        homeName: teamMap[m.homeTeamId]?.name ?? "TBD",
        awayName: teamMap[m.awayTeamId]?.name ?? "TBD",
      })),
    [upcoming, teamMap]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
            <Radio className={cn("h-8 w-8", live.length > 0 ? "text-red-500 animate-pulse" : "text-gray-400")} />
            Match Center
          </h1>
          <p className="mt-1 text-gray-500">
            Live scores with your picks and points overlaid
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddAllToCalendarButton events={calendarEvents} />
          <button type="button" onClick={() => refresh()} disabled={isSyncing} className="btn-ghost text-sm">
            {isSyncing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <StillAliveBanner />

      {pickedUpcoming > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-wc-green/10 px-4 py-2 text-sm text-wc-green">
          <Target className="h-4 w-4" />
          You have picks on {pickedUpcoming} upcoming match{pickedUpcoming === 1 ? "" : "es"}
        </div>
      )}

      {nextKickoff && (
        <div className="glass-card flex items-center gap-4 p-5">
          <Clock className="h-8 w-8 text-wc-gold" />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">Next kickoff</p>
            <p className="font-semibold">
              {teamMap[nextKickoff.homeTeamId]?.code} vs {teamMap[nextKickoff.awayTeamId]?.code}
            </p>
            <p className="text-sm text-gray-500">
              {formatKickoff(nextKickoff.kickoffAt, "EEE, MMM d · h:mm a")} {timezoneLabel}
              {nextKickoff.venue && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {nextKickoff.venue}
                </span>
              )}
            </p>
            {overlays.get(nextKickoff.id)?.predictedWinnerId && (
              <p className="mt-1 text-xs text-wc-green">
                Your pick: {teamMap[overlays.get(nextKickoff.id)!.predictedWinnerId!]?.code}
              </p>
            )}
          </div>
          <AddToCalendarButton
            match={nextKickoff}
            homeName={teamMap[nextKickoff.homeTeamId]?.name ?? "TBD"}
            awayName={teamMap[nextKickoff.awayTeamId]?.name ?? "TBD"}
          />
        </div>
      )}

      <section>
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Live now ({live.length})
        </h2>
        {live.length === 0 ? (
          <p className="glass-card p-6 text-center text-gray-500">No live matches right now.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {live.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                home={teamMap[m.homeTeamId] ?? TBD_TEAM}
                away={teamMap[m.awayTeamId] ?? TBD_TEAM}
                pickOverlay={overlays.get(m.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">Upcoming</h2>
        <div className="space-y-3">
          {upcoming.map((m) => {
            const overlay = overlays.get(m.id);
            return (
              <div key={m.id} className="glass-card flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-gray-400">{ROUND_LABELS[m.round]}</p>
                  <p className="font-medium">
                    {teamMap[m.homeTeamId]?.name} vs {teamMap[m.awayTeamId]?.name}
                  </p>
                  {overlay?.predictedWinnerId && (
                    <p className="mt-1 text-xs text-wc-green">
                      Your pick: {teamMap[overlay.predictedWinnerId]?.code}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{formatKickoff(m.kickoffAt, "MMM d, h:mm a")}</p>
                  <p className="text-xs">{MATCH_STATUS_LABELS[m.status]}</p>
                  <AddToCalendarButton
                    match={m}
                    homeName={teamMap[m.homeTeamId]?.name ?? "TBD"}
                    awayName={teamMap[m.awayTeamId]?.name ?? "TBD"}
                    compact
                    className="mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">Recent results</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {recent.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              home={teamMap[m.homeTeamId] ?? TBD_TEAM}
              away={teamMap[m.awayTeamId] ?? TBD_TEAM}
              pickOverlay={overlays.get(m.id)}
            />
          ))}
        </div>
      </section>

      {lastUpdate && (
        <p className="text-center text-xs text-gray-400">
          Last updated {formatKickoff(lastUpdate, "h:mm:ss a")} {timezoneLabel} · auto-refresh every 30s
        </p>
      )}
    </div>
  );
}
