// ============================================================
// math.utils.ts — Transform Helpers
// ============================================================

import * as THREE from 'three';

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Convert degrees to radians */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Extract world-space position from a Matrix4 */
export function positionFromMatrix(matrix: THREE.Matrix4): THREE.Vector3 {
  const pos = new THREE.Vector3();
  pos.setFromMatrixPosition(matrix);
  return pos;
}

/** Smoothly interpolate two Matrix4 values */
export function lerpMatrix4(
  out: THREE.Matrix4,
  a: THREE.Matrix4,
  b: THREE.Matrix4,
  t: number,
): THREE.Matrix4 {
  const posA = new THREE.Vector3();
  const posB = new THREE.Vector3();
  const quatA = new THREE.Quaternion();
  const quatB = new THREE.Quaternion();
  const scaleA = new THREE.Vector3();
  const scaleB = new THREE.Vector3();

  a.decompose(posA, quatA, scaleA);
  b.decompose(posB, quatB, scaleB);

  posA.lerp(posB, t);
  quatA.slerp(quatB, t);
  scaleA.lerp(scaleB, t);

  return out.compose(posA, quatA, scaleA);
}
