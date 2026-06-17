// ============================================================
// HUDManager.ts — HUD State Machine (UI box removed)
// ============================================================

import { eventBus } from '../core/EventBus';
import { logger } from '../utils/logger';
import type { HUDState } from '../data/types';

export class HUDManager {
  private currentState: HUDState = 'idle';

  // DOM elements — injected via index.html IDs (no card element)
  private readonly el = {
    hudRoot:       document.getElementById('hud-root'),
    statusText:    document.getElementById('hud-status'),
    scanOverlay:   document.getElementById('hud-scan-overlay'),
    wordPanel:     document.getElementById('hud-word-panel'),
    resetBtn:      document.getElementById('hud-reset-btn'),
  };

  constructor() {
    this.bindEvents();
    this.transition('idle');
  }

  private bindEvents(): void {
    eventBus.on('app:ready',        () => this.transition('idle'));
    eventBus.on('marker:found',     () => this.transition('tracking'));
    eventBus.on('word:composed',    () => this.transition('word-complete'));
    eventBus.on('word:reset',       () => this.transition('idle'));
    eventBus.on('canvas:reset',     () => this.transition('idle'));

    // Reset button
    this.el.resetBtn?.addEventListener('click', () => {
      eventBus.emit('word:reset');
      eventBus.emit('canvas:reset');
    });
  }

  transition(state: HUDState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    logger.debug(`[HUDManager] → ${state}`);

    // Remove all state classes, then apply current
    this.el.hudRoot?.classList.remove('idle', 'tracking', 'word-complete', 'speech');
    this.el.hudRoot?.classList.add(state);

    switch (state) {
      case 'idle':
        this.setStatus('Arahkan kamera ke kartu huruf hijaiyah');
        this.el.scanOverlay?.classList.add('visible');
        this.el.wordPanel?.classList.remove('visible');
        break;

      case 'tracking':
        this.setStatus('Huruf terdeteksi!');
        this.el.scanOverlay?.classList.remove('visible');
        this.el.wordPanel?.classList.add('visible');
        break;

      case 'word-complete':
        this.setStatus('Kata terbentuk! 🎉');
        break;

      case 'speech':
        this.setStatus('Ucapkan kata yang muncul…');
        break;
    }
  }

  private setStatus(text: string): void {
    if (this.el.statusText) this.el.statusText.textContent = text;
  }

  getState(): HUDState {
    return this.currentState;
  }
}
