"use client";

import { useEffect, useRef } from "react";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { useFollowedMatches } from "@/lib/match/followed-matches";

function playGoalChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    /* silent fail */
  }
}

export function GoalAlertsProvider() {
  const { matches } = useBracket();
  const { followed } = useFollowedMatches();
  const prevScores = useRef<Map<string, string>>(new Map());
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    for (const m of matches) {
      if (!followed.has(m.id)) continue;
      const key = `${m.homeScore ?? "-"}-${m.awayScore ?? "-"}`;
      const prev = prevScores.current.get(m.id);
      if (prev && prev !== key && m.homeScore != null) {
        if (!reducedMotion && "vibrate" in navigator) navigator.vibrate(80);
        if (!reducedMotion) playGoalChime();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Goal!", {
            body: `${m.homeScore}–${m.awayScore} · Match update`,
            tag: `goal-${m.id}`,
          });
        }
      }
      prevScores.current.set(m.id, key);
    }
  }, [matches, followed, reducedMotion]);

  return null;
}

export function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission();
}
