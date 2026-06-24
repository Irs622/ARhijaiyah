// ============================================================
// ARInteractionManager.ts — Touch Drag, Scale & Tap Gestures
// ============================================================

import * as THREE from 'three';
import { logger } from '../utils/logger';

export interface ARInteractionConfig {
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  onPlayAudio: (audioFile: string) => void;
  onPlaySuccess: () => void;
}

export class ARInteractionManager {
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera;
  private config: ARInteractionConfig;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  // List of root-level interactive objects (e.g. Letter, Word, Star models)
  private interactiveObjects: THREE.Object3D[] = [];

  // Gesture tracking state
  private activeObject: THREE.Object3D | null = null;
  private isDragging = false;
  private touchStartTime = 0;
  private touchStartPos = new THREE.Vector2();
  
  private initialObjectPos = new THREE.Vector3();
  private localDragOffset = new THREE.Vector3();
  private initialObjectScale = new THREE.Vector3();
  private initialPinchDistance = 0;

  constructor(config: ARInteractionConfig) {
    this.canvas = config.canvas;
    this.camera = config.camera;
    this.config = config;

    this.setupListeners();
    logger.info('[ARInteractionManager] Initialized');
  }

  /** Register objects that can be interacted with */
  registerObject(object: THREE.Object3D): void {
    if (!this.interactiveObjects.includes(object)) {
      this.interactiveObjects.push(object);
    }
  }

  /** Unregister an object */
  unregisterObject(object: THREE.Object3D): void {
    const idx = this.interactiveObjects.indexOf(object);
    if (idx !== -1) {
      this.interactiveObjects.splice(idx, 1);
    }
  }

  /** Clear all registered interactive objects */
  clear(): void {
    this.interactiveObjects = [];
    this.activeObject = null;
    this.isDragging = false;
    this.initialPinchDistance = 0;
  }

  private setupListeners(): void {
    // ── 1. Pointer (Mouse/Touch Single Pointer) Down ──────────────
    this.canvas.addEventListener('pointerdown', (e) => {
      // Ignore if multi-touch (let touchstart handle it)
      if (!e.isPrimary) return;

      this.updatePointerCoords(e.clientX, e.clientY);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        // Find the root-level registered object
        const rootObj = this.findParentInteractiveObject(intersects[0].object);
        if (rootObj) {
          e.preventDefault();
          this.activeObject = rootObj;
          this.isDragging = false;
          this.touchStartTime = performance.now();
          this.touchStartPos.set(e.clientX, e.clientY);
          this.initialObjectPos.copy(rootObj.position);
          this.initialObjectScale.copy(rootObj.scale);

          // Setup drag plane projection relative to the parent coordinate space (local Z=0 plane)
          const parent = rootObj.parent;
          if (parent) {
            const tempMatrix = new THREE.Matrix4();
            tempMatrix.copy(parent.matrixWorld).invert();
            const localRay = this.raycaster.ray.clone().applyMatrix4(tempMatrix);
            // Local plane parallel to the card at the object's local Z offset
            const localPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -rootObj.position.z);
            const localIntersection = new THREE.Vector3();
            if (localRay.intersectPlane(localPlane, localIntersection)) {
              this.localDragOffset.copy(rootObj.position).sub(localIntersection);
            }
          }
          this.canvas.setPointerCapture(e.pointerId);
        }
      }
    });

    // ── 2. Pointer Move (Dragging) ───────────────────────────────
    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.activeObject || !e.isPrimary) return;

      this.updatePointerCoords(e.clientX, e.clientY);

      // Check threshold to differentiate drag from tap
      const dist = Math.hypot(e.clientX - this.touchStartPos.x, e.clientY - this.touchStartPos.y);
      if (!this.isDragging && dist > 8) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        e.preventDefault();
        const parent = this.activeObject.parent;
        if (parent) {
          const tempMatrix = new THREE.Matrix4();
          tempMatrix.copy(parent.matrixWorld).invert();
          
          this.raycaster.setFromCamera(this.pointer, this.camera);
          const localRay = this.raycaster.ray.clone().applyMatrix4(tempMatrix);
          const localPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -this.initialObjectPos.z);
          const localIntersection = new THREE.Vector3();
          
          if (localRay.intersectPlane(localPlane, localIntersection)) {
            // New position = intersection point + original center offset
            this.activeObject.position.copy(localIntersection).add(this.localDragOffset);
            
            // Limit movement range so objects don't slide off screen limits
            this.activeObject.position.x = Math.max(-1.5, Math.min(1.5, this.activeObject.position.x));
            this.activeObject.position.y = Math.max(-1.5, Math.min(1.5, this.activeObject.position.y));
          }
        }
      }
    });

    // ── 3. Pointer Up (Tap Detection & Release) ───────────────────
    this.canvas.addEventListener('pointerup', (e) => {
      if (!this.activeObject || !e.isPrimary) return;

      this.canvas.releasePointerCapture(e.pointerId);
      
      const duration = performance.now() - this.touchStartTime;
      if (!this.isDragging && duration < 250) {
        // Successful tap! Trigger audio based on type
        const data = this.activeObject.userData;
        logger.debug('[ARInteractionManager] Tapped object of type:', data.type);
        
        if (data.type === 'letter' && data.audioFile) {
          this.config.onPlayAudio(data.audioFile);
        } else if (data.type === 'word' && data.audioFile) {
          this.config.onPlayAudio(data.audioFile);
        } else if (data.type === 'star') {
          this.config.onPlaySuccess();
        }
      }

      this.activeObject = null;
      this.isDragging = false;
    });

    this.canvas.addEventListener('pointercancel', () => {
      this.activeObject = null;
      this.isDragging = false;
    });

    // ── 4. Mobile Multi-Touch (Pinch‑to‑Scale) ──────────────────
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2 && this.interactiveObjects.length > 0) {
        // Raycast at the midpoint of the two touches to select an object
        const x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        this.updatePointerCoords(x, y);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

        if (intersects.length > 0) {
          const rootObj = this.findParentInteractiveObject(intersects[0].object);
          if (rootObj) {
            e.preventDefault();
            this.activeObject = rootObj;
            this.initialObjectScale.copy(rootObj.scale);
            this.initialPinchDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && this.activeObject && this.initialPinchDistance > 0) {
        e.preventDefault();
        const currentPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const scaleFactor = currentPinchDistance / this.initialPinchDistance;
        this.activeObject.scale.copy(this.initialObjectScale).multiplyScalar(scaleFactor);
        
        // Clamp scale factor to a safe, visible range
        const minScale = 0.05;
        const maxScale = 1.6;
        this.activeObject.scale.clampScalar(minScale, maxScale);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        this.initialPinchDistance = 0;
        this.activeObject = null;
      }
    });

    // ── 5. Desktop Mouse Wheel (Dev Testing Scaling) ──────────────
    this.canvas.addEventListener('wheel', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.pointer.set(x, y);

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        const rootObj = this.findParentInteractiveObject(intersects[0].object);
        if (rootObj) {
          e.preventDefault();
          const scaleFactor = e.deltaY < 0 ? 1.08 : 0.92;
          rootObj.scale.multiplyScalar(scaleFactor);
          rootObj.scale.clampScalar(0.05, 1.6);
        }
      }
    }, { passive: false });
  }

  private updatePointerCoords(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.pointer.set(x, y);
  }

  private findParentInteractiveObject(obj: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = obj;
    while (current) {
      if (this.interactiveObjects.includes(current)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }
}
