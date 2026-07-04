export const SCORING = {
  CORRECT_WINNER: 3,
  CORRECT_SCORE: 5,
  CORRECT_FINALIST: 10,
  CORRECT_CHAMPION: 25,
  PERFECT_BRACKET_BONUS: 100,
  /** Extra points when high-confidence upset pick is correct */
  UPSET_BONUS: 5,
} as const;

export function scoreMatchPrediction(
  predictedWinnerId: string | null | undefined,
  predictedHome: number | null | undefined,
  predictedAway: number | null | undefined,
  actualWinnerId: string | null | undefined,
  actualHome: number | null | undefined,
  actualAway: number | null | undefined,
  options?: {
    confidence?: 1 | 2 | 3;
    favoriteId?: string | null;
  }
): number {
  if (!actualWinnerId) return 0;
  let points = 0;
  if (predictedWinnerId === actualWinnerId) {
    points += SCORING.CORRECT_WINNER * (options?.confidence ?? 1);
    if (
      options?.confidence === 3 &&
      options?.favoriteId &&
      predictedWinnerId !== options.favoriteId
    ) {
      points += SCORING.UPSET_BONUS;
    }
  }
  if (
    predictedHome != null &&
    predictedAway != null &&
    actualHome != null &&
    actualAway != null &&
    predictedHome === actualHome &&
    predictedAway === actualAway
  ) {
    points += SCORING.CORRECT_SCORE;
  }
  return points;
}
