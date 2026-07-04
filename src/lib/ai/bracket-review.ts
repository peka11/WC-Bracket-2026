import type { Match } from "@/lib/types";
import type { UserPredictions } from "@/lib/predictions/types";
import { analyzeBracket } from "@/lib/predictions/bracket-analysis";
import { TEAMS_2026 } from "@/lib/data/tournament";

export interface AiReviewResult {
  summary: string;
  personality: string;
  bullets: string[];
  rarityNote: string;
  source: "openai" | "local";
}

function localReview(picks: UserPredictions, matches: Match[]): AiReviewResult {
  const analysis = analyzeBracket(picks, matches);
  const teamMap = Object.fromEntries(TEAMS_2026.map((t) => [t.id, t]));
  const champ = picks.champion ? teamMap[picks.champion]?.name : "none";

  const personality =
    analysis.riskLabel === "Chaos Mode"
      ? "You're a chaos agent — this bracket reads like a fever dream in the best way."
      : analysis.riskLabel === "Risky"
        ? "You're aggressive and unafraid of upsets. High reward, high bust potential."
        : analysis.riskLabel === "Balanced"
          ? "You mix safe picks with a few swings — a sensible strategist."
          : "You play it conservative. Favorites carry you deep, but upside is capped.";

  const bullets: string[] = [];
  bullets.push(`Champion: ${champ}. Risk score ${analysis.riskScore}/100 (${analysis.riskLabel}).`);
  if (analysis.upsetCount > 0) {
    bullets.push(`${analysis.upsetCount} upset pick${analysis.upsetCount > 1 ? "s" : ""} — you're betting on variance.`);
  }
  if (analysis.biggestUpset) {
    bullets.push(`Signature call: ${analysis.biggestUpset.label}.`);
  }
  if (analysis.darkHorseTeamId) {
    bullets.push(`Dark horse: ${teamMap[analysis.darkHorseTeamId]?.name} — a name most casual fans didn't pencil in.`);
  }
  if (analysis.averageFifaRank) {
    bullets.push(`Average FIFA rank of your picks: ${analysis.averageFifaRank} (${analysis.averageFifaRank < 15 ? "elite-heavy" : "mixed bag"}).`);
  }

  const pickCount = Object.keys(picks.bracketPicks).length;
  const rarityNote =
    analysis.riskScore >= 70
      ? `Only ~${Math.max(2, 100 - analysis.riskScore)}% of brackets this aggressive reach the final with all upsets intact.`
      : analysis.championConsensusPct != null && analysis.championConsensusPct < 12
        ? `Roughly ${analysis.championConsensusPct}% of users share your champion — you're in rare company.`
        : "Your bracket aligns with mainstream picks in several spots.";

  return {
    summary: analysis.reviewLines.join(" "),
    personality,
    bullets,
    rarityNote,
    source: "local",
  };
}

export async function generateBracketReview(
  picks: UserPredictions,
  matches: Match[]
): Promise<AiReviewResult> {
  const fallback = localReview(picks, matches);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return fallback;

  try {
    const analysis = analyzeBracket(picks, matches);
    const prompt = `You are a witty World Cup bracket analyst. Review this user's 2026 FIFA World Cup knockout predictions in 4-5 sentences. Be specific, fun, and insightful — not generic.

Champion: ${picks.champion}
Risk score: ${analysis.riskScore}/100 (${analysis.riskLabel})
Upsets: ${analysis.upsetCount}
Biggest upset: ${analysis.biggestUpset?.label ?? "none"}
Dark horse: ${analysis.darkHorseTeamId ?? "none"}
Review context: ${analysis.reviewLines.join("; ")}

Respond as JSON: {"personality":"one punchy sentence","bullets":["3 short insights"],"rarityNote":"one sentence about how unique this bracket is","summary":"2 sentence overview"}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 400,
      }),
    });

    if (!res.ok) return fallback;

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]) as {
      personality?: string;
      bullets?: string[];
      rarityNote?: string;
      summary?: string;
    };

    return {
      summary: parsed.summary ?? fallback.summary,
      personality: parsed.personality ?? fallback.personality,
      bullets: parsed.bullets ?? fallback.bullets,
      rarityNote: parsed.rarityNote ?? fallback.rarityNote,
      source: "openai",
    };
  } catch {
    return fallback;
  }
}
