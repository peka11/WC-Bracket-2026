"use client";

import { useEffect } from "react";

const AD_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AD_SCRIPT_URL ??
  "https://pl30218333.effectivecpmnetwork.com/85/45/22/854522bc6ac47f636c6b592bf54741c5.js";

const SCRIPT_ID = "effectivecpm-ad-script";

/** Loads the EffectiveCPM ad script once per page (injects banners/popunders per network config). */
export function AdScript() {
  useEffect(() => {
    if (!AD_SCRIPT_URL || typeof document === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = AD_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
