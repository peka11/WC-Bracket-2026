"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trophy } from "lucide-react";
import { getTeamProfile } from "@/lib/data/team-profiles";
import { getTeamEncyclopedia, headToHeadSummary } from "@/lib/data/team-encyclopedia";
import { useBracket } from "@/lib/bracket/BracketProvider";
import { ELIMINATED_TEAM_IDS } from "@/lib/data/tournament";
import { favoriteTeamId, winProbabilityFromRankings } from "@/lib/odds/probability";

export default function TeamPage({ params }: { params: { id: string } }) {
  const profile = getTeamProfile(params.id);
  const encyclopedia = getTeamEncyclopedia(params.id);
  const { matches, teamMap } = useBracket();

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <p>Team not found</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">Home</Link>
      </div>
    );
  }

  const eliminated = ELIMINATED_TEAM_IDS.has(profile.id);
  const teamMatches = matches.filter(
    (m) => m.homeTeamId === profile.id || m.awayTeamId === profile.id
  );
  const nextMatch = teamMatches.find((m) => m.status === "not_started");
  const lastResult = teamMatches.filter((m) => m.status === "finished").pop();

  let pathToFinal = "Eliminated";
  if (!eliminated) {
    if (nextMatch) {
      const opp =
        nextMatch.homeTeamId === profile.id
          ? teamMap[nextMatch.awayTeamId]
          : teamMap[nextMatch.homeTeamId];
      pathToFinal = `Next: ${nextMatch.round.toUpperCase()} vs ${opp?.code ?? "TBD"}`;
    } else {
      pathToFinal = "Still in contention";
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-wc-green">
        <ArrowLeft className="h-4 w-4" /> Back to bracket
      </Link>

      <div className="glass-card flex flex-wrap items-center gap-6 p-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-wc-gold/30">
          <Image src={profile.flagUrl} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold">{profile.name}</h1>
          <p className="text-gray-500">{profile.nickname ?? profile.code}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
              Group {profile.group}
            </span>
            <span className="rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
              {profile.confederation}
            </span>
            {profile.fifaRanking && (
              <span className="rounded-full bg-wc-green/10 px-2 py-0.5 text-wc-green">
                FIFA #{profile.fifaRanking}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 ${eliminated ? "bg-red-500/10 text-red-500" : "bg-wc-green/10 text-wc-green"}`}
            >
              {eliminated ? "Eliminated" : "Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard label="Coach" value={profile.coach ?? "—"} />
        <InfoCard label="Star player" value={profile.starPlayer ?? "—"} />
        <InfoCard label="World Cup best" value={profile.worldCupBest ?? "—"} />
        <InfoCard label="Recent form" value={profile.form ?? "—"} mono />
        <InfoCard label="Path to final" value={pathToFinal} />
        <InfoCard label="Group stage" value={profile.pathSummary ?? "—"} />
      </div>

      {nextMatch && (
        <div className="glass-card p-5">
          <h2 className="font-display mb-3 font-semibold">Next match odds</h2>
          {(() => {
            const home = teamMap[nextMatch.homeTeamId];
            const away = teamMap[nextMatch.awayTeamId];
            if (!home || !away) return null;
            const { homePct, awayPct } = winProbabilityFromRankings(home, away);
            return (
              <div className="flex justify-between text-sm">
                <span>{home.code} {homePct}%</span>
                <span className="text-gray-400">vs</span>
                <span>{awayPct}% {away.code}</span>
              </div>
            );
          })()}
        </div>
      )}

      {lastResult && (
        <div className="glass-card p-5">
          <h2 className="font-display mb-2 flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-wc-gold" />
            Latest result
          </h2>
          <Link href={`/matches/${lastResult.id}`} className="text-sm hover:text-wc-green">
            {teamMap[lastResult.homeTeamId]?.code} {lastResult.homeScore}–{lastResult.awayScore}{" "}
            {teamMap[lastResult.awayTeamId]?.code}
          </Link>
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="font-display mb-3 font-semibold">How they qualified</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{encyclopedia.qualification}</p>
        {encyclopedia.groupStageRecap && (
          <p className="mt-2 text-sm text-gray-500">{encyclopedia.groupStageRecap}</p>
        )}
      </div>

      <div className="glass-card p-5">
        <h2 className="font-display mb-3 font-semibold">Squad</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="pb-2">Player</th>
                <th className="pb-2">Pos</th>
                <th className="pb-2">Club</th>
                <th className="pb-2">Caps</th>
              </tr>
            </thead>
            <tbody>
              {encyclopedia.squad.map((p) => (
                <tr key={p.name} className="border-t border-black/5 dark:border-white/10">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2">{p.position}</td>
                  <td className="py-2 text-gray-500">{p.club}</td>
                  <td className="py-2 tabular-nums">{p.caps ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-display mb-3 font-semibold">World Cup history</h2>
        <ul className="space-y-2 text-sm">
          {encyclopedia.wcHistory.map((h) => (
            <li key={h.year} className="flex justify-between">
              <span>{h.year}</span>
              <span className="font-medium">{h.finish}</span>
            </li>
          ))}
        </ul>
      </div>

      {encyclopedia.rivalries.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-display mb-3 font-semibold">Key rivalries</h2>
          <ul className="list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
            {encyclopedia.rivalries.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {nextMatch && (
        <div className="glass-card p-5">
          <h2 className="font-display mb-2 font-semibold">Head-to-head · next opponent</h2>
          <p className="text-sm text-gray-500">
            {headToHeadSummary(
              profile.code,
              teamMap[nextMatch.homeTeamId === profile.id ? nextMatch.awayTeamId : nextMatch.homeTeamId]?.code ?? "?"
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className={cn("mt-1 font-medium", mono && "font-mono tracking-wider")}>{value}</p>
    </div>
  );
}
