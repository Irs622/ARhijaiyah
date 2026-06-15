// ============================================================
// LetterSnapshot.ts — Immutable World-Space Letter Record
// ============================================================
//
// CRITICAL: We store matrixWorld (world space), NOT position
// relative to the anchor group (which is camera-relative).
// Camera-relative positions drift when the camera moves.
// ============================================================

import * as THREE from 'three';
import type { HijaiyahLetter } from '../data/types';

export class LetterSnapshot {
  readonly letter: HijaiyahLetter;
  readonly matrixWorld: THREE.Matrix4;
  readonly mesh: THREE.Object3D;
  readonly timestamp: number;

  constructor(letter: HijaiyahLetter, matrixWorld: THREE.Matrix4, mesh: THREE.Object3D) {
    this.letter = letter;
    // Deep-copy the matrix — anchor group matrix is mutable
    this.matrixWorld = matrixWorld.clone();
    this.mesh = mesh;
    this.timestamp = performance.now();

    // Apply frozen world transform to the mesh
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(this.matrixWorld);
    this.mesh.matrix.decompose(
      this.mesh.position,
      this.mesh.quaternion,
      this.mesh.scale,
    );
  }
}
