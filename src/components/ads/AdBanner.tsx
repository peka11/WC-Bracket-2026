"use client";

import { useEffect } from "react";

const AD_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AD_SCRIPT_URL ??
  "https://pl30218333.effectivecpmnetwork.com/85/45/22/854522bc6ac47f636c6b592bf54741c5.js";

/** Loads EffectiveCPM after hydration; plain script tag avoids next/script + SW quirks. */
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
