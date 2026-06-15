// ============================================================
// TrackingEvents.ts — Typed Event Payload Definitions
// ============================================================

import type { MarkerAnchor } from './MarkerAnchor';
import type { HijaiyahLetter } from '../data/types';

export interface MarkerFoundPayload {
  anchor: MarkerAnchor;
  letter: HijaiyahLetter;
}

export interface MarkerLostPayload {
  anchor: MarkerAnchor;
  letter: HijaiyahLetter;
}
