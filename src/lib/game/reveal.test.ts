import { describe, it, expect, vi } from 'vitest';
import {
  computeRevealResult,
  findImpostorPlayerId,
  RawResponse,
  ComputeRevealInput,
} from './reveal';
import { getServerGameMode } from '@/game-modes/manifests';
import type { Question } from '@/lib/db/types';

const mockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'q-1',
  text: 'Question?',
  mode: 'ICEBREAKER',
  correctAnswer: 'answer-a',
  explanation: 'Because.',
  ...overrides,
});

const mockGameMode = () =>
  ({
    manifest: { id: 'MOCK', name: 'Mock' },
    engine: {
      validateResponse: vi.fn((answer: unknown) => ({
        isValid: typeof answer === 'string' && answer !== '',
        parsedAnswer: answer,
      })),
      calculateScores: vi.fn((_responses, question) => {
        if (question.correctAnswer === 'impostor-player') {
          return _responses.map((r: { playerId: string }) => ({
            playerId: r.playerId,
            pointsEarned: r.playerId === 'impostor-player' ? 1 : 0,
            isCorrect: r.playerId === 'impostor-player',
          }));
        }
        return _responses.map((r: { playerId: string; answer: unknown }) => ({
          playerId: r.playerId,
          pointsEarned: r.answer === question.correctAnswer ? 1 : 0,
          isCorrect: r.answer === question.correctAnswer,
        }));
      }),
    },
  }) as unknown as NonNullable<ReturnType<typeof getServerGameMode>>;

describe('computeRevealResult', () => {
  it('returns empty scores when no valid responses are provided', () => {
    const gameMode = mockGameMode();
    const input: ComputeRevealInput = {
      question: mockQuestion(),
      responses: [],
      gameMode,
      roundConfig: null,
    };

    const result = computeRevealResult(input);

    expect(result.scores).toEqual([]);
    expect(result.correctAnswer).toBe('answer-a');
    expect(result.explanation).toBe('Because.');
  });

  it('maps valid responses and calculates scores', () => {
    const gameMode = mockGameMode();
    const responses: RawResponse[] = [
      { id: 'r-1', playerId: 'p-1', answer: 'answer-a', timestamp: '2024-01-01T00:00:00.000Z' },
      { id: 'r-2', playerId: 'p-2', answer: 'answer-b', timestamp: '2024-01-01T00:00:01.000Z' },
      { id: 'r-3', playerId: 'p-3', answer: '', timestamp: '2024-01-01T00:00:02.000Z' },
    ];

    const input: ComputeRevealInput = {
      question: mockQuestion(),
      responses,
      gameMode,
      roundConfig: null,
    };

    const result = computeRevealResult(input);

    expect(gameMode.engine.validateResponse).toHaveBeenCalledTimes(3);
    expect(result.scores).toHaveLength(2);
    expect(result.scores).toContainEqual({
      playerId: 'p-1',
      pointsEarned: 1,
      isCorrect: true,
      rawResponseId: 'r-1',
    });
    expect(result.scores).toContainEqual({
      playerId: 'p-2',
      pointsEarned: 0,
      isCorrect: false,
      rawResponseId: 'r-2',
    });
  });

  it('overrides correctAnswer when impostorPlayerId is provided', () => {
    const gameMode = mockGameMode();
    const responses: RawResponse[] = [
      { id: 'r-1', playerId: 'p-1', answer: 'impostor-player', timestamp: '2024-01-01T00:00:00.000Z' },
      { id: 'r-2', playerId: 'impostor-player', answer: 'impostor-player', timestamp: '2024-01-01T00:00:01.000Z' },
    ];

    const input: ComputeRevealInput = {
      question: mockQuestion(),
      responses,
      gameMode,
      roundConfig: null,
      impostorPlayerId: 'impostor-player',
    };

    const result = computeRevealResult(input);

    expect(result.correctAnswer).toBe('impostor-player');
    expect(result.scores).toContainEqual({
      playerId: 'impostor-player',
      pointsEarned: 1,
      isCorrect: true,
      rawResponseId: 'r-2',
    });
  });
});

describe('findImpostorPlayerId', () => {
  it('returns undefined when roundConfig has no imposterHash', async () => {
    const getPlayers = vi.fn().mockResolvedValue([{ id: 'p-1' }]);
    const getHmac = vi.fn().mockResolvedValue('hash');

    const result = await findImpostorPlayerId('room-1', {}, getPlayers, getHmac);

    expect(result).toBeUndefined();
    expect(getPlayers).not.toHaveBeenCalled();
  });

  it('finds the player whose hmac matches the imposterHash', async () => {
    const getPlayers = vi.fn().mockResolvedValue([{ id: 'p-1' }, { id: 'p-2' }]);
    const getHmac = vi.fn((playerId: string) => Promise.resolve(playerId === 'p-2' ? 'target-hash' : 'other-hash'));

    const result = await findImpostorPlayerId(
      'room-1',
      { imposterHash: 'target-hash' },
      getPlayers,
      getHmac
    );

    expect(result).toBe('p-2');
    expect(getHmac).toHaveBeenCalledWith('p-1');
    expect(getHmac).toHaveBeenCalledWith('p-2');
  });

  it('parses string roundConfig and finds the impostor', async () => {
    const getPlayers = vi.fn().mockResolvedValue([{ id: 'p-1' }]);
    const getHmac = vi.fn().mockResolvedValue('matched-hash');

    const result = await findImpostorPlayerId(
      'room-1',
      JSON.stringify({ imposterHash: 'matched-hash' }),
      getPlayers,
      getHmac
    );

    expect(result).toBe('p-1');
  });

  it('returns undefined when no player hash matches', async () => {
    const getPlayers = vi.fn().mockResolvedValue([{ id: 'p-1' }]);
    const getHmac = vi.fn().mockResolvedValue('unmatched-hash');

    const result = await findImpostorPlayerId(
      'room-1',
      { imposterHash: 'target-hash' },
      getPlayers,
      getHmac
    );

    expect(result).toBeUndefined();
  });
});
