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
  { arabic: 'يد', letters: ['ي','د'], translation: 'Tangan', audioFile: 'words/yad.mp3', modelFile: 'yad.glb', difficulty: 1 },
  { arabic: 'أب', letters: ['ا','ب'], translation: 'Ayah', audioFile: 'words/ab.mp3', modelFile: 'ab.glb', difficulty: 1 },
  { arabic: 'أم', letters: ['ا','م'], translation: 'Ibu', audioFile: 'words/um.mp3', modelFile: 'um.glb', difficulty: 1 },
  { arabic: 'عم', letters: ['ع','م'], translation: 'Paman', audioFile: 'words/am.mp3', modelFile: 'am.glb', difficulty: 1 },
  { arabic: 'أخ', letters: ['ا','خ'], translation: 'Saudara', audioFile: 'words/akh.mp3', modelFile: 'akh.glb', difficulty: 1 },
  { arabic: 'دم', letters: ['د','م'], translation: 'Darah', audioFile: 'words/dam.mp3', modelFile: 'dam.glb', difficulty: 1 },

  // === Difficulty 2 — 3-letter words ===
  { arabic: 'باب', letters: ['ب','ا','ب'], translation: 'Pintu', audioFile: 'words/bab.mp3', modelFile: 'bab.glb', difficulty: 2 },
  { arabic: 'كتب', letters: ['ك','ت','ب'], translation: 'Buku', audioFile: 'words/kitab.mp3', modelFile: 'kitab.glb', difficulty: 2 },
  { arabic: 'قلم', letters: ['ق','ل','م'], translation: 'Pena', audioFile: 'words/qalam.mp3', modelFile: 'qalam.glb', difficulty: 2 },
  { arabic: 'نور', letters: ['ن','و','ر'], translation: 'Cahaya', audioFile: 'words/nur.mp3', modelFile: 'nur.glb', difficulty: 2 },
  { arabic: 'بيت', letters: ['ب','ي','ت'], translation: 'Rumah', audioFile: 'words/bait.mp3', modelFile: 'bait.glb', difficulty: 2 },
  { arabic: 'عسل', letters: ['ع','س','ل'], translation: 'Madu', audioFile: 'words/asal.mp3', modelFile: 'asal.glb', difficulty: 2 },
  { arabic: 'سمك', letters: ['س','م','ك'], translation: 'Ikan', audioFile: 'words/samak.mp3', modelFile: 'samak.glb', difficulty: 2 },
  { arabic: 'قمر', letters: ['ق','م','ر'], translation: 'Bulan', audioFile: 'words/qamar.mp3', modelFile: 'qamar.glb', difficulty: 2 },
  { arabic: 'شمس', letters: ['ش','م','س'], translation: 'Matahari', audioFile: 'words/syams.mp3', modelFile: 'syams.glb', difficulty: 2 },
  { arabic: 'رجل', letters: ['ر','ج','ل'], translation: 'Kaki', audioFile: 'words/rijl.mp3', modelFile: 'rijl.glb', difficulty: 2 },
  { arabic: 'ولد', letters: ['و','ل','د'], translation: 'Anak Laki-Laki', audioFile: 'words/walad.mp3', modelFile: 'walad.glb', difficulty: 2 },
  { arabic: 'بنت', letters: ['ب','ن','ت'], translation: 'Anak Perempuan', audioFile: 'words/bint.mp3', modelFile: 'bint.glb', difficulty: 2 },
  { arabic: 'عين', letters: ['ع','ي','ن'], translation: 'Mata', audioFile: 'words/ain.mp3', modelFile: 'ain.glb', difficulty: 2 },

  // === Difficulty 3 — 4-letter words ===
  { arabic: 'فرس', letters: ['ف','ر','س'], translation: 'Kuda', audioFile: 'words/faras.mp3', modelFile: 'faras.glb', difficulty: 3 },
  { arabic: 'نهر', letters: ['ن','ه','ر'], translation: 'Sungai', audioFile: 'words/nahr.mp3', modelFile: 'nahr.glb', difficulty: 3 },
  { arabic: 'كلب', letters: ['ك','ل','ب'], translation: 'Anjing', audioFile: 'words/kalb.mp3', modelFile: 'kalb.glb', difficulty: 3 },
  { arabic: 'جبل', letters: ['ج','ب','ل'], translation: 'Gunung', audioFile: 'words/jabal.mp3', modelFile: 'jabal.glb', difficulty: 3 },
  { arabic: 'أرنب', letters: ['ا','ر','ن','ب'], translation: 'Kelinci', audioFile: 'words/arnab.mp3', modelFile: 'arnab.glb', difficulty: 3 },
  { arabic: 'مسجد', letters: ['م','س','ج','د'], translation: 'Masjid', audioFile: 'words/masjid.mp3', modelFile: 'masjid.glb', difficulty: 3 },
  { arabic: 'تفاح', letters: ['ت','ف','ا','ح'], translation: 'Apel', audioFile: 'words/tuffah.mp3', modelFile: 'tuffah.glb', difficulty: 3 },
  { arabic: 'حليب', letters: ['ح','ل','ي','ب'], translation: 'Susu', audioFile: 'words/halib.mp3', modelFile: 'halib.glb', difficulty: 3 },
];

/**
 * Check if a sequence of Arabic letters matches any target word.
 * Returns the matched word or null.
 */
export function matchWord(letters: string[]): TargetWord | null {
  const seq = letters.join('');
  return TARGET_WORDS.find((w) => w.letters.join('') === seq) ?? null;
}

/**
 * Find an associated word for a given Hijaiyah letter Arabic char.
 * Prioritizes words starting with the letter, then any word containing it.
 */
export function getAssociatedWordForLetter(letterArabic: string): TargetWord | null {
  // 1. Try to find a word that starts with this letter
  let word = TARGET_WORDS.find((w) => w.letters[0] === letterArabic);
  if (word) return word;

  // 2. Try to find any word that contains this letter
  word = TARGET_WORDS.find((w) => w.letters.includes(letterArabic));
  return word ?? null;
}
