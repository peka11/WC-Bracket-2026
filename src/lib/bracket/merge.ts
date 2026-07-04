import type { Match, BracketSlot } from "@/lib/types";
import { advanceWinner } from "@/lib/bracket/advance";

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
      byId.set(sm.id, { ...existing, ...sm });
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
