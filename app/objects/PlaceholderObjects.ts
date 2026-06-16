// ============================================================
// PlaceholderObjects.ts — Procedural 3D Fallback Models
// ============================================================

import * as THREE from 'three';

/**
 * Creates a beautifully extruded and beveled 3D Gold Star
 */
export function create3DStar(color = 0xFFD700): THREE.Mesh {
  const shape = new THREE.Shape();
  const spikes = 5;
  const outerRadius = 0.15;
  const innerRadius = 0.06;
  const rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  shape.moveTo(0, -outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = Math.cos(rot + i * step * 2) * outerRadius;
    let y = Math.sin(rot + i * step * 2) * outerRadius;
    shape.lineTo(x, y);

    x = Math.cos(rot + i * step * 2 + step) * innerRadius;
    y = Math.sin(rot + i * step * 2 + step) * innerRadius;
    shape.lineTo(x, y);
  }
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.008,
    bevelSegments: 3,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.15,
    metalness: 0.7, // High metalness for a gold trophy look
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Creates a detailed 3D Gift Box with Ribbon and Ribbon Knot
 */
export function create3DGiftBox(): THREE.Group {
  const group = new THREE.Group();

  // Box Body
  const bodyGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xE91E63, // Hot Pink box
    roughness: 0.2,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Lid
  const lidGeo = new THREE.BoxGeometry(0.22, 0.05, 0.22);
  const lidMat = new THREE.MeshStandardMaterial({
    color: 0xE91E63,
    roughness: 0.2,
    metalness: 0.1,
  });
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.y = 0.11;
  lid.castShadow = true;
  lid.receiveShadow = true;
  group.add(lid);

  // Ribbon (Vertical & Horizontal stripes)
  const ribbonGeoX = new THREE.BoxGeometry(0.035, 0.21, 0.21);
  const ribbonGeoZ = new THREE.BoxGeometry(0.21, 0.21, 0.035);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xFFEB3B, // Yellow ribbon
    roughness: 0.1,
    metalness: 0.3,
  });
  const ribbonX = new THREE.Mesh(ribbonGeoX, ribbonMat);
  const ribbonZ = new THREE.Mesh(ribbonGeoZ, ribbonMat);
  ribbonX.position.y = 0.005;
  ribbonZ.position.y = 0.005;
  group.add(ribbonX, ribbonZ);

  // Ribbon Knot on top
  const knotGeo = new THREE.TorusGeometry(0.03, 0.01, 8, 24);
  const knot1 = new THREE.Mesh(knotGeo, ribbonMat);
  const knot2 = new THREE.Mesh(knotGeo, ribbonMat);
  knot1.position.set(-0.02, 0.14, 0);
  knot1.rotation.y = Math.PI / 4;
  knot2.position.set(0.02, 0.14, 0);
  knot2.rotation.y = -Math.PI / 4;
  group.add(knot1, knot2);

  return group;
}
