// ============================================================
// SceneManager.ts — Three.js Scene, Camera & Lights
// ============================================================

import * as THREE from 'three';
import { logger } from '../utils/logger';

export class SceneManager {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000,
    );

    this.setupLights();
    this.bindResize();
    logger.info('[SceneManager] Initialized');
  }

  private setupLights(): void {
    // Soft ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    ambient.name = 'ambient';

    // Directional key light — top-right, no shadows (mobile perf)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(1, 2, 1);
    dirLight.name = 'keyLight';

    this.scene.add(ambient, dirLight);
  }

  private bindResize(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  /** Remove all non-light objects from the scene */
  clearObjects(): void {
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (obj !== this.scene && !(obj instanceof THREE.Light)) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((obj) => obj.removeFromParent());
  }
}
