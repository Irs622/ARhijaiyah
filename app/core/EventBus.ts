// ============================================================
// EventBus.ts — Typed Pub/Sub Event System
// ============================================================

import type { AREvent } from '../data/types';

type Handler<T = unknown> = (payload: T) => void;

export class EventBus {
  private listeners = new Map<string, Handler[]>();

  /** Subscribe to an event */
  on<T = unknown>(event: AREvent | string, handler: Handler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler as Handler);
  }

  /** Unsubscribe a specific handler */
  off<T = unknown>(event: AREvent | string, handler: Handler<T>): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    const idx = handlers.indexOf(handler as Handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  /** Emit an event with a payload */
  emit<T = unknown>(event: AREvent | string, payload?: T): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    // Iterate a copy to allow handlers to unsubscribe mid-emission
    [...handlers].forEach((h) => h(payload));
  }

  /** Remove all listeners for all events */
  clear(): void {
    this.listeners.clear();
  }
}

/** Singleton — shared across all modules */
export const eventBus = new EventBus();
