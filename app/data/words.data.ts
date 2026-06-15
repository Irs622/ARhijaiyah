// ============================================================
// words.data.ts — Curated Word List for Children
// ============================================================

export interface TargetWord {
  arabic: string;        // e.g. "باب"
  letters: string[];     // Arabic chars in order e.g. ['ب','ا','ب']
  translation: string;   // Indonesian/English
  audioFile: string;     // word pronunciation mp3
  difficulty: 1 | 2 | 3; // 1 = easy, 3 = hard
}

export const TARGET_WORDS: TargetWord[] = [
  // === Difficulty 1 — 2-letter words ===
  { arabic: 'يد', letters: ['ي','د'], translation: 'Tangan', audioFile: 'yad.mp3', difficulty: 1 },
  { arabic: 'أب', letters: ['ا','ب'], translation: 'Ayah', audioFile: 'ab.mp3', difficulty: 1 },
  { arabic: 'أم', letters: ['ا','م'], translation: 'Ibu', audioFile: 'um.mp3', difficulty: 1 },

  // === Difficulty 2 — 3-letter words ===
  { arabic: 'باب', letters: ['ب','ا','ب'], translation: 'Pintu', audioFile: 'bab.mp3', difficulty: 2 },
  { arabic: 'كتب', letters: ['ك','ت','ب'], translation: 'Buku', audioFile: 'kitab.mp3', difficulty: 2 },
  { arabic: 'قلم', letters: ['ق','ل','م'], translation: 'Pena', audioFile: 'qalam.mp3', difficulty: 2 },
  { arabic: 'نور', letters: ['ن','و','ر'], translation: 'Cahaya', audioFile: 'nur.mp3', difficulty: 2 },
  { arabic: 'بيت', letters: ['ب','ي','ت'], translation: 'Rumah', audioFile: 'bait.mp3', difficulty: 2 },
  { arabic: 'ماء', letters: ['م','ا','ء'], translation: 'Air', audioFile: 'maa.mp3', difficulty: 2 },
  { arabic: 'سمك', letters: ['س','م','ك'], translation: 'Ikan', audioFile: 'samak.mp3', difficulty: 2 },
  { arabic: 'قمر', letters: ['ق','م','ر'], translation: 'Bulan', audioFile: 'qamar.mp3', difficulty: 2 },
  { arabic: 'شمس', letters: ['ش','م','س'], translation: 'Matahari', audioFile: 'syams.mp3', difficulty: 2 },
  { arabic: 'رجل', letters: ['ر','ج','ل'], translation: 'Kaki', audioFile: 'rijl.mp3', difficulty: 2 },

  // === Difficulty 3 — 4-letter words ===
  { arabic: 'فرس', letters: ['ف','ر','س'], translation: 'Kuda', audioFile: 'faras.mp3', difficulty: 3 },
  { arabic: 'نهر', letters: ['ن','ه','ر'], translation: 'Sungai', audioFile: 'nahr.mp3', difficulty: 3 },
  { arabic: 'كلب', letters: ['ك','ل','ب'], translation: 'Anjing', audioFile: 'kalb.mp3', difficulty: 3 },
  { arabic: 'جبل', letters: ['ج','ب','ل'], translation: 'Gunung', audioFile: 'jabal.mp3', difficulty: 3 },
];

/**
 * Check if a sequence of Arabic letters matches any target word.
 * Returns the matched word or null.
 */
export function matchWord(letters: string[]): TargetWord | null {
  const seq = letters.join('');
  return TARGET_WORDS.find((w) => w.letters.join('') === seq) ?? null;
}
