// ============================================================
// hijaiyah.data.ts — Complete 28-Letter Registry
// ============================================================

import type { HijaiyahLetter } from './types';

export const HIJAIYAH_LETTERS: HijaiyahLetter[] = [
  { id: 0,  arabic: 'ا', name: 'Alif',   transliteration: 'a',   audioFile: 'alif.mp3',   modelFile: 'alif.glb',   markerIndex: 0  },
  { id: 1,  arabic: 'ب', name: 'Ba',     transliteration: 'b',   audioFile: 'ba.mp3',     modelFile: 'ba.glb',     markerIndex: 1  },
  { id: 2,  arabic: 'ت', name: 'Ta',     transliteration: 't',   audioFile: 'ta.mp3',     modelFile: 'ta.glb',     markerIndex: 2  },
  { id: 3,  arabic: 'ث', name: 'Tsa',    transliteration: 'ts',  audioFile: 'tsa.mp3',    modelFile: 'tsa.glb',    markerIndex: 3  },
  { id: 4,  arabic: 'ج', name: 'Jim',    transliteration: 'j',   audioFile: 'jim.mp3',    modelFile: 'jim.glb',    markerIndex: 4  },
  { id: 5,  arabic: 'ح', name: 'Ha',     transliteration: 'h',   audioFile: 'ha.mp3',     modelFile: 'ha.glb',     markerIndex: 5  },
  { id: 6,  arabic: 'خ', name: 'Kha',    transliteration: 'kh',  audioFile: 'kha.mp3',    modelFile: 'kha.glb',    markerIndex: 6  },
  { id: 7,  arabic: 'د', name: 'Dal',    transliteration: 'd',   audioFile: 'dal.mp3',    modelFile: 'dal.glb',    markerIndex: 7  },
  { id: 8,  arabic: 'ذ', name: 'Dzal',   transliteration: 'dz',  audioFile: 'dzal.mp3',   modelFile: 'dzal.glb',   markerIndex: 8  },
  { id: 9,  arabic: 'ر', name: 'Ra',     transliteration: 'r',   audioFile: 'ra.mp3',     modelFile: 'ra.glb',     markerIndex: 9  },
  { id: 10, arabic: 'ز', name: 'Zai',    transliteration: 'z',   audioFile: 'zai.mp3',    modelFile: 'zai.glb',    markerIndex: 10 },
  { id: 11, arabic: 'س', name: 'Sin',    transliteration: 's',   audioFile: 'sin.mp3',    modelFile: 'sin.glb',    markerIndex: 11 },
  { id: 12, arabic: 'ش', name: 'Syin',   transliteration: 'sy',  audioFile: 'syin.mp3',   modelFile: 'syin.glb',   markerIndex: 12 },
  { id: 13, arabic: 'ص', name: 'Shad',   transliteration: 'sh',  audioFile: 'shad.mp3',   modelFile: 'shad.glb',   markerIndex: 13 },
  { id: 14, arabic: 'ض', name: 'Dhad',   transliteration: 'dh',  audioFile: 'dhad.mp3',   modelFile: 'dhad.glb',   markerIndex: 14 },
  { id: 15, arabic: 'ط', name: 'Tha',    transliteration: 'th',  audioFile: 'tha.mp3',    modelFile: 'tha.glb',    markerIndex: 15 },
  { id: 16, arabic: 'ظ', name: 'Zha',    transliteration: 'zh',  audioFile: 'zha.mp3',    modelFile: 'zha.glb',    markerIndex: 16 },
  { id: 17, arabic: 'ع', name: 'Ain',    transliteration: "'",   audioFile: 'ain.mp3',    modelFile: 'ain.glb',    markerIndex: 17 },
  { id: 18, arabic: 'غ', name: 'Ghain',  transliteration: 'gh',  audioFile: 'ghain.mp3',  modelFile: 'ghain.glb',  markerIndex: 18 },
  { id: 19, arabic: 'ف', name: 'Fa',     transliteration: 'f',   audioFile: 'fa.mp3',     modelFile: 'fa.glb',     markerIndex: 19 },
  { id: 20, arabic: 'ق', name: 'Qaf',    transliteration: 'q',   audioFile: 'qaf.mp3',    modelFile: 'qaf.glb',    markerIndex: 20 },
  { id: 21, arabic: 'ك', name: 'Kaf',    transliteration: 'k',   audioFile: 'kaf.mp3',    modelFile: 'kaf.glb',    markerIndex: 21 },
  { id: 22, arabic: 'ل', name: 'Lam',    transliteration: 'l',   audioFile: 'lam.mp3',    modelFile: 'lam.glb',    markerIndex: 22 },
  { id: 23, arabic: 'م', name: 'Mim',    transliteration: 'm',   audioFile: 'mim.mp3',    modelFile: 'mim.glb',    markerIndex: 23 },
  { id: 24, arabic: 'ن', name: 'Nun',    transliteration: 'n',   audioFile: 'nun.mp3',    modelFile: 'nun.glb',    markerIndex: 24 },
  { id: 25, arabic: 'و', name: 'Waw',    transliteration: 'w',   audioFile: 'waw.mp3',    modelFile: 'waw.glb',    markerIndex: 25 },
  { id: 26, arabic: 'ه', name: 'Ha',     transliteration: 'h',   audioFile: 'ha2.mp3',    modelFile: 'ha2.glb',    markerIndex: 26 },
  { id: 27, arabic: 'ي', name: 'Ya',     transliteration: 'y',   audioFile: 'ya.mp3',     modelFile: 'ya.glb',     markerIndex: 27 },
];

/** Look up a letter by MindAR target index */
export function getLetterByMarkerIndex(idx: number): HijaiyahLetter | undefined {
  return HIJAIYAH_LETTERS.find((l) => l.markerIndex === idx);
}

/** Look up a letter by Arabic character */
export function getLetterByArabic(arabic: string): HijaiyahLetter | undefined {
  return HIJAIYAH_LETTERS.find((l) => l.arabic === arabic);
}
