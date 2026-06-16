// ============================================================
// PronunciationEvaluator.ts — Phonetic Scoring Engine
// ============================================================
//
// Strategy:
//   1. Normalise both strings (strip diacritics, lowercase)
//   2. Compute Levenshtein edit distance
//   3. Convert to similarity score (0.0 – 1.0)
//
// Future: Replace with a proper Arabic phoneme model or
//         Whisper.wasm confidence scores.
// ============================================================

import type { EvalResult } from '../data/types';

export class PronunciationEvaluator {
  private PASS_THRESHOLD = 0.7; // 70% similarity required

  /**
   * Evaluate a speech transcript against the target word.
   * Returns an EvalResult with a 0.0–1.0 score and pass/fail.
   */
  evaluate(transcript: string, target: string): EvalResult {
    const normTranscript = this.normalise(transcript);
    const normTarget     = this.normalise(target);
    const score          = this.similarityScore(normTranscript, normTarget);

    return {
      transcript,
      target,
      score,
      passed: score >= this.PASS_THRESHOLD,
    };
  }

  /** Strip Arabic diacritics (tashkeel) and normalise whitespace */
  private normalise(text: string): string {
    return text
      .replace(/[\u064B-\u065F]/g, '') // strip tashkeel
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /** 1 - (levenshtein / maxLength) → similarity score */
  private similarityScore(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1.0;
    const dist = this.levenshtein(a, b);
    return 1 - dist / maxLen;
  }

  /** Classic dynamic-programming Levenshtein distance */
  private levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[m][n];
  }

  setPassThreshold(threshold: number): void {
    // Allow threshold to be adjusted for research study configurations
    this.PASS_THRESHOLD = Math.max(0, Math.min(1, threshold));
  }
}
