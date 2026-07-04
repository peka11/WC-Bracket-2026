import { formatInTimeZone } from "date-fns-tz";
import type { Match } from "@/lib/types";
import { DATA_AS_OF, getActiveTeams } from "@/lib/data/tournament";
import { ROUND_LABELS } from "@/lib/types";

const DISPLAY_TZ = "America/New_York";

export interface TournamentStatus {
  teamsRemaining: number;
  currentRoundLabel: string;
  subtitle: string;
  nextMatch: Match | null;
  nextMatchLabel: string | null;
  hasLive: boolean;
  r32Remaining: number;
}

export function getTournamentStatus(matches: Match[], teamsRemaining?: number): TournamentStatus {
  const active = teamsRemaining ?? getActiveTeams().length;
  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches
    .filter((m) => m.status === "not_started")
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
  const next = upcoming[0] ?? null;

  const r32Remaining = matches.filter((m) => m.round === "r32" && m.status === "not_started").length;
  const r16Started = matches.some((m) => m.round === "r16" && m.status !== "not_started");
  const r16Upcoming = matches.some((m) => m.round === "r16" && m.status === "not_started");

  let currentRoundLabel = "Round of 32";
  if (r32Remaining === 0 && r16Upcoming && !r16Started) currentRoundLabel = "Round of 16";
  else if (r16Started) currentRoundLabel = ROUND_LABELS.r16;
  else if (r32Remaining > 0 && r32Remaining < 16) currentRoundLabel = "Round of 32";

  let subtitle: string;
  if (live.length > 0) {
    subtitle = `${live.length} match${live.length > 1 ? "es" : ""} live right now`;
  } else if (next) {
    const when = formatInTimeZone(new Date(next.kickoffAt), DISPLAY_TZ, "EEE MMM d · h:mm a");
    subtitle = `Next up: ${when} ET`;
  } else {
    subtitle = `Knockout stage · snapshot ${formatInTimeZone(new Date(DATA_AS_OF), DISPLAY_TZ, "MMM d, yyyy")}`;
  }

  const nextMatchLabel = next
    ? formatInTimeZone(new Date(next.kickoffAt), DISPLAY_TZ, "MMM d · h:mm a")
    : null;

  return {
    teamsRemaining: active,
    currentRoundLabel,
    subtitle,
    nextMatch: next,
    nextMatchLabel,
    hasLive: live.length > 0,
    r32Remaining,
  };
}
