// ============================================================
// WordComposer.ts — Accumulate Letter Sequence & Validate
// ============================================================

import { matchWord, type TargetWord } from '../data/words.data';
import { eventBus } from '../core/EventBus';
import { logger } from '../utils/logger';
import type { HijaiyahLetter } from '../data/types';

export class WordComposer {
  private sequence: HijaiyahLetter[] = [];

  /** Called each time a new letter is added to PersistentCanvas */
  accumulate(letter: HijaiyahLetter): void {
    // Prevent consecutive identical letters (to filter out marker jitter)
    if (this.sequence.length > 0 && this.sequence[this.sequence.length - 1].id === letter.id) {
      logger.debug(`[WordComposer] Consecutive duplicate letter ${letter.name}, skipped`);
      return;
    }

    this.sequence.push(letter);
    logger.info(`[WordComposer] Sequence: ${this.sequence.map((l) => l.arabic).join(' ')}`);

    eventBus.emit('word:sequence-updated', { sequence: [...this.sequence] });

    // Check for a match after every new letter
    const result = this.validate();
    if (result) {
      logger.info(`[WordComposer] Word matched: ${result.arabic} (${result.translation})`);
      eventBus.emit('word:composed', result);
    }
  }

  /** Compare current sequence against target word list */
  validate(): TargetWord | null {
    const arabicLetters = this.sequence.map((l) => l.arabic);
    return matchWord(arabicLetters);
  }

  /** Get current letter sequence */
  getSequence(): HijaiyahLetter[] {
    return [...this.sequence];
  }

  /** Reset sequence — call after word success or manual reset */
  reset(): void {
    this.sequence = [];
    eventBus.emit('word:reset');
    logger.info('[WordComposer] Reset');
  }
}
