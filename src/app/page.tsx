"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { useMemo } from "react";
import { BracketPanel } from "@/components/bracket/BracketPanel";
import { StillAliveBanner } from "@/components/bracket/StillAliveBanner";
import { SyncIndicator } from "@/components/bracket/ShareBracket";
import { MatchCard } from "@/components/matches/MatchCard";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";
import { DATA_AS_OF } from "@/lib/data/tournament";
import { getTournamentStatus } from "@/lib/tournament-status";
import { getMatchPickOverlay } from "@/lib/predictions/match-pick-status";

function TournamentStatus() {
  const { matches, activeTeams } = useBracket();
  const status = getTournamentStatus(matches, activeTeams.length);

  return (
    <div className="glass-card inline-flex items-center gap-3 px-5 py-3">
      <span className="text-xs uppercase tracking-widest text-gray-500">{status.currentRoundLabel}</span>
      <span className="font-display text-xl font-bold tabular-nums text-wc-green">
        {status.teamsRemaining} teams left
      </span>
    </div>
  );
}

export default function HomePage() {
  const { teamMap, matches, isSyncing, refresh, activeTeams } = useBracket();
  const { picks } = usePredictions();
  const status = getTournamentStatus(matches, activeTeams.length);

  const pickOverlays = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getMatchPickOverlay>>();
    for (const m of [...matches]) {
      map.set(m.id, getMatchPickOverlay(m, picks, teamMap));
    }
    return map;
  }, [matches, picks, teamMap]);

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcoming = matches
    .filter((m) => m.status === "not_started")
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
    .slice(0, 4);
  const recentResults = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-12">
      <section className="text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wc-green">FIFA World Cup 2026 · Knockout Stage</p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Bracket Challenge
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">{status.subtitle}</p>
          <p className="mt-1 text-xs text-gray-400">
            Updated {format(parseISO(DATA_AS_OF), "MMM d, yyyy")}
            {status.hasLive && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                Live
              </span>
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <TournamentStatus />
            <Link href="/predictions" className="btn-primary">
              Make predictions <ArrowRight className="h-4 w-4" />
            </Link>
            <SyncIndicator syncing={isSyncing} onRefresh={refresh} />
          </div>
        </motion.div>
      </section>

      <StillAliveBanner />

      {liveMatches.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Radio className="h-4 w-4 animate-pulse text-red-500" />
            <h2 className="font-display text-lg font-semibold">Live now</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                home={teamMap[m.homeTeamId]}
                away={teamMap[m.awayTeamId]}
                pickOverlay={pickOverlays.get(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="glass-card overflow-visible p-4 sm:p-8">
        <div className="mb-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="font-display text-2xl font-bold">Knockout Bracket</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tap a sector to focus · Gold arc = R16 matchup · Click a team for details
            </p>
          </div>
        </div>
        <BracketPanel />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display mb-4 text-lg font-semibold">Upcoming</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} home={teamMap[m.homeTeamId]} away={teamMap[m.awayTeamId]} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-display mb-4 text-lg font-semibold">Latest results</h2>
          <div className="grid gap-4 sm:grid-cols-1">
            {recentResults.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                home={teamMap[m.homeTeamId]}
                away={teamMap[m.awayTeamId]}
                pickOverlay={pickOverlays.get(m.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
