import type { CSSProperties } from 'react';

/**
 * FX-03: a flat Bauhaus accent re-built as a real 3D solid with CSS only (no WebGL, no JS, ~0 kB).
 * kind="cube"  -> 6 faces, tumbles slowly (replaces the small rotated red squares)
 * kind="coin"  -> 2 faces, flips like a coin (for small circle accents)
 * Decorative only: always rendered inside an aria-hidden, pointer-events-none wrapper.
 * Reduced motion: the global reduced-motion rule freezes the animation at a static 3D pose.
 */
export function BauhausSolid({
  kind = 'cube',
  size = 40,
  color = '#FF4B2B',
  spin = '16s',
  className = '',
}: {
  kind?: 'cube' | 'coin';
  size?: number;
  color?: string;
  spin?: string;
  className?: string;
}) {
  const faces = kind === 'cube' ? 6 : 2;
  return (
    <div className={`fx-stage ${className}`} aria-hidden>
      <div
        className={`fx-solid ${kind === 'coin' ? 'fx-coin' : ''}`}
        style={{ '--s': `${size}px`, '--c': color, '--spin': spin } as CSSProperties}
      >
        {Array.from({ length: faces }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </div>
  );
}
