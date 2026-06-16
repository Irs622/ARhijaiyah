// ============================================================
// words.data.ts — Curated Word List for Children
// ============================================================

export interface TargetWord {
  arabic: string;        // e.g. "باب"
  letters: string[];     // Arabic chars in order e.g. ['ب','ا','ب']
  translation: string;   // Indonesian/English
  audioFile?: string;    // word pronunciation mp3 (optional)
  difficulty: 1 | 2 | 3; // 1 = easy, 3 = hard
}

export const TARGET_WORDS: TargetWord[] = [
  // === Difficulty 1 — 2-letter words ===
  { arabic: 'يد', letters: ['ي','د'], translation: 'Tangan', difficulty: 1 },
  { arabic: 'أب', letters: ['ا','ب'], translation: 'Ayah', difficulty: 1 },
  { arabic: 'أم', letters: ['ا','م'], translation: 'Ibu', difficulty: 1 },
  { arabic: 'عم', letters: ['ع','م'], translation: 'Paman', difficulty: 1 },
  { arabic: 'أخ', letters: ['ا','خ'], translation: 'Saudara', difficulty: 1 },
  { arabic: 'دم', letters: ['د','م'], translation: 'Darah', difficulty: 1 },

  // === Difficulty 2 — 3-letter words ===
  { arabic: 'باب', letters: ['ب','ا','ب'], translation: 'Pintu', difficulty: 2 },
  { arabic: 'كتب', letters: ['ك','ت','ب'], translation: 'Buku', difficulty: 2 },
  { arabic: 'قلم', letters: ['ق','ل','م'], translation: 'Pena', difficulty: 2 },
  { arabic: 'نور', letters: ['ن','و','ر'], translation: 'Cahaya', difficulty: 2 },
  { arabic: 'بيت', letters: ['ب','ي','ت'], translation: 'Rumah', difficulty: 2 },
  { arabic: 'عسل', letters: ['ع','س','ل'], translation: 'Madu', difficulty: 2 },
  { arabic: 'سمك', letters: ['س','م','ك'], translation: 'Ikan', difficulty: 2 },
  { arabic: 'قمر', letters: ['ق','م','ر'], translation: 'Bulan', difficulty: 2 },
  { arabic: 'شمس', letters: ['ش','م','س'], translation: 'Matahari', difficulty: 2 },
  { arabic: 'رجل', letters: ['ر','ج','ل'], translation: 'Kaki', difficulty: 2 },
  { arabic: 'ولد', letters: ['و','ل','د'], translation: 'Anak Laki-Laki', difficulty: 2 },
  { arabic: 'بنت', letters: ['ب','ن','ت'], translation: 'Anak Perempuan', difficulty: 2 },
  { arabic: 'عين', letters: ['ع','ي','ن'], translation: 'Mata', difficulty: 2 },

  // === Difficulty 3 — 4-letter words ===
  { arabic: 'فرس', letters: ['ف','ر','س'], translation: 'Kuda', difficulty: 3 },
  { arabic: 'نهر', letters: ['ن','ه','ر'], translation: 'Sungai', difficulty: 3 },
  { arabic: 'كلب', letters: ['ك','ل','ب'], translation: 'Anjing', difficulty: 3 },
  { arabic: 'جبل', letters: ['ج','ب','ل'], translation: 'Gunung', difficulty: 3 },
  { arabic: 'أرنب', letters: ['ا','ر','ن','ب'], translation: 'Kelinci', difficulty: 3 },
  { arabic: 'مسجد', letters: ['م','س','ج','د'], translation: 'Masjid', difficulty: 3 },
  { arabic: 'تفاح', letters: ['ت','ف','ا','ح'], translation: 'Apel', difficulty: 3 },
  { arabic: 'حليب', letters: ['ح','ل','ي','ب'], translation: 'Susu', difficulty: 3 },
];

/**
 * Check if a sequence of Arabic letters matches any target word.
 * Returns the matched word or null.
 */
export function matchWord(letters: string[]): TargetWord | null {
  const seq = letters.join('');
  return TARGET_WORDS.find((w) => w.letters.join('') === seq) ?? null;
}
