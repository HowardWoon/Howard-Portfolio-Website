import { ArrowUpRight } from 'lucide-react';
import { LEDGER } from '@/lib/build-sheet';
import { SIGNAL } from '@/lib/signal';

/**
 * R111 (owner, Pinterest references: "12K+ · 98% · 150+" bands): a lime ground band under the hero tapes with the four
 * Build Sheet figures, each a link to the section that proves it. Read from lib/build-sheet.ts (the About plate reads
 * the same list), so a figure can never differ between the two. Lime is a ground (decoration), not a SIGNAL meaning.
 *
 * R122 (owner: "the text is flat and ugly ... I want that neo-brutalism feel, like Pinterest templates"): each figure is
 * a sticker card ON the ground - paper face, 3 px ink, a hard ink block behind it, a slight alternating tilt - with the
 * label on an ink chip (its SIGNAL key square, as on the About plate), the figure in display type with a hard lime / ink
 * extrusion, the note in readable sans and the arrow as a square ink key. Hover straightens the card and pushes it
 * toward its block; a press sinks it in (transform only). From 1400 px the right gutter clears the fixed section spine. Styles: `.fb-*` in app/globals.css. docs/R122.
 */
export function FigureBand() {
  return (
    <section aria-label="Figures" data-figure-band className="relative border-y-3 border-ink bg-ground-lime">
      <ul className="mx-auto grid max-w-[1440px] grid-cols-1 gap-x-4 gap-y-6 px-4 py-8 xs:grid-cols-2 sm:gap-x-6 sm:gap-y-8 sm:px-8 sm:py-12 lg:grid-cols-4 min-[1400px]:pr-20">
        {LEDGER.map((x) => {
          const sig = x.signal ? SIGNAL[x.signal] : null;
          return (
            <li key={x.label} className="fb-card min-w-0">
              <a
                href={x.href}
                data-figure-card
                className="fb-face group flex h-full flex-col gap-3 px-4 pb-4 pt-4 text-ink outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-pop-blue sm:px-6 sm:pb-5 sm:pt-5"
              >
                <span className="fb-chip self-start">
                  {sig && <span aria-hidden className={`h-3 w-3 shrink-0 border-2 border-white ${sig.fill}`} />}
                  {x.label}
                </span>
                <span className="flex items-start justify-between gap-2">
                  <span data-figure className="fb-figure min-w-0">
                    {x.value}
                  </span>
                  <span aria-hidden className="fb-key">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
                  </span>
                </span>
                <span className="mt-auto font-sans text-sm font-semibold leading-snug text-ink-soft">{x.note}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
