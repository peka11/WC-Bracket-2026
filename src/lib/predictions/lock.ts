import type { Match } from "@/lib/types";

const LIVE_OR_DONE = new Set<Match["status"]>([
  "live",
  "halftime",
  "extra_time",
  "penalties",
  "finished",
  "postponed",
  "cancelled",
]);

/** True once kickoff has passed or the match is no longer editable */
export function isMatchLocked(match: Match, nowMs = Date.now()): boolean {
  if (LIVE_OR_DONE.has(match.status)) return true;
  return new Date(match.kickoffAt).getTime() <= nowMs;
}

export function getLockedMatchIds(matches: Match[], nowMs = Date.now()): Set<string> {
  return new Set(matches.filter((m) => isMatchLocked(m, nowMs)).map((m) => m.id));
}
