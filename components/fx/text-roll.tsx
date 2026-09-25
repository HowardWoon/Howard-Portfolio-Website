import { FX } from '@/lib/fx';

/**
 * FX-28: the label rolls up out of a mask and an identical copy rolls in (hover AND keyboard focus).
 * Exactly two spans: the copy is aria-hidden, so the accessible name stays "RUN SIMULATOR" (the previous
 * per-character version was announced by screen readers as "R U N S I M U L A T O R" twice).
 * Server-safe (no hooks). Pass a plain string only. Motion is removed by the global reduced-motion / Calm CSS.
 */
export function TextRoll({ children }: { children: string }) {
  if (!FX.textRoll) return <>{children}</>;
  return (
    <span className="fx-roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
