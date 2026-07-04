import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { TOURNAMENT_ID, TEAMS_2026 } from "@/lib/data/tournament";
import type { ConsensusData } from "@/lib/predictions/consensus-types";

export const dynamic = "force-dynamic";

function estimatedConsensus(): ConsensusData {
  const champions: Record<string, number> = {};
  const matchWinners: Record<string, Record<string, number>> = {};

  for (const t of TEAMS_2026) {
    const rank = t.fifaRanking ?? 50;
    champions[t.id] = Math.max(1, Math.round(40 / rank));
  }
  const champTotal = Object.values(champions).reduce((a, b) => a + b, 0);
  for (const id of Object.keys(champions)) {
    champions[id] = Math.round((champions[id] / champTotal) * 100);
  }

  const championList = TEAMS_2026.map((t) => ({
    teamId: t.id,
    pct: champions[t.id] ?? 0,
  }))
    .filter((c) => c.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10);

  return {
    source: "estimated",
    totalBrackets: 0,
    champions,
    championList,
    matchWinners,
  };
}

function aggregatePicks(rows: { picks: unknown }[]): ConsensusData {
  const champions: Record<string, number> = {};
  const matchWinners: Record<string, Record<string, number>> = {};
  let count = 0;

  for (const row of rows) {
    const picks = row.picks as {
      champion?: string;
      bracketPicks?: Record<string, string>;
      matchPicks?: Record<string, { winner?: string }>;
    } | null;
    if (!picks) continue;
    count++;

    if (picks.champion) {
      champions[picks.champion] = (champions[picks.champion] ?? 0) + 1;
    }

    const allMatchPicks = { ...picks.bracketPicks };
    for (const [mid, mp] of Object.entries(picks.matchPicks ?? {})) {
      if (mp?.winner) allMatchPicks[mid] = mp.winner;
    }

    for (const [matchId, teamId] of Object.entries(allMatchPicks)) {
      if (!teamId) continue;
      if (!matchWinners[matchId]) matchWinners[matchId] = {};
      matchWinners[matchId][teamId] = (matchWinners[matchId][teamId] ?? 0) + 1;
    }
  }

  const champTotal = Object.values(champions).reduce((a, b) => a + b, 0) || 1;
  const championsPct: Record<string, number> = {};
  for (const [id, n] of Object.entries(champions)) {
    championsPct[id] = Math.round((n / champTotal) * 100);
  }

  const matchWinnersPct: Record<string, Record<string, number>> = {};
  for (const [matchId, counts] of Object.entries(matchWinners)) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    matchWinnersPct[matchId] = {};
    for (const [teamId, n] of Object.entries(counts)) {
      matchWinnersPct[matchId][teamId] = Math.round((n / total) * 100);
    }
  }

  const championList = Object.entries(championsPct)
    .map(([teamId, pct]) => ({ teamId, pct }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 12);

  return {
    source: "community",
    totalBrackets: count,
    champions: championsPct,
    championList,
    matchWinners: matchWinnersPct,
  };
}

export async function GET() {
  const supabase = await createServiceClient();
  if (supabase) {
    const { data } = await supabase
      .from("user_picks_snapshot")
      .select("picks")
      .eq("tournament_key", TOURNAMENT_ID);

    if (data && data.length >= 3) {
      return NextResponse.json(aggregatePicks(data));
    }
  }

  return NextResponse.json(estimatedConsensus());
}
