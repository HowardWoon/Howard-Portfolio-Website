import * as THREE from 'three';

// R70: every key walk mode uses. While the street has the keyboard these are CLAIMED (default prevented, read first in
// the capture phase), so the site's own one-letter shortcuts stand aside: S used to toggle skim mode on and off many
// times a second while the player walked backwards (the whole page flickered), T jumped to the top, G started the tour.
const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'Shift']);
const GAME_LETTERS = new Set(['w', 'a', 's', 'd', 'e']);

/**
 * Walk-mode input. Keyboard keys are only captured while the diorama has focus (or the pointer is over it), so the
 * rest of the page keeps its own shortcuts and scrolling. Touch: left side = floating joystick, right side = look,
 * two fingers on the right = pinch zoom.
 */
export class Input {
  move = new THREE.Vector2();
  look = new THREE.Vector2();
  run = false;
  zoom = 0;
  jumpQueued = false;
  interactQueued = false;
  lastLook = -10;
  enabled = false;
  usingTouch = false;
  private keys = new Set<string>();
  private joy: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
  private looks = new Map<number, { x: number; y: number }>();
  private pinch = 0;
  private hover = false;
  private base: HTMLDivElement;
  private knob: HTMLDivElement;
  private off: (() => void)[] = [];
  private padPrev: boolean[] = [];

  constructor(
    private container: HTMLElement,
    private surface: HTMLElement,
  ) {
    const mk = (size: number, bg: string) => {
      const d = document.createElement('div');
      Object.assign(d.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        marginLeft: `${-size / 2}px`,
        marginTop: `${-size / 2}px`,
        borderRadius: '999px',
        border: '3px solid #0A0A0A',
        background: bg,
        boxShadow: '3px 3px 0 0 #0A0A0A',
        pointerEvents: 'none',
        display: 'none',
        zIndex: '6',
        left: '0',
        top: '0',
      } satisfies Partial<CSSStyleDeclaration>);
      container.appendChild(d);
      return d;
    };
    // R76: solid paper, not see-through (no glass panels, AGENTS.md law 5)
    this.base = mk(112, '#FFFFFF');
    this.knob = mk(48, '#FFC700');
    this.base.setAttribute('aria-hidden', 'true');
    this.knob.setAttribute('aria-hidden', 'true');

    const on = <K extends keyof WindowEventMap>(
      t: EventTarget,
      type: K | string,
      fn: (e: never) => void,
      opts?: AddEventListenerOptions,
    ) => {
      t.addEventListener(type, fn as EventListener, opts);
      this.off.push(() => t.removeEventListener(type, fn as EventListener, opts));
    };
    on(window, 'keydown', (e: KeyboardEvent) => this.onKey(e, true), { capture: true });
    on(window, 'keyup', (e: KeyboardEvent) => this.onKey(e, false), { capture: true });
    on(window, 'blur', () => this.reset());
    on(document, 'visibilitychange', () => this.reset());
    on(container, 'pointerenter', () => (this.hover = true));
    on(container, 'pointerleave', () => (this.hover = false));
    on(surface, 'pointerdown', (e: PointerEvent) => this.down(e));
    on(surface, 'pointermove', (e: PointerEvent) => this.moveP(e));
    on(surface, 'pointerup', (e: PointerEvent) => this.up(e));
    on(surface, 'pointercancel', (e: PointerEvent) => this.up(e));
    on(surface, 'wheel', (e: WheelEvent) => this.wheel(e), { passive: false });
    on(surface, 'contextmenu', (e: Event) => this.enabled && e.preventDefault());
  }

  /** keys belong to the diorama while focus is anywhere inside its frame (or the pointer rests on it) */
  private focused() {
    const a = document.activeElement;
    const root = this.container.closest<HTMLElement>('[data-diorama-root]') ?? this.container;
    return (a instanceof Node && root.contains(a)) || (this.hover && (a === document.body || a === null));
  }

  private onKey(e: KeyboardEvent, down: boolean) {
    if (!this.enabled) return;
    if (down && !this.focused()) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (down) {
      if (GAME_KEYS.has(e.key) || (GAME_LETTERS.has(k) && !e.metaKey && !e.ctrlKey && !e.altKey)) e.preventDefault();
      if ((k === ' ' || k === 'Spacebar') && !e.repeat) this.jumpQueued = true;
      if ((k === 'e' || k === 'Enter') && !e.repeat && t?.tagName !== 'BUTTON') this.interactQueued = true;
      this.keys.add(k);
    } else this.keys.delete(k);
  }

  private down(e: PointerEvent) {
    if (!this.enabled) return;
    const r = this.surface.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      this.usingTouch = true;
      e.preventDefault();
      if (!this.joy && x < r.width * 0.45) {
        this.joy = { id: e.pointerId, ox: x, oy: y, x, y };
        this.showJoy(x, y, x, y);
      } else this.looks.set(e.pointerId, { x, y });
    } else {
      if (e.button !== 0 && e.button !== 2) return;
      this.looks.set(e.pointerId, { x, y });
    }
    try {
      this.surface.setPointerCapture(e.pointerId);
    } catch {
      /* capture is optional */
    }
  }

  private moveP(e: PointerEvent) {
    if (!this.enabled) return;
    const r = this.surface.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (this.joy && this.joy.id === e.pointerId) {
      this.joy.x = x;
      this.joy.y = y;
      const R = 52;
      let dx = x - this.joy.ox;
      let dy = y - this.joy.oy;
      const l = Math.hypot(dx, dy);
      // the base follows the thumb when it overshoots (no "dead" joystick)
      if (l > R * 1.6) {
        this.joy.ox = x - (dx / l) * R * 1.6;
        this.joy.oy = y - (dy / l) * R * 1.6;
        dx = x - this.joy.ox;
        dy = y - this.joy.oy;
      }
      const k = Math.min(1, Math.hypot(dx, dy) / R);
      const a = Math.atan2(dy, dx);
      this.showJoy(this.joy.ox, this.joy.oy, this.joy.ox + Math.cos(a) * k * R, this.joy.oy + Math.sin(a) * k * R);
      return;
    }
    const p = this.looks.get(e.pointerId);
    if (!p) return;
    if (this.looks.size === 2) {
      const pts = [...this.looks.values()];
      const before = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      p.x = x;
      p.y = y;
      const after = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (this.pinch) this.zoom -= (after - before) * 0.02;
      this.pinch = 1;
      return;
    }
    const s = e.pointerType === 'mouse' ? 0.0055 : 0.008;
    this.look.x += (x - p.x) * s;
    this.look.y += (y - p.y) * s;
    p.x = x;
    p.y = y;
    this.lastLook = performance.now() / 1000;
  }

  private up(e: PointerEvent) {
    if (this.joy && this.joy.id === e.pointerId) {
      this.joy = null;
      this.base.style.display = this.knob.style.display = 'none';
    }
    this.looks.delete(e.pointerId);
    if (this.looks.size < 2) this.pinch = 0;
  }

  private wheel(e: WheelEvent) {
    if (!this.enabled) return;
    e.preventDefault();
    this.zoom += Math.sign(e.deltaY) * Math.min(1.2, Math.abs(e.deltaY) * 0.01);
  }

  private showJoy(bx: number, by: number, kx: number, ky: number) {
    this.base.style.display = this.knob.style.display = 'block';
    this.base.style.transform = `translate(${bx}px, ${by}px)`;
    this.knob.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  reset() {
    this.keys.clear();
    this.joy = null;
    this.looks.clear();
    this.move.set(0, 0);
    this.base.style.display = this.knob.style.display = 'none';
  }

  /** Called once per frame: merges keyboard, joystick and gamepad into one move vector. */
  poll() {
    const k = this.keys;
    let mx = (k.has('d') || k.has('ArrowRight') ? 1 : 0) - (k.has('a') || k.has('ArrowLeft') ? 1 : 0);
    let my = (k.has('w') || k.has('ArrowUp') ? 1 : 0) - (k.has('s') || k.has('ArrowDown') ? 1 : 0);
    let run = k.has('Shift');
    if (this.joy) {
      const dx = this.joy.x - this.joy.ox;
      const dy = this.joy.y - this.joy.oy;
      const l = Math.hypot(dx, dy);
      const m = Math.min(1, l / 52);
      if (l > 4) {
        mx = (dx / l) * m;
        my = (-dy / l) * m;
      }
      run = run || m > 0.92;
    }
    const pads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
    const pad = pads && [...pads].find((p) => p && p.connected);
    if (pad && this.enabled) {
      const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : v);
      const ax = dz(pad.axes[0] ?? 0);
      const ay = dz(pad.axes[1] ?? 0);
      if (ax || ay) {
        mx = ax;
        my = -ay;
      }
      const lx = dz(pad.axes[2] ?? 0);
      const ly = dz(pad.axes[3] ?? 0);
      if (lx || ly) {
        this.look.x += lx * 0.045;
        this.look.y += ly * 0.03;
        this.lastLook = performance.now() / 1000;
      }
      const pressed = pad.buttons.map((b) => b.pressed);
      if (pressed[0] && !this.padPrev[0]) this.jumpQueued = true;
      if (pressed[2] && !this.padPrev[2]) this.interactQueued = true;
      run = run || !!pressed[10] || (pad.buttons[7]?.value ?? 0) > 0.3;
      this.padPrev = pressed;
    }
    const l = Math.hypot(mx, my);
    if (l > 1) {
      mx /= l;
      my /= l;
    }
    this.move.set(mx, my);
    this.run = run;
  }

  dispose() {
    this.off.forEach((f) => f());
    this.base.remove();
    this.knob.remove();
  }
}
