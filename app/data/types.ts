// ============================================================
// types.ts — Shared TypeScript Interfaces
// ============================================================

export interface HijaiyahLetter {
  id: number;           // 0–27
  arabic: string;       // e.g. "ا"
  name: string;         // e.g. "Alif"
  transliteration: string; // e.g. "a"
  audioFile: string;    // e.g. "alif.mp3"
  modelFile: string;    // e.g. "alif.glb"
  markerIndex: number;  // MindAR target index
}

export interface LetterSnapshotData {
  letter: HijaiyahLetter;
  matrixWorld: number[]; // flat 16-element Matrix4
  timestamp: number;
}

export interface WordResult {
  matched: boolean;
  word?: string;        // Arabic word if matched
  translation?: string; // English/Indonesian translation
  letters: HijaiyahLetter[];
}

export interface EvalResult {
  transcript: string;
  target: string;
  score: number;        // 0.0 – 1.0
  passed: boolean;
}

export interface SessionEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  sessionId: string;
}

export type HUDState = 'idle' | 'tracking' | 'word-complete' | 'speech';

export type AREvent =
  | 'marker:found'
  | 'marker:lost'
  | 'word:composed'
  | 'word:reset'
  | 'speech:result'
  | 'speech:pass'
  | 'speech:fail'
  | 'app:ready'
  | 'app:error';
