"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { buildLeaderboard, WEEKLY_POINTS } from "@/lib/predictions/leaderboard";

export default function LeaderboardPage() {
  const { matches } = useBracket();
  const { picks } = usePredictions();

  const rows = useMemo(() => buildLeaderboard(picks, matches), [picks, matches]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-gray-500">Rankings based on your saved predictions vs actual results</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {rows.map((entry) => (
            <div
              key={entry.rank}
              className={`glass-card flex items-center gap-4 p-4 ${entry.isYou ? "ring-2 ring-wc-green/40" : ""}`}
            >
              <span className="font-display w-8 text-2xl font-bold text-gray-300">#{entry.rank}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wc-green/10 text-sm font-bold text-wc-green">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{entry.name}</p>
                <p className="text-xs text-gray-500">{entry.accuracyPct}% accuracy on scored picks</p>
              </div>
              <span className="font-display text-xl font-bold text-wc-green">{entry.points}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display font-semibold">Points by round</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_POINTS}>
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="points" fill="#00A651" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
