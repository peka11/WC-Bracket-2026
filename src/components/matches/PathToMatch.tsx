"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Match } from "@/lib/types";
import { getPathToMatch } from "@/lib/match/path-to-match";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function PathToMatch({ match, matches, teamMap }: { match: Match; matches: Match[]; teamMap: Record<string, { code: string }> }) {
  const t = useTranslation();
  const path = getPathToMatch(match, matches, teamMap);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{t.match.path}</p>
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {path.map((node, i) => (
          <li key={node.matchId} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="h-3 w-3 text-gray-400" />}
            <Link
              href={`/matches/${node.matchId}`}
              className={cn(
                "rounded-lg px-2 py-1 transition hover:bg-wc-green/10",
                node.isTarget ? "bg-wc-gold/20 font-semibold ring-1 ring-wc-gold/40" : "bg-black/5 dark:bg-white/10"
              )}
            >
              {node.homeCode}–{node.awayCode}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
