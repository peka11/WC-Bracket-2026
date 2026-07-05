"use client";

import { useEffect, useRef } from "react";

/** Zone 30117834 — Popunder (opens on click, no on-page banner). */
const AD_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AD_SCRIPT_URL ??
  "https://pl30218333.effectivecpmnetwork.com/85/45/22/854522bc6ac47f636c6b592bf54741c5.js";

/** Zone 30117835 — Native Banner (visible on page). */
const NATIVE_INVOKE_URL =
  process.env.NEXT_PUBLIC_NATIVE_BANNER_INVOKE_URL ??
  "https://pl30218334.effectivecpmnetwork.com/9b7bc6245103df02fe50f72e1e4e4d2f/invoke.js";

const NATIVE_CONTAINER_ID =
  process.env.NEXT_PUBLIC_NATIVE_BANNER_CONTAINER_ID ??
  "container-9b7bc6245103df02fe50f72e1e4e4d2f";

/** Loads EffectiveCPM popunder once per page (one popunder per page per network rules). */
export function AdScript() {
  useEffect(() => {
    if (!AD_SCRIPT_URL) return;
    if (document.getElementById("effectivecpm-ad-script")) return;

    const script = document.createElement("script");
    script.id = "effectivecpm-ad-script";
    script.src = AD_SCRIPT_URL;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}

/** Visible native banner — script + container from Adsterra GET CODE. */
export function NativeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || document.getElementById("native-banner-invoke")) return;

    const script = document.createElement("script");
    script.id = "native-banner-invoke";
    script.src = NATIVE_INVOKE_URL;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    container.insertAdjacentElement("beforebegin", script);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-3">
      <div
        ref={containerRef}
        id={NATIVE_CONTAINER_ID}
        className="mx-auto min-h-[90px] w-full max-w-4xl"
      />
    </div>
  );
}
