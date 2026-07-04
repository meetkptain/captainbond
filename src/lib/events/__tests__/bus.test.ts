import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from '../bus';

describe('eventBus', () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it('emits and receives a synchronous event', () => {
    const listener = vi.fn();
    eventBus.on('webhook:processed', listener);
    eventBus.emit('webhook:processed', { type: 'STRIPE', eventId: 'evt_1' });
    expect(listener).toHaveBeenCalledWith({ type: 'STRIPE', eventId: 'evt_1' });
  });

  it('supports multiple listeners on the same event', () => {
    const a = vi.fn();
    const b = vi.fn();
    eventBus.on('room:round:revealed', a);
    eventBus.on('room:round:revealed', b);
    eventBus.emit('room:round:revealed', { roomId: 'r1', round: 3 });
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it('unsubscribes a listener with off', () => {
    const listener = vi.fn();
    eventBus.on('couple:answer:submitted', listener);
    eventBus.off('couple:answer:submitted', listener);
    eventBus.emit('couple:answer:submitted', { coupleId: 'c1', dailyQuestionId: 'dq1', userId: 'u1' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribes with the returned function', () => {
    const listener = vi.fn();
    const unsubscribe = eventBus.on('couple:question:revealed', listener);
    unsubscribe();
    eventBus.emit('couple:question:revealed', { coupleId: 'c1', dailyQuestionId: 'dq1', resonanceScore: 0.8 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not throw when no listeners are registered', () => {
    expect(() => {
      eventBus.emit('webhook:processed', { type: 'STRIPE', eventId: 'evt_1' });
    }).not.toThrow();
  });

  it('swallows listener errors without breaking the bus', () => {
    const bad = vi.fn(() => { throw new Error('fail'); });
    const good = vi.fn();
    eventBus.on('room:round:started', bad);
    eventBus.on('room:round:started', good);
    expect(() => {
      eventBus.emit('room:round:started', { roomId: 'r1', round: 1 });
    }).not.toThrow();
    expect(good).toHaveBeenCalledOnce();
  });

  it('resolves async listeners via emitAsync', async () => {
    const fn = vi.fn();
    eventBus.on('couple:answer:submitted', async (payload) => {
      fn(payload);
    });
    await eventBus.emitAsync('couple:answer:submitted', { coupleId: 'c1', dailyQuestionId: 'dq1', userId: 'u1' });
    expect(fn).toHaveBeenCalledWith({ coupleId: 'c1', dailyQuestionId: 'dq1', userId: 'u1' });
  });

  it('removes all listeners', () => {
    eventBus.on('webhook:processed', vi.fn());
    eventBus.on('room:round:revealed', vi.fn());
    eventBus.removeAllListeners();
    expect(() => {
      eventBus.emit('webhook:processed', { type: 'STRIPE', eventId: 'evt_1' });
      eventBus.emit('room:round:revealed', { roomId: 'r1', round: 1 });
    }).not.toThrow();
  });

  it('handles events with no matching listeners gracefully', async () => {
    await expect(
      eventBus.emitAsync('couple:answer:submitted', { coupleId: 'c1', dailyQuestionId: 'dq1', userId: 'u1' })
    ).resolves.toBeUndefined();
  });
});
