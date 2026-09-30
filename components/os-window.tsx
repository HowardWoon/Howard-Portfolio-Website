'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { m, useDragControls, useMotionValue, animate } from 'framer-motion';
import { GripVertical, Minus, Square, Copy, RotateCcw } from 'lucide-react';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { useMotionAllowed } from './fx/use-motion-allowed';

/**
 * R22 "Desktop Console" (lecturer pattern 1): cards behave like neo-brutalist OS windows, as a layer ON TOP of the
 * existing cards (same border, radius, shadow, content).
 *  - drag by the title bar (mouse / pen on screens >= 1024 px; the grip button also moves it with the arrow keys),
 *    kept inside the desk; Reset puts it back
 *  - pressing anywhere in a window brings it to the front (z-index) with a shadow pop
 *  - minimise sends it to the desk's taskbar; maximise opens the same content full screen in a portal dialog
 *    (rules 10-B: role=dialog, focus trap, scroll lock, Escape restores). The content is rendered once, never twice.
 * Touch screens keep normal page scrolling (no drag), but minimise / maximise work everywhere.
 */

type Desk = {
  deskRef: RefObject<HTMLDivElement | null>;
  front: string | null;
  raise: (id: string) => void;
  minimized: { id: string; title: string }[];
  minimize: (id: string, title: string) => void;
  restore: (id: string) => void;
};

const DeskContext = createContext<Desk | null>(null);

export function WindowDesk({ children, className = '' }: { children: ReactNode; className?: string }) {
  const deskRef = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState<string | null>(null);
  const [minimized, setMinimized] = useState<{ id: string; title: string }[]>([]);
  const desk: Desk = {
    deskRef,
    front,
    raise: (id) => setFront(id),
    minimized,
    minimize: (id, title) => setMinimized((m) => (m.some((w) => w.id === id) ? m : [...m, { id, title }])),
    restore: (id) => {
      setMinimized((m) => m.filter((w) => w.id !== id));
      setFront(id);
    },
  };
  return (
    <DeskContext.Provider value={desk}>
      <div ref={deskRef} data-window-desk className={className}>
        {children}
      </div>
      {minimized.length ? (
        <div
          role="toolbar"
          aria-label="Taskbar: minimised windows"
          className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border-3 border-ink bg-ink p-2 shadow-brutal-sm"
        >
          <span aria-hidden className="px-2 font-mono text-[0.66rem] font-extrabold tracking-[0.16em] text-white">
            TASKBAR
          </span>
          {minimized.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => desk.restore(w.id)}
              aria-label={`Restore ${w.title} window`}
              className="nb-key min-h-[40px] rounded-xl border-2 border-white bg-white px-3 font-mono text-xs font-extrabold tracking-[0.12em] text-ink"
            >
              ▭ {w.title}
            </button>
          ))}
        </div>
      ) : null}
    </DeskContext.Provider>
  );
}

function WindowControls({
  title,
  maximized,
  moved,
  onMinimize,
  onMaximize,
  onReset,
}: {
  title: string;
  maximized: boolean;
  moved: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onReset: () => void;
}) {
  const btn =
    'nb-key grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-white text-ink [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-10';
  return (
    <div className="flex items-center gap-1.5">
      {moved && !maximized ? (
        <button type="button" onClick={onReset} aria-label={`Reset ${title} window position`} className={btn}>
          <RotateCcw className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        </button>
      ) : null}
      {!maximized ? (
        <button type="button" onClick={onMinimize} aria-label={`Minimise ${title} window`} className={btn}>
          <Minus className="h-4 w-4" strokeWidth={3} aria-hidden />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onMaximize}
        aria-label={maximized ? `Restore ${title} window` : `Maximise ${title} window`}
        aria-pressed={maximized}
        className={btn}
      >
        {maximized ? (
          <Copy className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        ) : (
          <Square className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        )}
      </button>
    </div>
  );
}

function MaximizedWindow({
  title,
  onRestore,
  children,
}: {
  title: string;
  onRestore: () => void;
  children: (bar: ReactNode) => ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, mounted);
  useScrollLock();
  const restore = useLatest(onRestore);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && restore.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [restore]);
  if (!mounted) return null;
  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} window, full screen`}
      data-lenis-prevent
      className="fixed inset-0 z-[10000] h-screen-safe overflow-y-auto overscroll-contain bg-ink/85 pb-[max(1rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] pt-[max(1rem,var(--safe-top))] sm:p-8"
    >
      <div className="mx-auto w-full max-w-5xl">
        {children(
          <WindowControls
            title={title}
            maximized
            moved={false}
            onMinimize={() => {}}
            onMaximize={onRestore}
            onReset={() => {}}
          />,
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * `outerClassName` stays on the grid cell (keep scroll-reveal classes there: a CSS animation on the same element
 * would override the drag transform). `className` is the card box (border / radius / shadow), `bodyClassName` its
 * padding.
 */
export function OsWindow({
  id,
  title,
  outerClassName = '',
  className = '',
  bodyClassName = '',
  children,
}: {
  id: string;
  title: string;
  outerClassName?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const desk = useContext(DeskContext);
  const allowed = useMotionAllowed();
  const [canDrag, setCanDrag] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [moved, setMoved] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useDragControls();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    const set = () => setCanDrag(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  // leaving the desktop layout puts the window back where it belongs
  useEffect(() => {
    if (canDrag) return;
    x.set(0);
    y.set(0);
    setMoved(false);
  }, [canDrag, x, y]);

  const isMin = !!desk?.minimized.some((w) => w.id === id);
  const front = desk?.front === id;
  const raise = () => desk?.raise(id);
  const reset = () => {
    const opts = allowed ? { type: 'spring' as const, stiffness: 420, damping: 32 } : { duration: 0 };
    animate(x, 0, opts);
    animate(y, 0, opts);
    setMoved(false);
  };
  const nudge = (dx: number, dy: number) => {
    // a move always wins over a Reset spring that is still settling (it used to swallow the first key press)
    x.stop();
    y.stop();
    const bounds = desk?.deskRef.current?.getBoundingClientRect();
    const limX = bounds ? bounds.width / 2 : 400;
    const limY = bounds ? bounds.height / 2 : 400;
    x.set(Math.max(-limX, Math.min(limX, x.get() + dx)));
    y.set(Math.max(-limY, Math.min(limY, y.get() + dy)));
    setMoved(true);
  };

  const titleBar = (controlsNode: ReactNode, draggable: boolean) => (
    <div
      data-window-bar
      onPointerDown={(e) => {
        if (!draggable || (e.target as HTMLElement).closest('button:not([data-grip])')) return;
        controls.start(e);
      }}
      className={`nb-hatch flex items-center justify-between gap-3 border-b-3 border-ink bg-paper-deep px-3 py-2 sm:px-4 ${
        draggable ? 'cursor-grab active:cursor-grabbing touch-none select-none' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {draggable ? (
          <button
            type="button"
            data-grip
            aria-label={`Move ${title} window (arrow keys)`}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 64 : 24;
              const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[
                e.key
              ];
              if (!d) return;
              e.preventDefault();
              nudge(d[0], d[1]);
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border-2 border-ink bg-white text-ink"
          >
            <GripVertical className="h-4 w-4" strokeWidth={2.75} aria-hidden />
          </button>
        ) : null}
        <span className="truncate font-mono text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-ink">
          {title}
        </span>
      </div>
      {controlsNode}
    </div>
  );

  const controlsInline = (
    <WindowControls
      title={title}
      maximized={false}
      moved={moved}
      onMinimize={() => desk?.minimize(id, title)}
      onMaximize={() => setMaximized(true)}
      onReset={reset}
    />
  );

  return (
    <div className={outerClassName}>
      {isMin || maximized ? (
        <div
          data-window-placeholder={id}
          className="flex min-h-[72px] items-center justify-center rounded-[28px] border-3 border-dashed border-ink/40 p-4 text-center font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink-muted"
        >
          {isMin ? `▭ ${title} · minimised to the taskbar` : `▢ ${title} · open full screen`}
        </div>
      ) : (
        <m.div
          data-os-window={id}
          data-front={front ? '' : undefined}
          drag={canDrag}
          dragControls={controls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.06}
          dragConstraints={desk?.deskRef}
          onDragStart={() => {
            x.stop();
            y.stop();
            raise();
            setMoved(true);
          }}
          onPointerDownCapture={raise}
          style={{ x, y }}
          className={`relative overflow-hidden transition-shadow duration-200 ${front ? 'z-20 !shadow-brutal-xl' : 'z-10'} ${className}`}
        >
          {titleBar(controlsInline, canDrag)}
          <div className={bodyClassName}>{children}</div>
        </m.div>
      )}
      {maximized ? (
        <MaximizedWindow title={title} onRestore={() => setMaximized(false)}>
          {(bar) => (
            <div data-os-window={id} data-maximized className={`relative overflow-hidden ${className}`}>
              {titleBar(bar, false)}
              <div className={bodyClassName}>{children}</div>
            </div>
          )}
        </MaximizedWindow>
      ) : null}
    </div>
  );
}
