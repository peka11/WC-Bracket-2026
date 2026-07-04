"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { X, MapPin, Clock } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { getMatchLabel } from "@/lib/data/tournament";
import { MATCH_STATUS_LABELS } from "@/lib/types";
import { AddToCalendarButton } from "@/components/calendar/AddToCalendarButton";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { getStadiumMeta } from "@/lib/data/stadiums";

export function MatchDrawer() {
  const { selectedMatch, selectedTeamId, teamMap, closeDrawer } = useBracket();
  const { formatKickoff, timezoneLabel } = useTimezone();
  const open = !!(selectedMatch || selectedTeamId);
  const team = selectedTeamId ? teamMap[selectedTeamId] : null;
  const match = selectedMatch;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && closeDrawer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-gray-900 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          <div className="mb-4 flex items-start justify-between">
            <Dialog.Title className="font-display text-lg font-bold">
              {match ? getMatchLabel(match) : team?.name}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {team && !match && (
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-wc-gold/40">
                <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
              </div>
              <div>
                <p className="text-xl font-semibold">{team.name}</p>
                <p className="text-sm text-gray-500">Group {team.group} · {team.confederation}</p>
                {team.fifaRanking && (
                  <p className="text-xs text-gray-400">FIFA rank #{team.fifaRanking}</p>
                )}
              </div>
            </div>
          )}

          {match && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatKickoff(match.kickoffAt, "EEE MMM d · h:mm a")} {timezoneLabel}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-white/10">
                  {MATCH_STATUS_LABELS[match.status]}
                </span>
              </div>

              {match.venue && (
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {match.venue}
                  {getStadiumMeta(match.venue) && (
                    <span className="text-gray-400">
                      · {getStadiumMeta(match.venue)!.capacity.toLocaleString()} capacity
                    </span>
                  )}
                </p>
              )}

              <AddToCalendarButton
                match={match}
                homeName={teamMap[match.homeTeamId]?.name ?? "TBD"}
                awayName={teamMap[match.awayTeamId]?.name ?? "TBD"}
              />

              <div className="space-y-2">
                {[match.homeTeamId, match.awayTeamId].map((id, i) => {
                  const t = teamMap[id];
                  const score = i === 0 ? match.homeScore : match.awayScore;
                  const isWinner = match.winnerTeamId === id;
                  return (
                    <div
                      key={id}
                      className={`flex items-center gap-3 rounded-xl p-3 ${isWinner ? "bg-wc-gold/10 ring-1 ring-wc-gold/30" : "bg-black/[0.03] dark:bg-white/5"}`}
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image src={t.flagUrl} alt="" fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{t.name}</span>
                        {t.fifaRanking != null && (
                          <p className="text-[10px] text-gray-400">FIFA #{t.fifaRanking}</p>
                        )}
                      </div>
                      <span className="text-2xl font-bold tabular-nums">{score ?? "–"}</span>
                    </div>
                  );
                })}
              </div>

              {match.events && match.events.length > 0 && (
                <div className="rounded-xl bg-black/[0.03] p-3 dark:bg-white/5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Match events</p>
                  {match.events.map((e, i) => (
                    <p key={i} className="text-sm text-gray-600 dark:text-gray-300">
                      {e.minute}&apos; {e.player ?? e.teamCode} {e.detail && `· ${e.detail}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
