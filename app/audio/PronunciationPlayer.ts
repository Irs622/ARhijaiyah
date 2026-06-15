// ============================================================
// PronunciationPlayer.ts — Letter & Word Audio Playback
// ============================================================

import { eventBus } from '../core/EventBus';
import { AudioManager } from './AudioManager';
import { HIJAIYAH_LETTERS } from '../data/hijaiyah.data';
import { TARGET_WORDS } from '../data/words.data';
import { logger } from '../utils/logger';
import type { MarkerFoundPayload } from '../tracking/TrackingEvents';
import type { TargetWord } from '../data/words.data';

export class PronunciationPlayer {
  constructor(private audio: AudioManager) {
    this.bindEvents();
  }

  /** Preload all letter + word audio files at startup */
  async preload(): Promise<void> {
    const letterFiles = HIJAIYAH_LETTERS.map((l) => l.audioFile);
    const wordFiles   = TARGET_WORDS.map((w) => w.audioFile);
    await this.audio.loadAll([...letterFiles, ...wordFiles]);
    logger.info('[PronunciationPlayer] All audio preloaded');
  }

  private bindEvents(): void {
    // Play letter audio when a marker is detected
    eventBus.on<MarkerFoundPayload>('marker:found', ({ letter }) => {
      this.playLetter(letter.audioFile);
    });

    // Play word audio when a word is composed
    eventBus.on<TargetWord>('word:composed', (word) => {
      // Short delay — let the success animation start first
      setTimeout(() => this.playWord(word.audioFile), 400);
    });
  }

  playLetter(audioFile: string): void {
    this.audio.play(audioFile, 1.0);
    logger.debug(`[PronunciationPlayer] Letter: ${audioFile}`);
  }

  playWord(audioFile: string): void {
    this.audio.play(audioFile, 1.0);
    logger.debug(`[PronunciationPlayer] Word: ${audioFile}`);
  }
}
