"use client";

import { motion, useInView, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? value : "0");
  const spring = useSpring(0, { duration: 1500, bounce: 0 });

  // Parse the input string to extract number and suffix
  // e.g. "100%" -> { number: 100, suffix: "%", prefix: "" }
  // e.g. "4.00" -> { number: 4.00, suffix: "", prefix: "" }
  // e.g. "16.46x" -> { number: 16.46, suffix: "x", prefix: "" }
  useEffect(() => {
    if (prefersReducedMotion) return;

    const match = value.match(/^([^0-9\.]*)([0-9\.]+)([^0-9\.]*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1];
    const num = parseFloat(match[2]);
    const suffix = match[3];
    const isFloat = match[2].includes('.');

    if (isInView) {
      spring.set(num);
    }

    const unsubscribe = spring.on("change", (latest) => {
      if (isFloat) {
        setDisplayValue(`${prefix}${latest.toFixed(2)}${suffix}`);
      } else {
        setDisplayValue(`${prefix}${Math.floor(latest)}${suffix}`);
      }
    });

    return () => unsubscribe();
  }, [isInView, value, spring, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}