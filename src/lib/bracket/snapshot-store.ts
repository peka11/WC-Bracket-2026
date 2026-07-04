import type { Match, BracketSlot } from "@/lib/types";
import { TOURNAMENT_ID } from "@/lib/data/tournament";

export interface BracketSnapshot {
  tournamentKey: string;
  matches: Match[];
  slots: BracketSlot[];
  updatedAt: string;
}

/** In-process cache when Supabase is unavailable (dev / demo) */
let memorySnapshot: BracketSnapshot | null = null;

export function getMemorySnapshot(): BracketSnapshot | null {
  return memorySnapshot;
}

export function setMemorySnapshot(matches: Match[], slots: BracketSlot[]) {
  memorySnapshot = {
    tournamentKey: TOURNAMENT_ID,
    matches,
    slots,
    updatedAt: new Date().toISOString(),
  };
}

export function clearMemorySnapshot() {
  memorySnapshot = null;
}
