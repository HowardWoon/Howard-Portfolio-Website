'use client';

import { useInView, useSpring } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FX } from '@/lib/fx';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

const NUMERIC = /^([^0-9]*?)(\d+(?:\.\d+)?)(.*)$/;
const IS_RANK = (prefix: string, suffix: string) => /#|top/i.test(prefix) || /^(st|nd|rd|th)\b/i.test(suffix);

function parse(value: string) {
  const m = value.match(NUMERIC);
  if (!m) return null;
  const [, prefix, num, suffix] = m;
  const n = parseFloat(num);
  const decimals = num.includes('.') ? num.split('.')[1].length : 0;
  const worthCounting = decimals > 0 || n >= 10;
  if (!worthCounting || IS_RANK(prefix, suffix)) return null;
  return { prefix, numStr: num, suffix, decimals };
}

/**
 * Counts numeric stats up from 0 when they scroll into view ("2nd", "Top 15", "4.00", "16.46x").
 *
 * - The real value is what the server renders (crawlers, link previews, reduced motion, no-JS).
 * - Glitch fixed: the previous version showed the final value, then snapped to "0" when the card
 *   scrolled in, then counted up (a visible flicker). Now, before the first paint, counters that are
 *   still off-screen are reset to 0 so the count-up starts cleanly; counters already on screen at
 *   load simply keep their value (no animation, no flicker).
 */
/*
 * R40 T2 Odometer: with FX.odometer the count-up is a row of mechanical digit wheels. Each digit is a 0-9 column that
 * turns to its value (transform only: one transition, no text written per frame - the old spring rewrote the text,
 * i.e. laid out, on every frame); the decimal point and the rest stand still. The final digit holds each wheel's
 * width, so the number never shifts. Screen readers read the real value once. When it has stopped, plain text again.
 */
export function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const [roll, setRoll] = useState<'off' | 'armed' | 'run'>('off');
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(value);
  const shouldAnimate = useRef(false);
  const spring = useSpring(0, { duration: 1500, bounce: 0 });
  const match = parse(value);

  // Runs before paint on the client only
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const onScreen = r.top < window.innerHeight && r.bottom > 0;
    // R40: a counter that mounts on screen LATE (an honours category the visitor opened) rolls too; one already on
    // screen at page load keeps its value (no flicker)
    const late = FX.odometer && performance.now() > 5000 && document.documentElement.dataset.motion !== 'calm';
    if (!onScreen || late) {
      if (FX.odometer && document.documentElement.dataset.motion !== 'calm') setRoll('armed');
      else {
        shouldAnimate.current = true;
        setDisplayValue(`${match.prefix}0${match.suffix}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // R40 odometer: its own effects on [roll, isInView], so it never races the in-view check (a stat already in view
  // when the effects first ran used to take the spring path and leave the wheels armed)
  useEffect(() => {
    if (roll !== 'armed' || !isInView) return;
    const raf = requestAnimationFrame(() => setRoll('run'));
    return () => cancelAnimationFrame(raf);
  }, [roll, isInView]);
  useEffect(() => {
    if (roll !== 'run') return;
    const done = window.setTimeout(() => setRoll('off'), 1700);
    return () => window.clearTimeout(done);
  }, [roll]);

  useEffect(() => {
    if (!isInView || !shouldAnimate.current || !match) return;
    shouldAnimate.current = false;
    const { prefix, numStr, suffix, decimals } = match;

    spring.jump(0);
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(`${prefix}${decimals ? latest.toFixed(decimals) : Math.round(latest)}${suffix}`);
    });
    const done = spring.on('animationComplete', () => setDisplayValue(value));
    spring.set(parseFloat(numStr));

    return () => {
      unsubscribe();
      done();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, value, spring]);

  if (roll !== 'off' && match) {
    const chars = [...match.numStr];
    return (
      <span ref={ref} className={className} data-odometer={roll}>
        <span className="sr-only">{value}</span>
        <span aria-hidden>
          {match.prefix}
          {chars.map((ch, i) =>
            /d/.test(ch) ? (
              <span key={i} className="fx-odo">
                <span className="fx-odo-ph">{ch}</span>
                <span
                  className="fx-odo-col"
                  style={{
                    transform: roll === 'run' ? `translateY(-${Number(ch) * 10}%)` : 'translateY(0)',
                    transitionDelay: `${(chars.length - 1 - i) * 110}ms`,
                  }}
                >
                  {DIGITS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </span>
              </span>
            ) : (
              <span key={i}>{ch}</span>
            ),
          )}
          {match.suffix}
        </span>
      </span>
    );
  }
  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
