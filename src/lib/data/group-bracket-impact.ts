import { GROUP_STANDINGS } from "@/lib/data/group-stage";
import { TEAMS_2026 } from "@/lib/data/tournament";

/** Known R32 matchup swaps when a different 3rd-place team qualifies */
const BRACKET_IMPACTS: Record<
  string,
  { baselineOpponent: string; alternateThird: string; alternateOpponent: string; r32Label: string }
> = {
  jpn: {
    baselineOpponent: "aus",
    alternateThird: "jpn",
    alternateOpponent: "bra",
    r32Label: "Round of 32 · Brazil vs Japan",
  },
  aus: {
    baselineOpponent: "jpn",
    alternateThird: "aus",
    alternateOpponent: "bra",
    r32Label: "Round of 32 · Brazil vs Australia",
  },
  alg: {
    baselineOpponent: "sui",
    alternateThird: "alg",
    alternateOpponent: "arg",
    r32Label: "Round of 32 · Argentina vs Algeria",
  },
  gha: {
    baselineOpponent: "col",
    alternateThird: "gha",
    alternateOpponent: "col",
    r32Label: "Round of 32 · Colombia vs Ghana (actual)",
  },
};

export interface BracketChangeExplanation {
  title: string;
  body: string;
  affectedMatch: string;
  fromMatchup: string;
  toMatchup: string;
}

export function explainThirdPlaceChange(
  groupId: string,
  thirdPlaceTeamId: string,
  previousThirdId?: string
): BracketChangeExplanation | null {
  const group = GROUP_STANDINGS.find((g) => g.id === groupId);
  if (!group) return null;

  const third = group.standings.find((s) => s.teamId === thirdPlaceTeamId);
  const prev = previousThirdId
    ? group.standings.find((s) => s.teamId === previousThirdId)
    : group.standings.find((s) => s.position === 3);

  const team = TEAMS_2026.find((t) => t.id === thirdPlaceTeamId);
  const prevTeam = prev ? TEAMS_2026.find((t) => t.id === prev.teamId) : null;
  if (!team || !prevTeam) return null;

  const impact = BRACKET_IMPACTS[thirdPlaceTeamId] ?? BRACKET_IMPACTS[prevTeam.id];

  if (impact && thirdPlaceTeamId !== prevTeam.id) {
    const fav = TEAMS_2026.find((t) => t.id === "fra") ?? TEAMS_2026[0];
    const altTeam = TEAMS_2026.find((t) => t.id === impact.alternateThird);
    const baseTeam = TEAMS_2026.find((t) => t.id === impact.baselineOpponent);

    return {
      title: `Group ${groupId} third place changed`,
      body: `Because ${team.name} finished 3rd in Group ${groupId} instead of ${prevTeam.name}, FIFA reassigned the Round of 32 slot. The 8 best third-place teams rule means one knockout path opens while another closes.`,
      affectedMatch: impact.r32Label,
      fromMatchup: baseTeam
        ? `${fav.code} vs ${baseTeam.code} (hypothetical)`
        : `${prevTeam.code} path`,
      toMatchup: altTeam
        ? `${TEAMS_2026.find((t) => t.id === "bra")?.code ?? "BRA"} vs ${altTeam.code}`
        : `${team.code} in knockout`,
    };
  }

  if (third?.advanced) {
    return {
      title: `${team.name} advances as a best 3rd-place team`,
      body: `${team.name} finished 3rd in Group ${groupId} with ${third.points} points and qualified among the 8 best third-place teams. That reshuffled which group winners they could face in the Round of 32.`,
      affectedMatch: "Round of 32 draw",
      fromMatchup: "Previous bracket slot",
      toMatchup: `${team.code} enters knockout bracket`,
    };
  }

  return {
    title: `${team.name} eliminated in group stage`,
    body: `${team.name} finished 3rd in Group ${groupId} but did not rank among the 8 best third-place teams, so they are out. A different 3rd-place qualifier takes their Round of 32 slot.`,
    affectedMatch: "Round of 32",
    fromMatchup: `${team.code} in`,
    toMatchup: "Another 3rd-place team",
  };
}

export function simulateGroupThirdPlace(
  groupId: string,
  newThirdTeamId: string
): BracketChangeExplanation | null {
  const group = GROUP_STANDINGS.find((g) => g.id === groupId);
  if (!group) return null;
  const currentThird = group.standings.find((s) => s.position === 3);
  return explainThirdPlaceChange(groupId, newThirdTeamId, currentThird?.teamId);
}
