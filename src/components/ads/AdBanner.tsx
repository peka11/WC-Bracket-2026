"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

const AD_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AD_SCRIPT_URL ??
  "https://pl30218333.effectivecpmnetwork.com/85/45/22/854522bc6ac47f636c6b592bf54741c5.js";

export const AD_ZONE_ID = process.env.NEXT_PUBLIC_AD_ZONE_ID ?? "30117834";

type PlacementFormat = "leaderboard" | "mobile" | "rectangle";

const FORMATS: Record<
  PlacementFormat,
  { minWidth: number; minHeight: number; className: string }
> = {
  leaderboard: {
    minWidth: 728,
    minHeight: 90,
    className: "hidden w-full max-w-[728px] sm:block",
  },
  mobile: {
    minWidth: 320,
    minHeight: 50,
    className: "block w-full max-w-[320px] sm:hidden",
  },
  rectangle: {
    minWidth: 300,
    minHeight: 250,
    className: "block w-full max-w-[336px]",
  },
};

/** Loads EffectiveCPM once after hydration. */
export function AdScript() {
  useEffect(() => {
    if (!AD_SCRIPT_URL) return;
    if (document.getElementById("effectivecpm-ad-script")) return;

    const script = document.createElement("script");
    script.id = "effectivecpm-ad-script";
    script.src = AD_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}

/**
 * Visible ad slot — reserved space for EffectiveCPM / zone banners.
 * Set NEXT_PUBLIC_AD_ZONE_ID in Vercel (default 30117834).
 */
export function AdPlacement({
  format = "leaderboard",
  slot = "default",
  className,
  label = "Advertisement",
}: {
  format?: PlacementFormat;
  slot?: string;
  className?: string;
  label?: string;
}) {
  const dims = FORMATS[format];
  const containerId = `ad-zone-${AD_ZONE_ID}-${slot}`;

  return (
    <aside
      className={cn(
        "ad-placement mx-auto flex w-full flex-col items-center gap-1",
        className
      )}
      aria-label={label}
    >
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <div
        id={containerId}
        data-ad-zone={AD_ZONE_ID}
        data-zone-id={AD_ZONE_ID}
        data-ad-slot={slot}
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]",
          dims.className
        )}
        style={{ minWidth: dims.minWidth, minHeight: dims.minHeight }}
      />
    </aside>
  );
}

/** 320×50 on mobile, 728×90 on desktop — standard header strip. */
export function ResponsiveAdStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <AdPlacement format="mobile" slot="mobile" />
      <AdPlacement format="leaderboard" slot="leaderboard" />
    </div>
  );
}
