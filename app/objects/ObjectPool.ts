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
    return new Promise((resolve, reject) => {
      this.loader.load(
        `${MODEL_BASE_PATH}${letter.modelFile}`,
        (gltf) => {
          const obj = new HijaiyahObject(
            letter,
            gltf.scene as THREE.Group,
            gltf.animations,
          );
          this.pool.set(letter.id, obj);
          logger.debug(`[ObjectPool] Loaded ${letter.name}`);
          resolve();
        },
        undefined,
        (err) => {
          logger.error(`[ObjectPool] Failed to load ${letter.modelFile}:`, err);
          reject(err);
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
