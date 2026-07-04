import type { ConsensusData } from "@/lib/predictions/consensus-types";
import { TEAMS_2026 } from "@/lib/data/tournament";
import { winProbabilityFromRankings } from "@/lib/odds/probability";

export function getMatchConsensusPct(
  consensus: ConsensusData,
  matchId: string,
  homeId: string,
  awayId: string
): { homePct: number; awayPct: number } {
  const counts = consensus.matchWinners[matchId];
  if (counts && (counts[homeId] != null || counts[awayId] != null)) {
    return {
      homePct: counts[homeId] ?? 100 - (counts[awayId] ?? 50),
      awayPct: counts[awayId] ?? 100 - (counts[homeId] ?? 50),
    };
  }

  const home = TEAMS_2026.find((t) => t.id === homeId);
  const away = TEAMS_2026.find((t) => t.id === awayId);
  if (home && away) {
    return winProbabilityFromRankings(home, away);
  }

  return { homePct: 50, awayPct: 50 };
}
