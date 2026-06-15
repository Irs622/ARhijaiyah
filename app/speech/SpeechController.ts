// ============================================================
// SpeechController.ts — Adapter: Web Speech API / Whisper.wasm
// ============================================================
//
// Design pattern: Adapter
//   This class abstracts the ASR backend so that Web Speech API
//   can be swapped for Whisper.wasm without touching business logic.
//
// Phase 6 — not active in Phase 1–5.
// ============================================================

import { eventBus } from '../core/EventBus';
import { PronunciationEvaluator } from './PronunciationEvaluator';
import { logger } from '../utils/logger';
import type { SpeechResultPayload } from './SpeechEvents';

export class SpeechController {
  private recognition: SpeechRecognition | null = null;
  private evaluator = new PronunciationEvaluator();
  private isListening = false;
  private targetWord = '';

  constructor() {
    const SpeechRecognitionAPI =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      logger.warn('[SpeechController] Web Speech API not supported on this device');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.lang = 'ar-SA'; // Arabic (Saudi Arabia)
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    this.bindRecognitionEvents();
    logger.info('[SpeechController] Web Speech API ready');
  }

  private bindRecognitionEvents(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence;
      const isFinal    = result.isFinal;

      const payload: SpeechResultPayload = { transcript, confidence, isFinal };
      eventBus.emit('speech:result', payload);

      if (isFinal) {
        this.evaluate(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      logger.error('[SpeechController] Recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      logger.debug('[SpeechController] Recognition ended');
    };
  }

  /** Set the word the user should pronounce before starting */
  setTarget(word: string): void {
    this.targetWord = word;
  }

  startListening(): void {
    if (!this.recognition || this.isListening) return;
    this.recognition.start();
    this.isListening = true;
    logger.info(`[SpeechController] Listening for: "${this.targetWord}"`);
  }

  stopListening(): void {
    if (!this.recognition || !this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
  }

  private evaluate(transcript: string): void {
    if (!this.targetWord) return;
    const result = this.evaluator.evaluate(transcript, this.targetWord);

    if (result.passed) {
      eventBus.emit('speech:pass', result);
      logger.info(`[SpeechController] PASS — score ${(result.score * 100).toFixed(0)}%`);
    } else {
      eventBus.emit('speech:fail', result);
      logger.info(`[SpeechController] FAIL — score ${(result.score * 100).toFixed(0)}%`);
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }
}
