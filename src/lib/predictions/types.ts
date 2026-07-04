export interface MatchPick {
  winner?: string;
  home?: number;
  away?: number;
  /** 1 = low, 2 = medium, 3 = high confidence (upset bonus at 3) */
  confidence?: 1 | 2 | 3;
}

export interface UserPredictions {
  displayName: string;
  matchPicks: Record<string, MatchPick>;
  bracketPicks: Record<string, string>;
  champion: string | null;
  updatedAt: string;
}

export const PREDICTIONS_STORAGE_KEY = "wc-2026-predictions";
export const DEFAULT_DISPLAY_NAME = "You";

export function emptyPredictions(): UserPredictions {
  return {
    displayName: DEFAULT_DISPLAY_NAME,
    matchPicks: {},
    bracketPicks: {},
    champion: null,
    updatedAt: new Date().toISOString(),
  };
}
