"use client";

import { useInView, useSpring } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

const NUMERIC = /^([^0-9.]*)([0-9.]+)([^0-9.]*)$/;

/**
 * Counts numeric stats up from 0 when they scroll into view ("2nd", "Top 15", "4.00", "16.46x").
 *
 * - The real value is what the server renders (crawlers, link previews, reduced motion, no-JS).
 * - Glitch fixed: the previous version showed the final value, then snapped to "0" when the card
 *   scrolled in, then counted up (a visible flicker). Now, before the first paint, counters that are
 *   still off-screen are reset to 0 so the count-up starts cleanly; counters already on screen at
 *   load simply keep their value (no animation, no flicker).
 */
export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(value);
  const shouldAnimate = useRef(false);
  const spring = useSpring(0, { duration: 1500, bounce: 0 });
  const match = value.match(NUMERIC);

  // Runs before paint on the client only
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const onScreen = r.top < window.innerHeight && r.bottom > 0;
    if (!onScreen) {
      shouldAnimate.current = true;
      setDisplayValue(`${match[1]}0${match[3]}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!isInView || !shouldAnimate.current || !match) return;
    shouldAnimate.current = false;
    const [, prefix, numStr, suffix] = match;
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;

    spring.jump(0);
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(`${prefix}${decimals ? latest.toFixed(decimals) : Math.round(latest)}${suffix}`);
    });
    const done = spring.on("animationComplete", () => setDisplayValue(value));
    spring.set(parseFloat(numStr));

    return () => {
      unsubscribe();
      done();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, value, spring]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
