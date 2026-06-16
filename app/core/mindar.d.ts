// Type declaration for MindAR (no official @types package available)
declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import * as THREE from 'three';

  interface MindARThreeOptions {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
    filterMinCF?: number;
    filterBeta?: number;
    warmupTolerance?: number;
    missTolerance?: number;
  }

  export interface MindAnchor {
    group: THREE.Group;
    cssGroup: any;
    onTargetFound: (() => void) | null;
    onTargetLost: (() => void) | null;
  }

  export class MindARThree {
    constructor(options: MindARThreeOptions);

    renderer: THREE.WebGLRenderer;
    scene:    THREE.Scene;
    camera:   THREE.PerspectiveCamera;
    anchors:  MindAnchor[];

    start(): Promise<void>;
    stop(): void;
    addAnchor(targetIndex: number): MindAnchor;
  }
}
