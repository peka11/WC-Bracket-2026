"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const AD_SCRIPT_URL =
  process.env.NEXT_PUBLIC_AD_SCRIPT_URL ??
  "https://pl30218333.effectivecpmnetwork.com/85/45/22/854522bc6ac47f636c6b592bf54741c5.js";

/** Loads EffectiveCPM after hydration so ads don't fight React startup. */
export function AdScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || !AD_SCRIPT_URL) return null;

  return (
    <Script
      id="effectivecpm-ad-script"
      src={AD_SCRIPT_URL}
      strategy="lazyOnload"
    />
  );
}
