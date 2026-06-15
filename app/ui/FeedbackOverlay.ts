// ============================================================
// FeedbackOverlay.ts — Visual Flash + Haptic Feedback
// ============================================================

import { eventBus } from '../core/EventBus';
import { logger } from '../utils/logger';

export class FeedbackOverlay {
  private overlay: HTMLElement;
  private HAPTIC_PATTERN_SUCCESS = [100, 50, 100];
  private HAPTIC_PATTERN_FAIL    = [300];

  constructor() {
    this.overlay = document.getElementById('feedback-overlay')!;
    this.bindEvents();
  }

  private bindEvents(): void {
    eventBus.on('word:composed',  () => this.flashSuccess());
    eventBus.on('speech:pass',    () => this.flashSuccess());
    eventBus.on('speech:fail',    () => this.flashFail());
    eventBus.on('marker:found',   () => this.pulseDetect());
  }

  /** Brief green flash — word composed or pronunciation correct */
  flashSuccess(): void {
    this.flash('overlay--success', 800);
    this.vibrate(this.HAPTIC_PATTERN_SUCCESS);
    logger.debug('[FeedbackOverlay] Success flash');
  }

  /** Red shake — pronunciation failed */
  flashFail(): void {
    this.flash('overlay--fail', 600);
    this.vibrate(this.HAPTIC_PATTERN_FAIL);
    logger.debug('[FeedbackOverlay] Fail flash');
  }

  /** Subtle pulse on every marker detection */
  pulseDetect(): void {
    this.overlay?.classList.add('overlay--detect');
    setTimeout(() => this.overlay?.classList.remove('overlay--detect'), 200);
  }

  private flash(className: string, durationMs: number): void {
    if (!this.overlay) return;
    this.overlay.classList.add(className);
    setTimeout(() => this.overlay.classList.remove(className), durationMs);
  }

  /** Trigger haptic feedback via Vibration API (Android Chrome) */
  private vibrate(pattern: number[]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}
