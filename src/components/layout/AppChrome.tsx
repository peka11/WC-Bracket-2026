"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MatchTicker } from "@/components/live/MatchTicker";
import { GoalAlertsProvider } from "@/components/live/GoalAlertsProvider";
import { AdScript, ResponsiveAdStrip } from "@/components/ads/AdBanner";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const minimal =
    pathname.startsWith("/embed") ||
    pathname.startsWith("/bracket/present");
  const hideAds = minimal || pathname.startsWith("/admin");

  if (minimal) {
    return <>{children}</>;
  }

  return (
    <>
      {!hideAds && <AdScript />}
      <GoalAlertsProvider />
      <Navbar />
      {!hideAds && (
        <div className="mx-auto max-w-7xl px-4 pt-3">
          <ResponsiveAdStrip />
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6">{children}</main>
      <MatchTicker />
    </>
  );
}
