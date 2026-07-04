import type { Match, BracketSlot, MatchStatus } from "@/lib/types";
import { advanceWinner } from "@/lib/bracket/advance";

const LIVE_STATUSES: MatchStatus[] = ["live", "halftime", "extra_time", "penalties"];

function isLiveStatus(status: MatchStatus): boolean {
  return LIVE_STATUSES.includes(status);
}

/** Prefer static tournament data for finished results; snapshot wins for live/in-progress */
function mergeMatch(base: Match, snapshot: Match): Match {
  if (isLiveStatus(snapshot.status)) {
    return { ...base, ...snapshot };
  }

  if (snapshot.status === "finished" && base.status !== "finished") {
    return { ...base, ...snapshot };
  }

  if (base.status === "finished" && base.winnerTeamId) {
    return {
      ...base,
      ...snapshot,
      status: base.status,
      homeScore: base.homeScore ?? snapshot.homeScore,
      awayScore: base.awayScore ?? snapshot.awayScore,
      winnerTeamId: base.winnerTeamId ?? snapshot.winnerTeamId,
      events: base.events?.length ? base.events : snapshot.events,
    };
  }

  return { ...base, ...snapshot };
}

/** Apply live snapshot over static tournament data; re-run advancement for finished matches */
export function mergeBracketState(
  baseMatches: Match[],
  baseSlots: BracketSlot[],
  snapshotMatches?: Match[] | null,
  snapshotSlots?: BracketSlot[] | null
): { matches: Match[]; slots: BracketSlot[] } {
  if (!snapshotMatches?.length) {
    return { matches: baseMatches, slots: baseSlots };
  }

  const byId = new Map(baseMatches.map((m) => [m.id, { ...m }]));
  for (const sm of snapshotMatches) {
    const existing = byId.get(sm.id);
    if (existing) {
      byId.set(sm.id, mergeMatch(existing, sm));
    } else {
      byId.set(sm.id, sm);
    }
  }

  let matches = Array.from(byId.values());
  let slots = snapshotSlots?.length ? [...snapshotSlots] : [...baseSlots];

  for (const match of matches) {
    if (match.status === "finished" && match.winnerTeamId) {
      slots = advanceWinner(slots, match);
    }
  }

  return { matches, slots };
}
