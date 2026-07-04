import { TEAMS_2026, R32_TO_R16 } from "@/lib/data/tournament";

export type BracketHalf = "left" | "right";

/** R16 slots 0–3 = left half, 4–7 = right half */
export function teamBracketHalf(teamId: string): BracketHalf | null {
  const entry = Object.entries(R32_TO_R16).find(([, v]) => v.teamId === teamId);
  if (!entry) return null;
  const slot = entry[1].slot;
  return slot <= 3 ? "left" : "right";
}

export function r16MatchForTeam(teamId: string): number | null {
  const entry = Object.entries(R32_TO_R16).find(([, v]) => v.teamId === teamId);
  if (!entry) return null;
  const slot = entry[1].slot;
  return slot + 1;
}

export interface PathAnalysis {
  teamA: string;
  teamB: string;
  canMeetInFinal: boolean;
  earliestRound: string;
  explanation: string;
  teamAHalf: BracketHalf | null;
  teamBHalf: BracketHalf | null;
}

export function analyzeMeetingPath(teamAId: string, teamBId: string): PathAnalysis {
  const a = TEAMS_2026.find((t) => t.id === teamAId);
  const b = TEAMS_2026.find((t) => t.id === teamBId);
  const halfA = teamBracketHalf(teamAId);
  const halfB = teamBracketHalf(teamBId);
  const r16A = r16MatchForTeam(teamAId);
  const r16B = r16MatchForTeam(teamBId);

  if (!a || !b) {
    return {
      teamA: teamAId,
      teamB: teamBId,
      canMeetInFinal: false,
      earliestRound: "—",
      explanation: "Unknown team.",
      teamAHalf: halfA,
      teamBHalf: halfB,
    };
  }

  if (teamAId === teamBId) {
    return {
      teamA: a.code,
      teamB: b.code,
      canMeetInFinal: false,
      earliestRound: "—",
      explanation: "Same team selected twice.",
      teamAHalf: halfA,
      teamBHalf: halfB,
    };
  }

  if (r16A === r16B) {
    return {
      teamA: a.code,
      teamB: b.code,
      canMeetInFinal: false,
      earliestRound: "Round of 16",
      explanation: `${a.code} and ${b.code} are on a collision course in the same Round of 16 bracket (Match ${r16A}). They cannot both reach the final.`,
      teamAHalf: halfA,
      teamBHalf: halfB,
    };
  }

  if (halfA && halfB && halfA === halfB) {
    const qfA = Math.ceil((r16A ?? 1) / 2);
    const qfB = Math.ceil((r16B ?? 1) / 2);
    if (qfA === qfB) {
      return {
        teamA: a.code,
        teamB: b.code,
        canMeetInFinal: false,
        earliestRound: "Quarterfinals",
        explanation: `Both teams are in the ${halfA} half. If they both advance, they would meet in the Quarterfinals (QF ${qfA}), not the final.`,
        teamAHalf: halfA,
        teamBHalf: halfB,
      };
    }
    const sfA = Math.ceil(qfA / 2);
    const sfB = Math.ceil(qfB / 2);
    if (sfA === sfB) {
      return {
        teamA: a.code,
        teamB: b.code,
        canMeetInFinal: false,
        earliestRound: "Semifinals",
        explanation: `Same bracket half — earliest meeting is the Semifinal (SF ${sfA}) if both teams win every round.`,
        teamAHalf: halfA,
        teamBHalf: halfB,
      };
    }
    return {
      teamA: a.code,
      teamB: b.code,
      canMeetInFinal: false,
      earliestRound: "Semifinals",
      explanation: `${a.code} and ${b.code} share the ${halfA} half. One must be eliminated before the final.`,
      teamAHalf: halfA,
      teamBHalf: halfB,
    };
  }

  return {
    teamA: a.code,
    teamB: b.code,
    canMeetInFinal: true,
    earliestRound: "Final",
    explanation: `${a.code} (${halfA} half) and ${b.code} (${halfB} half) are on opposite sides of the bracket. They can only meet in the Final if both win every knockout match on their side.`,
    teamAHalf: halfA,
    teamBHalf: halfB,
  };
}
