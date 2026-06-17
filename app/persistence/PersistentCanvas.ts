// ============================================================
// PersistentCanvas.ts — Secondary Scene: Interactive 3D Viewer Card
// ============================================================
//
// Strategy: Render to an independent floating card canvas
// with OrbitControls, allowing 360-degree rotation and zoom
// of the letters and composed words.
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LetterSnapshot } from './LetterSnapshot';
import { eventBus } from '../core/EventBus';
import { logger } from '../utils/logger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { create3DStar } from '../objects/PlaceholderObjects';
import type { TargetWord } from '../data/words.data';

export class PersistentCanvas {
  private scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  
  private snapshots: LetterSnapshot[] = [];
  private wordObject: THREE.Object3D | null = null;
  private loader = new GLTFLoader();
  
  private userInteracted = false;
  private cardEl: HTMLElement;
  private containerEl: HTMLElement;

  constructor() {
    this.cardEl = document.getElementById('hud-3d-card')!;
    this.containerEl = document.getElementById('interactive-3d-canvas-container')!;

    const width = this.containerEl.clientWidth || 340;
    const height = this.containerEl.clientHeight || 240;

    // 1. Initialize WebGLRenderer with transparency (alpha: true)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.containerEl.appendChild(this.renderer.domElement);

    // 2. Initialize Perspective Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
    this.camera.position.set(0, 0.05, 1.1); // slightly elevated camera

    // 3. Initialize Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 2.2;
    this.controls.enablePan = false; // keep focus centered

    // 4. Setup Ambient and Key Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(2, 4, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512; // low-res shadows for mobile efficiency
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.bias = -0.001;
    this.scene.add(ambient, dirLight);

    // 5. Shadow Catcher Plane under floating objects
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.22;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    // 6. Listen for manual interaction to stop auto-rotate
    this.controls.addEventListener('start', () => {
      this.userInteracted = true;
    });

    // 7. Watch Container Resize (using ResizeObserver for responsive layout)
    const resizeObserver = new ResizeObserver(() => {
      const w = this.containerEl.clientWidth;
      const h = this.containerEl.clientHeight;
      if (w > 0 && h > 0) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(this.containerEl);

    // 8. Subscribe to word composition and frame ticks
    eventBus.on<TargetWord>('word:composed', (word) => this.spawnWordObject(word));
    eventBus.on<{ delta: number }>('tick', ({ delta }) => this.update(delta));
  }

  /**
   * Spawns a 3D model representing the composed word or falls back to a 3D gold star.
   */
  private spawnWordObject(word: TargetWord): void {
    // Hide individual letter meshes
    this.snapshots.forEach((s) => {
      s.mesh.visible = false;
    });

    // Remove previous word object if it exists
    if (this.wordObject) {
      this.wordObject.removeFromParent();
      this.wordObject = null;
    }

    this.userInteracted = false;
    this.camera.position.set(0, 0.05, 1.1);
    this.controls.target.set(0, 0, 0);

    const spawnPosition = new THREE.Vector3(0, 0.02, 0);

    // Try to load the word's GLB model, otherwise use the Gold Star placeholder
    if (word.modelFile) {
      this.loader.load(
        `/assets/models/words/${word.modelFile}`,
        (gltf) => {
          const gltfScene = gltf.scene;

          // Normalize size for card view
          const box = new THREE.Box3().setFromObject(gltfScene);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scaleFactor = 0.45 / maxDim; // scale to fit card nicely
            gltfScene.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          // Center geometry offset
          const scaledBox = new THREE.Box3().setFromObject(gltfScene);
          const modelCenter = new THREE.Vector3();
          scaledBox.getCenter(modelCenter);
          gltfScene.position.sub(modelCenter);
          gltfScene.position.y += 0.02;

          gltfScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = 0.2;
                child.material.metalness = 0.1;
              }
            }
          });

          this.wordObject = gltfScene;
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
    const star = create3DStar(0xFFD700);
    star.position.copy(position);
    star.scale.set(0.4, 0.4, 0.4);
    
    star.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.wordObject = star;
    this.scene.add(this.wordObject);
  }

  private update(delta: number): void {
    // 1. Update controls dampening
    this.controls.update();

    // 2. Slow auto-rotate if the user has not started dragging
    if (!this.userInteracted) {
      if (this.wordObject) {
        this.wordObject.rotation.y += delta * 0.7;
      } else {
        this.snapshots.forEach((s) => {
          s.mesh.rotation.y += delta * 0.7;
        });
      }
    }

    // 3. Render
    this.renderer.render(this.scene, this.camera);
  }

  /** Called when a new letter is detected */
  addLetterSnapshot(snapshot: LetterSnapshot): void {
    // Prevent duplicate — same letter index already in canvas
    const alreadyPlaced = this.snapshots.some(
      (s) => s.letter.id === snapshot.letter.id,
    );
    if (alreadyPlaced) {
      logger.debug(`[PersistentCanvas] Letter ${snapshot.letter.name} already placed, skipping`);
      return;
    }

    // Reset transform for standard viewer placement
    snapshot.mesh.matrixAutoUpdate = true;
    snapshot.mesh.rotation.set(0.15, 0, 0); // slight forward tilt
    snapshot.mesh.scale.set(0.4, 0.4, 0.4);

    this.scene.add(snapshot.mesh);
    this.snapshots.push(snapshot);
    logger.info(`[PersistentCanvas] Placed letter ${snapshot.letter.name} — total: ${this.snapshots.length}`);

    // Show the card container when first letter is added
    if (this.snapshots.length === 1) {
      this.cardEl.classList.add('visible');
      this.userInteracted = false;
      this.camera.position.set(0, 0.05, 1.1);
      this.controls.target.set(0, 0, 0);
    }

    this.alignLettersRTL();

    eventBus.emit('canvas:letter-added', { letter: snapshot.letter, count: this.snapshots.length });
  }

  /**
   * Arranges letters side-by-side in Arabic Right-to-Left sequence.
   */
  private alignLettersRTL(): void {
    if (this.wordObject) return;

    const spacing = 0.32; // comfortable gap between letter models
    const total = this.snapshots.length;

    this.snapshots.forEach((snapshot, index) => {
      // Calculate centered X offset: first item is rightmost
      const x = ((total - 1) / 2 - index) * spacing;
      snapshot.mesh.position.set(x, 0, 0);

      snapshot.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    });
  }

  /** Clear all placed letters — triggered by reset button */
  reset(): void {
    this.snapshots.forEach((s) => {
      s.mesh.removeFromParent();
    });
    this.snapshots = [];

    // Clear word object
    if (this.wordObject) {
      this.wordObject.removeFromParent();
      this.wordObject = null;
    }

    // Hide the floating card
    this.cardEl.classList.remove('visible');
    this.userInteracted = false;

    logger.info('[PersistentCanvas] Reset');
    eventBus.emit('canvas:reset');
  }

  getSnapshotCount(): number {
    return this.snapshots.length;
  }
}
