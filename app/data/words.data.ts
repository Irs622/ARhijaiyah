// ============================================================
// words.data.ts — Curated Word List for Children
// ============================================================

export interface TargetWord {
  arabic: string;        // e.g. "باب"
  letters: string[];     // Arabic chars in order e.g. ['ب','ا','ب']
  translation: string;   // Indonesian/English
  audioFile?: string;    // word pronunciation mp3 (optional)
  modelFile?: string;    // word 3D model file (.glb) (optional)
  difficulty: 1 | 2 | 3; // 1 = easy, 3 = hard
}

export const TARGET_WORDS: TargetWord[] = [
  // === Difficulty 1 — 2-letter words ===
  { arabic: 'يد', letters: ['ي','د'], translation: 'Tangan', modelFile: 'yad.glb', difficulty: 1 },
  { arabic: 'أب', letters: ['ا','ب'], translation: 'Ayah', modelFile: 'ab.glb', difficulty: 1 },
  { arabic: 'أم', letters: ['ا','م'], translation: 'Ibu', modelFile: 'um.glb', difficulty: 1 },
  { arabic: 'عم', letters: ['ع','م'], translation: 'Paman', modelFile: 'am.glb', difficulty: 1 },
  { arabic: 'أخ', letters: ['ا','خ'], translation: 'Saudara', modelFile: 'akh.glb', difficulty: 1 },
  { arabic: 'دم', letters: ['د','م'], translation: 'Darah', modelFile: 'dam.glb', difficulty: 1 },

  // === Difficulty 2 — 3-letter words ===
  { arabic: 'باب', letters: ['ب','ا','ب'], translation: 'Pintu', modelFile: 'bab.glb', difficulty: 2 },
  { arabic: 'كتب', letters: ['ك','ت','ب'], translation: 'Buku', modelFile: 'kitab.glb', difficulty: 2 },
  { arabic: 'قلم', letters: ['ق','ل','م'], translation: 'Pena', modelFile: 'qalam.glb', difficulty: 2 },
  { arabic: 'نور', letters: ['ن','و','ر'], translation: 'Cahaya', modelFile: 'nur.glb', difficulty: 2 },
  { arabic: 'بيت', letters: ['ب','ي','ت'], translation: 'Rumah', modelFile: 'bait.glb', difficulty: 2 },
  { arabic: 'عسل', letters: ['ع','س','ل'], translation: 'Madu', modelFile: 'asal.glb', difficulty: 2 },
  { arabic: 'سمك', letters: ['س','م','ك'], translation: 'Ikan', modelFile: 'samak.glb', difficulty: 2 },
  { arabic: 'قمر', letters: ['ق','م','ر'], translation: 'Bulan', modelFile: 'qamar.glb', difficulty: 2 },
  { arabic: 'شمس', letters: ['ش','م','س'], translation: 'Matahari', modelFile: 'syams.glb', difficulty: 2 },
  { arabic: 'رجل', letters: ['ر','ج','ل'], translation: 'Kaki', modelFile: 'rijl.glb', difficulty: 2 },
  { arabic: 'ولد', letters: ['و','ل','د'], translation: 'Anak Laki-Laki', modelFile: 'walad.glb', difficulty: 2 },
  { arabic: 'بنت', letters: ['ب','ن','ت'], translation: 'Anak Perempuan', modelFile: 'bint.glb', difficulty: 2 },
  { arabic: 'عين', letters: ['ع','ي','ن'], translation: 'Mata', modelFile: 'ain.glb', difficulty: 2 },

  // === Difficulty 3 — 4-letter words ===
  { arabic: 'فرس', letters: ['ف','ر','س'], translation: 'Kuda', modelFile: 'faras.glb', difficulty: 3 },
  { arabic: 'نهر', letters: ['ن','ه','ر'], translation: 'Sungai', modelFile: 'nahr.glb', difficulty: 3 },
  { arabic: 'كلب', letters: ['ك','ل','ب'], translation: 'Anjing', modelFile: 'kalb.glb', difficulty: 3 },
  { arabic: 'جبل', letters: ['ج','ب','ل'], translation: 'Gunung', modelFile: 'jabal.glb', difficulty: 3 },
  { arabic: 'أرنب', letters: ['ا','ر','ن','ب'], translation: 'Kelinci', modelFile: 'arnab.glb', difficulty: 3 },
  { arabic: 'مسجد', letters: ['م','س','ج','د'], translation: 'Masjid', modelFile: 'masjid.glb', difficulty: 3 },
  { arabic: 'تفاح', letters: ['ت','ف','ا','ح'], translation: 'Apel', modelFile: 'tuffah.glb', difficulty: 3 },
  { arabic: 'حليب', letters: ['ح','ل','ي','ب'], translation: 'Susu', modelFile: 'halib.glb', difficulty: 3 },
];

/**
 * Check if a sequence of Arabic letters matches any target word.
 * Returns the matched word or null.
 */
export function matchWord(letters: string[]): TargetWord | null {
  const seq = letters.join('');
  return TARGET_WORDS.find((w) => w.letters.join('') === seq) ?? null;
}
