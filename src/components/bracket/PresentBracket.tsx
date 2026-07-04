"use client";

import { useEffect, useRef, useState } from "react";
import { BracketPanel } from "@/components/bracket/BracketPanel";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { QRCodeDisplay } from "@/components/bracket/QRCodeDisplay";

export function PresentBracket() {
  const { refresh, matches } = useBracket();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [flash, setFlash] = useState(false);
  const prevFinished = useRef(matches.filter((m) => m.status === "finished").length);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => refresh(), 30_000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  useEffect(() => {
    const finished = matches.filter((m) => m.status === "finished").length;
    if (finished > prevFinished.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      prevFinished.current = finished;
      return () => clearTimeout(t);
    }
    prevFinished.current = finished;
  }, [matches]);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className={`min-h-screen bg-[#071a10] ${flash ? "animate-pulse ring-4 ring-wc-gold/50" : ""}`}>
      <div className="flex items-center justify-between px-4 py-3 text-white/70">
        <p className="font-display text-lg font-bold text-white">FIFA World Cup 2026 · Knockout Bracket</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          Auto-refresh
        </label>
      </div>
      <div className="px-2 pb-24 pt-4">
        <BracketPanel />
      </div>
      <div className="fixed bottom-4 right-4 rounded-xl bg-white/10 p-3 text-center backdrop-blur">
        <QRCodeDisplay url={appUrl} size={80} />
        <p className="mt-1 text-[10px] text-white/60">Scan for live bracket</p>
      </div>
    </div>
  );
}
