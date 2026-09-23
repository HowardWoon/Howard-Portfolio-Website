"use client";

import { useInView, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

/**
 * Counts numeric stats up from 0 when they scroll into view ("2nd", "Top 15", "4.00", "16.46x").
 *
 * Bug fixes vs. previous version:
 *  - The first render showed "0" (useReducedMotion() is null on the first render), and for
 *    reduced-motion users the effect returned early → the stat stayed "0" FOREVER.
 *  - Server HTML / crawlers / link previews also saw "0" instead of the real value.
 * The real value is now always rendered; only the count-up animation is optional.
 */
export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  const [displayValue, setDisplayValue] = useState(value);
  const spring = useSpring(0, { duration: 1500, bounce: 0 });

  useEffect(() => {
    const match = value.match(/^([^0-9.]*)([0-9.]+)([^0-9.]*)$/);
    if (prefersReducedMotion || !match || !isInView) {
      setDisplayValue(value);
      return;
    }

    const [, prefix, numStr, suffix] = match;
    const num = parseFloat(numStr);
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;

    spring.jump(0);
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(`${prefix}${decimals ? latest.toFixed(decimals) : Math.round(latest)}${suffix}`);
    });
    const done = spring.on("animationComplete", () => setDisplayValue(value));
    spring.set(num);

    return () => {
      unsubscribe();
      done();
    };
  }, [isInView, value, spring, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
