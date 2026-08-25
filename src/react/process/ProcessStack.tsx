import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "../shared/reduced-motion";

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

function StackItem({ step, index, total }: { step: ProcessStep; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  return (
    <div
      ref={ref}
      className="process-stack__item"
      style={{ top: `${96 + index * 24}px`, zIndex: index + 1 }}
    >
      <motion.div
        className="process-stack__card"
        style={reduceMotion ? undefined : { opacity, scale }}
      >
        <span className="process-stack__number" aria-hidden="true">
          {step.number}
        </span>
        <div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function ProcessStack({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="process-stack">
      {steps.map((step, i) => (
        <StackItem key={step.number} step={step} index={i} total={steps.length} />
      ))}
    </div>
  );
}
