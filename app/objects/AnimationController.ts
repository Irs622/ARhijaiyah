// ============================================================
// AnimationController.ts — Centralised Animation Update Loop
// ============================================================

import { eventBus } from '../core/EventBus';
import type { HijaiyahObject } from './HijaiyahObject';

interface TickPayload {
  delta: number;
}

export class AnimationController {
  private activeObjects = new Set<HijaiyahObject>();

  constructor() {
    // Subscribe to the global render loop tick from AREngine
    eventBus.on<TickPayload>('tick', ({ delta }) => this.update(delta));
  }

  register(obj: HijaiyahObject): void {
    this.activeObjects.add(obj);
  }

  unregister(obj: HijaiyahObject): void {
    this.activeObjects.delete(obj);
  }

  private update(delta: number): void {
    this.activeObjects.forEach((obj) => obj.update(delta));
  }

  clear(): void {
    this.activeObjects.clear();
  }
}
