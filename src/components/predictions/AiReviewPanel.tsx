"use client";

import { useEffect, useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import type { AiReviewResult } from "@/lib/ai/bracket-review";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";

export function AiReviewPanel() {
  const { picks } = usePredictions();
  const [review, setReview] = useState<AiReviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasPicks =
      picks.champion || Object.keys(picks.bracketPicks).length > 0;
    if (!hasPicks) return;

    setLoading(true);
    fetch("/api/bracket/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ picks }),
    })
      .then((r) => r.json())
      .then((data) => setReview(data as AiReviewResult))
      .catch(() => setReview(null))
      .finally(() => setLoading(false));
  }, [picks]);

  if (loading) {
    return (
      <div className="glass-card flex items-center gap-3 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-wc-green" />
        <span className="text-sm text-gray-500">Analyzing your bracket…</span>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="glass-card space-y-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
          <Bot className="h-5 w-5 text-wc-green" />
          AI Bracket Review
        </h2>
        <span className="text-[10px] uppercase tracking-wide text-gray-400">
          {review.source === "openai" ? "Powered by AI" : "Smart analysis"}
        </span>
      </div>
      <p className="text-lg font-medium leading-snug">{review.personality}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{review.summary}</p>
      <ul className="space-y-2">
        {review.bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-wc-gold" />
            {b}
          </li>
        ))}
      </ul>
      <p className="rounded-lg bg-wc-gold/10 px-3 py-2 text-sm text-wc-gold">{review.rarityNote}</p>
    </div>
  );
}
