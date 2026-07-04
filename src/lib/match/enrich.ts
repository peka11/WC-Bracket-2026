import type { Match, MatchStats } from "@/lib/types";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function demoStatsForMatch(m: Match): MatchStats {
  const seed = hashSeed(m.id);
  const homePoss = 42 + (seed % 17);
  const goals = (m.homeScore ?? 0) + (m.awayScore ?? 0);
  return {
    homePossession: homePoss,
    awayPossession: 100 - homePoss,
    homeShots: 8 + (seed % 9) + goals,
    awayShots: 6 + ((seed >> 3) % 10),
    homeShotsOnTarget: 3 + (seed % 5),
    awayShotsOnTarget: 2 + ((seed >> 2) % 6),
    homeCorners: 3 + (seed % 7),
    awayCorners: 2 + ((seed >> 4) % 8),
    homeXG: Number(((m.homeScore ?? 0) * 0.85 + (seed % 10) / 10).toFixed(2)),
    awayXG: Number(((m.awayScore ?? 0) * 0.85 + ((seed >> 2) % 10) / 10).toFixed(2)),
  };
}

/** Fill demo referee, attendance, and stats when API data is absent */
export function enrichMatchDetails(match: Match): Match {
  const finished = match.status === "finished";
  const live = ["live", "halftime", "extra_time", "penalties"].includes(match.status);
  if (!finished && !live) return match;

  const stats =
    match.stats ??
    (match.homePossession != null
      ? {
          homePossession: match.homePossession,
          awayPossession: match.awayPossession,
        }
      : demoStatsForMatch(match));

  const seed = hashSeed(match.id);
  return {
    ...match,
    stats,
    homePossession: stats.homePossession ?? match.homePossession,
    awayPossession: stats.awayPossession ?? match.awayPossession,
    referee: match.referee ?? ["Michael Oliver", "Slavko Vinčić", "César Ramos", "Daniele Orsato"][seed % 4],
    attendance: match.attendance ?? 55000 + (seed % 35000),
  };
}

export function enrichAllMatches(matches: Match[]): Match[] {
  return matches.map(enrichMatchDetails);
}
