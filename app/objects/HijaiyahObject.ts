// ============================================================
// HijaiyahObject.ts — 3D Letter Mesh + Animation State
// ============================================================

import * as THREE from 'three';
import type { HijaiyahLetter } from '../data/types';

export type AnimationState = 'idle' | 'entrance' | 'success' | 'persistent' | 'interactive';

export class HijaiyahObject {
  readonly letter: HijaiyahLetter;
  readonly root: THREE.Group;

  private mixer?: THREE.AnimationMixer;
  private currentState: AnimationState = 'idle';
  private entranceClip?: THREE.AnimationClip;
  private idleClip?: THREE.AnimationClip;
  private successClip?: THREE.AnimationClip;

  private basePosition = new THREE.Vector3();
  private baseRotation = new THREE.Euler();
  private elapsed = 0;

  constructor(letter: HijaiyahLetter, gltfScene: THREE.Group, clips: THREE.AnimationClip[]) {
    this.letter = letter;
    this.root = gltfScene;
    this.mixer = new THREE.AnimationMixer(this.root);

    // Save base centered pose (position and rotation)
    this.basePosition.copy(this.root.position);
    this.baseRotation.copy(this.root.rotation);

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

    // Dynamic floating and swaying for active/live AR markers (disabled for persistent and interactive states)
    if (this.currentState !== 'persistent' && this.currentState !== 'interactive') {
      this.elapsed += delta;

      // Bobbing (floating) up and down along the Z-axis (pointing out of the card)
      this.root.position.z = this.basePosition.z + Math.sin(this.elapsed * 2.5) * 0.015;

      // Swaying left and right to reveal side-shading profiles
      this.root.rotation.y = this.baseRotation.y + Math.sin(this.elapsed * 1.5) * 0.1;
    }
  }

  /** Set straight pose for live interactive state */
  setInteractiveState(): void {
    this.currentState = 'interactive';
    this.root.position.copy(this.basePosition);
    this.root.rotation.set(Math.PI / 2, 0, 0); // Stand upright perpendicular to card
  }

  /** Keep original shiny material and reset pose for static persistent rendering */
  toPersistentMaterial(): void {
    this.currentState = 'persistent';
    
    // Reset to base centered position and orientation
    this.root.position.copy(this.basePosition);
    this.root.rotation.copy(this.baseRotation);
  }

  getState(): AnimationState {
    return this.currentState;
  }
}
