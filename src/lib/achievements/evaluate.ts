import type { Match } from "@/lib/types";
import type { UserPredictions } from "@/lib/predictions/types";
import { analyzeBracket } from "@/lib/predictions/bracket-analysis";
import type { ConsensusData } from "@/lib/predictions/consensus-types";
import { isUpsetPick } from "@/lib/odds/probability";
import { ELIMINATED_TEAM_IDS, TEAMS_2026 } from "@/lib/data/tournament";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: string;
}

export function evaluateAchievements(
  picks: UserPredictions,
  matches: Match[],
  consensus?: ConsensusData | null
): Achievement[] {
  const analysis = analyzeBracket(picks, matches, consensus);
  const teamMap = Object.fromEntries(TEAMS_2026.map((t) => [t.id, t]));
  const finished = matches.filter((m) => m.status === "finished" && m.winnerTeamId);
  const correct = finished.filter((m) => {
    const p = picks.matchPicks[m.id]?.winner ?? picks.bracketPicks[m.id];
    return p === m.winnerTeamId;
  });

  const r16Teams = new Set(
    matches.filter((m) => m.round === "r16").flatMap((m) => [m.homeTeamId, m.awayTeamId])
  );
  const predictedR16 = new Set(
    Object.entries(picks.bracketPicks)
      .filter(([id]) => matches.find((m) => m.id === id)?.round === "r16")
      .map(([, w]) => w)
  );
  const qfCorrect = Array.from(predictedR16).filter((id) => r16Teams.has(id)).length;

  let giantKiller = false;
  for (const m of matches) {
    const w = picks.bracketPicks[m.id] ?? picks.matchPicks[m.id]?.winner;
    if (!w) continue;
    const home = teamMap[m.homeTeamId];
    const away = teamMap[m.awayTeamId];
    if (home && away && isUpsetPick(home, away, w)) {
      const rank = teamMap[w]?.fifaRanking ?? 99;
      if (rank > 30) giantKiller = true;
    }
  }

  const achievements: Achievement[] = [
    {
      id: "first-picks",
      title: "Bracket Builder",
      description: "Save your first predictions",
      icon: "🎯",
      unlocked: Object.keys(picks.bracketPicks).length >= 3 || !!picks.champion,
    },
    {
      id: "champion-picked",
      title: "Crown Chosen",
      description: "Pick a tournament champion",
      icon: "🏆",
      unlocked: !!picks.champion,
    },
    {
      id: "perfect-group",
      title: "Perfect Round",
      description: "Get every finished match correct in a round",
      icon: "🏅",
      unlocked: correct.length >= 4 && correct.length === finished.length && finished.length > 0,
      progress: `${correct.length}/${finished.length} correct`,
    },
    {
      id: "giant-killer",
      title: "Giant Killer",
      description: "Pick a rank-30+ underdog to advance",
      icon: "⚔️",
      unlocked: giantKiller,
    },
    {
      id: "dark-horse",
      title: "Dark Horse Expert",
      description: "Back a long-shot team deep in your bracket",
      icon: "🐴",
      unlocked: !!analysis.darkHorseTeamId,
    },
    {
      id: "bold-predictor",
      title: "Bold Predictor",
      description: "Risk score 50+ — you're playing for glory",
      icon: "🔥",
      unlocked: analysis.riskScore >= 50,
      progress: `${analysis.riskScore}/100 risk`,
    },
    {
      id: "chaos-mode",
      title: "Chaos Mode",
      description: "Risk score 75+ — maximum bracket madness",
      icon: "💥",
      unlocked: analysis.riskScore >= 75,
    },
    {
      id: "contrarian",
      title: "Against the Crowd",
      description: "Champion pick under 10% community share",
      icon: "⭐",
      unlocked:
        !!picks.champion &&
        (analysis.championConsensusPct ?? 100) < 10 &&
        (analysis.championConsensusPct ?? 0) > 0,
    },
    {
      id: "qf-caller",
      title: "Quarterfinal Vision",
      description: "Correctly predict 4+ Round of 16 teams",
      icon: "🔮",
      unlocked: qfCorrect >= 4,
      progress: `${qfCorrect}/8 R16 teams`,
    },
    {
      id: "alive",
      title: "Still Alive",
      description: "Your champion pick is still in the tournament",
      icon: "💚",
      unlocked: !!picks.champion && !ELIMINATED_TEAM_IDS.has(picks.champion),
    },
  ];

  return achievements;
}
