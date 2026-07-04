"use client";

import { useEffect, useRef, useState } from "react";
import type { Match, BracketSlot } from "@/lib/types";
import { polarToCartesian } from "@/lib/utils";
import { radiusForRound } from "@/lib/data/tournament";

const CX = 400;
const CY = 400;
const DURATION_MS = 1400;

export interface AdvancementAnimation {
  teamId: string;
  teamCode: string;
  flagUrl: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
}

function slotPosition(slot: BracketSlot): { x: number; y: number } {
  const r = radiusForRound(slot.round);
  return polarToCartesian(CX, CY, r, slot.angleDegrees);
}

export function useAdvancementAnimations(matches: Match[], slots: BracketSlot[], teamMap: Record<string, { code: string; flagUrl: string }>) {
  const seenRef = useRef(new Set<string>());
  const seededRef = useRef(false);
  const [animations, setAnimations] = useState<AdvancementAnimation[]>([]);
  const animatingIds = new Set(animations.filter((a) => a.progress < 1).map((a) => a.teamId));

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (!seededRef.current) {
      for (const match of matches) {
        if (match.status === "finished" && match.winnerTeamId) {
          seenRef.current.add(`${match.id}:${match.winnerTeamId}`);
        }
      }
      seededRef.current = true;
      return;
    }

    for (const match of matches) {
      if (match.status !== "finished" || !match.winnerTeamId) continue;
      const key = `${match.id}:${match.winnerTeamId}`;
      if (seenRef.current.has(key)) continue;

      const winnerId = match.winnerTeamId;
      const fromSlot = slots.find((s) => s.teamId === winnerId && s.round === match.round);
      const nextRound = match.round === "r32" ? "r16" : match.round === "r16" ? "qf" : match.round === "qf" ? "sf" : match.round === "sf" ? "final" : null;
      if (!fromSlot || !nextRound) continue;

      const toSlot = slots.find((s) => s.teamId === winnerId && s.round === nextRound);
      if (!toSlot) continue;

      seenRef.current.add(key);
      const team = teamMap[winnerId];
      if (!team) continue;

      const from = slotPosition(fromSlot);
      const to = slotPosition(toSlot);

      setAnimations((prev) => [
        ...prev.filter((a) => a.teamId !== winnerId),
        { teamId: winnerId, teamCode: team.code, flagUrl: team.flagUrl, from, to, progress: 0 },
      ]);

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        const eased = 1 - Math.pow(1 - t, 3);
        setAnimations((prev) =>
          prev.map((a) => (a.teamId === winnerId ? { ...a, progress: eased } : a))
        );
        if (t < 1) requestAnimationFrame(tick);
        else {
          setTimeout(() => {
            setAnimations((prev) => prev.filter((a) => a.teamId !== winnerId));
          }, 200);
        }
      };
      requestAnimationFrame(tick);
    }
  }, [matches, slots, teamMap]);

  return { animations, animatingIds };
}

export function interpolatePosition(from: { x: number; y: number }, to: { x: number; y: number }, t: number) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}
