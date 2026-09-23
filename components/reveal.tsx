"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
export function Reveal({ delay = 0, y = 20, ...rest }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} {...rest} />;
}

