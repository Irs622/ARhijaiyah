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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { create3DStar } from '../objects/PlaceholderObjects';
import type { TargetWord } from '../data/words.data';
import type { HijaiyahLetter } from '../data/types';

export class PersistentCanvas {
  private scene = new THREE.Scene();
  private snapshots: LetterSnapshot[] = [];
  
  private wordObject: THREE.Object3D | null = null;
  private baseWordPosY = 0;
  private elapsed = 0;
  private loader = new GLTFLoader();

  constructor() {
    // Setup lights for the persistent composite scene
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(2, 4, 2);
    this.scene.add(ambient, dirLight);

    // Subscribe to word composition and render ticks
    eventBus.on<TargetWord>('word:composed', (word) => this.spawnWordObject(word));
    eventBus.on<{ delta: number }>('tick', ({ delta }) => this.update(delta));
  }

  /**
   * Spawns a 3D model representing the composed word or falls back to a 3D gold star.
   */
  private spawnWordObject(word: TargetWord): void {
    // 1. Remove previous word object if it exists
    if (this.wordObject) {
      this.wordObject.removeFromParent();
      this.wordObject = null;
    }

    // 2. Calculate average center coordinate of placed letters
    const center = new THREE.Vector3();
    let count = 0;
    this.snapshots.forEach((s) => {
      center.add(s.mesh.position);
      count++;
    });
    if (count > 0) {
      center.divideScalar(count);
    }

    // Set base height above the letters (floating)
    this.baseWordPosY = center.y + 0.3;
    this.elapsed = 0;

    const spawnPosition = new THREE.Vector3(center.x, this.baseWordPosY, center.z + 0.05);

    // 3. Try to load the word's GLB model, otherwise use the Gold Star placeholder
    if (word.modelFile) {
      this.loader.load(
        `/assets/models/words/${word.modelFile}`,
        (gltf) => {
          const gltfScene = gltf.scene;

          // Normalize size
          const box = new THREE.Box3().setFromObject(gltfScene);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scaleFactor = 0.4 / maxDim; // scale to fit nicely above letters
            gltfScene.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          // Center geometry offset
          const scaledBox = new THREE.Box3().setFromObject(gltfScene);
          const modelCenter = new THREE.Vector3();
          scaledBox.getCenter(modelCenter);
          gltfScene.position.sub(modelCenter);

          // Wrap in a pivot group to rotate nicely around its actual center
          const pivot = new THREE.Group();
          pivot.add(gltfScene);
          pivot.position.copy(spawnPosition);

          gltfScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                // Adjust material properties for better 3D definition
                child.material.roughness = 0.2;
                child.material.metalness = 0.1;
              }
            }
          });

          this.wordObject = pivot;
          this.scene.add(this.wordObject);
          logger.info(`[PersistentCanvas] Custom model loaded: ${word.modelFile}`);
        },
        undefined,
        () => {
          logger.warn(`[PersistentCanvas] Model ${word.modelFile} not found, using Star fallback`);
          this.spawnFallbackPlaceholder(spawnPosition);
        }
      );
    } else {
      this.spawnFallbackPlaceholder(spawnPosition);
    }
  }

  private spawnFallbackPlaceholder(position: THREE.Vector3): void {
    // Fall back to a procedurally generated gold star
    const star = create3DStar(0xFFD700);
    star.position.copy(position);
    this.wordObject = star;
    this.scene.add(this.wordObject);
  }

  private update(delta: number): void {
    if (this.wordObject) {
      // Rotate slowly in 3D space
      this.wordObject.rotation.y += delta * 1.5;

      // Bob up and down floating effect
      this.elapsed += delta;
      this.wordObject.position.y = this.baseWordPosY + Math.sin(this.elapsed * 3.0) * 0.03;
    }
  }

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

    // Clear word object reward
    if (this.wordObject) {
      this.wordObject.removeFromParent();
      this.wordObject = null;
    }

    logger.info('[PersistentCanvas] Reset');
    eventBus.emit('canvas:reset');
  }

  getSnapshotCount(): number {
    return this.snapshots.length;
  }
}
