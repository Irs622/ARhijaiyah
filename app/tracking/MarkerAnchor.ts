// ============================================================
// MarkerAnchor.ts — Single Marker Anchor State Model
// ============================================================

import * as THREE from 'three';
import type { HijaiyahLetter } from '../data/types';

export class MarkerAnchor {
  readonly index: number;
  readonly letter: HijaiyahLetter;
  readonly group: THREE.Group; // MindAR anchor group

  isVisible = false;
  lastSeen = 0;

  /** Snapshot of world-space matrix at moment of detection — used by PersistentCanvas */
  get worldMatrix(): THREE.Matrix4 {
    const m = new THREE.Matrix4();
    this.group.updateWorldMatrix(true, false);
    m.copy(this.group.matrixWorld);
    return m;
  }

  constructor(index: number, letter: HijaiyahLetter, group: THREE.Group) {
    this.index = index;
    this.letter = letter;
    this.group = group;
  }

  onFound(): void {
    this.isVisible = true;
    this.lastSeen = performance.now();
  }

  onLost(): void {
    this.isVisible = false;
  }
}
