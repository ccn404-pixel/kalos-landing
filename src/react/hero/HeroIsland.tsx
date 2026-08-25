import { HeroScene } from "./HeroScene";
import { HeroChips } from "./HeroChips";
import { useReducedMotion } from "../shared/reduced-motion";

export function HeroIsland() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="hero-island" aria-hidden="true">
      <HeroScene reduceMotion={reduceMotion} />
      <HeroChips />
    </div>
  );
}
