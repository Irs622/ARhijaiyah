// ============================================================
// ObjectPool.ts — Pre-allocate All 28 Meshes, Zero Runtime GC
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HijaiyahObject } from './HijaiyahObject';
import { HIJAIYAH_LETTERS } from '../data/hijaiyah.data';
import { logger } from '../utils/logger';
import type { HijaiyahLetter } from '../data/types';

const MODEL_BASE_PATH = '/assets/models/';

export class ObjectPool {
  private pool = new Map<number, HijaiyahObject>(); // keyed by letter.id
  private loader = new GLTFLoader();

  /**
   * Preload all 28 GLB models at startup.
   * Call once before arEngine.start().
   */
  async preload(): Promise<void> {
    logger.info('[ObjectPool] Preloading all 28 models…');

    const promises = HIJAIYAH_LETTERS.map((letter) => this.loadLetter(letter));
    await Promise.all(promises);

    logger.info('[ObjectPool] All models loaded');
  }

  private loadLetter(letter: HijaiyahLetter): Promise<void> {
    return new Promise((resolve) => {
      this.loader.load(
        `${MODEL_BASE_PATH}${letter.modelFile}`,
        (gltf) => {
          const gltfScene = gltf.scene as THREE.Group;

          // 1. Set colorful glossy material and enable shadows for all child meshes
          gltfScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              let letterColor = 0xffffff;
              if (child.material) {
                const matColor = (child.material as THREE.MeshStandardMaterial).color;
                // Preserve custom pre-authored colors if they aren't default white/grey
                if (matColor && (matColor.r !== 1 || matColor.g !== 1 || matColor.b !== 1)) {
                  letterColor = matColor.getHex();
                } else {
                  // Vibrant palette suitable for kids education
                  const colors = [
                    0xFF5722, // Orange
                    0x4CAF50, // Playful Green
                    0x2196F3, // Sky Blue
                    0xFFEB3B, // Sun Yellow
                    0x9C27B0, // Magic Purple
                    0xE91E63, // Hot Pink
                    0x00BCD4, // Teal
                    0xFF9800, // Amber
                    0x00E676, // Lime
                    0x2979FF  // Indigo
                  ];
                  letterColor = colors[letter.id % colors.length];
                }
              }

              child.material = new THREE.MeshStandardMaterial({
                color: letterColor,
                roughness: 0.15, // Shiny glossy plastic-toy finish
                metalness: 0.1,
                flatShading: false
              });
            }
          });

          // 2. Standardize scale based on its bounding box
          const box = new THREE.Box3().setFromObject(gltfScene);
          const size = new THREE.Vector3();
          box.getSize(size);

          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const targetSize = 0.65; // fits perfectly inside a 1x1 marker card
            const scaleFactor = targetSize / maxDim;
            gltfScene.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          // 3. Re-compute center and offset the position to center it at the origin
          const scaledBox = new THREE.Box3().setFromObject(gltfScene);
          const center = new THREE.Vector3();
          scaledBox.getCenter(center);
          gltfScene.position.sub(center);

          // Elevate slightly along Z (facing camera) so it hovers above the card
          gltfScene.position.z += 0.05;

          // Apply initial tilt (X/Y rotation) to show 3D side depth
          gltfScene.rotation.x = 0.2;
          gltfScene.rotation.y = 0.4;

          const obj = new HijaiyahObject(
            letter,
            gltfScene,
            gltf.animations,
          );
          this.pool.set(letter.id, obj);
          logger.debug(`[ObjectPool] Loaded & normalized ${letter.name}`);
          resolve();
        },
        undefined,
        () => {
          logger.warn(`[ObjectPool] Skipped missing model for ${letter.name}: ${letter.modelFile}`);
          resolve();
        },
      );
    });
  }

  /**
   * Lease a HijaiyahObject for use in the live AR scene.
   * Returns undefined if not loaded (should not happen after preload()).
   */
  lease(letter: HijaiyahLetter): HijaiyahObject | undefined {
    const obj = this.pool.get(letter.id);
    if (!obj) {
      logger.warn(`[ObjectPool] Letter ${letter.name} not found in pool`);
    }
    return obj;
  }

  /** Return a leased object (re-enable for next lease cycle) */
  return(_obj: HijaiyahObject): void {
    // In this single-instance-per-letter model, nothing needs to be done.
    // Extend to a queue if multiple instances of the same letter are needed.
  }

  isReady(): boolean {
    return this.pool.size === HIJAIYAH_LETTERS.length;
  }
}
