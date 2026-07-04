import type { Match } from "@/lib/types";
import { BRACKET_SECTORS, getMatchLabel } from "@/lib/data/tournament";

export interface PathNode {
  matchId: string;
  label: string;
  homeCode: string;
  awayCode: string;
  status: Match["status"];
  isTarget?: boolean;
}

/** R16 match N is fed by two R32 matches from BRACKET_SECTORS */
function feederR32ForR16(r16Num: number): [number, number] | null {
  const sector = BRACKET_SECTORS.find((s) => s.r16MatchNumber === r16Num);
  return sector?.r32MatchNumbers ?? null;
}

function qfFeeders(qfNum: number): [number, number] {
  const base = (qfNum - 1) * 2 + 1;
  return [base, base + 1];
}

function sfFeeders(sfNum: number): [number, number] {
  const base = (sfNum - 1) * 2 + 1;
  return [base, base + 1];
}

export function getPathToMatch(match: Match, matches: Match[], teamMap: Record<string, { code: string }>): PathNode[] {
  const node = (m: Match, isTarget = false): PathNode => ({
    matchId: m.id,
    label: getMatchLabel(m),
    homeCode: teamMap[m.homeTeamId]?.code ?? "?",
    awayCode: teamMap[m.awayTeamId]?.code ?? "?",
    status: m.status,
    isTarget,
  });

  const find = (round: string, num: number) => matches.find((m) => m.round === round && m.matchNumber === num);

  const path: PathNode[] = [];

  if (match.round === "r32") {
    return [node(match, true)];
  }

  if (match.round === "r16") {
    const feeders = feederR32ForR16(match.matchNumber);
    if (feeders) {
      for (const n of feeders) {
        const m = find("r32", n);
        if (m) path.push(node(m));
      }
    }
    path.push(node(match, true));
    return path;
  }

  if (match.round === "qf") {
    const [a, b] = qfFeeders(match.matchNumber);
    for (const n of [a, b]) {
      const m = find("r16", n);
      if (m) path.push(...getPathToMatch(m, matches, teamMap).filter((p) => !path.some((x) => x.matchId === p.matchId)));
    }
    path.push(node(match, true));
    return dedupe(path);
  }

  if (match.round === "sf") {
    const [a, b] = sfFeeders(match.matchNumber);
    for (const n of [a, b]) {
      const m = find("qf", n);
      if (m) {
        const sub = getPathToMatch(m, matches, teamMap);
        for (const p of sub) {
          if (!path.some((x) => x.matchId === p.matchId)) path.push(p);
        }
      }
    }
    path.push(node(match, true));
    return dedupe(path);
  }

  if (match.round === "final") {
    for (const n of [1, 2]) {
      const m = find("sf", n);
      if (m) {
        const sub = getPathToMatch(m, matches, teamMap);
        for (const p of sub) {
          if (!path.some((x) => x.matchId === p.matchId)) path.push(p);
        }
      }
    }
    path.push(node(match, true));
    return dedupe(path);
  }

  return [node(match, true)];
}

function dedupe(nodes: PathNode[]): PathNode[] {
  const seen = new Set<string>();
  return nodes.filter((n) => {
    if (seen.has(n.matchId)) return false;
    seen.add(n.matchId);
    return true;
  });
}
