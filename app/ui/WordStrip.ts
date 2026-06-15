// ============================================================
// WordStrip.ts — Live Right-to-Left Letter Display
// ============================================================

import { eventBus } from '../core/EventBus';
import type { HijaiyahLetter } from '../data/types';
import type { TargetWord } from '../data/words.data';

interface SequencePayload {
  sequence: HijaiyahLetter[];
}

export class WordStrip {
  private container: HTMLElement;
  private sequence: HijaiyahLetter[] = [];

  constructor() {
    this.container = document.getElementById('word-strip')!;
    this.bindEvents();
  }

  private bindEvents(): void {
    eventBus.on<SequencePayload>('word:sequence-updated', ({ sequence }) => {
      this.sequence = sequence;
      this.render();
    });

    eventBus.on<TargetWord>('word:composed', (word) => {
      this.renderSuccess(word);
    });

    eventBus.on('word:reset', () => {
      this.sequence = [];
      this.render();
    });
  }

  private render(): void {
    if (!this.container) return;

    // Arabic is RTL — display letters right-to-left using flex-direction: row-reverse
    this.container.innerHTML = this.sequence
      .map(
        (letter) => `
          <div class="strip-letter strip-letter--active" data-letter="${letter.id}">
            <span class="strip-letter__arabic">${letter.arabic}</span>
            <span class="strip-letter__name">${letter.name}</span>
          </div>`,
      )
      .join('');
  }

  private renderSuccess(word: TargetWord): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="strip-word-success">
        <span class="strip-word-success__arabic">${word.arabic}</span>
        <span class="strip-word-success__translation">${word.translation}</span>
      </div>`;

    this.container.classList.add('strip--success');
    setTimeout(() => this.container.classList.remove('strip--success'), 2000);
  }
}
