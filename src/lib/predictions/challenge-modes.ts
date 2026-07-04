import type { Match } from "@/lib/types";
import type { UserPredictions } from "@/lib/predictions/types";
import { favoriteTeamId } from "@/lib/odds/probability";
import { TEAMS_2026 } from "@/lib/data/tournament";

export type ChallengeMode = "standard" | "favorites_only" | "chaos";

export const CHALLENGE_MODES: {
  id: ChallengeMode;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Pick freely — no restrictions",
    icon: "⚽",
  },
  {
    id: "favorites_only",
    name: "Favorites Only",
    description: "Auto-fill every match with the higher FIFA-ranked team",
    icon: "👑",
  },
  {
    id: "chaos",
    name: "Chaos Mode",
    description: "Auto-fill with underdogs and maximum upsets",
    icon: "🔥",
  },
];

const teamMap = Object.fromEntries(TEAMS_2026.map((t) => [t.id, t]));

export function applyChallengeMode(
  mode: ChallengeMode,
  matches: Match[],
  existing?: UserPredictions
): Partial<UserPredictions> {
  if (mode === "standard") return {};

  const bracketPicks: Record<string, string> = {};
  const matchPicks: UserPredictions["matchPicks"] = {};

  for (const m of matches) {
    if (m.status !== "not_started" || m.homeTeamId === "tbd" || m.awayTeamId === "tbd") continue;
    const home = teamMap[m.homeTeamId];
    const away = teamMap[m.awayTeamId];
    if (!home || !away) continue;

    const fav = favoriteTeamId(home, away);
    let winner: string;
    if (mode === "favorites_only") {
      winner = fav ?? home.id;
    } else {
      winner = fav === home.id ? away.id : fav === away.id ? home.id : away.id;
    }

    bracketPicks[m.id] = winner;
    matchPicks[m.id] = {
      winner,
      confidence: mode === "chaos" ? 3 : 1,
      home: mode === "chaos" ? 1 : 2,
      away: mode === "chaos" ? 2 : 0,
    };
  }

  const champion =
    mode === "favorites_only"
      ? "arg"
      : mode === "chaos"
        ? "nor"
        : existing?.champion ?? null;

  return {
    bracketPicks: { ...existing?.bracketPicks, ...bracketPicks },
    matchPicks: { ...existing?.matchPicks, ...matchPicks },
    champion,
  };
}
