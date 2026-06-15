// ============================================================
// device.utils.ts — Mobile Device Detection & Capabilities
// ============================================================

/** Returns device pixel ratio, capped at 2 for mobile perf */
export function getSafePixelRatio(): number {
  return Math.min(window.devicePixelRatio ?? 1, 2);
}

/** True if running on Android Chrome — primary target platform */
export function isAndroidChrome(): boolean {
  const ua = navigator.userAgent;
  return /Android/.test(ua) && /Chrome/.test(ua);
}

/** True if running on iOS Safari */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** True if the device is in portrait orientation */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

/** Check if WebGL2 is available — required for Three.js r150+ */
export function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

/** Check if the Vibration API is available */
export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/** Check if Web Speech API is available */
export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/** Register an orientation-change callback */
export function onOrientationChange(callback: (isPortrait: boolean) => void): void {
  window.addEventListener('resize', () => callback(isPortrait()));
}
