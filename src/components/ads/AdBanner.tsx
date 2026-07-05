"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

const AD_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AD_SCRIPT_URL ??
  "https://pl30218333.effectivecpmnetwork.com/85/45/22/854522bc6ac47f636c6b592bf54741c5.js";

export const AD_ZONE_ID = process.env.NEXT_PUBLIC_AD_ZONE_ID ?? "30117834";

/** Copy from your Adsterra banner snippet, e.g. www.highperformanceformat.com */
const AD_INVOKE_HOST =
  process.env.NEXT_PUBLIC_AD_INVOKE_HOST ?? "www.highperformanceformat.com";

type PlacementFormat = "leaderboard" | "mobile" | "rectangle";

const FORMATS: Record<PlacementFormat, { width: number; height: number; className: string }> = {
  leaderboard: { width: 728, height: 90, className: "hidden sm:block" },
  mobile: { width: 320, height: 50, className: "block sm:hidden" },
  rectangle: { width: 300, height: 250, className: "block" },
};

/** invoke.js uses document.write — must run inside an iframe, not via React appendChild. */
function buildAdSrcDoc(width: number, height: number) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script>atOptions={key:'${AD_ZONE_ID}',format:'iframe',height:${height},width:${width},params:{}};<\/script><script src="https://${AD_INVOKE_HOST}/${AD_ZONE_ID}/invoke.js"><\/script></body></html>`;
}

function AdIframe({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className?: string;
}) {
  const srcDoc = useMemo(() => buildAdSrcDoc(width, height), [width, height]);

  return (
    <iframe
      title="Advertisement"
      srcDoc={srcDoc}
      width={width}
      height={height}
      className={cn("overflow-hidden border-0 bg-transparent", className)}
      loading="lazy"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
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

export function AdPlacement({
  format = "leaderboard",
  className,
  label = "Advertisement",
}: {
  format?: PlacementFormat;
  slot?: string;
  className?: string;
  label?: string;
}) {
  const dims = FORMATS[format];

  return (
    <aside
      className={cn("ad-placement mx-auto flex w-full flex-col items-center gap-1", className)}
      aria-label={label}
    >
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <AdIframe
        width={dims.width}
        height={dims.height}
        className={cn("mx-auto max-w-full", dims.className)}
      />
    </aside>
  );
}

/** 320×50 mobile or 728×90 desktop banner. */
export function ResponsiveAdStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <aside className="ad-placement mx-auto flex w-full flex-col items-center gap-1 sm:hidden">
        <p className="text-[10px] uppercase tracking-wider text-gray-400">Advertisement</p>
        <AdIframe width={320} height={50} className="mx-auto" />
      </aside>
      <aside className="ad-placement mx-auto hidden w-full flex-col items-center gap-1 sm:flex">
        <p className="text-[10px] uppercase tracking-wider text-gray-400">Advertisement</p>
        <AdIframe width={728} height={90} className="mx-auto max-w-full" />
      </aside>
    </div>
  );
}
