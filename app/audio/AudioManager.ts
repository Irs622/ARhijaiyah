// ============================================================
// AudioManager.ts — Web Audio API Context & Buffer Pool
// ============================================================

import { logger } from '../utils/logger';

const AUDIO_BASE_PATH = '/assets/audio/';

export class AudioManager {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private gainNode: GainNode | null = null;

  /**
   * Must be called from a user gesture (e.g. tap) to unlock AudioContext
   * on mobile browsers (iOS/Android restriction).
   */
  unlock(): void {
    if (this.context) return;
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
    this.gainNode.gain.value = 1.0;
    logger.info('[AudioManager] AudioContext unlocked');
  }

  /** Preload a single audio file into the buffer pool */
  async load(filename: string): Promise<void> {
    if (!this.context) {
      logger.warn('[AudioManager] AudioContext not unlocked yet');
      return;
    }
    if (this.buffers.has(filename)) return;

    try {
      const res = await fetch(`${AUDIO_BASE_PATH}${filename}`);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.buffers.set(filename, audioBuffer);
      logger.debug(`[AudioManager] Loaded ${filename}`);
    } catch (err) {
      logger.error(`[AudioManager] Failed to load ${filename}:`, err);
    }
  }

  /** Preload an array of audio files */
  async loadAll(filenames: string[]): Promise<void> {
    await Promise.all(filenames.map((f) => this.load(f)));
    logger.info(`[AudioManager] ${filenames.length} audio files loaded`);
  }

  /** Play a buffered audio file by filename */
  play(filename: string, volume = 1.0): void {
    if (!this.context || !this.gainNode) {
      logger.warn('[AudioManager] Cannot play — context not unlocked');
      return;
    }

    const buffer = this.buffers.get(filename);
    if (!buffer) {
      logger.warn(`[AudioManager] Buffer not found for ${filename}`);
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    // Per-sound gain for volume control
    const soundGain = this.context.createGain();
    soundGain.gain.value = volume;
    source.connect(soundGain);
    soundGain.connect(this.gainNode);

    source.start(0);
    logger.debug(`[AudioManager] Playing ${filename}`);
  }

  setMasterVolume(value: number): void {
    if (this.gainNode) this.gainNode.gain.value = Math.max(0, Math.min(1, value));
  }

  isReady(): boolean {
    return this.context !== null && this.context.state === 'running';
  }
}
