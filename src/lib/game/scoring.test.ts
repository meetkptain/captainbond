import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { applyScores } from './scoring';
import { RevealScoreItem, ScoreRecord } from './reveal';

describe('applyScores', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-id' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when no scores are provided', async () => {
    const fetchExistingScores = vi.fn().mockResolvedValue([]);
    const updateResponses = vi.fn().mockResolvedValue(undefined);
    const upsertScores = vi.fn().mockResolvedValue(undefined);

    await applyScores('room-1', [], {
      fetchExistingScores,
      updateResponses,
      upsertScores,
    });

    expect(fetchExistingScores).not.toHaveBeenCalled();
    expect(updateResponses).not.toHaveBeenCalled();
    expect(upsertScores).not.toHaveBeenCalled();
  });

  it('inserts a new score with a generated id', async () => {
    const fetchExistingScores = vi.fn().mockResolvedValue([]);
    const updateResponses = vi.fn().mockResolvedValue(undefined);
    const upsertScores = vi.fn().mockResolvedValue(undefined);

    const scores: RevealScoreItem[] = [
      { playerId: 'p-1', pointsEarned: 10, isCorrect: true },
    ];

    await applyScores('room-1', scores, {
      fetchExistingScores,
      updateResponses,
      upsertScores,
    });

    expect(fetchExistingScores).toHaveBeenCalledWith('room-1');
    expect(updateResponses).not.toHaveBeenCalled();
    expect(upsertScores).toHaveBeenCalledWith([
      {
        id: 'generated-id',
        roomId: 'room-1',
        playerId: 'p-1',
        points: 10,
      },
    ]);
  });

  it('updates an existing score with accumulated points', async () => {
    const existing: ScoreRecord[] = [
      { id: 'score-1', roomId: 'room-1', playerId: 'p-1', points: 5 },
    ];
    const fetchExistingScores = vi.fn().mockResolvedValue(existing);
    const updateResponses = vi.fn().mockResolvedValue(undefined);
    const upsertScores = vi.fn().mockResolvedValue(undefined);

    const scores: RevealScoreItem[] = [
      { playerId: 'p-1', pointsEarned: 10, isCorrect: true },
    ];

    await applyScores('room-1', scores, {
      fetchExistingScores,
      updateResponses,
      upsertScores,
    });

    expect(upsertScores).toHaveBeenCalledWith([
      {
        id: 'score-1',
        roomId: 'room-1',
        playerId: 'p-1',
        points: 15,
      },
    ]);
  });

  it('batches response correctness updates', async () => {
    const fetchExistingScores = vi.fn().mockResolvedValue([]);
    const updateResponses = vi.fn().mockResolvedValue(undefined);
    const upsertScores = vi.fn().mockResolvedValue(undefined);

    const scores: RevealScoreItem[] = [
      { playerId: 'p-1', pointsEarned: 10, isCorrect: true, rawResponseId: 'r-1' },
      { playerId: 'p-2', pointsEarned: 5, isCorrect: false, rawResponseId: 'r-2' },
    ];

    await applyScores('room-1', scores, {
      fetchExistingScores,
      updateResponses,
      upsertScores,
    });

    expect(updateResponses).toHaveBeenCalledTimes(1);
    expect(updateResponses).toHaveBeenCalledWith([
      { responseId: 'r-1', isCorrect: true },
      { responseId: 'r-2', isCorrect: false },
    ]);
  });
});
