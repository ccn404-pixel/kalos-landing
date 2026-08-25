import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "./reduced-motion";

export interface RevealOnScrollProps {
  children: ReactNode;
  direction?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}

const OFFSETS: Record<string, { x?: number; y?: number }> = {
  up: { y: 24 },
  left: { x: -32 },
  right: { x: 32 },
};

export function RevealOnScroll({
  children,
  direction = "up",
  delay = 0,
  className,
}: RevealOnScrollProps) {
  const reduceMotion = useReducedMotion();
  const offset = OFFSETS[direction];

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
