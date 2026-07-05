"use client";

import { useEffect, useId } from "react";
import { cn } from "@/lib/utils";

const AD_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AD_SCRIPT_URL ??
  "https://pl30218333.effectivecpmnetwork.com/85/45/22/854522bc6ac47f636c6b592bf54741c5.js";

export const AD_ZONE_ID = process.env.NEXT_PUBLIC_AD_ZONE_ID ?? "30117834";

/** Adsterra / EffectiveCPM banner invoke host from your publisher dashboard. */
const AD_INVOKE_HOST =
  process.env.NEXT_PUBLIC_AD_INVOKE_HOST ?? "www.highperformanceformat.com";

type PlacementFormat = "leaderboard" | "mobile" | "rectangle";

const FORMATS: Record<
  PlacementFormat,
  { width: number; height: number; className: string }
> = {
  leaderboard: {
    width: 728,
    height: 90,
    className: "hidden w-full max-w-[728px] sm:block",
  },
  mobile: {
    width: 320,
    height: 50,
    className: "block w-full max-w-[320px] sm:hidden",
  },
  rectangle: {
    width: 300,
    height: 250,
    className: "block w-full max-w-[336px]",
  },
};

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

function loadBannerIntoContainer(containerId: string, width: number, height: number) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.adLoaded === "1") return;
  container.dataset.adLoaded = "1";

  window.atOptions = {
    key: AD_ZONE_ID,
    format: "iframe",
    height,
    width,
    container: containerId,
    params: {},
  };

  const invoke = document.createElement("script");
  invoke.type = "text/javascript";
  invoke.src = `https://${AD_INVOKE_HOST}/${AD_ZONE_ID}/invoke.js`;
  invoke.async = true;
  container.appendChild(invoke);
}

/** Global EffectiveCPM loader (popunders / network-managed units). */
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
 * Visible banner slot — loads zone invoke.js into this container.
 * Copy NEXT_PUBLIC_AD_INVOKE_HOST from your Adsterra / EffectiveCPM banner snippet if ads stay empty.
 */
export function AdPlacement({
  format = "leaderboard",
  slot,
  className,
  label = "Advertisement",
}: {
  format?: PlacementFormat;
  slot?: string;
  className?: string;
  label?: string;
}) {
  const autoId = useId().replace(/:/g, "");
  const slotKey = slot ?? format;
  const containerId = `ad-zone-${AD_ZONE_ID}-${slotKey}-${autoId}`;
  const dims = FORMATS[format];

  useEffect(() => {
    loadBannerIntoContainer(containerId, dims.width, dims.height);
  }, [containerId, dims.width, dims.height]);

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
        data-ad-format={format}
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]",
          dims.className
        )}
        style={{ minWidth: dims.width, minHeight: dims.height }}
      />
    </aside>
  );
}

/** One banner per page: 320×50 mobile or 728×90 desktop (same zone, no duplicate invoke). */
export function ResponsiveAdStrip({ className }: { className?: string }) {
  const autoId = useId().replace(/:/g, "");
  const mobileId = `ad-zone-${AD_ZONE_ID}-mobile-${autoId}`;
  const desktopId = `ad-zone-${AD_ZONE_ID}-leaderboard-${autoId}`;

  useEffect(() => {
    const pick = () => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        loadBannerIntoContainer(desktopId, 728, 90);
      } else {
        loadBannerIntoContainer(mobileId, 320, 50);
      }
    };
    pick();
    window.matchMedia("(min-width: 640px)").addEventListener("change", pick);
    return () =>
      window.matchMedia("(min-width: 640px)").removeEventListener("change", pick);
  }, [mobileId, desktopId]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <aside className="ad-placement mx-auto flex w-full flex-col items-center gap-1 sm:hidden">
        <p className="text-[10px] uppercase tracking-wider text-gray-400">Advertisement</p>
        <div
          id={mobileId}
          className="flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]"
          style={{ minWidth: 320, minHeight: 50 }}
        />
      </aside>
      <aside className="ad-placement mx-auto hidden w-full flex-col items-center gap-1 sm:flex">
        <p className="text-[10px] uppercase tracking-wider text-gray-400">Advertisement</p>
        <div
          id={desktopId}
          className="flex w-full max-w-[728px] items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]"
          style={{ minWidth: 728, minHeight: 90 }}
        />
      </aside>
    </div>
  );
}
