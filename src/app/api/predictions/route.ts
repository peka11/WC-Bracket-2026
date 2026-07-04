import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TOURNAMENT_ID } from "@/lib/data/tournament";
import type { UserPredictions } from "@/lib/predictions/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ configured: false, picks: null });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ configured: true, authenticated: false, picks: null });
  }

  const { data } = await supabase
    .from("user_picks_snapshot")
    .select("picks, updated_at")
    .eq("user_id", user.id)
    .eq("tournament_key", TOURNAMENT_ID)
    .maybeSingle();

  return NextResponse.json({
    configured: true,
    authenticated: true,
    picks: data?.picks ?? null,
    updatedAt: data?.updated_at ?? null,
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const picks = (await req.json()) as UserPredictions;

  const { error } = await supabase.from("user_picks_snapshot").upsert({
    user_id: user.id,
    tournament_key: TOURNAMENT_ID,
    picks,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: picks.displayName,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
}
