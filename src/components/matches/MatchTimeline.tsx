"use client";

import { Circle, Square, Flag } from "lucide-react";
import type { MatchEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/I18nProvider";

const iconFor = (type: MatchEvent["type"]) => {
  if (type === "goal") return Circle;
  if (type === "card") return Square;
  return Flag;
};

export function MatchTimeline({ events }: { events?: MatchEvent[] }) {
  const t = useTranslation();
  const sorted = [...(events ?? [])].sort((a, b) => a.minute - b.minute);

  if (!sorted.length) {
    return <p className="text-sm text-gray-500">{t.match.noEvents}</p>;
  }

  return (
    <ol className="space-y-2">
      {sorted.map((e, i) => {
        const Icon = iconFor(e.type);
        return (
          <li
            key={`${e.minute}-${e.teamCode}-${i}`}
            className={cn(
              "flex items-start gap-3 rounded-xl px-3 py-2 text-sm",
              e.type === "goal" ? "bg-wc-green/10" : "bg-black/5 dark:bg-white/5"
            )}
          >
            <span className="w-10 shrink-0 tabular-nums font-semibold text-wc-gold">{e.minute}&apos;</span>
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", e.type === "goal" ? "fill-wc-green text-wc-green" : "text-yellow-500")} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {e.player ?? e.type}
                <span className="ml-2 text-xs text-gray-400">{e.teamCode}</span>
              </p>
              {e.detail && <p className="text-xs text-gray-500">{e.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
