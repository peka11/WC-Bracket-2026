export interface ConsensusData {
  source: "community" | "estimated";
  totalBrackets: number;
  champions: Record<string, number>;
  championList: { teamId: string; pct: number }[];
  matchWinners: Record<string, Record<string, number>>;
}
