// ============================================================
// AREngine.ts — MindAR Bootstrap & Render Loop
// ============================================================
//
// IMPORTANT: MindARThree bundles its own Three.js instance.
// We use it for camera/video binding, then hand off renderer
// and scene control to our own Renderer and SceneManager.
// ============================================================

import { MindARThree, MindAnchor } from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { Renderer } from './Renderer';
import { eventBus } from './EventBus';
import { logger } from '../utils/logger';

export interface AREngineConfig {
  container: HTMLElement;
  imageTargetSrc: string; // Path to .mind file
  maxTrack?: number;       // Max simultaneous tracked markers (default: 1)
}

export class AREngine {
  private mindar: MindARThree;
  private sceneManager: SceneManager;
  private renderer: Renderer;
  private clock = new THREE.Clock();
  private frameId = -1;
  private isRunning = false;

  constructor(config: AREngineConfig) {
    this.mindar = new MindARThree({
      container: config.container,
      imageTargetSrc: config.imageTargetSrc,
      maxTrack: config.maxTrack ?? 1,
      // uiLoading: 'no', // Hide MindAR default UI — we use our own HUD
    });

    const { renderer, camera } = this.mindar;

    // Inject MindAR's renderer/scene into our wrappers
    this.renderer = new Renderer(renderer.domElement);
    this.sceneManager = new SceneManager();

    // MindAR manages its own camera — sync projection matrix
    this.sceneManager.camera.projectionMatrix.copy(camera.projectionMatrix);

    // Setup lights for the live AR scene so 3D objects are illuminated
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(2, 4, 2);
    this.mindar.scene.add(ambient, dirLight);

    logger.info('[AREngine] Initialized');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    await this.mindar.start();
    this.isRunning = true;
    this.tick();
    eventBus.emit('app:ready');
    logger.info('[AREngine] Started');
  }

  stop(): void {
    if (!this.isRunning) return;
    this.mindar.stop();
    this.mindar.renderer.setAnimationLoop(null);
    cancelAnimationFrame(this.frameId);
    this.isRunning = false;
    logger.info('[AREngine] Stopped');
  }

  private tick(): void {
    this.mindar.renderer.setAnimationLoop(() => {
      const delta = this.clock.getDelta();

      // Emit a global tick event that other modules can subscribe to
      eventBus.emit('tick', { delta });

      // 1. Clear once per frame
      this.renderer.clear();

      // 2. Render live AR scene (MindAR anchors)
      this.renderer.render(this.mindar.scene, this.mindar.camera);

      // 3. Render persistent scene on top (autoClear=false preserves live scene)
      // PersistentCanvas subscribes to 'tick' and calls renderer.render() here
    });
  }

  getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  getRenderer(): Renderer {
    return this.renderer;
  }

  /** Expose MindAR anchors for MarkerManager to attach callbacks */
  getAnchors(): MindAnchor[] {
    return this.mindar.anchors ?? [];
  }

  /** Expose MindAR addAnchor — used by MarkerManager */
  addAnchor(targetIndex: number): MindAnchor {
    return this.mindar.addAnchor(targetIndex);
  }
}
