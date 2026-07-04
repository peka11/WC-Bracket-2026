import { NextRequest, NextResponse } from "next/server";
import { footballApi } from "@/lib/football-api/client";
import { buildSyncedMatches } from "@/lib/football-api/sync-mapper";
import {
  buildInitialSlots,
  TOURNAMENT_ID,
} from "@/lib/data/tournament";
import { ensureInnerSlots, advanceWinner } from "@/lib/bracket/advance";
import { setMemorySnapshot } from "@/lib/bracket/snapshot-store";
import { createServiceClient } from "@/lib/supabase/server";

export const maxDuration = 60;

async function persistSnapshot(matches: ReturnType<typeof buildSyncedMatches>, slots: ReturnType<typeof ensureInnerSlots>) {
  const supabase = await createServiceClient();
  const payload = {
    tournament_key: TOURNAMENT_ID,
    matches,
    slots,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    await supabase.from("app_match_snapshots").upsert(payload);
  }
  setMemorySnapshot(matches, slots);
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  const cronSecret = process.env.CRON_SECRET;
  if (!adminKey || adminKey !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const source = (body as { source?: string }).source ?? "manual";

  const leagueId = parseInt(process.env.FOOTBALL_LEAGUE_ID ?? "1", 10);
  const season = parseInt(process.env.FOOTBALL_SEASON ?? "2026", 10);
  const supabase = await createServiceClient();

  const log = async (status: string, records: number, error?: string) => {
    if (!supabase) return;
    await supabase.from("sync_logs").insert({
      source,
      action: "sync_matches",
      status,
      records_affected: records,
      error_message: error ?? null,
    });
  };

  try {
    if (!footballApi.isConfigured) {
      await log("skipped", 0, "FOOTBALL_API_KEY not configured — using demo data");
      return NextResponse.json({
        ok: true,
        mode: "demo",
        message: "API key not set. Bracket runs on demo data.",
        synced: 0,
      });
    }

    const [live, finished, upcoming] = await Promise.all([
      footballApi.getLiveFixtures(leagueId, season),
      footballApi.getFixtures(leagueId, season, "FT"),
      footballApi.getFixtures(leagueId, season, "NS"),
    ]);

    const fixtures = [...live, ...finished, ...upcoming];
    const matches = buildSyncedMatches(fixtures);
    let slots = ensureInnerSlots(buildInitialSlots());
    for (const m of matches) {
      if (m.status === "finished" && m.winnerTeamId) {
        slots = advanceWinner(slots, m);
      }
    }

    await persistSnapshot(matches, slots);

    if (supabase) {
      await supabase.from("api_health").upsert({
        provider: "api-football",
        is_healthy: true,
        last_success_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    await log("success", fixtures.length);

    return NextResponse.json({
      ok: true,
      mode: "live",
      synced: fixtures.length,
      live: live.length,
      matchesUpdated: matches.filter((m) => m.status !== "not_started").length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    await log("error", 0, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
