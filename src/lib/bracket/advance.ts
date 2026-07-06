import type { BracketSlot, BracketRound, Match } from "@/lib/types";
import { ELIMINATED_TEAM_IDS, nextRound, R32_TO_R16, slotsForRound } from "@/lib/data/tournament";

function targetSlotIndex(round: BracketRound, matchNum: number): number | null {
  if (round === "r32") {
    const m = R32_TO_R16[matchNum];
    if (!m) return null;
    const pairBase = m.slot * 2;
    const sideByMatch: Record<number, 0 | 1> = {
      4: 0, 1: 1, 6: 0, 3: 1, 2: 0, 5: 1, 7: 0, 8: 1,
      11: 0, 12: 1, 10: 0, 9: 1, 15: 0, 14: 1, 13: 0, 16: 1,
    };
    return pairBase + (sideByMatch[matchNum] ?? 0);
  }
  if (round === "r16" || round === "qf" || round === "sf") return matchNum - 1;
  if (round === "final") return 0;
  return null;
}

export function advanceWinner(slots: BracketSlot[], match: Match): BracketSlot[] {
  const winnerId = match.winnerTeamId;
  if (!winnerId) return slots;

  const matchId = match.id;
  const round = match.round;
  const next = nextRound(round);
  const targetIdx = targetSlotIndex(round, match.matchNumber);
  const losers = [match.homeTeamId, match.awayTeamId].filter((id) => id !== winnerId);

  return slots.map((slot) => {
    if (slot.teamId && losers.includes(slot.teamId)) {
      return { ...slot, isEliminated: true };
    }

    if (slot.sourceMatchId === matchId && slot.teamId && slot.teamId !== winnerId) {
      return { ...slot, isEliminated: true };
    }

    if (next && targetIdx != null && slot.round === next && slot.slotIndex === targetIdx) {
      return { ...slot, teamId: winnerId, sourceMatchId: matchId, isEliminated: false };
    }

    if (slot.teamId && ELIMINATED_TEAM_IDS.has(slot.teamId)) {
      return { ...slot, isEliminated: true };
    }

    return slot;
  });
}

export function ensureInnerSlots(slots: BracketSlot[]): BracketSlot[] {
  const rounds = ["qf", "sf", "final", "champion"] as const;
  const result = [...slots];

  for (const round of rounds) {
    const count = slotsForRound(round);
    for (let i = 0; i < count; i++) {
      const id = `${round}-${i}`;
      if (!result.find((s) => s.id === id)) {
        result.push({
          id,
          round,
          slotIndex: i,
          angleDegrees: (360 / count) * i + 360 / count / 2,
        });
      }
    }
  }

  return result;
}

export function getActiveTeamIds(slots: BracketSlot[]): Set<string> {
  const active = new Set<string>();
  for (const slot of slots) {
    if (slot.teamId && !slot.isEliminated) active.add(slot.teamId);
  }
  return active;
}

/** Run advancement for every finished match so the bracket reflects current scores. */
export function resolveBracketState(
  matches: Match[],
  slots: BracketSlot[]
): { matches: Match[]; slots: BracketSlot[] } {
  let resolvedSlots = [...slots];
  for (const match of matches) {
    if (match.status === "finished" && match.winnerTeamId) {
      resolvedSlots = advanceWinner(resolvedSlots, match);
    }
  }
  return { matches, slots: resolvedSlots };
}
