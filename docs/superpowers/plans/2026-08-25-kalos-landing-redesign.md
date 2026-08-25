# Kalos Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Kalos landing page as a hybrid Astro + React-islands site with a Motion/react-three-fiber 3D hero, an Astryx-based bento layout for the services section, and the real brand assets extracted from the company brochure, while preserving the zero-JS content baseline and the existing `npm test` suite.

**Architecture:** Astro stays the static-HTML shell (all real copy server-rendered). React islands (`client:load` on the hero, `client:visible` elsewhere) add the animated/3D layer on top. Astro SSRs each island's initial DOM into `dist/index.html`, so grep-based tests against the built HTML keep passing.

**Tech Stack:** Astro 4.15 (existing) + `@astrojs/react`, React 19, `motion` (Motion/ex-Framer-Motion), `three` + `@react-three/fiber` + `@react-three/drei`, `@astryxdesign/core` + `@stylexjs/stylex` + `vite-plugin-stylex`.

**Spec:** `docs/superpowers/specs/2026-08-25-kalos-landing-redesign-design.md`

## Global Constraints

- Zero-JS baseline: every section's real text content must still appear in `dist/index.html` and be readable with JavaScript disabled. Only decorative/animated layers are JS-dependent.
- `prefers-reduced-motion: reduce` must collapse every new animation (Motion and react-three-fiber) to a static frame, matching the existing CSS-level override in `src/styles/global.css`.
- No fabricated numbers or invented stats anywhere (hero chips, copy). Only use strings that already exist in `src/data/content.ts`.
- No section may repeat the immediately-adjacent section's layout family (spec Section 5 table is authoritative for section-to-layout mapping).
- `npm test` (the existing `tests/*.test.mjs` suite, build-then-grep-`dist/index.html`) must pass unmodified in its assertions about visible copy — only add new test files, don't weaken existing ones.
- Real extracted assets only, from `src/assets/logo-lockup.png`, `src/assets/logo-icon.png`, `src/assets/photos/{hologram-hands,portrait-woman,pair-coworking,team-collaboration}.png` — no placeholder imagery.
- If StyleX↔Vite wiring (Task 7) proves unstable, the pre-approved fallback (spec Section 3) is: drop `@astryxdesign/core`, hand-build the bento grid with plain React + existing CSS tokens. State explicitly in the task's commit message if this fallback is taken.

---

## Task 1: Wire up React islands (toolchain foundation)

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Create: `src/react/shared/reduced-motion.ts`
- Create: `src/react/shared/RevealOnScroll.tsx`
- Modify: `src/styles/global.css` (add `.reveal-island` base styles, mirrors existing `[data-reveal]` behavior for React-rendered content)
- Test: `tests/react-islands.test.mjs`

**Interfaces:**
- Produces: `useReducedMotion(): boolean` from `src/react/shared/reduced-motion.ts` — used by every later island.
- Produces: `RevealOnScroll` component from `src/react/shared/RevealOnScroll.tsx` with props `{ children: ReactNode; direction?: "up" | "left" | "right"; delay?: number; className?: string }` — used by every later island that needs "enter on scroll."

- [ ] **Step 1: Install dependencies**

```bash
cd "/Users/trixie/Desktop/CLAUDE VSCODE/kalos-landing"
npm install @astrojs/react@^4 react@^19 react-dom@^19 motion@^13
npm install -D @types/react@^19 @types/react-dom@^19
```

- [ ] **Step 2: Register the React integration in Astro**

Edit `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://kalostechnology.com",
  output: "static",
  integrations: [react()],
});
```

- [ ] **Step 3: Write the reduced-motion hook**

Create `src/react/shared/reduced-motion.ts`:

```ts
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Write the shared scroll-reveal wrapper**

Create `src/react/shared/RevealOnScroll.tsx`:

```tsx
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
```

- [ ] **Step 5: Write a smoke-test island to prove the pipeline works**

Create `src/react/shared/__smoke__/SmokeIsland.tsx` (temporary, deleted in Step 8 once a real island exists):

```tsx
import { RevealOnScroll } from "../RevealOnScroll";

export function SmokeIsland() {
  return (
    <RevealOnScroll className="smoke-island">
      <p>react-island-smoke-test-content</p>
    </RevealOnScroll>
  );
}
```

Temporarily mount it in `src/pages/index.astro` (or wherever the page composes sections) right after `<Hero />`:

```astro
import { SmokeIsland } from "../react/shared/__smoke__/SmokeIsland";
---
<SmokeIsland client:load />
```

- [ ] **Step 6: Write the failing test**

Create `tests/react-islands.test.mjs`:

```js
// tests/react-islands.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("a React island SSRs its content into the static build", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /react-island-smoke-test-content/);
});
```

- [ ] **Step 7: Run the test and confirm it passes**

```bash
npm test -- tests/react-islands.test.mjs
```

Expected: PASS (React 19 + `@astrojs/react` correctly SSRs the island).

- [ ] **Step 8: Remove the smoke-test island and its page mount**

Delete `src/react/shared/__smoke__/` and the `<SmokeIsland client:load />` line added in Step 5. Leave `tests/react-islands.test.mjs` — replace its assertion to check for the real Hero island instead, once Task 4 lands (tracked there).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/react/shared/reduced-motion.ts src/react/shared/RevealOnScroll.tsx tests/react-islands.test.mjs
git commit -m "Add React islands toolchain (Astro + React 19 + Motion)"
```

---

## Task 2: Real logo + image pipeline

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Test: `tests/header.test.mjs` (extend), `tests/footer.test.mjs` (extend)

**Interfaces:**
- Consumes: `src/assets/logo-lockup.png`, `src/assets/logo-icon.png` (already in repo).
- Produces: nothing new consumed by later tasks — this task is self-contained.

- [ ] **Step 1: Extend the header test to expect the real logo asset**

Edit `tests/header.test.mjs`, replace the logo assertion:

```js
  assert.match(html, /<a href="\/" class="site-header__logo"/);
  assert.match(html, /logo-lockup/);
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npm test -- tests/header.test.mjs
```

Expected: FAIL (`logo-lockup` not yet referenced — current header still injects `logo.svg` raw markup).

- [ ] **Step 3: Swap the header logo to the real asset**

Edit `src/components/Header.astro`. Replace:

```astro
import { site, nav, hero } from "../data/content";
import Logo from "../assets/logo.svg?raw";
```

with:

```astro
import { Image } from "astro:assets";
import { site, nav, hero } from "../data/content";
import logoLockup from "../assets/logo-lockup.png";
```

Replace the logo markup:

```astro
<a href="/" class="site-header__logo" aria-label={`${site.name} home`} set:html={Logo} />
```

with:

```astro
<a href="/" class="site-header__logo" aria-label={`${site.name} home`}>
  <Image src={logoLockup} alt="" width={140} height={50} />
</a>
```

(`alt=""` because the link's own `aria-label` already names the destination — an image alt here would be redundant, matching the existing pattern where the logo is decorative inside a labelled link.)

Update the `.site-header__logo` CSS rule (remove `color: var(--white)` since it no longer colors an inline SVG via `currentColor`; keep `width: 140px` — add `height: auto; display: block;`):

```css
  .site-header__logo {
    width: 140px;
    height: auto;
    display: block;
  }
```

- [ ] **Step 4: Run the header test and confirm it passes**

```bash
npm test -- tests/header.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Extend the footer test and swap its logo the same way**

Edit `tests/footer.test.mjs`, add after the existing assertions:

```js
  assert.match(indexHtml, /logo-icon|logo-lockup/);
```

Edit `src/components/Footer.astro`. Replace:

```astro
import { site, nav, footer } from "../data/content";
import LogoRaw from "../assets/logo.svg?raw";

const Logo = LogoRaw.replaceAll("kalosLogoTitle", "kalosLogoTitleFooter");
```

with:

```astro
import { Image } from "astro:assets";
import { site, nav, footer } from "../data/content";
import logoLockup from "../assets/logo-lockup.png";
```

Replace:

```astro
<div class="site-footer__brand" aria-hidden="true" set:html={Logo} />
```

with:

```astro
<div class="site-footer__brand" aria-hidden="true">
  <Image src={logoLockup} alt="" width={130} height={47} />
</div>
```

(The id-collision comment and `LogoRaw.replaceAll` workaround are no longer needed — delete both, they were specific to inlining the same SVG twice on one page.)

Update `.site-footer__brand` CSS the same way as the header (`height: auto; display: block;`).

- [ ] **Step 6: Run the footer test and confirm it passes**

```bash
npm test -- tests/footer.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Run the full suite to confirm nothing else broke**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro tests/header.test.mjs tests/footer.test.mjs
git commit -m "Replace recreated logo.svg with real extracted Kalos logo"
```

---

## Task 3: Hero 3D scene (react-three-fiber node network)

**Files:**
- Create: `src/react/hero/HeroScene.tsx`
- Test: `tests/hero-scene.test.mjs` (unit test of the pure geometry helpers, not the WebGL render)

**Interfaces:**
- Produces: `HeroScene({ reduceMotion: boolean })` component, and exported pure helpers `generateNodes(seed: number): THREE.Vector3[]` and `buildEdges(nodes: THREE.Vector3[], maxDist: number): [THREE.Vector3, THREE.Vector3][]` — consumed only within this file, but exported so the test can check determinism without a WebGL context.

- [ ] **Step 1: Install three.js + react-three-fiber**

```bash
npm install three@^0.165 @react-three/fiber@^9.7 @react-three/drei@^10.7
npm install -D @types/three@^0.165
```

- [ ] **Step 2: Write the failing test for the deterministic node/edge generation**

Create `tests/hero-scene.test.mjs`:

```js
// tests/hero-scene.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateNodes, buildEdges } from "../src/react/hero/HeroScene.tsx";

test("generateNodes is deterministic for a given seed", () => {
  const a = generateNodes(42);
  const b = generateNodes(42);
  assert.equal(a.length, 24);
  assert.deepEqual(
    a.map((v) => [v.x, v.y, v.z]),
    b.map((v) => [v.x, v.y, v.z])
  );
});

test("buildEdges only connects nodes within maxDist", () => {
  const nodes = generateNodes(42);
  const edges = buildEdges(nodes, 2.6);
  for (const [a, b] of edges) {
    assert.ok(a.distanceTo(b) < 2.6);
  }
});
```

Note: this test imports a `.tsx` file directly under Node's test runner — confirm Node 22's native TypeScript stripping handles the JSX-free named exports (the exported helpers themselves contain no JSX, only the default-exported component does). If the import fails on JSX syntax elsewhere in the file, extract `generateNodes`/`buildEdges` into a sibling `src/react/hero/network-geometry.ts` (plain `.ts`, no JSX) and have `HeroScene.tsx` import from it — do this proactively since it's the safer structure (keeps pure logic separate from rendering, per the file-structure guidance in writing-plans).

- [ ] **Step 3: Create the pure geometry module**

Create `src/react/hero/network-geometry.ts`:

```ts
import * as THREE from "three";

export const NODE_COUNT = 24;

export function generateNodes(seed: number): THREE.Vector3[] {
  const nodes: THREE.Vector3[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(
      new THREE.Vector3(
        (rand() - 0.5) * 8,
        (rand() - 0.5) * 5,
        (rand() - 0.5) * 4
      )
    );
  }
  return nodes;
}

export function buildEdges(
  nodes: THREE.Vector3[],
  maxDist: number
): [THREE.Vector3, THREE.Vector3][] {
  const edges: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) < maxDist) {
        edges.push([nodes[i], nodes[j]]);
      }
    }
  }
  return edges;
}
```

Update the test import in `tests/hero-scene.test.mjs` to `from "../src/react/hero/network-geometry.ts"`.

- [ ] **Step 4: Run the test and confirm it fails**

```bash
npm test -- tests/hero-scene.test.mjs
```

Expected: FAIL (module doesn't exist yet — do this step before Step 3 if following strict TDD order; either order is fine as long as you observe one real failure before the implementation exists).

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npm test -- tests/hero-scene.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Write the r3f scene component**

Create `src/react/hero/HeroScene.tsx`:

```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { generateNodes, buildEdges } from "./network-geometry";

function NetworkGroup({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(42), []);
  const edges = useMemo(() => buildEdges(nodes, 2.6), [nodes]);

  useFrame((state, delta) => {
    if (!group.current || reduceMotion) return;
    group.current.rotation.y += delta * 0.05;
    const targetX = state.pointer.y * 0.15;
    const targetY = state.pointer.x * 0.15;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.02;
  });

  return (
    <group ref={group}>
      {edges.map(([a, b], i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#1fe6e6" transparent opacity={0.18} />
        </line>
      ))}
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#1fe6e6" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export interface HeroSceneProps {
  reduceMotion: boolean;
}

export function HeroScene({ reduceMotion }: HeroSceneProps) {
  if (reduceMotion) {
    // Static frame: render once, no useFrame-driven rotation, no continuous RAF loop.
    return (
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop="demand"
        style={{ position: "absolute", inset: 0 }}
      >
        <NetworkGroup reduceMotion />
      </Canvas>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <NetworkGroup reduceMotion={false} />
    </Canvas>
  );
}
```

`frameloop="demand"` on the reduced-motion path means r3f renders one frame and stops — no continuous animation loop runs at all, which is the strongest form of "collapses to a static frame."

- [ ] **Step 7: Run the full test suite**

```bash
npm test
```

Expected: all PASS (this component isn't mounted into any page yet, so no existing test touches it).

- [ ] **Step 8: Commit**

```bash
git add src/react/hero/network-geometry.ts src/react/hero/HeroScene.tsx tests/hero-scene.test.mjs package.json package-lock.json
git commit -m "Add deterministic node-network geometry and r3f HeroScene"
```

---

## Task 4: Hero floating stat chips + island composition + Hero.astro rewrite

**Files:**
- Create: `src/react/hero/HeroChips.tsx`
- Create: `src/react/hero/HeroIsland.tsx`
- Modify: `src/components/Hero.astro`
- Modify: `src/styles/global.css` (add `.hero-chip` styles)
- Modify: `tests/react-islands.test.mjs` (point it at the real hero island instead of the deleted smoke test)
- Modify: `tests/hero.test.mjs` (unchanged assertions still apply — headline/subhead/CTA copy doesn't move; add one new assertion for the island mount point)

**Interfaces:**
- Consumes: `RevealOnScroll`, `useReducedMotion` (Task 1); `HeroScene` (Task 3).
- Produces: `HeroIsland` component, default export, no props — mounted once in `Hero.astro`.

- [ ] **Step 1: Write the chips component using only real, already-published copy fragments**

Create `src/react/hero/HeroChips.tsx`. The three chip labels are pulled verbatim from `src/data/content.ts` (`staffAugServices.items[2].description`'s tech list and `industries.items`) — not invented:

```tsx
import { motion } from "motion/react";
import { useReducedMotion } from "../shared/reduced-motion";

interface Chip {
  label: string;
  style: React.CSSProperties;
  delay: number;
}

const CHIPS: Chip[] = [
  { label: "React · Node.js · Cloud Architecture · DevOps", style: { top: "10%", right: "4%" }, delay: 0 },
  { label: "Healthcare · SaaS · Logistics · Finance", style: { bottom: "22%", left: "2%" }, delay: 0.4 },
  { label: "Discovery to Launch & Scale", style: { top: "56%", right: "0%" }, delay: 0.8 },
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
```

- [ ] **Step 2: Compose the island**

Create `src/react/hero/HeroIsland.tsx`:

```tsx
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
```

`aria-hidden="true"`: the chips repeat information already present as real page text elsewhere (Services, Industries, Process sections), so this decorative echo doesn't need its own accessibility tree presence, and the 3D canvas is purely visual.

- [ ] **Step 3: Add chip styling to global.css**

Append to `src/styles/global.css`:

```css
.hero-chip {
  background: rgba(10, 14, 31, 0.6);
  border: 1px solid var(--border-on-dark);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--teal-300);
  backdrop-filter: blur(6px);
  pointer-events: none;
  white-space: nowrap;
}

@media (max-width: 860px) {
  .hero-chip {
    display: none;
  }
}
```

(Chips are hidden below 860px — the same breakpoint the hero grid already collapses at — so they don't crowd the single-column mobile layout; the 3D scene still renders full-bleed behind the text on mobile.)

- [ ] **Step 4: Update the hero island smoke test to check for the real component**

Edit `tests/react-islands.test.mjs`, replace the assertion:

```js
  assert.match(html, /class="hero-island"/);
```

(Delete the now-stale `react-island-smoke-test-content` assertion — that string no longer exists anywhere.)

- [ ] **Step 5: Rewrite Hero.astro**

Replace the full contents of `src/components/Hero.astro`:

```astro
---
// src/components/Hero.astro
import { Image } from "astro:assets";
import { hero } from "../data/content";
import { HeroIsland } from "../react/hero/HeroIsland";
import hologramHands from "../assets/photos/hologram-hands.png";
---

<section id="hero" class="hero" aria-labelledby="hero-heading">
  <div class="hero__mesh" aria-hidden="true"></div>
  <div class="hero__photo-layer" aria-hidden="true">
    <Image src={hologramHands} alt="" width={640} height={581} />
  </div>
  <HeroIsland client:load />
  <div class="container hero__inner">
    <div class="hero__copy">
      <p class="hero__eyebrow" data-reveal style={{ "--reveal-delay": "0s" }}>{hero.eyebrow}</p>
      <h1 id="hero-heading" data-reveal style={{ "--reveal-delay": "0.1s" }}>{hero.headline}</h1>
      <p class="hero__subhead" data-reveal style={{ "--reveal-delay": "0.2s" }}>{hero.subhead}</p>
      <div class="hero__actions" data-reveal style={{ "--reveal-delay": "0.3s" }}>
        <a href={hero.primaryCta.href} class="btn btn-primary">{hero.primaryCta.label}</a>
        <a href={hero.secondaryCta.href} class="btn btn-secondary">{hero.secondaryCta.label}</a>
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    background: var(--navy-950);
    color: var(--white);
    padding-block: var(--space-24) var(--space-16);
    overflow: hidden;
    min-height: 90vh;
    display: flex;
    align-items: center;
  }

  .hero__mesh {
    position: absolute;
    inset: 0;
    background: var(--gradient-mesh);
    pointer-events: none;
    z-index: 0;
  }

  .hero__photo-layer {
    position: absolute;
    right: -5%;
    bottom: -8%;
    width: min(46vw, 640px);
    opacity: 0.35;
    filter: blur(0.5px) saturate(1.1);
    z-index: 1;
    pointer-events: none;
  }

  .hero__photo-layer :global(img) {
    width: 100%;
    height: auto;
    border-radius: var(--radius-lg);
  }

  .hero__inner {
    position: relative;
    z-index: 3;
  }

  .hero__eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--teal-400);
    font-size: var(--text-sm);
    font-weight: 700;
    margin-bottom: var(--space-3);
  }

  .hero h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
    max-width: 18ch;
  }

  .hero__subhead {
    font-size: var(--text-lg);
    color: rgba(255, 255, 255, 0.85);
    max-width: 46ch;
  }

  .hero__actions {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
  }
</style>

<style is:global>
  .hero-island {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .hero-island canvas {
    pointer-events: none;
  }
</style>
```

Notes on this rewrite:
- The `hero__inner` grid (copy | graphic, two columns) is gone — the hero is now single-column full-bleed, with the 3D scene and photo layered behind the text (z-index 0/1/2 for mesh/photo/canvas, 3 for text), matching "layered interface components... depth and perspective" from the brief.
- `hero-island` and its canvas get `pointer-events: none` so the decorative layer never blocks clicks on the CTAs above it.
- The old hand-drawn SVG network graphic and its `draw-line`/`pulse-node`/`rotate-ring` keyframe animations are removed entirely — replaced by the real r3f scene. Delete those now-unused keyframes if grep shows nothing else references them: `grep -rn "draw-line\|pulse-node\|rotate-ring" src/`.

- [ ] **Step 6: Run the hero and react-island tests**

```bash
npm test -- tests/hero.test.mjs tests/react-islands.test.mjs
```

Expected: both PASS (hero.test.mjs's assertions about the h1 count and CTA copy are untouched by this rewrite — same headline, same CTAs, just a new visual layer around them).

- [ ] **Step 7: Run the full suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 8: Visual check in the dev server**

```bash
npm run dev
```

Open `http://localhost:4321/`, confirm: the node network renders behind the headline and rotates gently / responds to mouse movement, the hologram-hands photo is visible as a faint layer bottom-right, the three chips float in from real copy (tech stack, industries, process), and toggling OS-level "reduce motion" freezes the network and chips to a static frame. Stop the dev server when done.

- [ ] **Step 9: Commit**

```bash
git add src/react/hero/HeroChips.tsx src/react/hero/HeroIsland.tsx src/components/Hero.astro src/styles/global.css tests/react-islands.test.mjs
git commit -m "Compose Hero into a layered 3D/motion island, retire hand-drawn SVG graphic"
```

---

## Task 5: Problem section (About.astro → full-bleed editorial)

**Files:**
- Modify: `src/components/About.astro`
- Modify: `tests/about.test.mjs`

**Interfaces:**
- Consumes: `RevealOnScroll` (Task 1) — optional here since this section can be CSS-only; use the existing `[data-reveal]` CSS system already in `global.css` for consistency with other pure-Astro sections instead of pulling in a React island where none is needed.
- Consumes: `src/assets/photos/portrait-woman.png`.

- [ ] **Step 1: Extend the existing about test**

Edit `tests/about.test.mjs`, add:

```js
  assert.match(html, /portrait-woman/);
```

(Read the current file first to match its exact existing assertions and append to them, not replace.)

- [ ] **Step 2: Run it and confirm it fails**

```bash
npm test -- tests/about.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Rewrite About.astro as the full-bleed Problem section**

Replace `src/components/About.astro`:

```astro
---
// src/components/About.astro
import { Image } from "astro:assets";
import { about } from "../data/content";
import portraitWoman from "../assets/photos/portrait-woman.png";
---

<section id="about" class="about" aria-labelledby="about-heading">
  <Image src={portraitWoman} alt="" width={1200} height={2100} class="about__photo" />
  <div class="about__scrim" aria-hidden="true"></div>
  <div class="container about__inner" data-reveal>
    <h2 id="about-heading">{about.heading}</h2>
    <p>{about.overview}</p>
    <p>{about.reliability}</p>
  </div>
</section>

<style>
  .about {
    position: relative;
    min-height: 70vh;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    color: var(--white);
  }

  .about :global(.about__photo) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    z-index: 0;
  }

  .about__scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10, 14, 31, 0.92) 15%,
      rgba(10, 14, 31, 0.55) 55%,
      rgba(10, 14, 31, 0.15) 100%
    );
    z-index: 1;
  }

  .about__inner {
    position: relative;
    z-index: 2;
    padding-block: var(--space-16);
    max-width: 70ch;
  }

  .about h2 {
    font-size: var(--text-xl);
    max-width: 20ch;
  }
</style>
```

- [ ] **Step 4: Run the about test**

```bash
npm test -- tests/about.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run the full suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/About.astro tests/about.test.mjs
git commit -m "Rebuild About as a full-bleed Problem section with the real portrait photo"
```

---

## Task 6: Astryx + StyleX wiring

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Create: `src/styles/stylex.tokens.ts`
- Create: `src/react/services/__smoke__/AstryxSmoke.tsx` (temporary, deleted at end of task)
- Test: `tests/astryx-smoke.test.mjs` (temporary, deleted at end of task — this task's job is to prove the toolchain works, not ship a feature)

**Interfaces:**
- Produces: a working StyleX compile step in the Astro/Vite build, and `src/styles/stylex.tokens.ts` exporting a token object later tasks import — OR, if the fallback is taken, produces nothing and Task 7 proceeds with plain React + CSS tokens instead.

- [ ] **Step 1: Install Astryx + StyleX + the Vite plugin**

```bash
npm install @astryxdesign/core@^0.5.0 @stylexjs/stylex@^0.19
npm install -D vite-plugin-stylex@^0.13
```

- [ ] **Step 2: Define shared StyleX tokens matching the existing CSS palette**

Create `src/styles/stylex.tokens.ts`:

```ts
import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  navy950: "#0a0e1f",
  navy900: "#10152c",
  navy800: "#161d3a",
  teal400: "#1fe6e6",
  teal300: "#7ff2f2",
  white: "#ffffff",
  lavender50: "#f4f4fb",
  ink900: "#12131c",
  borderOnLight: "rgba(10, 14, 31, 0.12)",
});
```

(Values copied verbatim from `src/styles/tokens.css` — this is the "one system, not two" requirement from the spec: Astryx islands and static Astro sections share the same palette source of truth, just expressed in each toolchain's own format.)

- [ ] **Step 3: Register the StyleX Vite plugin**

Edit `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import styleX from "vite-plugin-stylex";

export default defineConfig({
  site: "https://kalostechnology.com",
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [styleX()],
  },
});
```

- [ ] **Step 4: Write a smoke-test component using a real Astryx primitive**

Create `src/react/services/__smoke__/AstryxSmoke.tsx`:

```tsx
import { Button } from "@astryxdesign/core";

export function AstryxSmoke() {
  return <Button>astryx-smoke-test-button</Button>;
}
```

Mount it temporarily in `src/pages/index.astro` after the Hero section: `<AstryxSmoke client:load />`.

- [ ] **Step 5: Write the failing test**

Create `tests/astryx-smoke.test.mjs`:

```js
// tests/astryx-smoke.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("an Astryx component renders through the StyleX build pipeline", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /astryx-smoke-test-button/);
});
```

- [ ] **Step 6: Run the build and the test**

```bash
npm test -- tests/astryx-smoke.test.mjs
```

**Decision point:**
- If PASS: the toolchain works. Proceed to Step 7.
- If the build fails (StyleX extraction error, Vite plugin incompatibility, or any error that isn't a quick one-line fix): stop, do not spend more than one troubleshooting pass on it. Take the pre-approved fallback from the spec — remove `@astryxdesign/core`, `@stylexjs/stylex`, `vite-plugin-stylex` from `package.json`, remove the `vite.plugins` entry from `astro.config.mjs`, delete `src/styles/stylex.tokens.ts`, and record in the commit message for this task: `"Astryx/StyleX wiring failed (<one-line reason>); falling back to plain React + CSS tokens per spec Section 3."` Task 7's bento grid is then built with plain React + `global.css`/`tokens.css` classes instead of Astryx components — same visual outcome (asymmetric bento tiles), different implementation.

- [ ] **Step 7: Remove the smoke test**

Delete `src/react/services/__smoke__/`, the `<AstryxSmoke client:load />` mount, and `tests/astryx-smoke.test.mjs` — this task's job was only to prove (or disprove) the toolchain.

- [ ] **Step 8: Run the full suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/styles/stylex.tokens.ts
git commit -m "Wire up Astryx + StyleX build pipeline"
```

(If the fallback was taken, commit whatever remains — likely just an updated `astro.config.mjs` with no new plugin — with the fallback message from Step 6 instead.)

---

## Task 7: Custom Software bento grid (Services.astro)

**Files:**
- Create: `src/react/services/ServiceBento.tsx`
- Modify: `src/components/Services.astro`
- Modify: `tests/services.test.mjs`

**Interfaces:**
- Consumes: `RevealOnScroll`, `useReducedMotion` (Task 1); `Astryx` primitives if Task 6 succeeded, otherwise plain divs + CSS classes if the fallback was taken (write whichever variant matches Task 6's actual outcome).
- Consumes: `src/assets/photos/pair-coworking.png`.
- Produces: `ServiceBento({ items, photoSrc }: { items: Array<{ title: string; description: string }>; photoSrc: string })`.

- [ ] **Step 1: Extend the services test**

Edit `tests/services.test.mjs`, add:

```js
  assert.match(html, /pair-coworking/);
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npm test -- tests/services.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Write the bento component (plain-React variant — use this unless Task 6 confirmed Astryx works, in which case swap the wrapping `<div>`/`<article>` elements for the equivalent `@astryxdesign/core` `Card`/`Grid` components with the same className hooks)**

Create `src/react/services/ServiceBento.tsx`:

```tsx
import { RevealOnScroll } from "../shared/RevealOnScroll";

export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServiceBentoProps {
  items: ServiceItem[];
  photoSrc: string;
}

export function ServiceBento({ items, photoSrc }: ServiceBentoProps) {
  return (
    <div className="service-bento">
      <RevealOnScroll direction="left" className="service-bento__photo-tile">
        <img src={photoSrc} alt="" width={800} height={1400} loading="lazy" />
      </RevealOnScroll>
      {items.map((item, i) => (
        <RevealOnScroll
          key={item.title}
          direction={i % 2 === 0 ? "up" : "right"}
          delay={i * 0.08}
          className={`service-bento__tile${i === 0 ? " service-bento__tile--wide" : ""}`}
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </RevealOnScroll>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Add bento layout CSS to global.css**

Append to `src/styles/global.css`:

```css
.service-bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(140px, auto);
  gap: var(--space-4);
  margin-top: var(--space-8);
}

.service-bento__photo-tile {
  grid-column: span 2;
  grid-row: span 2;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.service-bento__photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-bento__tile {
  grid-column: span 2;
  background: var(--white);
  border: 1px solid var(--border-on-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.service-bento__tile--wide {
  grid-column: span 4;
}

@media (max-width: 780px) {
  .service-bento {
    grid-template-columns: 1fr;
  }
  .service-bento__photo-tile,
  .service-bento__tile,
  .service-bento__tile--wide {
    grid-column: span 1;
  }
}
```

- [ ] **Step 5: Update Services.astro to render the bento**

Replace `src/components/Services.astro`:

```astro
---
// src/components/Services.astro
import { services } from "../data/content";
import { ServiceBento } from "../react/services/ServiceBento";
import pairCoworking from "../assets/photos/pair-coworking.png";
---

<section id={services.id} class="services" aria-labelledby="services-heading">
  <div class="container">
    <p class="eyebrow">{services.eyebrow}</p>
    <h2 id="services-heading">{services.heading}</h2>
    <p class="services__intro">{services.intro}</p>
    <ServiceBento client:visible items={services.items} photoSrc={pairCoworking.src} />
  </div>
</section>

<style>
  .services {
    padding-block: var(--space-16);
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--navy-800);
    font-size: var(--text-sm);
    font-weight: 700;
    opacity: 0.65;
  }

  .services__intro {
    max-width: 60ch;
  }
</style>
```

(`pairCoworking.src` — Astro's image imports resolve to an object with a `.src` string when used outside `<Image>`/`<Picture>`, which is what a plain `<img>` inside the React island needs. This bypasses `astro:assets`' automatic optimization for this one image since it's consumed by a client component rather than rendered by Astro directly — acceptable here since it's a single bento tile, not a full-bleed hero photo; note as a possible follow-up optimization, not a blocker.)

- [ ] **Step 6: Run the services test**

```bash
npm test -- tests/services.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Run the full suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 8: Visual check**

```bash
npm run dev
```

Confirm the 5 services render as an asymmetric bento (one wide tile, one photo tile spanning 2×2, remaining tiles at 2-column width), each revealing in a different direction as you scroll. Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add src/react/services/ServiceBento.tsx src/components/Services.astro src/styles/global.css tests/services.test.mjs
git commit -m "Rebuild Custom Software section as an asymmetric bento grid"
```

---

## Task 8: Approach sticky-stack (Process.astro)

**Files:**
- Create: `src/react/process/ProcessStack.tsx`
- Modify: `src/components/Process.astro`
- Test: `tests/process.test.mjs` (existing assertions must still pass unmodified — this task must not change step order or copy)

**Interfaces:**
- Consumes: `useReducedMotion` (Task 1).
- Produces: `ProcessStack({ steps }: { steps: Array<{ number: string; title: string; description: string }> })`.

- [ ] **Step 1: Confirm the existing test still describes the contract**

Read `tests/process.test.mjs` — it already asserts the 5 step titles appear in order inside `id="approach"`. No new assertion needed; this task must keep that test passing with a different visual implementation underneath.

- [ ] **Step 2: Write the sticky-stack component**

Create `src/react/process/ProcessStack.tsx`:

```tsx
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
  const opacity = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
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
```

- [ ] **Step 3: Add sticky-stack CSS**

Append to `src/styles/global.css`:

```css
.process-stack {
  position: relative;
  margin-top: var(--space-8);
}

.process-stack__item {
  position: sticky;
  margin-bottom: var(--space-6);
}

.process-stack__card {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  background: var(--white);
  border: 1px solid var(--border-on-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
}

.process-stack__number {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--teal-400);
  background: var(--navy-950);
  border-radius: 999px;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.process-stack__card h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-1);
}

@media (prefers-reduced-motion: reduce) {
  .process-stack__item {
    position: static;
  }
}
```

(Reduced motion falls back to `position: static` — the steps stack in normal document flow instead of sticking/scaling, which is the CSS-level equivalent of the JS-level `reduceMotion` check already skipping the `opacity`/`scale` transform in the component.)

- [ ] **Step 4: Update Process.astro**

Replace `src/components/Process.astro`:

```astro
---
// src/components/Process.astro
import { process } from "../data/content";
import { ProcessStack } from "../react/process/ProcessStack";
---

<section id={process.id} class="process" aria-labelledby="process-heading">
  <div class="container">
    <h2 id="process-heading">{process.heading}</h2>
    <p class="process__intro">{process.intro}</p>
    <ProcessStack client:visible steps={process.steps} />
  </div>
</section>

<style>
  .process {
    padding-block: var(--space-16);
  }

  .process__intro {
    max-width: 60ch;
  }
</style>
```

- [ ] **Step 5: Run the process test**

```bash
npm test -- tests/process.test.mjs
```

Expected: PASS (same 5 titles, same order, same `id="approach"` — only the CSS/JS presentation changed).

- [ ] **Step 6: Run the full suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/react/process/ProcessStack.tsx src/components/Process.astro src/styles/global.css
git commit -m "Turn the Approach section into a scroll-linked sticky stack"
```

---

## Task 9: Why Kalos proof section (full-bleed team photo)

**Files:**
- Modify: `src/components/WhyKalos.astro`
- Modify: `tests/why-kalos.test.mjs`

**Interfaces:**
- Consumes: `src/assets/photos/team-collaboration.png`. No React needed — CSS-only full-bleed, consistent with "Proof" being a plain photo + overlay quote per the spec table.

- [ ] **Step 1: Extend the why-kalos test**

Edit `tests/why-kalos.test.mjs`, add:

```js
  assert.match(html, /team-collaboration/);
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npm test -- tests/why-kalos.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Rewrite WhyKalos.astro**

Replace `src/components/WhyKalos.astro`:

```astro
---
// src/components/WhyKalos.astro
import { Image } from "astro:assets";
import { whyKalos } from "../data/content";
import teamPhoto from "../assets/photos/team-collaboration.png";
---

<section id="why-kalos" class="why-kalos" aria-labelledby="why-kalos-heading">
  <div class="container" data-reveal>
    <h2 id="why-kalos-heading">{whyKalos.heading}</h2>
    <p class="why-kalos__intro">{whyKalos.intro}</p>
    <ul class="why-kalos__bullets">
      {whyKalos.bullets.map((bullet) => (
        <li>{bullet}</li>
      ))}
    </ul>
    <p class="why-kalos__closing">{whyKalos.closing}</p>
  </div>

  <div class="why-kalos__proof">
    <Image src={teamPhoto} alt="" width={1600} height={3900} class="why-kalos__photo" />
    <div class="why-kalos__scrim" aria-hidden="true"></div>
    <div class="why-kalos__quote-wrap" data-reveal>
      <div>
        <h3>{whyKalos.whyKalosHeading}</h3>
        <ol>
          {whyKalos.whyKalosItems.map((item) => (
            <li>{item}</li>
          ))}
        </ol>
      </div>
      <blockquote class="why-kalos__quote">
        <p>{whyKalos.quote}</p>
      </blockquote>
    </div>
  </div>
</section>

<style>
  .why-kalos {
    padding-block: var(--space-16) 0;
  }

  .why-kalos__intro,
  .why-kalos__closing {
    max-width: 65ch;
  }

  .why-kalos__closing {
    font-weight: 600;
  }

  .why-kalos__bullets {
    padding-left: var(--space-6);
  }

  .why-kalos__proof {
    position: relative;
    min-height: 60vh;
    margin-top: var(--space-16);
    overflow: hidden;
    color: var(--white);
    display: flex;
    align-items: center;
  }

  .why-kalos__proof :global(.why-kalos__photo) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    z-index: 0;
  }

  .why-kalos__scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      rgba(10, 14, 31, 0.9) 30%,
      rgba(10, 14, 31, 0.35) 80%
    );
    z-index: 1;
  }

  .why-kalos__quote-wrap {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
    align-items: center;
    padding: var(--space-16) var(--space-6);
    max-width: var(--max-width);
    margin-inline: auto;
    width: 100%;
  }

  .why-kalos__quote {
    background: rgba(10, 14, 31, 0.55);
    border: 1px solid var(--border-on-dark);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    margin: 0;
    font-size: var(--text-xl);
    font-weight: 700;
    font-style: italic;
    backdrop-filter: blur(4px);
  }

  @media (max-width: 780px) {
    .why-kalos__quote-wrap {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 4: Run the why-kalos test**

```bash
npm test -- tests/why-kalos.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run the full suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/WhyKalos.astro tests/why-kalos.test.mjs
git commit -m "Rebuild Why Kalos as a full-bleed proof section with the real team photo"
```

---

## Task 10: Staff Augmentation benefits horizontal scroll-snap

**Files:**
- Modify: `src/components/StaffAugBenefits.astro`
- Test: `tests/staff-aug-benefits.test.mjs` (existing assertions must still pass — same 7 items, same copy)

**Interfaces:**
- No React needed — CSS scroll-snap only, per spec Section 5 ("horizontal scroll-snap benefit strip").

- [ ] **Step 1: Confirm the existing test's contract**

Read `tests/staff-aug-benefits.test.mjs` — note its exact assertions before editing, to make sure the rewrite keeps every one of them true (same 7 titles/descriptions, same order).

- [ ] **Step 2: Rewrite the layout to a horizontal scroll-snap strip**

Edit `src/components/StaffAugBenefits.astro`. Replace the `<ul class="staff-aug-benefits__grid">` markup with:

```astro
    <ul class="staff-aug-benefits__strip">
      {staffAugBenefits.items.map((item) => (
        <li class="card">
          <svg class="check-icon" aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
            <path d="M4 10l4 4 8-9" stroke="var(--teal-400)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
```

Replace the `.staff-aug-benefits__grid` CSS block with:

```css
  .staff-aug-benefits__strip {
    list-style: none;
    margin: var(--space-8) 0 0;
    padding: 0 0 var(--space-4);
    display: flex;
    gap: var(--space-6);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
  }

  .staff-aug-benefits__strip .card {
    scroll-snap-align: start;
    flex: 0 0 280px;
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }

  .staff-aug-benefits__strip h3 {
    font-size: var(--text-base);
    margin-bottom: var(--space-1);
  }

  .staff-aug-benefits__strip svg {
    flex-shrink: 0;
    margin-top: 4px;
  }
```

- [ ] **Step 3: Run the staff-aug-benefits test**

```bash
npm test -- tests/staff-aug-benefits.test.mjs
```

Expected: PASS (copy and order unchanged, only the container layout changed from CSS grid to a scroll-snap flex strip).

- [ ] **Step 4: Run the full suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/StaffAugBenefits.astro
git commit -m "Turn Staff Augmentation benefits into a horizontal scroll-snap strip"
```

---

## Task 11: Contact section motif echo

**Files:**
- Modify: `src/components/Contact.astro`

**Interfaces:**
- No new dependency: "faint echo" of the hero's node-network is implemented as a lightweight static inline SVG (not a second WebGL canvas — a second live r3f instance for a barely-visible background accent would cost real GPU/JS budget for no perceptible benefit, which conflicts with the spec's "avoid unnecessary dependencies or effects that compromise performance" constraint from the user's brief).

- [ ] **Step 1: Add a static SVG motif to the contact section background**

Edit `src/components/Contact.astro`. In the `<style>` block, extend `.contact__mesh` (already added in the prior motion pass) — leave it as-is — and add a new sibling element right after it in the markup:

```astro
  <div class="contact__mesh" aria-hidden="true"></div>
  <svg class="contact__motif" aria-hidden="true" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--teal-400)" stroke-opacity="0.15" stroke-width="1">
      <line x1="40" y1="340" x2="160" y2="220" />
      <line x1="160" y1="220" x2="260" y2="260" />
      <line x1="260" y1="260" x2="360" y2="120" />
      <line x1="160" y1="220" x2="180" y2="80" />
    </g>
    <g fill="var(--teal-400)" fill-opacity="0.2">
      <circle cx="40" cy="340" r="4" />
      <circle cx="160" cy="220" r="4" />
      <circle cx="260" cy="260" r="4" />
      <circle cx="360" cy="120" r="4" />
      <circle cx="180" cy="80" r="4" />
    </g>
  </svg>
```

Add to the `<style>` block:

```css
  .contact__motif {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 40%;
    max-width: 400px;
    pointer-events: none;
    z-index: 0;
  }
```

(Same node/edge shape language as the hero's 3D scene — same color, same visual grammar — but zero JS cost, which is the right trade for a background accent nobody needs to interact with.)

- [ ] **Step 2: Run the full suite**

```bash
npm test
```

Expected: all PASS (no test asserts against this purely decorative addition; confirm nothing else regressed).

- [ ] **Step 3: Commit**

```bash
git add src/components/Contact.astro
git commit -m "Echo the hero's node-network motif faintly behind the contact form"
```

---

## Task 12: Final integration pass

**Files:**
- Modify: `README.md` (dev setup notes — new deps mean a fresh `npm install` picks up React/Motion/r3f/Astryx automatically via `package-lock.json`, but call out the new `client:load`/`client:visible` pattern for future editors)
- No other file changes expected; this task is verification, not new features.

- [ ] **Step 1: Run the full test suite one more time, clean**

```bash
rm -rf dist .astro
npm test
```

Expected: all tests PASS from a clean build.

- [ ] **Step 2: Manual reduced-motion audit**

```bash
npm run dev
```

In Chrome DevTools: Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce". Reload. Confirm: hero 3D scene renders one static frame (no rotation), hero chips appear without the floating loop, process sticky-stack items sit in normal flow (not `position: sticky`) with no scale/opacity animation, all `[data-reveal]` elements are visible immediately without transition. Stop the dev server.

- [ ] **Step 3: Manual no-JS audit**

In Chrome DevTools: Settings → Debugger → check "Disable JavaScript" (or use `curl -s http://localhost:4321/ | less` against the built `dist/index.html` directly, which is closer to what actually ships). Confirm every section's real copy (headline, all body text, all list items, the contact form fields) is present and readable. The hero's 3D canvas and chips will be absent — expected, they're decorative-only.

- [ ] **Step 4: Lighthouse pass**

```bash
npm run build && npm run preview -- --port 4321 &
sleep 2
npx lighthouse http://localhost:4321/ --output=json --output-path=/tmp/lighthouse-kalos.json --chrome-flags="--headless" --only-categories=performance,accessibility
kill %1
```

Read `/tmp/lighthouse-kalos.json`'s `categories.performance.score` and `categories.accessibility.score`. If either is below 0.85, investigate the specific audit that's failing (common culprit for this stack: unoptimized image weight from the `pairCoworking.src` bypass in Task 7, or the r3f canvas's `dpr` setting on lower-end simulated devices) and fix before considering this task done.

- [ ] **Step 5: Update the README's dev notes**

Edit `README.md`, add a short section (read the existing file first to match its structure and add this in the appropriate place, not necessarily appended at the end):

```markdown
## React islands

The Hero, Custom Software (bento grid), and Approach (sticky-stack) sections
are React islands hydrated client-side (`client:load` on the Hero since it's
above the fold, `client:visible` elsewhere). Every island's real text content
is still server-rendered by Astro — only the Motion/react-three-fiber
animation layer depends on JavaScript. When adding a new island, put it under
`src/react/<section>/` and reuse `src/react/shared/RevealOnScroll.tsx` and
`useReducedMotion` from `src/react/shared/reduced-motion.ts` rather than
writing new scroll-reveal or reduced-motion logic per component.
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "Document the React-islands pattern for future contributors"
```

---

## Self-Review Notes

- **Spec coverage:** Section 2 (real assets) → Tasks 2, 4, 5, 7, 9. Section 3 (architecture) → Task 1, 6. Section 4 (file structure) → Tasks 1, 3, 4, 7, 8. Section 5 (section map) → Tasks 4, 5, 7, 8, 9, 10, 11. Section 6 (image pipeline) → Tasks 2, 4, 5, 9 use `astro:assets` `<Image>` directly; Task 7's bento tile is the one documented exception (raw `<img src={photo.src}>` inside a React island) with the trade-off stated inline. Section 7 (a11y/perf) → Task 12. Section 8 (StyleX risk) → Task 6's explicit decision point.
- **No fabricated stats:** Task 4's hero chips pull three real strings straight from `content.ts` (tech list, industries, process range) instead of inventing numbers — corrected from an earlier "12 engineers embedded this quarter" placeholder floated during chat brainstorming, which never made it into the spec or this plan.
- **Type consistency check:** `HeroScene({ reduceMotion })`, `HeroChips()` (no props), `HeroIsland()` (no props) — consistent across Tasks 3–4. `RevealOnScroll({ children, direction, delay, className })` used identically in Tasks 5 (implicitly, via existing `[data-reveal]` CSS instead — noted as a deliberate choice not to pull React into a section that doesn't need it), 7, and available to 8 (Task 8 uses Motion's `useScroll`/`useTransform` directly instead, since a sticky-stack needs per-item scroll progress, not a single enter-once reveal — different tool for a different job, not an inconsistency).
