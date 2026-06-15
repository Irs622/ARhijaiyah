// ============================================================
// SpeechEvents.ts — Typed Speech Event Payloads
// ============================================================

export interface SpeechResultPayload {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechEvalPayload {
  transcript: string;
  target: string;
  score: number;       // 0.0 – 1.0
  passed: boolean;
}
