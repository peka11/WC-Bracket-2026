import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

function generateCode() {
  return randomBytes(3).toString("hex").toUpperCase();
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ configured: false, leagues: [] });
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (code) {
    const { data: league } = await supabase
      .from("leagues")
      .select("id, name, code, owner_id")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    const { count } = await supabase
      .from("league_members")
      .select("*", { count: "exact", head: true })
      .eq("league_id", league.id);

    return NextResponse.json({ league: { ...league, members: count ?? 0 } });
  }

  if (!user) {
    return NextResponse.json({ configured: true, authenticated: false, leagues: [] });
  }

  const { data: memberships } = await supabase
    .from("league_members")
    .select("league_id, leagues(id, name, code, owner_id)")
    .eq("user_id", user.id);

  const leagues = (memberships ?? []).map((m) => {
    const l = m.leagues as unknown as { id: string; name: string; code: string; owner_id: string } | null;
    return l ? { id: l.id, name: l.name, code: l.code, isOwner: l.owner_id === user.id } : null;
  }).filter(Boolean);

  return NextResponse.json({ configured: true, authenticated: true, leagues });
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

  const body = await req.json();
  const action = body.action as string;

  if (action === "create") {
    const name = (body.name as string)?.trim() || "My League";
    const code = generateCode();

    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id")
      .eq("season", 2026)
      .maybeSingle();

    const { data: league, error } = await supabase
      .from("leagues")
      .insert({
        name,
        code,
        owner_id: user.id,
        tournament_id: tournament?.id ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("league_members").insert({
      league_id: league.id,
      user_id: user.id,
    });

    return NextResponse.json({ league: { id: league.id, name, code } });
  }

  if (action === "join") {
    const code = (body.code as string)?.trim().toUpperCase();
    const { data: league } = await supabase
      .from("leagues")
      .select("id, name, code")
      .eq("code", code)
      .maybeSingle();

    if (!league) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    const { error } = await supabase.from("league_members").upsert({
      league_id: league.id,
      user_id: user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ league: { id: league.id, name: league.name, code: league.code } });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
