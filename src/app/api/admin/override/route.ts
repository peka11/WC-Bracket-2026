import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildInitialMatches, buildInitialSlots, TOURNAMENT_ID } from "@/lib/data/tournament";
import { ensureInnerSlots, advanceWinner } from "@/lib/bracket/advance";
import { mergeBracketState } from "@/lib/bracket/merge";
import { getMemorySnapshot, setMemorySnapshot } from "@/lib/bracket/snapshot-store";
import { createServiceClient } from "@/lib/supabase/server";
import type { Match, MatchEvent, MatchStats } from "@/lib/types";

function checkAdmin(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return !!key && key === process.env.CRON_SECRET;
}

const overrideSchema = z.object({
  matchId: z.string(),
  homeScore: z.number().nullable().optional(),
  awayScore: z.number().nullable().optional(),
  status: z.enum([
    "not_started",
    "live",
    "halftime",
    "extra_time",
    "penalties",
    "finished",
    "postponed",
    "cancelled",
  ]).optional(),
  winnerTeamId: z.string().nullable().optional(),
  referee: z.string().optional(),
  attendance: z.number().optional(),
  events: z.array(z.object({
    type: z.enum(["goal", "card", "subst", "var"]),
    minute: z.number(),
    teamCode: z.string(),
    player: z.string().optional(),
    detail: z.string().optional(),
  })).optional(),
  stats: z.object({
    homeXG: z.number().optional(),
    awayXG: z.number().optional(),
    homeShots: z.number().optional(),
    awayShots: z.number().optional(),
    homeShotsOnTarget: z.number().optional(),
    awayShotsOnTarget: z.number().optional(),
    homeCorners: z.number().optional(),
    awayCorners: z.number().optional(),
    homePossession: z.number().optional(),
    awayPossession: z.number().optional(),
  }).optional(),
});

async function loadState() {
  const baseMatches = buildInitialMatches();
  const baseSlots = ensureInnerSlots(buildInitialSlots());
  const supabase = await createServiceClient();
  let snapshotMatches: Match[] | undefined;
  let snapshotSlots = baseSlots;
  let updatedAt: string | undefined;

  if (supabase) {
    const { data } = await supabase
      .from("app_match_snapshots")
      .select("matches, slots, updated_at")
      .eq("tournament_key", TOURNAMENT_ID)
      .maybeSingle();
    if (data?.matches) {
      snapshotMatches = data.matches as Match[];
      snapshotSlots = (data.slots ?? baseSlots) as typeof baseSlots;
      updatedAt = data.updated_at as string;
    }
  } else {
    const mem = getMemorySnapshot();
    if (mem) {
      snapshotMatches = mem.matches;
      snapshotSlots = mem.slots;
      updatedAt = mem.updatedAt;
    }
  }

  const { matches, slots } = mergeBracketState(baseMatches, baseSlots, snapshotMatches, snapshotSlots);
  return { matches, slots, supabase, updatedAt };
}

async function persist(matches: Match[], slots: ReturnType<typeof ensureInnerSlots>) {
  const supabase = await createServiceClient();
  const payload = {
    tournament_key: TOURNAMENT_ID,
    matches,
    slots,
    updated_at: new Date().toISOString(),
  };
  if (supabase) {
    await supabase.from("app_match_snapshots").upsert(payload);
    await supabase.from("sync_logs").insert({
      source: "admin_override",
      action: "override_match",
      status: "success",
      records_affected: 1,
    });
  }
  setMemorySnapshot(matches, slots);
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = overrideSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const patch = body.data;
  const { matches, slots } = await loadState();
  const idx = matches.findIndex((m) => m.id === patch.matchId);
  if (idx < 0) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const current = matches[idx];
  const updated: Match = {
    ...current,
    ...(patch.homeScore !== undefined ? { homeScore: patch.homeScore } : {}),
    ...(patch.awayScore !== undefined ? { awayScore: patch.awayScore } : {}),
    ...(patch.status ? { status: patch.status } : {}),
    ...(patch.winnerTeamId !== undefined ? { winnerTeamId: patch.winnerTeamId } : {}),
    ...(patch.referee ? { referee: patch.referee } : {}),
    ...(patch.attendance !== undefined ? { attendance: patch.attendance } : {}),
    ...(patch.events ? { events: patch.events as MatchEvent[] } : {}),
    ...(patch.stats ? {
      stats: patch.stats as MatchStats,
      homePossession: patch.stats.homePossession,
      awayPossession: patch.stats.awayPossession,
    } : {}),
  };

  const nextMatches = [...matches];
  nextMatches[idx] = updated;
  let nextSlots = slots;
  if (updated.status === "finished" && updated.winnerTeamId) {
    nextSlots = advanceWinner(nextSlots, updated);
  }

  await persist(nextMatches, nextSlots);

  return NextResponse.json({ ok: true, match: updated });
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  let health = { provider: "api-football", is_healthy: false, last_success_at: null as string | null };
  let logs: unknown[] = [];

  if (supabase) {
    const { data: h } = await supabase.from("api_health").select("*").eq("provider", "api-football").maybeSingle();
    if (h) health = { provider: h.provider, is_healthy: h.is_healthy, last_success_at: h.last_success_at };
    const { data: l } = await supabase.from("sync_logs").select("*").order("created_at", { ascending: false }).limit(10);
    logs = l ?? [];
  }

  const mem = getMemorySnapshot();

  return NextResponse.json({
    ok: true,
    footballApiConfigured: !!process.env.FOOTBALL_API_KEY,
    health,
    lastSnapshot: mem?.updatedAt ?? null,
    recentLogs: logs,
  });
}
