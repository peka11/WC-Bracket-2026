import { NextRequest, NextResponse } from "next/server";
import type { UserPredictions } from "@/lib/predictions/types";
import { buildInitialMatches } from "@/lib/data/tournament";
import { generateBracketReview } from "@/lib/ai/bracket-review";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const picks = body.picks as UserPredictions | undefined;
  if (!picks) {
    return NextResponse.json({ error: "Missing picks" }, { status: 400 });
  }

  const review = await generateBracketReview(picks, buildInitialMatches());
  return NextResponse.json(review);
}
