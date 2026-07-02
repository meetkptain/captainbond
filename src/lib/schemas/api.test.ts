import { describe, it, expect } from 'vitest';
import { roomCodeSchema, playerNameSchema, roomSetModeSchema } from './api';

describe('roomCodeSchema', () => {
  it('uppercases and trims room codes', () => {
    expect(roomCodeSchema.parse('  abcd  ')).toBe('ABCD');
  });

  it('strips non-alphanumeric characters', () => {
    expect(roomCodeSchema.parse('a-b_c d')).toBe('ABCD');
  });
});

describe('playerNameSchema', () => {
  it('trims and collapses whitespace', () => {
    expect(playerNameSchema.parse('  James   Bond  ')).toBe('James Bond');
  });

  it('rejects empty names after trimming', () => {
    expect(() => playerNameSchema.parse('   ')).toThrow();
  });
});

describe('roomSetModeSchema', () => {
  it('accepts a registered mode outside the original 3-mode list', () => {
    expect(roomSetModeSchema.safeParse({ roomCode: 'ABCD', mode: 'SPICY' }).success).toBe(true);
  });

  it('rejects an unregistered mode', () => {
    expect(roomSetModeSchema.safeParse({ roomCode: 'ABCD', mode: 'UNKNOWN_MODE' }).success).toBe(false);
  });
});
