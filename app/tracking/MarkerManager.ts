// ============================================================
// MarkerManager.ts — Register & Manage All 28 MindAR Anchors
// ============================================================

import { MarkerAnchor } from './MarkerAnchor';
import { HIJAIYAH_LETTERS, getLetterByMarkerIndex } from '../data/hijaiyah.data';
import { eventBus } from '../core/EventBus';
import type { AREngine } from '../core/AREngine';
import { logger } from '../utils/logger';

export class MarkerManager {
  private anchors: MarkerAnchor[] = [];

  constructor(private arEngine: AREngine) {}

  /** Register all 28 letter markers with MindAR */
  registerAll(): void {
    for (const letter of HIJAIYAH_LETTERS) {
      const group = this.arEngine.addAnchor(letter.markerIndex);
      const anchor = new MarkerAnchor(letter.markerIndex, letter, group);

      // MindAR fires these callbacks when the target enters/leaves camera view
      group.addEventListener('targetFound', () => this.onFound(anchor));
      group.addEventListener('targetLost',  () => this.onLost(anchor));

      this.anchors.push(anchor);
      logger.debug(`[MarkerManager] Registered anchor ${letter.markerIndex} (${letter.name})`);
    }

    logger.info(`[MarkerManager] ${this.anchors.length} anchors registered`);
  }

  private onFound(anchor: MarkerAnchor): void {
    anchor.onFound();
    logger.info(`[MarkerManager] Found: ${anchor.letter.name} (idx ${anchor.index})`);
    eventBus.emit('marker:found', { anchor, letter: anchor.letter });
  }

  private onLost(anchor: MarkerAnchor): void {
    anchor.onLost();
    logger.debug(`[MarkerManager] Lost: ${anchor.letter.name}`);
    eventBus.emit('marker:lost', { anchor, letter: anchor.letter });
  }

  getAnchor(idx: number): MarkerAnchor | undefined {
    return this.anchors.find((a) => a.index === idx);
  }

  getVisibleAnchors(): MarkerAnchor[] {
    return this.anchors.filter((a) => a.isVisible);
  }
}
