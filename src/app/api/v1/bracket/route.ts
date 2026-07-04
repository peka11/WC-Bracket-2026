import { NextRequest, NextResponse } from "next/server";
import {
  buildInitialMatches,
  buildInitialSlots,
  DATA_AS_OF,
  TEAMS_2026,
  TOURNAMENT_ID,
} from "@/lib/data/tournament";
import { ensureInnerSlots } from "@/lib/bracket/advance";
import { mergeBracketState } from "@/lib/bracket/merge";
import { getMemorySnapshot } from "@/lib/bracket/snapshot-store";
import { enrichAllMatches } from "@/lib/match/enrich";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const rateMap = new Map<string, { count: number; reset: number }>();
const LIMIT = 60;
const WINDOW_MS = 60_000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count += 1;
  return true;
}

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
  return getMemorySnapshot();
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const baseMatches = buildInitialMatches();
  const baseSlots = ensureInnerSlots(buildInitialSlots());
  const snapshot = await loadSnapshot();

  const { matches, slots } = mergeBracketState(
    baseMatches,
    baseSlots,
    snapshot?.matches,
    snapshot?.slots
  );

  const enriched = enrichAllMatches(matches);
  const nextKickoffs = enriched
    .filter((m) => m.status === "not_started")
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      round: m.round,
      kickoffAt: m.kickoffAt,
      home: TEAMS_2026.find((t) => t.id === m.homeTeamId)?.code,
      away: TEAMS_2026.find((t) => t.id === m.awayTeamId)?.code,
      venue: m.venue,
    }));

  return NextResponse.json(
    {
      version: "1",
      tournamentId: TOURNAMENT_ID,
      dataAsOf: DATA_AS_OF,
      syncedAt: snapshot?.updatedAt ?? new Date().toISOString(),
      teams: TEAMS_2026.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        group: t.group,
        confederation: t.confederation,
        fifaRanking: t.fifaRanking,
      })),
      matches: enriched.map((m) => ({
        id: m.id,
        round: m.round,
        matchNumber: m.matchNumber,
        status: m.status,
        kickoffAt: m.kickoffAt,
        venue: m.venue,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        winnerTeamId: m.winnerTeamId,
        events: m.events,
        stats: m.stats,
      })),
      slots,
      nextKickoffs,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
