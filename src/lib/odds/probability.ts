import type { Team } from "@/lib/types";

/** Implied win % from FIFA ranking (lower rank number = stronger) */
export function winProbabilityFromRankings(home: Team, away: Team): { homePct: number; awayPct: number } {
  const hr = home.fifaRanking ?? 50;
  const ar = away.fifaRanking ?? 50;
  const strengthHome = 1 / hr;
  const strengthAway = 1 / ar;
  const total = strengthHome + strengthAway;
  const homePct = Math.round((strengthHome / total) * 100);
  const awayPct = 100 - homePct;
  return { homePct, awayPct };
}

export function favoriteTeamId(home: Team, away: Team): string | null {
  const hr = home.fifaRanking;
  const ar = away.fifaRanking;
  if (hr == null || ar == null) return null;
  if (hr === ar) return null;
  return hr < ar ? home.id : away.id;
}

export function isUpsetPick(home: Team, away: Team, pickedId: string): boolean {
  const fav = favoriteTeamId(home, away);
  return fav != null && pickedId !== fav;
}

/** Rank gap for upset magnitude (positive = picked weaker team) */
export function upsetRankGap(home: Team, away: Team, pickedId: string): number {
  const hr = home.fifaRanking ?? 50;
  const ar = away.fifaRanking ?? 50;
  if (pickedId === home.id) return ar - hr;
  if (pickedId === away.id) return hr - ar;
  return 0;
}
