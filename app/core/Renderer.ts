// ============================================================
// Renderer.ts — Three.js WebGLRenderer Wrapper
// ============================================================

import * as THREE from 'three';
import { logger } from '../utils/logger';

export class Renderer {
  private renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,         // Transparent background for AR overlay
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for mobile perf
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = false; // Disabled for mobile perf
    this.renderer.autoClear = false;         // Critical: manual clear for dual-scene compositing

    this.bindResize();
    logger.info('[Renderer] Initialized');
  }

  private bindResize(): void {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      logger.debug('[Renderer] Resized to', window.innerWidth, window.innerHeight);
    });
  }

  /** Clear all buffers — call once per frame before rendering */
  clear(): void {
    this.renderer.clear();
  }

  /**
   * Render a scene with a camera.
   * Set autoClear=false before calling to composite multiple scenes.
   */
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  getWebGLRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  dispose(): void {
    this.renderer.dispose();
    logger.info('[Renderer] Disposed');
  }
}
