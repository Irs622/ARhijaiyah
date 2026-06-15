// ============================================================
// PersistentCanvas.ts — Secondary Scene: Letters Never Removed
// ============================================================
//
// Strategy: autoClear=false dual-scene compositing
//   Frame N:
//     1. renderer.clear()                        — clear all buffers
//     2. renderer.render(liveScene, camera)      — live AR anchors
//     3. renderer.render(persistentScene, camera) — frozen snapshots
//
// Step 3 composites on top of step 2 without clearing.
// Persistent letter meshes use MeshBasicMaterial — no lighting cost.
// ============================================================

import * as THREE from 'three';
import { LetterSnapshot } from './LetterSnapshot';
import { eventBus } from '../core/EventBus';
import { logger } from '../utils/logger';
import type { HijaiyahLetter } from '../data/types';

export class PersistentCanvas {
  private scene = new THREE.Scene();
  private snapshots: LetterSnapshot[] = [];

  /** Called by MarkerManager subscriber when a new letter is detected */
  addLetterSnapshot(snapshot: LetterSnapshot): void {
    // Prevent duplicate — same letter index already in canvas
    const alreadyPlaced = this.snapshots.some(
      (s) => s.letter.id === snapshot.letter.id,
    );
    if (alreadyPlaced) {
      logger.debug(`[PersistentCanvas] Letter ${snapshot.letter.name} already placed, skipping`);
      return;
    }

    this.scene.add(snapshot.mesh);
    this.snapshots.push(snapshot);
    logger.info(`[PersistentCanvas] Placed letter ${snapshot.letter.name} — total: ${this.snapshots.length}`);

    eventBus.emit('canvas:letter-added', { letter: snapshot.letter, count: this.snapshots.length });
  }

  /** Render persistent scene on top of live AR scene (autoClear must be false) */
  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    renderer.render(this.scene, camera);
  }

  /** Returns placed letters in detection order */
  getSequence(): HijaiyahLetter[] {
    return this.snapshots.map((s) => s.letter);
  }

  /** Clear all placed letters — triggered by reset gesture or new session */
  reset(): void {
    this.snapshots.forEach((s) => {
      s.mesh.removeFromParent();
    });
    this.snapshots = [];
    logger.info('[PersistentCanvas] Reset');
    eventBus.emit('canvas:reset');
  }

  getSnapshotCount(): number {
    return this.snapshots.length;
  }
}
