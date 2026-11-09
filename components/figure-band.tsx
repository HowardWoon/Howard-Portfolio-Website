import { ArrowUpRight } from 'lucide-react';
import { LEDGER } from '@/lib/build-sheet';

/**
 * R111 (owner, Pinterest references: "12K+ · 98% · 150+" bands): a lime ground band under the hero tapes with the four
 * Build Sheet figures, each a link to the section that proves it. Read from lib/build-sheet.ts (the About plate reads
 * the same list), so a figure can never differ between the two. Lime is a ground (decoration), not a SIGNAL meaning.
 */
export function FigureBand() {
  return (
    <section aria-label="Figures" data-figure-band className="relative border-y-3 border-ink bg-ground-lime">
      <ul className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
        {LEDGER.map((x, i) => (
          <li
            key={x.label}
            className={`min-w-0 border-ink ${i % 2 ? 'border-l-3' : ''} ${i > 1 ? 'border-t-3 lg:border-t-0' : ''} ${
              i === 2 ? 'lg:border-l-3' : ''
            }`}
          >
            <a
              href={x.href}
              className="group flex h-full flex-col gap-1 px-4 py-5 text-ink outline-none focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-pop-blue sm:px-8 sm:py-7"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="font-display text-[clamp(2.4rem,7vw,4.25rem)] font-extrabold leading-none tracking-[-0.04em]">
                  {x.value}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="mt-1 h-6 w-6 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={3}
                />
              </span>
              <span className="font-mono text-xs font-extrabold uppercase tracking-[0.14em]">{x.label}</span>
              <span className="font-mono text-xs font-bold leading-snug text-ink">{x.note}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
