import { Children, Fragment, isValidElement, type ReactNode } from 'react';

/**
 * R27 ScrollInk (after React Bits ScrollReveal + GSAP SplitText / ScrollTrigger scrub; native, no JS at runtime).
 * Splits its text into words; each word inks in from 18 % to full as it scrolls up the screen and un-inks when you
 * scroll back (CSS scroll-driven animation, `.si-w` in globals.css, compositor-only opacity). Inline elements (a
 * <strong>, the CGPA chip) stay whole and count as one word. The words are the same text in the same order: copy,
 * search and screen readers are unchanged. Browsers without scroll timelines, reduced motion and Calm Mode show the
 * text fully inked.
 */
export function ScrollInk({ children }: { children: ReactNode }) {
  let i = 0;
  const word = (node: ReactNode, key: string) => (
    <span key={key} className="si-w" style={{ '--i': i++ } as React.CSSProperties}>
      {node}
    </span>
  );
  const out: ReactNode[] = [];
  Children.forEach(children, (child, c) => {
    if (typeof child === 'string') {
      // keep the spaces as plain text between word spans, so wrapping and copy-paste are untouched
      child.split(/(\s+)/).forEach((part, p) => {
        if (!part) return;
        out.push(/^\s+$/.test(part) ? <Fragment key={`${c}-${p}`}>{part}</Fragment> : word(part, `${c}-${p}`));
      });
    } else if (isValidElement(child)) out.push(word(child, `${c}`));
    else if (child != null) out.push(child);
  });
  return <>{out}</>;
}
