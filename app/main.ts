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
import { PersistentCanvas }     from './persistence/PersistentCanvas';
import { WordComposer }         from './persistence/WordComposer';
import { LetterSnapshot }       from './persistence/LetterSnapshot';
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
  const persistentCanvas   = new PersistentCanvas();
  const wordComposer       = new WordComposer();
  const markerManager      = new MarkerManager(arEngine);
  const audioManager       = new AudioManager();
  const pronunciationPlayer = new PronunciationPlayer(audioManager);

  // UI — instantiated after DOM ready
  new HUDManager();
  new WordStrip();
  new FeedbackOverlay();

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
    // Lease the pre-loaded mesh
    const hijaiyahObj = objectPool.lease(letter);
    if (!hijaiyahObj) return;

    // Add to live AR scene under MindAR anchor group
    anchor.group.add(hijaiyahObj.root);
    hijaiyahObj.playEntrance();
    animController.register(hijaiyahObj);

    // After entrance animation, freeze into persistent canvas
    setTimeout(() => {
      // Transition live object to persistent state to reset pose and stop animation
      hijaiyahObj.toPersistentMaterial();

      const snapshot = new LetterSnapshot(
        letter,
        anchor.worldMatrix, // ← world-space, not camera-relative
        hijaiyahObj.root.clone(),
      );

      persistentCanvas.addLetterSnapshot(snapshot);
      wordComposer.accumulate(letter);
    }, 800); // wait for entrance animation to complete
  });

  // Plug persistent canvas into render loop
  eventBus.on<{ delta: number }>('tick', () => {
    persistentCanvas.render(
      arEngine.getRenderer().getWebGLRenderer(),
      arEngine.getSceneManager().camera,
    );
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
