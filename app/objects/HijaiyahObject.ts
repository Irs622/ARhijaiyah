// ============================================================
// HijaiyahObject.ts — 3D Letter Mesh + Animation State
// ============================================================

import * as THREE from 'three';
import type { HijaiyahLetter } from '../data/types';

export type AnimationState = 'idle' | 'entrance' | 'success' | 'persistent';

export class HijaiyahObject {
  readonly letter: HijaiyahLetter;
  readonly root: THREE.Group;

  private mixer?: THREE.AnimationMixer;
  private currentState: AnimationState = 'idle';
  private entranceClip?: THREE.AnimationClip;
  private idleClip?: THREE.AnimationClip;
  private successClip?: THREE.AnimationClip;

  constructor(letter: HijaiyahLetter, gltfScene: THREE.Group, clips: THREE.AnimationClip[]) {
    this.letter = letter;
    this.root = gltfScene;
    this.mixer = new THREE.AnimationMixer(this.root);

    // Map clips by name convention: 'entrance', 'idle', 'success'
    this.entranceClip = clips.find((c) => c.name === 'entrance');
    this.idleClip     = clips.find((c) => c.name === 'idle');
    this.successClip  = clips.find((c) => c.name === 'success');
  }

  playEntrance(): void {
    if (!this.mixer || !this.entranceClip) return;
    this.currentState = 'entrance';
    const action = this.mixer.clipAction(this.entranceClip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset().play();
  }

  playIdle(): void {
    if (!this.mixer || !this.idleClip) return;
    this.currentState = 'idle';
    this.mixer.clipAction(this.idleClip).reset().play();
  }

  playSuccess(): void {
    if (!this.mixer || !this.successClip) return;
    this.currentState = 'success';
    const action = this.mixer.clipAction(this.successClip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset().play();
  }

  /** Called every frame tick with delta time (seconds) */
  update(delta: number): void {
    this.mixer?.update(delta);
  }

  /** Swap to a flat, unlit material for the persistent scene (perf optimisation) */
  toPersistentMaterial(): void {
    this.root.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const color = (child.material as THREE.MeshStandardMaterial).color ?? new THREE.Color(0xffffff);
        child.material = new THREE.MeshBasicMaterial({ color });
      }
    });
    this.currentState = 'persistent';
  }

  getState(): AnimationState {
    return this.currentState;
  }
}
