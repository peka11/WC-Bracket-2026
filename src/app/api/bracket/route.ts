import { NextResponse } from "next/server";
import {
  buildInitialMatches,
  buildInitialSlots,
  DATA_AS_OF,
  TOURNAMENT_ID,
  TEAMS_2026,
} from "@/lib/data/tournament";
import { ensureInnerSlots, resolveBracketState } from "@/lib/bracket/advance";
import { mergeBracketState } from "@/lib/bracket/merge";
import { getMemorySnapshot } from "@/lib/bracket/snapshot-store";
import { enrichAllMatches } from "@/lib/match/enrich";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function loadSnapshot() {
  const supabase = await createServiceClient();
  if (supabase) {
    const { data } = await supabase
      .from("app_match_snapshots")
      .select("matches, slots, updated_at")
      .eq("tournament_key", TOURNAMENT_ID)
      .maybeSingle();
    if (data?.matches) {
      return {
        matches: data.matches as ReturnType<typeof buildInitialMatches>,
        slots: (data.slots ?? []) as ReturnType<typeof buildInitialSlots>,
        updatedAt: data.updated_at as string,
      };
    }
  }
  const mem = getMemorySnapshot();
  if (mem) return mem;
  return null;
}

export async function GET() {
  const { matches: baseMatches, slots: baseSlots } = resolveBracketState(
    buildInitialMatches(),
    ensureInnerSlots(buildInitialSlots())
  );
  const snapshot = await loadSnapshot();

  const { matches, slots } = mergeBracketState(
    baseMatches,
    baseSlots,
    snapshot?.matches,
    snapshot?.slots
  );

  return NextResponse.json({
    tournamentId: TOURNAMENT_ID,
    dataAsOf: DATA_AS_OF,
    matches: enrichAllMatches(matches),
    slots,
    teams: TEAMS_2026,
    syncedAt: snapshot?.updatedAt ?? new Date().toISOString(),
    mode: process.env.FOOTBALL_API_KEY ? "live-ready" : "demo",
    hasSnapshot: !!snapshot,
  });
}
