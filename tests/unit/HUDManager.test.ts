import { describe, it, expect, beforeEach } from 'vitest';
import { HUDManager } from '../../app/ui/HUDManager';

describe('HUDManager', () => {
  let hud: HUDManager;
  beforeEach(() => {
    document.body.innerHTML = '<div id="hud-3d-card"></div>';
    hud = new HUDManager();
  });

  it('should initialize without errors', () => {
    expect(hud).toBeTruthy();
  });

  it('should show card when set visible', () => {
    hud.showCard();
    const card = document.getElementById('hud-3d-card');
    expect(card?.classList.contains('visible')).toBe(true);
  });
});
