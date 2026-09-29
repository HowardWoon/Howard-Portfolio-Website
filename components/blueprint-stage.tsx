'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { ChevronLeft, ChevronRight, Move, Orbit, RotateCcw, Rotate3d, X, ZoomIn, ZoomOut } from 'lucide-react';
import { isCalm } from '@/lib/motion-pref';
import { prefersReducedMotion } from '@/lib/fx';

/**
 * FX-45 Blueprint Inspection Bench (Round 11, replaces the static FX-31 explode).
 *
 * The project narrative column becomes a 3D model the visitor can orbit (drag / swipe / arrow keys), zoom
 * (buttons, Ctrl+scroll, pinch), pan, explode or re-assemble (LAYER GAP slider) and inspect layer by layer
 * (click a plate, press 1-7, or use the legend).
 *
 * Why it can no longer crop or overlap:
 *  - every exploded plate also moves DOWN its own plane (1.3 x the Z gap), so plates never cover each other;
 *  - the model is auto-fitted: the projected corners of every plate are computed analytically (same maths as
 *    CSS rotateX * rotateZ + perspective) and a 2D scale/translate keeps the whole model inside the stage;
 *    the camera distance grows with the model so no plate can reach the camera. No DOM reads per frame
 *    (layer boxes are measured once per open / resize).
 *
 * Performance contract: no React state per pointer frame. Drag, tween, inertia and auto-rotate write inline
 * styles on 9 elements (fit wrapper, stack, 7 plates) + the gizmo + one readout text node inside rAF.
 */

/** true = the bench opens as a full-screen sheet */
function useBenchSheet() {
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px), (pointer: coarse), (max-height: 619px)');
    const on = () => setSheet(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return sheet;
}

export const BP_LAYERS = ['INDEX', 'TITLE', 'STORY', 'ARCHITECTURE', 'METRICS', 'STACK', 'ACTIONS'] as const;

/** p pitch, y yaw, g layer gap, z zoom, px/py pan, k open progress (0 = flat column, 1 = bench), l inspect lift */
type View = { p: number; y: number; g: number; z: number; px: number; py: number; k: number; l: number };
type Preset = 'iso' | 'plan' | 'front' | 'side';

const PRESETS: Record<Preset, { p: number; y: number; label: string }> = {
  iso: { p: 52, y: -18, label: 'ISO' },
  plan: { p: 0, y: 0, label: 'PLAN' },
  front: { p: 28, y: 0, label: 'FRONT' },
  side: { p: 64, y: -48, label: 'SIDE' },
};
const CLOSED: View = { p: 0, y: 0, g: 0, z: 1, px: 0, py: 0, k: 0, l: 0 };
const OPEN_GAP = 36;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/**
 * In-plane drop per unit of Z gap. Lifting a plate by Z moves it UP the screen by g*sin(pitch); dropping it
 * down its own plane by d moves it DOWN by d*cos(pitch). d is chosen so every plate always ends up
 * 0.8 x gap further apart on screen than in the flat layout, i.e. exploded plates (and their labels) never overlap.
 */
const spread = (p: number) => {
  const r = (p * Math.PI) / 180;
  return clamp((0.8 + Math.sin(r)) / Math.cos(r), 0.8, SPREAD_MAX);
};
const LIFT = 48; // extra Z for the isolated plate
const SPREAD_MAX = 1.8; // steep side views may overlap a little (like any exploded drawing) but stay framed
const P_MIN = 0;
const P_MAX = 75;
const Y_MIN = -60;
const Y_MAX = 60;
const Z_MIN = 0.5;
const Z_MAX = 2.5;
const G_MAX = 64;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const still = () => isCalm() || prefersReducedMotion();

type Geo = {
  persp: number;
  W: number;
  H: number;
  stageW: number;
  stageH: number;
  top: number;
  bottom: number;
  plates: [number, number][];
};

/** Projected bounding box of every plate for one view (pure maths, mirrors CSS rotateX(p) rotateZ(y) + perspective). */
function bbox(geo: Geo, p: number, y: number, g: number, iso: number | null, only: number | null = null, lift = 1) {
  const sp = Math.sin((p * Math.PI) / 180);
  const cp = Math.cos((p * Math.PI) / 180);
  const sy = Math.sin((y * Math.PI) / 180);
  const cy = Math.cos((y * Math.PI) / 180);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const hw = geo.W / 2 + 14;
  const sd = spread(p);
  geo.plates.forEach(([t, b], n) => {
    if (only !== null && n !== only) return;
    const dy = n * sd * g;
    const z = n * g + (iso === n ? LIFT * lift : 0);
    for (const x of [-hw, hw])
      for (const yy of [t - 30 - geo.H / 2 + dy, b + 14 - geo.H / 2 + dy]) {
        const x1 = x * cy - yy * sy;
        const y1 = x * sy + yy * cy;
        const y2 = y1 * cp - z * sp;
        const z2 = y1 * sp + z * cp;
        const f = geo.persp / Math.max(geo.persp * 0.25, geo.persp - z2);
        const X = x1 * f;
        const Y = y2 * f;
        if (X < minX) minX = X;
        if (X > maxX) maxX = X;
        if (Y < minY) minY = Y;
        if (Y > maxY) maxY = Y;
      }
  });
  return { minX, minY, maxX, maxY };
}

export function BlueprintStage({
  open,
  onRequestClose,
  title,
  children,
}: {
  open: boolean;
  /** the stage's own close button / console asks the card to close the blueprint */
  onRequestClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const gizmoRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const gapInputRef = useRef<HTMLInputElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  const sheet = useBenchSheet();
  const sheetRef = useRef(sheet);
  sheetRef.current = sheet;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [placeholderH, setPlaceholderH] = useState(0);

  // `mounted` = stage is in its open layout (fixed height, absolute model). Stays true during the close tween.
  const [mounted, setMounted] = useState(false);
  const [stageH, setStageH] = useState<number | null>(null);
  const [iso, setIso] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [tool, setTool] = useState<'orbit' | 'pan'>('orbit');
  const [spin, setSpin] = useState(false);
  const spinRaf = useRef(0);
  const stopSpin = useCallback(() => {
    cancelAnimationFrame(spinRaf.current);
    spinRaf.current = 0;
    setSpin(false);
  }, []);
  const [preset, setPreset] = useState<Preset | null>('iso');
  useScrollLock(mounted && sheet);
  useFocusTrap(dialogRef, mounted && sheet);

  const view = useRef<View>({ ...CLOSED });
  const geo = useRef<Geo | null>(null);
  const plates = useRef<HTMLElement[]>([]);
  const isoRef = useRef<number | null>(null);
  const raf = useRef(0);
  const lastText = useRef('');

  /* ------------------------------------------------------------------ measure + apply */
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const stack = stackRef.current;
    if (!stage || !stack) return;
    plates.current = Array.from(stack.querySelectorAll<HTMLElement>(':scope > .fx-layer'));
    const H = stack.offsetHeight;
    // camera distance grows with the model, so no plate can ever get close to (or behind) the camera
    const persp = Math.round(Math.max(1800, 2.2 * (H / 2 + 6 * SPREAD_MAX * G_MAX + 6 * G_MAX)));
    if (fitRef.current) fitRef.current.style.perspective = `${persp}px`;
    geo.current = {
      persp,
      W: stack.offsetWidth,
      H: stack.offsetHeight,
      stageW: stage.clientWidth,
      stageH: stage.clientHeight,
      top: (headRef.current?.offsetHeight ?? 40) + 16,
      bottom: 16,
      plates: plates.current.map((el) => [el.offsetTop, el.offsetTop + el.offsetHeight] as [number, number]),
    };
  }, []);

  const apply = useCallback(() => {
    const g = geo.current;
    const stack = stackRef.current;
    const fit = fitRef.current;
    if (!g || !stack || !fit) return;
    const v = view.current;
    const isoN = isoRef.current;

    // plates: staggered explode (lower plates leave first) + in-plane drop
    const sd = spread(v.p);
    plates.current.forEach((el, n) => {
      const stagger = clamp(v.k * 1.35 - n * 0.05, 0, 1);
      const gn = v.g * stagger;
      const lift = isoN === n ? LIFT * v.l * v.k : 0;
      el.style.transform = `translate3d(0px, ${(n * sd * gn).toFixed(2)}px ${(n * gn + lift).toFixed(2)}px)`;
    });
    stack.style.transform = `rotateX(${v.p.toFixed(2)}deg) rotateZ(${v.y.toFixed(2)}deg)`;
    if (gizmoRef.current)
      gizmoRef.current.style.transform = `rotateX(${v.p.toFixed(2)}deg) rotateZ(${v.y.toFixed(2)}deg)`;

    // auto-fit. Whole model: smallest scale over a +-8 deg yaw window (almost no "breathing" while orbiting), centred
    // on the current yaw. Inspecting a layer: the camera frames THAT plate (fly-to), so it is readable on phones.
    const areaW = g.stageW - 24;
    const areaH = g.stageH - g.top - g.bottom;
    let sFit = Infinity;
    const yaws = isoN === null ? [clamp(v.y - 8, Y_MIN, Y_MAX), v.y, clamp(v.y + 8, Y_MIN, Y_MAX)] : [v.y];
    for (const yy of yaws) {
      const b = bbox(g, v.p, yy, v.g, isoN, isoN, v.l);
      sFit = Math.min(sFit, areaW / (b.maxX - b.minX), areaH / (b.maxY - b.minY));
    }
    sFit = Math.min(sFit, isoN === null ? 1 : sheetRef.current ? 1.0 : 1.15);
    const cur = bbox(g, v.p, v.y, v.g, isoN, isoN, v.l);
    const s = 1 + (sFit * v.z - 1) * v.k;
    const cx = g.W / 2 + (cur.minX + cur.maxX) / 2;
    const cy = g.H / 2 + (cur.minY + cur.maxY) / 2;
    const tx = (12 + areaW / 2 - sFit * v.z * cx + v.px) * v.k;
    const ty = (g.top + areaH / 2 - sFit * v.z * cy + v.py) * v.k;
    fit.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;

    const text =
      g.stageW < 340
        ? `P${Math.round(v.p)}° Y${Math.round(v.y)}° ${Math.round(v.z * 100)}%`
        : g.stageW < 480
          ? `P ${Math.round(v.p)}° · Y ${Math.round(v.y)}° · ${Math.round(v.z * 100)}% · GAP ${Math.round(v.g)}`
          : `PITCH ${Math.round(v.p)}° · YAW ${Math.round(v.y)}° · ZOOM ${Math.round(v.z * 100)}% · GAP ${Math.round(v.g)}`;
    if (readoutRef.current && text !== lastText.current) {
      readoutRef.current.textContent = text;
      lastText.current = text;
    }
  }, []);

  // data-bp-live = the model is being driven per frame (drag / tween / spin / slider): CSS transitions off
  const live = useCallback((onOff: boolean) => stageRef.current?.toggleAttribute('data-bp-live', onOff), []);
  const pending = useRef<View | null>(null); // target of the running tween (so quick key presses add up)
  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    pending.current = null;
    live(false);
  }, [live]);

  const tween = useCallback(
    (to: Partial<View>, ms = 650, done?: () => void) => {
      const base = pending.current;
      stop();
      const from = { ...view.current };
      const target = { ...(base ?? from), ...to };
      pending.current = target;
      if (still() || ms === 0) {
        pending.current = null;
        view.current = target;
        apply();
        done?.();
        return;
      }
      live(true);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = ease(Math.min(1, (now - t0) / ms));
        const v = view.current;
        (Object.keys(target) as (keyof View)[]).forEach((key) => {
          v[key] = from[key] + (target[key] - from[key]) * t;
        });
        apply();
        if (t < 1) raf.current = requestAnimationFrame(step);
        else {
          raf.current = 0;
          pending.current = null;
          live(false);
          done?.();
        }
      };
      raf.current = requestAnimationFrame(step);
    },
    [apply, live, stop],
  );

  const syncGapInput = () => {
    if (gapInputRef.current) gapInputRef.current.value = String(Math.round(view.current.g));
  };

  /* ------------------------------------------------------------------ open / close lifecycle */
  const openView = () => ({ ...PRESETS.iso, g: OPEN_GAP, z: 1, px: 0, py: 0, k: 1, l: 0 });

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (open && !mounted) {
      setPlaceholderH(stage.offsetHeight);
      if (!sheet) {
        const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
        const avail = window.innerHeight - headerH - 24;
        const target = Math.round(clamp(avail * 0.72, 320, 680));
        setStageH(target);
      }
      setMounted(true);
    } else if (open && mounted) {
      // re-opened while the close animation was still running
      setPreset('iso');
      tween(openView(), 600, syncGapInput);
    } else if (!open && mounted) {
      // close: re-assemble (tween back to identity), then hand the column back to normal flow
      stopSpin();
      setIso(null);
      isoRef.current = null;
      tween({ ...CLOSED }, 600, () => {
        plates.current.forEach((el) => {
          el.style.transform = '';
          el.removeAttribute('data-bp-active');
        });
        stackRef.current?.removeAttribute('data-bp-isolating');
        if (stackRef.current) stackRef.current.style.transform = '';
        if (fitRef.current) {
          fitRef.current.style.transform = '';
          fitRef.current.style.perspective = '';
        }
        setMounted(false);
        setStageH(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // after the open layout has rendered: measure, then tween from "flat" into the ISO view
  useLayoutEffect(() => {
    if (!mounted || !open) return;
    measure();
    view.current = { ...CLOSED };
    apply();
    setPreset('iso');
    tween(openView(), 900, syncGapInput);
    syncGapInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => () => stop(), [stop]);

  // resize while open: re-measure (layer heights change when the column width changes)
  useEffect(() => {
    if (!mounted) return;
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
        const avail = window.innerHeight - headerH - 24;
        const target = Math.round(clamp(avail * 0.72, 320, 680));
        setStageH(target);
        requestAnimationFrame(() => {
          measure();
          apply();
        });
      }, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, [mounted, measure, apply]);

  /* ------------------------------------------------------------------ isolation (layer inspection) */
  useEffect(() => {
    const active = preview ?? iso;
    plates.current.forEach((el, n) => {
      el.toggleAttribute('data-bp-active', active === n);
    });
    stackRef.current?.toggleAttribute('data-bp-isolating', active !== null);
  }, [iso, preview]);

  // inspecting a layer = camera fly-to: the plate rises, the view turns to a readable angle and frames it
  useEffect(() => {
    if (!mounted || !open) return;
    if (isoRef.current === iso) return;
    isoRef.current = iso;
    stopSpin();
    const v = view.current;
    if (iso === null) {
      tween({ l: 0, px: 0, py: 0 }, 600);
    } else {
      v.l = 0;
      setPreset(null);
      tween(
        sheetRef.current
          ? { l: 1, p: 8, y: 0, px: 0, py: 0, z: 1 }
          : { l: 1, p: Math.min(v.p, 34), y: clamp(v.y, -18, 18), px: 0, py: 0, z: 1 },
        700,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso]);

  // sheet: auto-inspect L1 after the open tween
  useEffect(() => {
    if (!mounted || !open || !sheet) return;
    const t = window.setTimeout(() => setIso((c) => (c === null ? 0 : c)), still() ? 0 : 1200);
    return () => window.clearTimeout(t);
  }, [mounted, open, sheet]);

  const toggleIso = (n: number) => setIso((cur) => (cur === n ? null : n));
  // walk the plates L1 -> L7 (the camera flies to each one); past either end returns to the whole model
  const stepLayer = (d: number) =>
    setIso((cur) => {
      const next = cur === null ? (d > 0 ? 0 : BP_LAYERS.length - 1) : cur + d;
      return next < 0 || next >= BP_LAYERS.length ? null : next;
    });

  /* ------------------------------------------------------------------ pointer: orbit / pan / pinch */
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({
    active: false,
    sx: 0,
    sy: 0,
    lx: 0,
    ly: 0,
    vx: 0,
    vy: 0,
    t: 0,
    pinch: 0,
    z0: 1,
    moved: false,
    x0: 0,
    y0: 0,
    t0: 0,
  });

  /* ------------------------------------------------------------------ auto-rotate (turntable) */
  useEffect(() => {
    if (!spin || !mounted) return;
    if (still()) {
      setSpin(false);
      return;
    }
    stop();
    live(true);
    const base = view.current.y;
    const t0 = performance.now();
    const step = (now: number) => {
      view.current.y = clamp(base + 34 * Math.sin((now - t0) / 1400), Y_MIN, Y_MAX);
      apply();
      spinRaf.current = requestAnimationFrame(step);
    };
    spinRaf.current = requestAnimationFrame(step);
    const d = drag.current;
    return () => {
      cancelAnimationFrame(spinRaf.current);
      spinRaf.current = 0;
      if (!raf.current && !d.active) live(false);
    };
  }, [spin, mounted, apply, live, stop]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!mounted || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if ((e.target as HTMLElement).closest('[data-bp-ui]')) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    if (ptrs.current.size === 2) {
      const [a, b] = Array.from(ptrs.current.values());
      d.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      d.z0 = view.current.z;
      d.active = true;
      stop();
      live(true);
      d.moved = true;
      stageRef.current?.setPointerCapture(e.pointerId);
      return;
    }
    Object.assign(d, {
      x0: e.clientX,
      y0: e.clientY,
      t0: performance.now(),
      active: false,
      sx: e.clientX,
      sy: e.clientY,
      lx: e.clientX,
      ly: e.clientY,
      vx: 0,
      vy: 0,
      t: performance.now(),
      moved: false,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    const v = view.current;
    if (sheetRef.current && isoRef.current !== null && tool === 'orbit') {
      apply();
      return;
    }
    if (ptrs.current.size === 2 && d.pinch > 0) {
      const [a, b] = Array.from(ptrs.current.values());
      v.z = clamp((d.z0 * Math.hypot(a.x - b.x, a.y - b.y)) / d.pinch, Z_MIN, Z_MAX);
      setPreset(null);
      apply();
      return;
    }
    if (!d.active) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      d.active = true;
      d.moved = true;
      stop();
      stopSpin();
      setPreset(null);
      stageRef.current?.setPointerCapture(e.pointerId);
      stageRef.current?.setAttribute('data-bp-dragging', '');
      live(true);
    }
    const dx = e.clientX - d.lx;
    const dy = e.clientY - d.ly;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    d.vx = (dx / dt) * 16;
    d.vy = (dy / dt) * 16;
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.t = now;
    if (tool === 'pan') {
      const g = geo.current;
      const lim = g ? g.stageW / 2 : 300;
      v.px = clamp(v.px + dx, -lim, lim);
      v.py = clamp(v.py + dy, -lim, lim);
    } else {
      v.y = clamp(v.y + dx * 0.35, Y_MIN, Y_MAX);
      v.p = clamp(v.p - dy * 0.3, P_MIN, P_MAX);
    }
    apply();
  };

  const endPointer = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId);
    const d = drag.current;
    const dx = e.clientX - d.x0,
      dy = e.clientY - d.y0;
    if (
      sheetRef.current &&
      isoRef.current !== null &&
      Math.abs(dx) > 60 &&
      Math.abs(dx) > 2 * Math.abs(dy) &&
      performance.now() - d.t0 < 450
    ) {
      stepLayer(dx < 0 ? 1 : -1);
      return;
    }
    if (ptrs.current.size > 0) return;
    d.pinch = 0;
    stageRef.current?.removeAttribute('data-bp-dragging');
    if (!d.active) return;
    d.active = false;
    live(false);
    // inertia (orbit only, motion allowed, released while moving)
    if (tool !== 'orbit' || still() || Math.hypot(d.vx, d.vy) < 1 || performance.now() - d.t > 80) return;
    let vx = d.vx;
    let vy = d.vy;
    const step = () => {
      const v = view.current;
      v.y = clamp(v.y + vx * 0.35, Y_MIN, Y_MAX);
      v.p = clamp(v.p - vy * 0.3, P_MIN, P_MAX);
      vx *= 0.9;
      vy *= 0.9;
      apply();
      if (Math.hypot(vx, vy) > 0.2) raf.current = requestAnimationFrame(step);
      else stop();
    };
    stop();
    live(true);
    raf.current = requestAnimationFrame(step);
  };

  // a drag must never also "click" a link/plate underneath; a plain click on a plate isolates it
  const onClickCapture = (e: React.MouseEvent) => {
    if (!mounted) return;
    if (drag.current.moved) {
      drag.current.moved = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const target = e.target as HTMLElement;
    if (target.closest('a,button,input,[data-bp-ui]')) return;
    const plate = target.closest<HTMLElement>('.fx-layer');
    const n = plate ? plates.current.indexOf(plate) : -1;
    if (n >= 0) toggleIso(n);
  };

  // Ctrl/⌘ + wheel (and trackpad pinch, which Chromium/Safari report as ctrl+wheel) zooms the model
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !mounted) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      stop();
      view.current.z = clamp(view.current.z * Math.exp(-e.deltaY * 0.004), Z_MIN, Z_MAX);
      setPreset(null);
      apply();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [mounted, apply, stop]);

  /* ------------------------------------------------------------------ keyboard (stage focused) */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!mounted || (e.target as HTMLElement).closest('[data-bp-ui]')) return;
    const v = pending.current ?? view.current; // keys pressed during a tween add up
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':
        tween({ y: clamp(v.y - 8, Y_MIN, Y_MAX) }, 200);
        break;
      case 'ArrowRight':
        tween({ y: clamp(v.y + 8, Y_MIN, Y_MAX) }, 200);
        break;
      case 'ArrowUp':
        tween({ p: clamp(v.p + 6, P_MIN, P_MAX) }, 200);
        break;
      case 'ArrowDown':
        tween({ p: clamp(v.p - 6, P_MIN, P_MAX) }, 200);
        break;
      case '+':
      case '=':
        tween({ z: clamp(v.z * 1.2, Z_MIN, Z_MAX) }, 200);
        break;
      case '-':
      case '_':
        tween({ z: clamp(v.z / 1.2, Z_MIN, Z_MAX) }, 200);
        break;
      case 'r':
      case 'R':
        reset();
        break;
      default:
        if (/^[1-7]$/.test(e.key)) toggleIso(Number(e.key) - 1);
        else handled = false;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key !== 'r' && e.key !== 'R' && !/^[1-7]$/.test(e.key)) setPreset(null);
    }
  };

  /* ------------------------------------------------------------------ console actions */
  const goPreset = (key: Preset) => {
    stopSpin();
    setPreset(key);
    tween({ p: PRESETS[key].p, y: PRESETS[key].y, px: 0, py: 0 });
  };
  const zoomBy = (f: number) => {
    stopSpin();
    setPreset(null);
    tween({ z: clamp(view.current.z * f, Z_MIN, Z_MAX) }, 250);
  };
  function reset() {
    stopSpin();
    isoRef.current = null; // handled here, so the fly-to effect does not start a competing tween
    setIso(null);
    setPreset('iso');
    tween({ ...PRESETS.iso, g: OPEN_GAP, z: 1, px: 0, py: 0, l: 0 }, 650, syncGapInput);
  }
  const onGap = (e: React.FormEvent<HTMLInputElement>) => {
    const g = clamp(Number(e.currentTarget.value), 0, G_MAX);
    view.current.g = g;
    if (pending.current) pending.current.g = g; // a running preset tween keeps going, with the new gap
    if (raf.current) return;
    live(true);
    apply();
  };

  /* ------------------------------------------------------------------ render */
  const btn =
    'inline-flex items-center justify-center gap-1.5 min-h-[36px] min-w-[36px] [@media(pointer:coarse)]:min-h-[40px] [@media(pointer:coarse)]:min-w-[40px] px-2.5 rounded-xl border-2 border-ink font-mono text-[0.68rem] font-extrabold tracking-[0.08em] transition-colors';
  const on = 'bg-ink text-white';
  const off = 'bg-white text-ink hover:bg-pop-yellow';

  const [showGap, setShowGap] = useState(false);
  const stageEl = (
    <div
      ref={stageRef}
      className="fx-blueprint relative"
      data-open={mounted ? 'true' : 'false'}
      data-tool={tool}
      style={
        mounted && stageH && !sheet ? ({ height: stageH, '--bp-h': `${stageH}px` } as React.CSSProperties) : undefined
      }
      role={mounted ? 'group' : undefined}
      aria-roledescription={mounted ? '3D blueprint' : undefined}
      aria-label={
        mounted
          ? `Blueprint of ${title}. Drag or use the arrow keys to orbit, plus and minus to zoom, 1 to 7 to inspect a layer, R to reset, Escape to close.`
          : undefined
      }
      tabIndex={mounted ? 0 : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
    >
      <div ref={fitRef} className="bp-fit">
        <div ref={stackRef} className="fx-stack space-y-6">
          {children}
        </div>
      </div>

      {mounted ? (
        <>
          {/* scan line + corner ticks (decorative) */}
          <span aria-hidden className="bp-scan" />
          <span aria-hidden className="bp-corner bp-corner-br" />

          {/* head: title + live readout + gizmo + close */}
          <div
            ref={headRef}
            data-bp-ui
            className="absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-3 pointer-events-none"
          >
            <div className="min-w-0 pointer-events-auto">
              <div className="flex flex-wrap items-center gap-2">
                <span className="nb-tag bg-pop-blue text-white text-[0.65rem] max-w-full">
                  <span className="truncate min-w-0">BLUEPRINT // {title}</span>
                </span>
                <span className="bp-stamp nb-tag bg-pop-mint text-[0.65rem] hidden sm:inline-flex">
                  INSPECTION READY
                </span>
              </div>
              <span
                ref={readoutRef}
                aria-live="polite"
                className="block mt-1.5 font-mono text-[0.65rem] font-extrabold tracking-[0.08em] text-pop-blue"
              >
                PITCH 34° · YAW 0°
              </span>
            </div>

            <div className="flex gap-2.5 items-start pointer-events-auto shrink-0">
              <div
                ref={gizmoRef}
                aria-hidden
                className="w-10 h-10 rounded-full border-2 border-ink bg-white/80 shadow-brutal-sm relative"
              >
                <div className="absolute inset-[3px] rounded-full border border-ink/20" />
                <div className="bp-gizmo-yaw absolute inset-0">
                  <div className="absolute top-[3px] left-[17px] w-1 h-1 rounded-full bg-pop-blue" />
                  <div className="absolute bottom-[3px] left-[17px] w-1 h-1 rounded-full bg-ink" />
                </div>
              </div>
              <button
                type="button"
                onClick={onRequestClose}
                data-autofocus={sheet ? 'true' : undefined}
                aria-label="Close Blueprint"
                title="Close"
                className="flex items-center justify-center w-10 h-10 rounded-full border-3 border-ink bg-white text-ink hover:bg-pop-yellow hover:scale-105 transition-transform shadow-brutal-sm"
              >
                <X strokeWidth={3} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
  const consoleEl = mounted ? (
    <div
      ref={consoleRef}
      data-bp-ui
      className="mt-3 flex flex-col gap-2 p-2 rounded-2xl border-3 border-ink bg-white shadow-brutal-sm"
    >
      <div
        className={
          sheet
            ? 'flex flex-nowrap overflow-x-auto [scrollbar-width:none] gap-1.5'
            : 'flex flex-wrap items-center gap-1.5'
        }
      >
        <div role="group" aria-label="View presets" className="flex gap-1 shrink-0">
          {(Object.keys(PRESETS) as Preset[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={preset === key}
              onClick={() => goPreset(key)}
              className={`${btn} ${preset === key ? on : off}`}
            >
              {PRESETS[key].label}
            </button>
          ))}
        </div>
        <span aria-hidden className="w-px h-6 bg-ink/20 mx-0.5 shrink-0" />
        <div role="group" aria-label="Drag tool" className="flex gap-1 shrink-0">
          <button
            type="button"
            aria-pressed={tool === 'orbit'}
            aria-label="Orbit tool"
            title="Orbit"
            onClick={() => setTool('orbit')}
            className={`${btn} ${tool === 'orbit' ? on : off}`}
          >
            <Rotate3d className="w-4 h-4" strokeWidth={2.5} aria-hidden />
          </button>
          <button
            type="button"
            aria-pressed={tool === 'pan'}
            aria-label="Pan tool"
            title="Pan"
            onClick={() => setTool('pan')}
            className={`${btn} ${tool === 'pan' ? on : off}`}
          >
            <Move className="w-4 h-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
        <span aria-hidden className="w-px h-6 bg-ink/20 mx-0.5 shrink-0" />
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomBy(1 / 1.25)}
          className={`${btn} ${off} shrink-0`}
        >
          <ZoomOut className="w-4 h-4" strokeWidth={2.5} aria-hidden />
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)} className={`${btn} ${off} shrink-0`}>
          <ZoomIn className="w-4 h-4" strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          aria-pressed={spin}
          aria-label="Auto-rotate"
          title="Auto-rotate"
          onClick={() => setSpin((s) => !s)}
          className={`${btn} ${spin ? on : off} shrink-0`}
        >
          <Orbit className="w-4 h-4" strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          title="Reset (R)"
          onClick={reset}
          className={`${btn} ${off} shrink-0`}
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      {sheet ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => stepLayer(-1)} aria-label="Previous layer" className={`${btn} ${off}`}>
              <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
            <span aria-live="polite" className="flex-1 text-center nb-tag bg-pop-yellow justify-center">
              {iso === null ? 'WHOLE MODEL' : `L${iso + 1} · ${BP_LAYERS[iso]}`}
            </span>
            <button type="button" onClick={() => stepLayer(1)} aria-label="Next layer" className={`${btn} ${off}`}>
              <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
            <button
              type="button"
              aria-pressed={showGap}
              onClick={() => setShowGap(!showGap)}
              className={`${btn} ${showGap ? on : off}`}
            >
              GAP
            </button>
          </div>
          {showGap && (
            <label className="flex items-center gap-2 font-mono text-[0.65rem] font-extrabold tracking-[0.08em] text-ink">
              <span className="shrink-0">ASSEMBLE</span>
              <input
                ref={gapInputRef}
                type="range"
                min={0}
                max={G_MAX}
                step={1}
                defaultValue={OPEN_GAP}
                onInput={onGap}
                onPointerUp={() => live(false)}
                onKeyUp={() => live(false)}
                aria-label="Layer gap"
                className="bp-range flex-1 min-w-0"
              />
              <span className="shrink-0">EXPLODE</span>
            </label>
          )}
        </div>
      ) : (
        <>
          <label className="flex items-center gap-2 font-mono text-[0.65rem] font-extrabold tracking-[0.08em] text-ink">
            <span className="shrink-0">ASSEMBLE</span>
            <input
              ref={gapInputRef}
              type="range"
              min={0}
              max={G_MAX}
              step={1}
              defaultValue={OPEN_GAP}
              onInput={onGap}
              onPointerUp={() => live(false)}
              onKeyUp={() => live(false)}
              aria-label="Layer gap: drag left to assemble, right to explode"
              className="bp-range flex-1 min-w-0"
            />
            <span className="shrink-0">EXPLODE</span>
          </label>

          <div role="group" aria-label="Inspect a layer" className="flex flex-wrap gap-1">
            <button type="button" aria-label="Previous layer" onClick={() => stepLayer(-1)} className={`${btn} ${off}`}>
              <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
            {BP_LAYERS.map((name, n) => (
              <button
                key={name}
                type="button"
                aria-pressed={iso === n}
                aria-label={`Inspect layer ${n + 1}: ${name.toLowerCase()}`}
                onClick={() => toggleIso(n)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setPreview(n)}
                onPointerLeave={() => setPreview(null)}
                onFocus={() => setPreview(n)}
                onBlur={() => setPreview(null)}
                title={name}
                className={`${btn} shrink-0 ${iso === n ? 'bg-pop-yellow text-ink' : off}`}
              >
                <span className="opacity-60">L{n + 1}</span>
                <span className="hidden sm:inline">{name}</span>
              </button>
            ))}
            <button type="button" aria-label="Next layer" onClick={() => stepLayer(1)} className={`${btn} ${off}`}>
              <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  ) : null;

  if (mounted && sheet) {
    return (
      <div className="min-w-0">
        <div
          aria-hidden
          style={{ height: placeholderH }}
          className="rounded-[20px] border-3 border-dashed border-ink/40 grid place-items-center font-mono text-xs font-extrabold tracking-[0.1em] text-ink/60"
        >
          BLUEPRINT OPEN
        </div>
        {createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Blueprint of ${title}`}
            data-lenis-prevent
            className="fixed inset-0 z-[10000] flex flex-col gap-2 bg-paper h-screen-safe pt-[max(0.5rem,var(--safe-top))] pb-[max(0.5rem,var(--safe-bottom))] pl-[max(0.5rem,var(--safe-left))] pr-[max(0.5rem,var(--safe-right))]"
          >
            {React.cloneElement(stageEl, {
              className: 'fx-blueprint relative flex-1 min-h-0',
              style: undefined,
              'data-sheet': '',
            })}
            {consoleEl}
          </div>,
          document.body,
        )}
      </div>
    );
  }
  return (
    <div className="min-w-0">
      {stageEl}
      {consoleEl}
    </div>
  );
}
