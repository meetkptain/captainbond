import { RevealScoreItem, ScoreRecord } from './reveal';

export async function applyScores(
  roomId: string,
  scores: RevealScoreItem[],
  options: {
    fetchExistingScores: (roomId: string) => Promise<ScoreRecord[]>;
    updateResponse: (responseId: string, isCorrect: boolean) => Promise<void>;
    upsertScores: (scores: ScoreRecord[]) => Promise<void>;
  }
): Promise<void> {
  const { fetchExistingScores, updateResponse, upsertScores } = options;
  const playerIds = scores.map((s) => s.playerId);
  const existingScores = playerIds.length > 0 ? await fetchExistingScores(roomId) : [];
  const existingByPlayer = new Map(existingScores.map((s) => [s.playerId, s]));

  const scoreRecords: ScoreRecord[] = [];
  for (const scoreItem of scores) {
    if (scoreItem.rawResponseId) {
      await updateResponse(scoreItem.rawResponseId, scoreItem.isCorrect);
    }
    const existing = existingByPlayer.get(scoreItem.playerId);
    scoreRecords.push({
      id: existing?.id ?? crypto.randomUUID(),
      roomId,
      playerId: scoreItem.playerId,
      points: (existing?.points ?? 0) + scoreItem.pointsEarned,
    });
  }
  if (scoreRecords.length > 0) {
    await upsertScores(scoreRecords);
  }
}
