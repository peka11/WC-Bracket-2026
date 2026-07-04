"use client";

import { Info } from "lucide-react";

/** Explains the 2026 third-place team bracket reshuffling */
export function BracketFormatExplainer() {
  return (
    <div className="glass-card space-y-3 p-5">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-wc-gold" />
        <div>
          <h3 className="font-display font-semibold">Why the 2026 bracket shifts</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This World Cup uses <strong>12 groups of 4</strong>, but only 8 of the 12 third-place teams
            advance. When group standings change, which third-place teams qualify changes too — and FIFA
            reassigns Round of 32 matchups so teams from the same group cannot meet again until later rounds.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Example: if Japan finishes 3rd in their group instead of Australia, a Round of 32 slot can flip
            from <em>France vs Australia</em> to <em>France vs Japan</em>. The whole knockout tree can
            look different even when favorites win their groups.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Your app is now in the knockout stage — R32 pairings are fixed. This explainer helps when
            comparing pre-tournament brackets to the final draw.
          </p>
        </div>
      </div>
    </div>
  );
}
