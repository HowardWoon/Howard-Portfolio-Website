/**
 * FX-60 Ambient orbits: decorative Bauhaus geometry for the section margins on wide screens (animated
 * background). Server-rendered markup only (no JS): a dashed ink ring turning slowly (.animate-spin-slow,
 * paused off-screen by D5 and frozen by reduced motion / Calm), plus a small colour square that drifts with
 * scroll (FX-13 .fx-drift). Hidden below xl so it never sits on phone or tablet content.
 */
export function AmbientOrbits({ side = 'left', square = 'bg-pop-blue' }: { side?: 'left' | 'right'; square?: string }) {
  // the right edge belongs to the fixed Section Spine (>= 1400 px), so rings default to the left margin
  const ring = side === 'right' ? '-right-28 top-40' : '-left-36 top-[38%]';
  const box = side === 'right' ? 'left-8 bottom-[22%]' : 'right-8 bottom-[18%]';
  return (
    <>
      <div
        aria-hidden
        className={`fx-orbit pointer-events-none absolute ${ring} w-72 h-72 hidden xl:block rounded-full border-3 border-dashed border-ink/25 animate-spin-slow`}
      >
        <span className="absolute -top-2 left-1/2 w-4 h-4 -translate-x-1/2 rounded-full border-3 border-ink bg-pop-yellow" />
      </div>
      <div
        aria-hidden
        className={`fx-orbit fx-drift pointer-events-none absolute ${box} w-10 h-10 hidden xl:block border-3 border-ink ${square} rotate-12 shadow-brutal-xs`}
      />
    </>
  );
}
