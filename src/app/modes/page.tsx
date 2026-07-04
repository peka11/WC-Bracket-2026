"use client";

import { useState } from "react";
import { CHALLENGE_MODES, applyChallengeMode, type ChallengeMode } from "@/lib/predictions/challenge-modes";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ModesPage() {
  const { matches } = useBracket();
  const { picks, setMatchPick, setBracketPick, setChampion, save } = usePredictions();
  const [active, setActive] = useState<ChallengeMode>("standard");
  const [applied, setApplied] = useState(false);

  function applyMode(mode: ChallengeMode) {
    setActive(mode);
    if (mode === "standard") {
      setApplied(false);
      return;
    }
    const patch = applyChallengeMode(mode, matches, picks);
    for (const [matchId, winner] of Object.entries(patch.bracketPicks ?? {})) {
      setBracketPick(matchId, winner);
    }
    for (const [matchId, mp] of Object.entries(patch.matchPicks ?? {})) {
      setMatchPick(matchId, mp);
    }
    if (patch.champion) setChampion(patch.champion);
    setApplied(true);
  }

  async function saveMode() {
    await save();
    setApplied(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Challenge Modes</h1>
        <p className="mt-1 text-gray-500">Auto-fill your bracket with a ruleset — then tweak and save</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {CHALLENGE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => applyMode(mode.id)}
            className={cn(
              "glass-card p-5 text-left transition",
              active === mode.id && "ring-2 ring-wc-green"
            )}
          >
            <span className="text-3xl">{mode.icon}</span>
            <p className="font-display mt-2 font-semibold">{mode.name}</p>
            <p className="mt-1 text-sm text-gray-500">{mode.description}</p>
          </button>
        ))}
      </div>

      {applied && (
        <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-4">
          <p className="text-sm">
            <strong>{CHALLENGE_MODES.find((m) => m.id === active)?.name}</strong> applied to open matches.
            Review on Predictions before saving.
          </p>
          <div className="flex gap-2">
            <Link href="/predictions" className="btn-ghost text-sm">
              Review picks
            </Link>
            <button type="button" onClick={saveMode} className="btn-primary text-sm">
              Save bracket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
