"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, User, Users } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { enrichMatchDetails } from "@/lib/match/enrich";
import { getMatchLabel } from "@/lib/data/tournament";
import { getStadiumMeta } from "@/lib/data/stadiums";
import { MATCH_STATUS_LABELS } from "@/lib/types";
import { MatchTimeline } from "@/components/matches/MatchTimeline";
import { MatchStatsPanel } from "@/components/matches/MatchStatsPanel";
import { PathToMatch } from "@/components/matches/PathToMatch";
import { FollowMatchButton } from "@/components/matches/FollowMatchButton";
import { AddToCalendarButton } from "@/components/calendar/AddToCalendarButton";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const { matches, teamMap } = useBracket();
  const { formatKickoff, timezoneLabel } = useTimezone();
  const t = useTranslation();

  const match = useMemo(() => {
    const m = matches.find((x) => x.id === params.id);
    return m ? enrichMatchDetails(m) : null;
  }, [matches, params.id]);

  if (!match) {
    return (
      <div className="py-20 text-center">
        <p>Match not found</p>
        <Link href="/schedule" className="btn-primary mt-4 inline-flex">Schedule</Link>
      </div>
    );
  }

  const home = teamMap[match.homeTeamId];
  const away = teamMap[match.awayTeamId];
  const stadium = getStadiumMeta(match.venue);
  const live = ["live", "halftime", "extra_time", "penalties"].includes(match.status);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/schedule" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-wc-green">
        <ArrowLeft className="h-4 w-4" /> {t.match.back}
      </Link>

      <div className="glass-card overflow-hidden p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-500">{getMatchLabel(match)}</p>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", live ? "bg-red-500/20 text-red-500" : "bg-gray-100 dark:bg-white/10")}>
            {MATCH_STATUS_LABELS[match.status]}
          </span>
        </div>

        <div className="flex items-center justify-center gap-6 py-6">
          {[home, away].map((team, i) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="flex flex-col items-center gap-2 hover:opacity-90">
              <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-wc-gold/20">
                <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
              </div>
              <span className="font-display text-lg font-bold">{team.name}</span>
              <span className="text-3xl font-bold tabular-nums">
                {i === 0 ? match.homeScore ?? "-" : match.awayScore ?? "-"}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 dark:border-white/10">
          <p className="text-sm text-gray-500">
            {formatKickoff(match.kickoffAt, "EEE, MMM d · h:mm a")} {timezoneLabel}
          </p>
          <div className="flex gap-2">
            <FollowMatchButton matchId={match.id} />
            <AddToCalendarButton match={match} homeName={home.name} awayName={away.name} compact />
          </div>
        </div>

        {(match.referee || match.attendance || stadium) && (
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            {match.referee && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-400" />
                <span>{t.match.referee}: {match.referee}</span>
              </div>
            )}
            {match.attendance && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{t.match.attendance}: {match.attendance.toLocaleString()}</span>
              </div>
            )}
            {stadium && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Link href="/venues" className="hover:text-wc-green">{stadium.city} · {match.venue?.split(",")[0]}</Link>
              </div>
            )}
          </dl>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="font-display mb-4 font-semibold">{t.match.timeline}</h2>
          <MatchTimeline events={match.events} />
        </div>
        <div className="glass-card p-5">
          <MatchStatsPanel match={match} homeCode={home.code} awayCode={away.code} />
        </div>
      </div>

      <div className="glass-card p-5">
        <PathToMatch match={match} matches={matches} teamMap={teamMap} />
      </div>
    </div>
  );
}
