import { InternalEventName, InternalEventPayload } from './types';

type Listener<N extends InternalEventName> = (payload: InternalEventPayload<N>) => void | Promise<void>;
type Unsubscribe = () => void;

class InternalEventBus {
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  on<N extends InternalEventName>(event: N, listener: Listener<N>): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as (...args: unknown[]) => void);
    return () => {
      this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void);
    };
  }

  off<N extends InternalEventName>(event: N, listener: Listener<N>): void {
    this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void);
  }

  emit<N extends InternalEventName>(event: N, payload: InternalEventPayload<N>): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch {
        // Swallow individual listener errors so one bad listener doesn't break the bus
      }
    }
  }

  async emitAsync<N extends InternalEventName>(event: N, payload: InternalEventPayload<N>): Promise<void> {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    const promises: Promise<void>[] = [];
    for (const listener of listeners) {
      try {
        const result = listener(payload) as unknown;
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch {
        // Swallow individual listener errors
      }
    }
    await Promise.allSettled(promises);
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export const eventBus = new InternalEventBus();
