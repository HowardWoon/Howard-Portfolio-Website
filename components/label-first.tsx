'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SIGNAL, type Signal } from '@/lib/signal';
import '@/app/label-first.css';

/*
 * R92 label-first (owner, 3 Nov 2026: "wherever the website can express something with a visual or a label, use a
 * visual or a label, not all words"; AGENTS.md 8.3; docs/R92-LABEL-FIRST.md).
 * - Every label is a VERBATIM piece of the text it fronts: a label that is not found in `source` is not drawn
 *   (tests/r92 fails on it), so no wording is ever invented.
 * - The full text stays word for word behind READ MORE. Closed it is `.sr-only`: screen readers, innerText and print
 *   still get all of it. The labels are aria-hidden (they repeat words of the text).
 * - The full text opens BELOW the button, so the button never moves when it is pressed (keep the reader's place).
 */

/** a label that starts with a figure ("51 behavioral heuristics", "100% custom audio") prints the figure in a block;
 *  a figure joined to its word ("12-pass", "5-agent") stays one word */
const LEAD_FIGURE = /^(\d[\d.,]*%?\+?)(?=\s)/;

/** a point's own label: the words before its first colon ("Layer 1 Execution Node: ..."), else the given phrase */
export function pointLabel(point: string, phrase?: string): string {
  if (phrase) return phrase;
  const m = /^([^:]{3,60}):\s/.exec(point);
  return m ? m[1] : point;
}

function Label({ text, index }: { text: string; index?: number }) {
  const fig = LEAD_FIGURE.exec(text);
  return (
    <li className="lf-label">
      {index !== undefined ? <span className="lf-idx">{String(index + 1).padStart(2, '0')}</span> : null}
      <span data-lf-chip className="lf-chip">
        {fig ? (
          <>
            <b className="lf-fig">{fig[1]}</b>
            <span>{text.slice(fig[1].length)}</span>
          </>
        ) : (
          text
        )}
      </span>
    </li>
  );
}

/** the text with its label phrases set in extra-bold ink (the words are unchanged) */
export function Marked({ text, keys }: { text: string; keys: string[] }) {
  const hits = keys
    .map((k) => ({ k, at: text.indexOf(k) }))
    .filter((h) => h.at >= 0)
    .sort((a, b) => a.at - b.at);
  const out: React.ReactNode[] = [];
  let pos = 0;
  hits.forEach(({ k, at }, i) => {
    if (at < pos) return; // overlapping phrase: the earlier one already covers it
    out.push(
      text.slice(pos, at),
      <strong key={i} className="lf-key">
        {k}
      </strong>,
    );
    pos = at + k.length;
  });
  out.push(text.slice(pos));
  return <>{out}</>;
}

/**
 * Labels first, the full text one press away.
 * `source` = every word of the full text (labels are checked against it); `numbered` = one label row per point.
 */
export function LabelFirst({
  labels,
  source,
  numbered,
  children,
  className = '',
  ...rest
}: {
  labels: string[];
  source: string;
  numbered?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const shown = labels.filter((l) => source.includes(l));
  return (
    <div {...rest} data-lf data-lf-open={open ? '' : undefined} className={`lf ${className}`}>
      <ul aria-hidden className={numbered ? 'lf-rows' : 'lf-chips'}>
        {shown.map((l, i) => (
          <Label key={i} text={l} index={numbered ? i : undefined} />
        ))}
      </ul>
      <button
        type="button"
        data-lf-more
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="lf-more nb-press"
      >
        <span aria-hidden className="lf-more-key">
          <ChevronDown className="h-4 w-4" strokeWidth={3} />
        </span>
        <span>{open ? 'READ LESS' : 'READ MORE'}</span>
      </button>
      <div id={id} data-lf-full className={open ? 'lf-full' : 'lf-full sr-only'}>
        {children}
      </div>
    </div>
  );
}

/**
 * A tagline as an ink label on a highlighter stripe in the item's OWN signal colour (the colour of its spec bar, so
 * the colour keeps its one meaning). No signal, or INDUSTRY (ink): a thick ink underline instead.
 */
export function Tagline({
  signal,
  children,
  className = '',
}: {
  signal?: Signal;
  children: React.ReactNode;
  className?: string;
}) {
  const mark = signal && signal !== 'industry' ? SIGNAL[signal].hex : undefined;
  return (
    <p
      data-lf-tag
      className={`lf-tag ${className}`}
      style={mark ? ({ '--lf-mark': mark } as React.CSSProperties) : undefined}
      data-mark={mark ? 'stripe' : 'rule'}
    >
      <span>{children}</span>
    </p>
  );
}
