import { motion } from "motion/react";
import { useReducedMotion } from "../shared/reduced-motion";

interface Chip {
  label: string;
  style: React.CSSProperties;
  delay: number;
}

const CHIPS: Chip[] = [
  { label: "React · Node.js · Cloud Architecture · DevOps", style: { top: "8%", right: "4%" }, delay: 0 },
  { label: "Healthcare · SaaS · Logistics · Finance", style: { top: "46%", right: "1%" }, delay: 0.4 },
  { label: "Discovery to Launch and Scale", style: { bottom: "8%", right: "6%" }, delay: 0.8 },
];

export function HeroChips() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {CHIPS.map((chip) => (
        <motion.div
          key={chip.label}
          className="hero-chip"
          style={{ position: "absolute", ...chip.style }}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: [12, -6, 12] }
          }
          transition={
            reduceMotion
              ? { duration: 0.3 }
              : {
                  opacity: { duration: 0.6, delay: chip.delay },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: chip.delay },
                }
          }
        >
          {chip.label}
        </motion.div>
      ))}
    </>
  );
}
