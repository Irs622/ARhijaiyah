// ============================================================
// main.ts — Application Entry Point
// ============================================================
//
// Boot sequence:
//   1. Validate device capabilities
//   2. Preload assets (models + audio)
//   3. Start AR engine
//   4. Register all 28 markers
//   5. Wire up UI modules
//   6. Unlock AudioContext on first user tap
// ============================================================

import { AREngine }             from './core/AREngine';
import { eventBus }             from './core/EventBus';
import { MarkerManager }        from './tracking/MarkerManager';
import { WordComposer }         from './persistence/WordComposer';
import { ObjectPool }           from './objects/ObjectPool';
import { AnimationController }  from './objects/AnimationController';
import { AudioManager }         from './audio/AudioManager';
import { PronunciationPlayer }  from './audio/PronunciationPlayer';
import { HUDManager }           from './ui/HUDManager';
import { WordStrip }            from './ui/WordStrip';
import { FeedbackOverlay }      from './ui/FeedbackOverlay';
import { isWebGL2Supported }    from './utils/device.utils';
import { logger }               from './utils/logger';
import type { MarkerFoundPayload } from './tracking/TrackingEvents';

import { MarkerAnchor }         from './tracking/MarkerAnchor';
import type { TargetWord }      from './data/words.data';
import { ARInteractionManager } from './core/ARInteractionManager';
import { GLTFLoader }           from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE               from 'three';

async function bootstrap(): Promise<void> {
  // ── 1. Device capability check ────────────────────────────
  if (!isWebGL2Supported()) {
    document.getElementById('error-screen')!.textContent =
      'Perangkat tidak mendukung WebGL2. Gunakan Chrome terbaru.';
    return;
  }

  // ── 2. Instantiate modules ────────────────────────────────
  const container = document.getElementById('ar-container')!;

  const arEngine   = new AREngine({
    container,
    imageTargetSrc: '/assets/markers/hijaiyah.mind',
    maxTrack: 2, // Phase 1: track Alif and Ba simultaneously
  });

  const objectPool         = new ObjectPool();
  const animController     = new AnimationController();
  const wordComposer       = new WordComposer();
  const markerManager      = new MarkerManager(arEngine);
  const audioManager       = new AudioManager();
  const pronunciationPlayer = new PronunciationPlayer(audioManager);

  // UI — instantiated after DOM ready
  new HUDManager();
  new WordStrip();
  new FeedbackOverlay();

  // Instantiate Interaction Manager for touch dragging and raycasted tapping
  const arInteractionManager = new ARInteractionManager({
    canvas: arEngine.getRenderer().getWebGLRenderer().domElement,
    camera: arEngine.getCamera(),
    onPlayAudio: (audioFile) => {
      pronunciationPlayer.playLetter(audioFile);
    },
    onPlaySuccess: () => {
      audioManager.playSuccessChime();
    }
  });

  const gltfLoader = new GLTFLoader();

  let lastActiveAnchor: MarkerAnchor | null = null;
  let isWordComposed = false;

  // ── 3. Preload assets ─────────────────────────────────────
  logger.info('[main] Preloading assets…');
  await Promise.all([
    objectPool.preload(),
    pronunciationPlayer.preload(),
  ]);
  logger.info('[main] Assets ready');

  // ── 4. Register markers ───────────────────────────────────
  markerManager.registerAll();

  // ── 5. Core event wiring ──────────────────────────────────
  eventBus.on<MarkerFoundPayload>('marker:found', ({ anchor, letter }) => {
    // If a word was already composed, trigger auto-reset before scanning the new letter
    if (isWordComposed) {
      wordComposer.reset();
    }

    // 1. Clean up any existing children from the anchor group and unregister them
    anchor.group.children.forEach((child) => {
      arInteractionManager.unregisterObject(child);
    });
    while (anchor.group.children.length > 0) {
      anchor.group.remove(anchor.group.children[0]);
    }

    // Track the last active anchor
    lastActiveAnchor = anchor;

    // 2. Spawn Object 1: Letter Model (Leased from preloaded pool)
    const hijaiyahObj = objectPool.lease(letter);
    if (hijaiyahObj) {
      hijaiyahObj.setInteractiveState();
      hijaiyahObj.root.position.set(0, 0, 0.05); // Centered on marker
      hijaiyahObj.root.rotation.set(Math.PI / 2, 0, 0); // Stand upright perpendicular to card
      
      hijaiyahObj.root.userData = { type: 'letter', audioFile: letter.audioFile };
      
      anchor.group.add(hijaiyahObj.root);
      arInteractionManager.registerObject(hijaiyahObj.root);
      
      hijaiyahObj.playEntrance();
      animController.register(hijaiyahObj);
    }

    // 3. Accumulate letter
    wordComposer.accumulate(letter);
  });

  // Handle word composition success to hide letters and spawn word model
  eventBus.on<TargetWord>('word:composed', (word) => {
    isWordComposed = true;

    // Hide all letter models on all visible markers
    markerManager.getVisibleAnchors().forEach((anchor) => {
      anchor.group.children.forEach((child) => {
        if (child.userData && child.userData.type === 'letter') {
          child.visible = false;
        }
      });
    });

    if (!lastActiveAnchor || !lastActiveAnchor.isVisible) return;

    // Spawn Object 2: Word Model (Loaded dynamically if exists)
    if (word.modelFile) {
      gltfLoader.load(
        `/assets/models/words/${word.modelFile}`,
        (gltf) => {
          // Double check if anchor is still tracked
          if (!lastActiveAnchor || !lastActiveAnchor.isVisible) return;
          // If a reset happened while loading, discard
          if (!isWordComposed) return;

          const wordRoot = gltf.scene;

          // Normalize size
          const box = new THREE.Box3().setFromObject(wordRoot);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scaleFactor = 0.4 / maxDim;
            wordRoot.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          // Center origin
          const scaledBox = new THREE.Box3().setFromObject(wordRoot);
          const center = new THREE.Vector3();
          scaledBox.getCenter(center);
          wordRoot.position.sub(center);

          // Position at X = 0.0 (center), Y = 0, Z = 0.05
          wordRoot.position.set(0, 0, 0.05);
          wordRoot.rotation.set(Math.PI / 2, 0, 0); // Stand upright perpendicular to card

          // Setup materials & shadows
          wordRoot.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = 0.2;
                child.material.metalness = 0.1;
              }
            }
          });

          wordRoot.userData = { type: 'word', audioFile: word.audioFile };
          
          lastActiveAnchor.group.add(wordRoot);
          arInteractionManager.registerObject(wordRoot);
          logger.info(`[main] Spawned word model ${word.modelFile} for composed word ${word.arabic}`);
        },
        undefined,
        (err) => {
          logger.error(`[main] Failed to load word model ${word.modelFile}:`, err);
        }
      );
    }
  });

  // Handle word reset (Ulangi button or auto-reset)
  eventBus.on('word:reset', () => {
    isWordComposed = false;

    // Clean up word models and make all letter models visible & centered again
    markerManager.getVisibleAnchors().forEach((anchor) => {
      const toRemove: THREE.Object3D[] = [];
      anchor.group.children.forEach((child) => {
        if (child.userData && child.userData.type === 'word') {
          toRemove.push(child);
        } else if (child.userData && child.userData.type === 'letter') {
          child.visible = true;
          child.position.set(0, 0, 0.05); // Recenter letter model
        }
      });

      toRemove.forEach((child) => {
        arInteractionManager.unregisterObject(child);
        anchor.group.remove(child);
      });
    });
  });

  // Handle marker lost event to clean up and unregister objects
  eventBus.on<MarkerFoundPayload>('marker:lost', ({ anchor }) => {
    anchor.group.children.forEach((child) => {
      arInteractionManager.unregisterObject(child);
    });
    while (anchor.group.children.length > 0) {
      anchor.group.remove(anchor.group.children[0]);
    }
  });



  // ── 6. AudioContext unlock on first tap ───────────────────
  const unlockAudio = (): void => {
    audioManager.unlock();
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click',      unlockAudio);
  };
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('click',      unlockAudio, { once: true });

  // ── 7. Start AR ───────────────────────────────────────────
  logger.info('[main] Starting AR engine…');
  await arEngine.start();
}

// Kick off when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch((err) => {
    logger.error('[main] Fatal error:', err);
  });
});
