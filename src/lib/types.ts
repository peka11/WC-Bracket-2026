export type MatchStatus =
  | "not_started"
  | "live"
  | "halftime"
  | "extra_time"
  | "penalties"
  | "finished"
  | "postponed"
  | "cancelled";

export type BracketRound = "r32" | "r16" | "qf" | "sf" | "third" | "final" | "champion";

export interface Team {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  fifaRanking?: number;
  group?: string;
  confederation?: string;
}

export interface MatchEvent {
  type: "goal" | "card" | "subst" | "var";
  minute: number;
  teamCode: string;
  player?: string;
  detail?: string;
}

export interface MatchStats {
  homeXG?: number;
  awayXG?: number;
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  homeCorners?: number;
  awayCorners?: number;
  homePossession?: number;
  awayPossession?: number;
}

export interface Match {
  id: string;
  round: BracketRound;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  winnerTeamId?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  status: MatchStatus;
  kickoffAt: string;
  venue?: string;
  /** @deprecated prefer stats.homePossession */
  homePossession?: number;
  /** @deprecated prefer stats.awayPossession */
  awayPossession?: number;
  events?: MatchEvent[];
  stats?: MatchStats;
  referee?: string;
  attendance?: number;
}

export interface BracketSlot {
  id: string;
  round: BracketRound;
  slotIndex: number;
  teamId?: string | null;
  sourceMatchId?: string | null;
  nextSlotId?: string | null;
  angleDegrees: number;
  isEliminated?: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  points: number;
  rank: number;
  accuracyPct: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
}

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  not_started: "Not Started",
  live: "Live",
  halftime: "Halftime",
  extra_time: "Extra Time",
  penalties: "Penalties",
  finished: "Finished",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

export const ROUND_LABELS: Record<BracketRound, string> = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarterfinals",
  sf: "Semifinals",
  third: "Third Place",
  final: "Final",
  champion: "Champion",
};
