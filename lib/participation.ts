export function normalizeParticipationScore(score: number) {
  return Math.round(score * 10) / 10;
}

export function formatParticipationScore(score: number) {
  const normalizedScore = normalizeParticipationScore(score);

  return Number.isInteger(normalizedScore)
    ? normalizedScore.toString()
    : normalizedScore.toFixed(1);
}
