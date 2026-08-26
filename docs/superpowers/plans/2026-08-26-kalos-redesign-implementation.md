# Kalos Techno-Schematic Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the approved "techno-schematic" visual redesign (dark/light
hairline-grid system, Archivo + IBM Plex Mono, teal accent) from a static
HTML mockup into the live Astro codebase at
`/Users/trixie/Desktop/CLAUDE VSCODE/kalos-landing` (branch
`redesign/landing-v2`), section by section, updating tests alongside each
section and removing now-dead dependencies (Three.js/R3F, StyleX/Astryx).

**Architecture:** Astro static site with React islands (`client:load`/
`client:visible`) for the few genuinely interactive/animated pieces (still
`ServiceBento`, `ProcessStack`; the Hero's WebGL island is deleted and
replaced by static Astro+CSS). Visual system moves to CSS custom
properties with a dark/light `.on-light` theme-flip pattern scoped per
`<section>`. Content facts live in `src/data/content.ts`; each `.astro`
component reads from there. Each section's test file
(`tests/<section>.test.mjs`) runs `npm run build` then asserts against
`dist/index.html`.

**Tech Stack:** Astro 4, React 19 (islands only), Motion (`motion` npm
package) for the interactive islands that keep motion, plain CSS (no
Tailwind/StyleX), Node's built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-08-26-techno-schematic-redesign-v2-design.md`
— read it before starting; it has the full rationale, the frozen mockup
reference (`docs/superpowers/specs/assets/2026-08-26-kalos-mockup-reference.html`),
and the three structural decisions the user made (Industries kept,
Staff Aug "Cultural Integration" kept as a 7th stat, Approach's
scroll-linked sticky-stack kept). This plan implements that spec; consult
it (and the reference HTML, which has the byte-exact CSS/markup this plan
quotes) if a task's instructions seem to leave something unspecified.

## Global Constraints

- Teal accent value does not change: `#1fe6e6` (existing `--teal-400`,
  aliased to the new `--teal` name — do not introduce a second hex literal
  for the same color).
- All new decorative motion (SVG line-draw pulses, logo marquee scroll)
  must be disabled under `prefers-reduced-motion: reduce`, matching the
  existing guarantee in `src/styles/global.css:14-26`.
- No new build-time JS frameworks/tools. Sharp corners (`border-radius: 0`)
  on all redesigned elements — do not carry over `--radius-md`/`--radius-lg`
  into new component CSS (they stay defined in `tokens.css` for anything
  not yet touched, e.g. `Industries.astro`'s pill shape when not otherwise
  specified).
- Every task must end with `npm test` passing (or, for tasks with no
  behavior change to test, `npm run build` succeeding) before commit.
- Node >=22.6.0, existing `npm test` command:
  `node --test --test-concurrency=1 'tests/**/*.test.mjs'`.
- Do not delete `src/assets/photos/pair-coworking.png` or `logo-lockup.png`
  from disk — only stop referencing them where the spec says to (Services
  bento drops the photo; Header swaps to `logo-icon.png`; Footer keeps
  `logo-lockup.png`).

---

## Task 1: Design tokens, theme system, and shared utility CSS

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro` (add IBM Plex Mono font link)
- Test: `tests/base-layout.test.mjs` (add font-link assertion)

**Interfaces:**
- Produces: CSS custom properties `--dark-bg`, `--dark-panel`, `--dark-ink`,
  `--dark-ink-dim`, `--dark-line`, `--dark-line-strong`, `--light-bg`,
  `--light-panel`, `--light-ink`, `--light-ink-dim`, `--light-line`,
  `--light-line-strong`, `--teal-deep`, `--teal-wash`, `--violet`,
  `--font-mono` on `:root`; a `section { --bg: var(--dark-bg); ... }` /
  `section.on-light { ... }` theme-flip block; shared `.tag`, `.tag .dot`,
  `.tag.status-off .dot`, `.mono`, `.num`, `.btn` (rewritten), `.btn-ghost`
  classes in `global.css` that every later task's component CSS depends on.
  All later tasks consume these names verbatim — do not rename them.

- [ ] **Step 1: Add the new tokens to `tokens.css`**

Edit `src/styles/tokens.css`, inside the existing `:root { ... }` block,
add after the existing `--border-on-light` line:

```css
  --dark-bg: #0a0d12;
  --dark-panel: #10141b;
  --dark-ink: #f0f2f0;
  --dark-ink-dim: #8b93a0;
  --dark-line: rgba(240, 242, 240, 0.13);
  --dark-line-strong: rgba(240, 242, 240, 0.24);

  --light-bg: #eef2f1;
  --light-panel: #ffffff;
  --light-ink: #0e1318;
  --light-ink-dim: #545f5c;
  --light-line: rgba(14, 19, 24, 0.11);
  --light-line-strong: rgba(14, 19, 24, 0.22);

  --teal: var(--teal-400);
  --teal-dim: var(--teal-300);
  --teal-deep: #0a8f8f;
  --teal-wash: rgba(31, 230, 230, 0.1);
  --violet: #8b7ff2;

  --font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", monospace;
```

Then change `--max-width: 1200px;` to `--max-width: 1240px;` (matches the
mockup's `--max` value — one-line change, no other token renamed).

- [ ] **Step 2: Add the font link to `BaseLayout.astro`**

In `src/layouts/BaseLayout.astro`, the existing Archivo `<link>` is at
lines 27-30. Replace the `href` so the same stylesheet request also pulls
IBM Plex Mono (one Google Fonts request, matching the mockup exactly):

```astro
    <link
      href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,500;0,600;0,700;0,800;1,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 3: Write the failing font-link test**

Edit `tests/base-layout.test.mjs`, add after the existing `og:title`
assertion:

```javascript
  assert.match(html, /family=IBM\+Plex\+Mono/);
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="base layout"`
Expected: FAIL (no match for `family=IBM\+Plex\+Mono` yet, since Step 2
hasn't landed if you're doing strict red-green — if you already did Step 2
first, skip ahead; the point is both the link and the assertion must exist
together by the end of this step).

- [ ] **Step 5: Add the theme system and shared utility classes to `global.css`**

Add to the end of `src/styles/global.css`:

```css
/* Theme-block pattern: section defaults to dark, .on-light flips it.
   Component CSS should reference --bg/--panel/--ink/--ink-dim/--line/
   --line-strong, never --dark-*/--light-* directly, so the same rules
   work in either theme. */
section {
  --bg: var(--dark-bg);
  --panel: var(--dark-panel);
  --ink: var(--dark-ink);
  --ink-dim: var(--dark-ink-dim);
  --line: var(--dark-line);
  --line-strong: var(--dark-line-strong);
}

section.on-light {
  --bg: var(--light-bg);
  --panel: var(--light-panel);
  --ink: var(--light-ink);
  --ink-dim: var(--light-ink-dim);
  --line: var(--light-line);
  --line-strong: var(--light-line-strong);
}

/* Global grain texture overlay — static, no animation, so it needs no
   prefers-reduced-motion gating. pointer-events:none keeps it from
   blocking clicks. */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.4;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E");
}

/* Mono eyebrow tag: bordered pill, optional status dot */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--line-strong, var(--border-on-dark));
  padding: 0.4rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-dim, var(--white));
  background: rgba(127, 127, 127, 0.04);
}

.tag .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--teal);
  flex-shrink: 0;
  box-shadow: 0 0 8px var(--teal);
}

.tag.status-off .dot {
  background: var(--ink-dim, var(--white));
  box-shadow: none;
  opacity: 0.5;
}

.mono {
  font-family: var(--font-mono);
}

.num {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-dim, var(--white));
  letter-spacing: 0.05em;
  opacity: 0.7;
}
```

- [ ] **Step 6: Rewrite `.btn`/add `.btn-ghost` for sharp corners + mono label**

Replace the existing `.btn`, `.btn-primary`, `.btn-secondary` rules in
`global.css` (currently lines 87-122) with:

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border: 1px solid var(--teal);
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  color: #04191a;
  background: var(--teal);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(31, 230, 230, 0.3);
}

.btn-secondary,
.btn-ghost {
  background: transparent;
  color: var(--ink, var(--white));
  border-color: var(--line-strong, var(--border-on-dark));
}

.btn-secondary:hover,
.btn-ghost:hover {
  border-color: var(--teal);
  color: var(--teal);
  box-shadow: none;
  transform: translateY(-2px);
}
```

Keep the existing `.btn-primary` class name as an alias so `Header.astro`'s
`class="btn btn-primary site-header__cta"` and `Contact.astro`'s
`class="btn btn-primary"` don't need touching in this task — add
`.btn-primary { background: var(--teal); color: #04191a; }` right after
`.btn` (same visual result, just keeps the existing class working without
an unrelated rename in this task).

- [ ] **Step 7: Run the full suite to verify nothing broke and the new font-link test passes**

Run: `npm test`
Expected: PASS — this task only adds tokens/utilities and one link tag, no
component markup changed yet, so every existing test (including the one
from Step 3) should be green.

- [ ] **Step 8: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css src/layouts/BaseLayout.astro tests/base-layout.test.mjs
git commit -m "Add techno-schematic design tokens, theme-flip system, and IBM Plex Mono"
```

---

## Task 2: Remove dead dependencies (Three.js/R3F, StyleX/Astryx)

**Files:**
- Delete: `src/react/hero/HeroScene.tsx`, `src/react/hero/HeroChips.tsx`,
  `src/react/hero/network-geometry.ts`, `src/styles/stylex.tokens.ts`
- Delete: `tests/hero-scene.test.mjs`
- Modify: `astro.config.mjs` (remove `vite-plugin-stylex` plugin)
- Modify: `package.json` (remove 7 packages)
- Modify: `.npmrc` (drop `legacy-peer-deps` if nothing else needs it)

**Note:** `src/react/hero/HeroIsland.tsx` is also deleted, but that happens
in Task 4 alongside the new Hero markup (deleting it here would break the
build since `Hero.astro` still imports it until Task 4 rewrites that file).
This task only removes the pieces nothing currently touches outside the
hero island itself.

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces: a `package.json`/`astro.config.mjs` with no r3f/three/stylex
  references — Task 4 depends on this being done first so its Hero rewrite
  doesn't need to also juggle dependency removal.

- [ ] **Step 1: Confirm zero remaining references before deleting anything**

Run:
```bash
grep -rn "three\|@react-three" src --include="*.ts" --include="*.tsx" --include="*.astro" | grep -v "node_modules"
grep -rn "stylex\|astryx" src astro.config.mjs --include="*.ts" --include="*.tsx" --include="*.astro" --include="*.mjs" | grep -v "node_modules"
```
Expected: only hits inside `HeroScene.tsx`, `HeroChips.tsx`,
`network-geometry.ts`, `HeroIsland.tsx` (three/r3f) and
`stylex.tokens.ts` + the `vite-plugin-stylex` import line in
`astro.config.mjs` (stylex/astryx). If anything else matches, stop and
investigate before deleting.

- [ ] **Step 2: Delete the dead files**

```bash
git rm src/react/hero/HeroScene.tsx src/react/hero/HeroChips.tsx src/react/hero/network-geometry.ts src/styles/stylex.tokens.ts tests/hero-scene.test.mjs
```

- [ ] **Step 3: Remove the StyleX plugin from `astro.config.mjs`**

Read the file first to find the exact import/plugin lines, then remove the
`import styleX from "vite-plugin-stylex"` line and the `styleX()` entry
from the `plugins: [...]` array (leaving any other plugins, e.g.
`@astrojs/react`, in place).

- [ ] **Step 4: Remove the 7 packages from `package.json`**

Remove from `dependencies`: `@astryxdesign/core`, `@react-three/drei`,
`@react-three/fiber`, `@stylexjs/stylex`, `three`.
Remove from `devDependencies`: `@types/three`, `vite-plugin-stylex`.
Keep `motion`, `react`, `react-dom`, `@astrojs/react`, `astro`,
`@types/react`, `@types/react-dom`.

- [ ] **Step 5: Reinstall and check `.npmrc`**

Run: `npm install`
Then check `.npmrc` — if its only content is `legacy-peer-deps=true` added
for `vite-plugin-stylex` (per commit `e899cb3`), test whether `npm install`
still needs it:
```bash
rm .npmrc  # temporarily
npm install
```
If `npm install` succeeds cleanly without peer-dependency errors, leave
`.npmrc` deleted (`git rm .npmrc`). If it errors, restore `.npmrc` with
`git checkout .npmrc` and keep it.

- [ ] **Step 6: Confirm the build still fails only where expected**

Run: `npm run build`
Expected: FAILS at this point — `Hero.astro` still imports
`HeroIsland.tsx`, which itself imports the now-deleted `HeroScene.tsx`/
`HeroChips.tsx`. This is expected; Task 4 fixes it. Do not attempt to make
the build pass in this task.

- [ ] **Step 7: Run the non-build-dependent tests to confirm nothing else broke**

Run: `node --test tests/content.test.mjs`
Expected: PASS (this test imports `content.ts` directly, no build step,
unaffected by this task).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Remove Three.js/R3F and StyleX/Astryx dead dependencies ahead of Hero rewrite"
```

(This commit intentionally leaves `npm run build` red until Task 4 lands —
call this out in the PR/task handoff so the next task's implementer isn't
surprised by a pre-broken build.)

---

## Task 3: Header reskin

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro` (only the `.site-footer a:hover`
  color reference, if it depended on a token that's changing — check
  during implementation; likely no change needed since `--teal-400` still
  exists)
- Test: `tests/header.test.mjs`

**Interfaces:**
- Consumes: `.tag`, `.btn`, `--dark-bg`, `--dark-line`, `--font-mono` from
  Task 1.
- Produces: no new exports; `Header.astro`'s markup shape (logo structure)
  is consumed visually by nothing else, but note its nav hrefs
  (`/#custom-software`, `/#staff-augmentation`, `/#approach`,
  `/#industries`, `/#contact`) are unchanged in this task — Industries
  stays per the user's decision, so `content.ts`'s `nav` array does not
  change.

- [ ] **Step 1: Update the failing test for the new logo markup**

Edit `tests/header.test.mjs`, replace the last assertion
(`assert.match(html, /logo-lockup/);`) with:

```javascript
  assert.match(html, /logo-icon/);
```

Leave every other assertion in this file unchanged — nav hrefs, aria
attributes, and the CTA label are not changing.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/header.test.mjs`
Expected: FAIL (`logo-icon` not found yet, `dist/index.html` still has
`logo-lockup` from the old markup).

- [ ] **Step 3: Rewrite `Header.astro`'s logo markup**

In `src/components/Header.astro`, replace the import:
```astro
import logoIcon from "../assets/logo-icon.png";
```
(remove the `logoLockup` import). Replace the logo `<a>` block:

```astro
    <a href="/" class="site-header__logo" aria-label={`${site.name} home`}>
      <Image src={logoIcon} alt="" width={16} height={16} class="site-header__mark" />
      <span aria-hidden="true">KALOS</span>
    </a>
```

- [ ] **Step 4: Restyle the header CSS**

Replace the `.site-header` and `.site-header__logo` rules in the
`<style>` block:

```css
  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 13, 18, 0.86);
    backdrop-filter: blur(10px);
    color: var(--dark-ink);
    border-bottom: 1px solid var(--dark-line);
  }

  .site-header__logo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    color: var(--dark-ink);
    text-decoration: none;
  }

  .site-header__logo :global(.site-header__mark) {
    width: 16px;
    height: auto;
    flex-shrink: 0;
  }
```

Update `.site-header__nav a` color from `var(--white)` to `var(--dark-ink-dim)`
and its `:hover` to `var(--dark-ink)`; update `.site-header__toggle`'s
`border-radius: var(--radius-md)` to `border-radius: 0`.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/header.test.mjs`
Expected: PASS.

- [ ] **Step 6: Full suite + build check**

Run: `npm run build` — expected to still FAIL (Hero still broken per
Task 2's Step 6) — that's fine, this task's own test uses `npm run build`
internally via `execSync`, so if `header.test.mjs` passed in Step 5, the
build succeeded far enough to produce `dist/index.html` with the new
header markup; if it's failing at the Hero step instead, Header's test
would also fail. Confirm Task 4 hasn't been skipped — **if Task 2 and 4
haven't landed yet, do Task 4 (Hero) before or immediately after this one
so `npm run build` succeeds end-to-end.**

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.astro tests/header.test.mjs
git commit -m "Reskin header: icon+wordmark logo, translucent blur background, mono nav"
```

---

## Task 4: Hero rebuild

**Files:**
- Modify: `src/components/Hero.astro` (full rewrite)
- Delete: `src/react/hero/HeroIsland.tsx`
- Modify: `tests/hero.test.mjs`
- Modify: `tests/react-islands.test.mjs`

**Interfaces:**
- Consumes: `.tag`, `.btn`, `.btn-ghost`, `--dark-*`, `--teal*`,
  `--font-mono` (Task 1); depends on Task 2 having removed
  `HeroScene.tsx`/`HeroChips.tsx`/`network-geometry.ts` already.
- Produces: `Hero.astro` becomes plain Astro + scoped CSS, no React
  island — `react-islands.test.mjs` must point at a different still-live
  island (`ServiceBento`, class `service-bento`, or `ProcessStack`, class
  `process-stack`) instead of `hero-island`.

- [ ] **Step 1: Update the two tests for the new Hero shape**

Edit `tests/hero.test.mjs`, replace the last assertion:
```javascript
  assert.match(html, /class="hero-island"/);
```
with:
```javascript
  assert.match(html, /KALOS ENGAGEMENT/);
```

Edit `tests/react-islands.test.mjs`, replace:
```javascript
  assert.match(html, /class="hero-island"/);
```
with:
```javascript
  assert.match(html, /class="process-stack"/);
```
(`ProcessStack` is `client:visible` and unaffected by this task, so this
assertion should already pass once the build succeeds — it's being
repointed here because Hero no longer has an island to test.)

- [ ] **Step 2: Run both tests to verify they fail**

Run: `node --test tests/hero.test.mjs tests/react-islands.test.mjs`
Expected: FAIL for `hero.test.mjs` (no `KALOS ENGAGEMENT` text yet since
Hero hasn't been rewritten); `react-islands.test.mjs` may already pass
since `ProcessStack` markup is untouched — that's fine, it's not required
to be red first if the assertion target already exists in the current
build.

- [ ] **Step 3: Delete the old Hero island file**

```bash
git rm src/react/hero/HeroIsland.tsx
```

- [ ] **Step 4: Rewrite `Hero.astro`**

Replace the entire file:

```astro
---
// src/components/Hero.astro
import { Image } from "astro:assets";
import { hero } from "../data/content";
import hologramHands from "../assets/photos/hologram-hands.png";
---

<section id="hero" class="hero" aria-labelledby="hero-heading">
  <div class="hero-grid">
    <div class="container hero-copy">
      <span class="tag"><span class="dot"></span>{hero.eyebrow}</span>
      <h1 id="hero-heading">Software that fits.<br />Teams that scale.</h1>
      <p class="sub">{hero.subhead}</p>
      <div class="hero-actions">
        <a href={hero.primaryCta.href} class="btn">{hero.primaryCta.label}</a>
        <a href={hero.secondaryCta.href} class="btn btn-ghost">{hero.secondaryCta.label}</a>
      </div>
      <div class="stat-strip">
        <div class="stat"><span class="n">100%</span><span class="l">Client Ownership</span></div>
        <div class="stat"><span class="n">0</span><span class="l">Recruitment Overhead</span></div>
        <div class="stat"><span class="n">1&ndash;2wk</span><span class="l">To Productive Onboarding</span></div>
      </div>
    </div>

    <div class="hero-visual">
      <div class="photo-layer" aria-hidden="true">
        <Image src={hologramHands} alt="" width={640} height={581} />
      </div>
      <div class="branch">
        <div class="branch-node">✓ KALOS ENGAGEMENT</div>
        <div class="branch-connectors">
          <svg viewBox="0 0 420 56" preserveAspectRatio="none" aria-hidden="true">
            <path class="branch-path" d="M210,0 L210,16 L90,16 L90,56" />
            <path class="branch-pulse" d="M210,0 L210,16 L90,16 L90,56" pathLength="100" />
            <path class="branch-path" d="M210,0 L210,16 L330,16 L330,56" />
            <path class="branch-pulse rev" d="M210,0 L210,16 L330,16 L330,56" pathLength="100" />
            <circle cx="210" cy="16" r="2.5" fill="var(--teal)" />
          </svg>
        </div>
        <div class="branch-outputs">
          <div class="branch-card">
            <svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1.5" stroke="currentColor" stroke-width="1.5" /><path d="M9 20h6M12 17v3" stroke="currentColor" stroke-width="1.5" /></svg>
            <h3>Custom Software</h3>
            <p>Built from the ground up, yours entirely.</p>
            <span class="status"><span class="dot"></span>BUILT &amp; OWNED</span>
          </div>
          <div class="branch-card">
            <svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5" /><circle cx="17" cy="8" r="3" stroke="currentColor" stroke-width="1.5" /><path d="M3 20c0-3 2.5-5 5-5s5 2 5 5M13 20c0-3 2-5 4-5s4 2 4 5" stroke="currentColor" stroke-width="1.5" /></svg>
            <h3>Staff Augmentation</h3>
            <p>Embedded engineers, reporting to you.</p>
            <span class="status"><span class="dot"></span>EMBEDDED</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    padding-block: 0;
    overflow: hidden;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 92vh;
  }

  @media (max-width: 980px) {
    .hero-grid {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  .hero-copy {
    padding-block: 5rem 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    position: relative;
    z-index: 2;
  }

  .hero-copy h1 {
    font-size: clamp(2.7rem, 4.2vw + 1rem, 4.4rem);
    font-weight: 800;
    max-width: 16ch;
  }

  .hero-copy .sub {
    max-width: 44ch;
    color: var(--dark-ink-dim);
    font-size: 1.08rem;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }

  .stat-strip {
    display: flex;
    gap: 2.25rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .stat .n {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--teal-dim);
    font-variant-numeric: tabular-nums;
  }

  .stat .l {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dark-ink-dim);
  }

  .hero-visual {
    position: relative;
    border-left: 1px solid var(--dark-line);
    background:
      radial-gradient(55% 45% at 75% 25%, rgba(31, 230, 230, 0.16), transparent 65%),
      radial-gradient(40% 35% at 15% 80%, rgba(139, 127, 242, 0.12), transparent 65%),
      var(--dark-panel);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-visual .photo-layer {
    position: absolute;
    inset: 0;
    opacity: 0.22;
  }

  .hero-visual .photo-layer :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-visual .photo-layer::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(165deg, rgba(10, 13, 18, 0.35), rgba(10, 13, 18, 0.92) 78%);
  }

  .branch {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .branch-node {
    border: 1px solid var(--teal);
    background: rgba(16, 20, 27, 0.9);
    padding: 0.85rem 1.6rem;
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    color: var(--teal-dim);
    box-shadow: 0 0 32px rgba(31, 230, 230, 0.18);
  }

  .branch-connectors {
    width: 100%;
    max-width: 420px;
    height: 56px;
    position: relative;
  }

  .branch-connectors svg {
    width: 100%;
    height: 100%;
  }

  .branch-path {
    stroke: var(--dark-line-strong);
    stroke-width: 1.25;
    fill: none;
  }

  .branch-pulse {
    stroke: var(--teal);
    stroke-width: 1.5;
    fill: none;
    stroke-dasharray: 8 90;
    opacity: 0.9;
    animation: flowmove 2.6s linear infinite;
  }

  .branch-pulse.rev {
    animation-delay: 1.3s;
  }

  @keyframes flowmove {
    0% { stroke-dashoffset: 98; }
    100% { stroke-dashoffset: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .branch-pulse {
      animation: none;
      opacity: 0.4;
    }
  }

  .branch-outputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.1rem;
    width: 100%;
    max-width: 460px;
  }

  .branch-card {
    border: 1px solid var(--dark-line-strong);
    background: rgba(16, 20, 27, 0.75);
    padding: 1.25rem 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .branch-card .ic {
    width: 26px;
    height: 26px;
    color: var(--teal);
  }

  .branch-card h3 {
    font-size: 0.98rem;
    font-weight: 700;
    color: var(--dark-ink);
  }

  .branch-card p {
    font-size: 0.8rem;
    color: var(--dark-ink-dim);
  }

  .branch-card .status {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    color: var(--teal-dim);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.15rem;
  }

  .branch-card .status .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--teal);
    box-shadow: 0 0 6px var(--teal);
  }
</style>
```

Note: `hero.subhead` in `content.ts` already matches the mockup's copy
verbatim, so it's read from `content.ts` as before; the `<h1>` text is
hardcoded to match the mockup's `<br>` line break exactly (matches
`hero.headline`'s text content, just split visually) — if `content.ts`'s
`hero.headline` field is changed later, update this markup's line break
placement too, but don't reintroduce a second source of truth for the
words themselves; consider passing `hero.headline` and doing the `<br>`
split via a small helper if this bothers you, but it's not required for
this task.

- [ ] **Step 5: Run both tests to verify they pass**

Run: `node --test tests/hero.test.mjs tests/react-islands.test.mjs`
Expected: PASS.

- [ ] **Step 6: Full build check**

Run: `npm run build`
Expected: PASS — this is the point where the build should succeed
end-to-end again for the first time since Task 2 (assuming Task 3 already
landed; if not, Header's old markup still builds fine, it just doesn't
have the new look yet — that's a separate, non-blocking concern).

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: Some other section tests may still fail if their sections
haven't been rewritten yet (e.g. `about.test.mjs` still expects old
prose) — that's expected and fixed in later tasks. Confirm specifically
that `hero.test.mjs`, `react-islands.test.mjs`, `header.test.mjs` (if
Task 3 landed), and anything not touching Hero/Header (`contact.test.mjs`,
`footer.test.mjs`, `nav-toggle.test.mjs`, `scroll-reveal.test.mjs`,
`content.test.mjs`) all still pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Rebuild Hero as static SVG branch diagram, replacing the R3F node-network island"
```

---

## Task 5: Problem section (rewrite `About.astro`)

**Files:**
- Modify: `src/components/About.astro` (full rewrite; keep filename and
  `id="about"` — only the internal export/content shape and markup change)
- Modify: `src/data/content.ts` (rename `about` export to `problem`, new shape)
- Delete: `src/components/WhyCustom.astro`
- Modify: `src/pages/index.astro` (remove `<WhyCustom />`)
- Delete: `tests/why-custom.test.mjs`
- Modify: `tests/about.test.mjs`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `.tag`, `.tag.status-off`, `section.on-light` theme flip
  (Task 1).
- Produces: `content.ts` exports `problem` (not `about`) from this task
  onward — no other current task reads the old `about` export, so this is
  a clean rename.

- [ ] **Step 1: Update `content.ts`**

Replace the `about` export in `src/data/content.ts`:

```typescript
export const problem = {
  id: "about",
  tag: "The Problem",
  heading: "Off-the-shelf software wasn't built for you.",
  items: [
    {
      title: "Generic templates",
      description: "You bend your workflows to fit someone else's product roadmap.",
    },
    {
      title: "Licensing limits",
      description: "Features get gated, seats get capped, and pricing scales against you.",
    },
    {
      title: "Slow to evolve",
      description: "Every change waits on someone else's release cycle, not yours.",
    },
    {
      title: "Divided ownership",
      description: "You rent the system. You never actually own what runs your business.",
    },
  ],
};
```

- [ ] **Step 2: Remove `whyCustom` from `content.ts`**

Delete the entire `export const whyCustom = { ... };` block.

- [ ] **Step 3: Update `tests/content.test.mjs`**

Replace:
```javascript
  assert.equal(c.services.items.length, 5);
  assert.equal(c.whyCustom.items.length, 4);
```
with:
```javascript
  assert.equal(c.services.items.length, 7);
  assert.equal(c.problem.items.length, 4);
```
(The `services.items.length` bump to 7 belongs to Task 6, but since this
test file asserts the whole module shape in one test, update both counts
together here — Task 6 will find this assertion already correct and
shouldn't need to touch it again, just verify.)

- [ ] **Step 4: Rewrite `tests/about.test.mjs`**

```javascript
// tests/about.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("problem section renders the 4 problem cards on a light theme section", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="about"[^>]*class="[^"]*on-light/);
  assert.match(html, /Off-the-shelf software wasn(?:&#39;|')t built for you\./);
  assert.match(html, /Generic templates/);
  assert.match(html, /Licensing limits/);
  assert.match(html, /Slow to evolve/);
  assert.match(html, /Divided ownership/);
  assert.match(html, /portrait-woman/);
});
```

- [ ] **Step 5: Delete `WhyCustom.astro` and its test, remove from `index.astro`**

```bash
git rm src/components/WhyCustom.astro tests/why-custom.test.mjs
```
In `src/pages/index.astro`, remove the `import WhyCustom from
"../components/WhyCustom.astro";` line and the `<WhyCustom />` usage.

- [ ] **Step 6: Run the tests to verify they fail (about.test.mjs) before the rewrite**

Run: `node --test tests/about.test.mjs tests/content.test.mjs`
Expected: FAIL (About.astro hasn't been rewritten yet; content.ts changes
from Steps 1-2 should make `content.test.mjs` pass already if those steps
are done — if so, that's fine, it's testing pure data not requiring
red-green ceremony since it's not the thing under TDD in this task, the
markup is).

- [ ] **Step 7: Rewrite `About.astro`**

```astro
---
// src/components/About.astro
import { Image } from "astro:assets";
import { problem } from "../data/content";
import portraitWoman from "../assets/photos/portrait-woman.png";
---

<section id={problem.id} class="problem on-light" aria-labelledby="about-heading">
  <div class="container problem-layout">
    <div class="problem-photo">
      <Image src={portraitWoman} alt="" width={640} height={800} />
    </div>
    <div>
      <div class="section-head">
        <span class="tag status-off"><span class="dot"></span>{problem.tag}</span>
        <h2 id="about-heading">{problem.heading}</h2>
      </div>
      <div class="problem-grid">
        {problem.items.map((item) => (
          <div class="problem-card">
            <div class="ic" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.6" /><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.6" /><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.6" /><rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.6" /></svg>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

<style>
  .problem {
    padding-block: 6.5rem;
  }

  .problem-layout {
    display: grid;
    grid-template-columns: 0.6fr 1fr;
    gap: 3.5rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .problem-layout {
      grid-template-columns: 1fr;
    }
  }

  .problem-photo {
    aspect-ratio: 4 / 5;
    border: 1px solid var(--line-strong);
    position: relative;
    overflow: hidden;
  }

  .problem-photo :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
  }

  .problem-photo::after {
    content: "";
    position: absolute;
    inset: 0;
    box-shadow: inset 0 -70px 70px -40px rgba(14, 19, 24, 0.35);
  }

  .section-head {
    max-width: 56ch;
    margin-bottom: 2rem;
  }

  .section-head .tag {
    margin-bottom: 1.25rem;
  }

  .section-head h2 {
    font-size: clamp(1.95rem, 2.5vw + 1rem, 2.85rem);
    font-weight: 800;
  }

  .problem-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--line);
  }

  @media (max-width: 640px) {
    .problem-grid {
      grid-template-columns: 1fr;
    }
  }

  .problem-card {
    padding: 1.9rem;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }

  .problem-card:nth-child(2n) {
    border-right: none;
  }

  .problem-grid .problem-card:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  @media (max-width: 640px) {
    .problem-card {
      border-right: none !important;
    }
    .problem-grid .problem-card:last-child {
      border-bottom: none;
    }
  }

  .problem-card .ic {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--line-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: var(--teal-deep);
    background: var(--panel);
    flex-shrink: 0;
  }

  .problem-card h3 {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .problem-card p {
    color: var(--ink-dim);
    font-size: 0.92rem;
  }
</style>
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `node --test tests/about.test.mjs tests/content.test.mjs`
Expected: PASS.

- [ ] **Step 9: Full suite + build**

Run: `npm test`
Expected: PASS for everything touched so far (Hero, Header, Problem); other
untouched sections may still be red pending later tasks.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Rebuild About as light-theme Problem section with 4-card grid; drop WhyCustom"
```

---

## Task 6: Services bento restyle + new items

**Files:**
- Modify: `src/data/content.ts` (`services.items` 5 → 7)
- Modify: `src/components/Services.astro`
- Modify: `src/react/services/ServiceBento.tsx`
- Modify: `src/styles/global.css` (replace `.service-bento*` rules)
- Modify: `tests/services.test.mjs`

**Interfaces:**
- Consumes: `section.on-light`, `--font-mono`, `--teal-wash`,
  `--teal-deep`, `--teal-dim` (Task 1).
- Produces: `ServiceBento` component's prop shape changes from
  `{ items, photoSrc: string }` to `{ items }` only (no photo prop) — no
  other task consumes this component's props.

- [ ] **Step 1: Add the two new services to `content.ts`**

In `services.items`, after "System integrations & automation" and before
"Modernization & optimization", insert:

```typescript
    {
      title: "Digital transformation consulting",
      description: "Modernize operations and translate business goals into technical roadmaps.",
    },
    {
      title: "Platform as a Service (Cloud)",
      description: "Scalable, secure cloud infrastructure that adapts as you grow.",
    },
```

(Final order: Custom software development, SaaS product development,
Web & cloud applications, System integrations & automation, Digital
transformation consulting, Platform as a Service (Cloud), Modernization &
optimization — 7 total, matching the mockup.)

- [ ] **Step 2: Update the failing test**

Replace `tests/services.test.mjs`:

```javascript
// tests/services.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("services section renders id anchor and all 7 service tiles, no photo", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="custom-software"/);
  assert.match(html, /Custom software development/);
  assert.match(html, /SaaS product development/);
  assert.match(html, /Web (?:&#38;|&amp;|&) ?cloud applications/);
  assert.match(html, /System integrations (?:&#38;|&amp;|&) ?automation/);
  assert.match(html, /Digital transformation consulting/);
  assert.match(html, /Platform as a Service \(Cloud\)/);
  assert.match(html, /Modernization (?:&#38;|&amp;|&) ?optimization/);
  assert.ok(!html.includes("pair-coworking"), "photo tile should be gone, replaced by the status panel");
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tests/services.test.mjs`
Expected: FAIL (still 5 items, still references `pair-coworking`).

- [ ] **Step 4: Rewrite `ServiceBento.tsx`**

```typescript
import { RevealOnScroll } from "../shared/RevealOnScroll";

export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServiceBentoProps {
  items: ServiceItem[];
}

export function ServiceBento({ items }: ServiceBentoProps) {
  return (
    <div className="bento">
      <RevealOnScroll direction="left" className="bento-panel">
        <div className="panel-row"><span>ENGAGEMENT</span><span className="val">ACTIVE</span></div>
        <div className="panel-row"><span>STACK</span><span className="val">REACT · NODE · CLOUD</span></div>
        <div className="panel-row"><span>OWNERSHIP</span><span className="val">100% CLIENT</span></div>
        <div className="panel-title">Built from the ground up — yours entirely.</div>
      </RevealOnScroll>
      {items.map((item, i) => (
        <RevealOnScroll
          key={item.title}
          direction={i % 2 === 0 ? "up" : "right"}
          delay={i * 0.08}
          className={`bento-tile${i === items.length - 1 ? " bento-tile--wide" : ""}`}
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </RevealOnScroll>
      ))}
    </div>
  );
}
```

(The wide closer is now determined by position — last item — rather than
the old code's first-item special case, matching the mockup where
"Modernization & optimization" is the final, full-width tile.)

- [ ] **Step 5: Rewrite `Services.astro`**

```astro
---
// src/components/Services.astro
import { services } from "../data/content";
import { ServiceBento } from "../react/services/ServiceBento";
---

<section id={services.id} class="services on-light" aria-labelledby="services-heading">
  <div class="container">
    <div class="section-head">
      <span class="tag"><span class="dot"></span>{services.eyebrow}</span>
      <h2 id="services-heading">{services.heading}</h2>
    </div>
    <ServiceBento client:visible items={services.items} />
  </div>
</section>

<style>
  .services {
    padding-block: 6.5rem;
  }
</style>
```

(Drops the `getImage()` pre-optimization step entirely — no longer needed
since there's no photo in the bento. `services.intro` field in
`content.ts` is no longer rendered here — leave it in `content.ts`
unused rather than deleting it, since `content.test.mjs` doesn't assert on
it and it's harmless dead data, not worth a separate content.ts edit in
this task.)

- [ ] **Step 6: Replace the `.service-bento*` CSS in `global.css` with `.bento*`**

Replace lines 234-279 of `src/styles/global.css` (the `.service-bento`
block) with:

```css
.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(140px, auto);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  margin-top: 3rem;
}

@media (max-width: 780px) {
  .bento {
    grid-template-columns: 1fr;
  }
}

.bento > * {
  background: var(--bg);
}

.bento-panel {
  grid-column: span 2;
  grid-row: span 2;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: var(--font-mono);
  background:
    radial-gradient(120% 100% at 100% 0%, var(--teal-wash), transparent 60%),
    var(--bg) !important;
}

@media (max-width: 780px) {
  .bento-panel {
    grid-column: span 1;
  }
}

.panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--ink-dim);
  border-bottom: 1px dashed var(--line);
  padding-bottom: 0.6rem;
}

.panel-row .val {
  color: var(--teal-deep);
  font-weight: 600;
}

.panel-title {
  font-family: var(--font-display);
  color: var(--ink);
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: auto;
}

.bento-tile {
  grid-column: span 2;
  padding: 1.75rem;
}

@media (max-width: 780px) {
  .bento-tile {
    grid-column: span 1;
  }
}

.bento-tile--wide {
  grid-column: span 4;
}

@media (max-width: 780px) {
  .bento-tile--wide {
    grid-column: span 1;
  }
}

.bento-tile h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.bento-tile p {
  font-size: 0.9rem;
  color: var(--ink-dim);
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `node --test tests/services.test.mjs`
Expected: PASS.

- [ ] **Step 8: Full suite**

Run: `npm test` — confirm no regressions in sections already migrated
(Hero, Header, Problem) and note which remaining sections are still
pending (Approach, Staff Aug, Why Kalos, Contact, Footer, Industries).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Restyle Services as hairline bento with status panel; add 2 new service tiles"
```

---

## Task 7: Approach restyle (keep sticky-stack scroll)

**Files:**
- Modify: `src/data/content.ts` (add `process.methodology`)
- Modify: `src/components/Process.astro`
- Modify: `src/react/process/ProcessStack.tsx` (restyle only, interaction
  logic unchanged)
- Modify: `src/styles/global.css` (`.process-stack*` restyle)
- Modify: `tests/process.test.mjs`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `.tag`, `--font-mono`, `--teal-dim`, `--line-strong` (Task 1).
- Produces: nothing new consumed by later tasks.

**Note on the user's decision**: the mockup's Approach section replaces
the sticky-stack scroll with a static 5-col grid — the user explicitly
chose to **keep** the existing scroll-linked sticky-stack interaction
(`ProcessStack.tsx`'s `useScroll`/`useTransform`) instead. This task
therefore does **not** port the mockup's `.flow`/`.flow-step` markup — it
restyles the *existing* sticky-stack cards (`.process-stack__card`) to the
new dark hairline visual system, and adds the new methodology strip below
it as new, separate markup in `Process.astro`.

- [ ] **Step 1: Add `methodology` to `content.ts`**

In the `process` export, add a new field after `steps`:

```typescript
  methodology: [
    "Digital Transformation Strategies",
    "Lean Six Sigma Optimization",
    "Systematic Problem-Solving",
    "Cloud Computing Strategy",
  ],
```

- [ ] **Step 2: Update `tests/content.test.mjs`**

Add after the existing `c.process.steps.length` assertion:
```javascript
  assert.equal(c.process.methodology.length, 4);
```

- [ ] **Step 3: Update `tests/process.test.mjs`**

Add after the existing step-order loop:
```javascript
  assert.match(html, /Digital Transformation Strategies/);
  assert.match(html, /Lean Six Sigma Optimization/);
  assert.match(html, /Systematic Problem-Solving/);
  assert.match(html, /Cloud Computing Strategy/);
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `node --test tests/process.test.mjs tests/content.test.mjs`
Expected: FAIL (methodology strip doesn't exist yet).

- [ ] **Step 5: Update `Process.astro`**

```astro
---
// src/components/Process.astro
import { process } from "../data/content";
import { ProcessStack } from "../react/process/ProcessStack";
---

<section id={process.id} class="process" aria-labelledby="process-heading">
  <div class="container">
    <div class="section-head">
      <span class="tag"><span class="dot"></span>Introducing the Process</span>
      <h2 id="process-heading">{process.heading}</h2>
    </div>
    <p class="process__intro">{process.intro}</p>
    <ProcessStack client:visible steps={process.steps} />
    <div class="method-strip">
      <span class="method-label">Grounded in proven methodology</span>
      <ul>
        {process.methodology.map((item) => <li>{item}</li>)}
      </ul>
    </div>
  </div>
</section>

<style>
  .process {
    padding-block: 6.5rem;
  }

  .process__intro {
    max-width: 60ch;
  }

  .method-strip {
    margin-top: 3rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .method-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dark-ink-dim);
    opacity: 0.75;
    flex-shrink: 0;
  }

  .method-strip ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .method-strip li {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    color: var(--teal-dim);
    border: 1px solid var(--dark-line-strong);
    padding: 0.4rem 0.75rem;
  }
</style>
```

- [ ] **Step 6: Restyle `.process-stack__card` in `global.css`**

Replace the `.process-stack__card` and `.process-stack__number` rules
(current lines 291-314) with:

```css
.process-stack__card {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  background: var(--dark-panel);
  border: 1px solid var(--dark-line-strong);
  border-radius: 0;
  padding: var(--space-6);
}

.process-stack__number {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--teal-dim);
  background: transparent;
  border: 1px solid var(--teal);
  border-radius: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

Also update `.process-stack__card h3` color to `var(--dark-ink)` and add
a `p { color: var(--dark-ink-dim); }` rule scoped under
`.process-stack__card` if not already inheriting readable color (check
against the new dark section background — `Process.astro`'s section has
no `.on-light`, so it stays on the dark theme's default `--bg`/`--ink`,
meaning body text inherits fine, but the card itself has its own
`background: var(--dark-panel)` so its text needs explicit dark-theme
colors, not the ambient section theme vars, since Approach doesn't flip
to light).

- [ ] **Step 7: Run tests to verify they pass**

Run: `node --test tests/process.test.mjs tests/content.test.mjs`
Expected: PASS.

- [ ] **Step 8: Full suite**

Run: `npm test`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Restyle Approach's sticky-stack cards to dark hairline system; add methodology strip"
```

---

## Task 8: Staff Augmentation — consolidate + restyle (keep 7 benefits)

**Files:**
- Modify: `src/data/content.ts` (`staffAugBenefits.items` shape change,
  `staffAugServices.items` +1)
- Modify: `src/components/StaffAugIntro.astro`
- Modify: `src/components/StaffAugBenefits.astro`
- Modify: `src/components/StaffAugServices.astro`
- Modify: `src/pages/index.astro` (wrap the three in one `<section>`)
- Modify: `tests/staff-aug-benefits.test.mjs`
- Modify: `tests/staff-aug-services.test.mjs`
- Modify: `tests/content.test.mjs`
- Check: `tests/staff-aug-intro.test.mjs` (read it first; update only if it
  asserts a `<section>` wrapper that's being removed from this component)

**Interfaces:**
- Consumes: `.tag`, `--font-mono`, `--teal-wash`, `--dark-*` (Task 1).
- Produces: nothing new consumed elsewhere. `staffAugBenefits.items` shape
  changes from `{title, description}` to `{n, l, d}` — this is a breaking
  shape change local to this task's own components/tests only.

**Consolidation approach**: keep the three `.astro` files (one per
responsibility, matching the existing codebase pattern), but only
`StaffAugIntro.astro` renders the outer `<section id="staff-augmentation">`
element and the shared header (tag + h2 + subhead); `StaffAugBenefits.astro`
and `StaffAugServices.astro` are changed to render *only* their inner
content (no `<section>` wrapper, no own heading) so `index.astro` can
compose all three inside one continuous section.

- [ ] **Step 1: Read `tests/staff-aug-intro.test.mjs` to know what to preserve**

Read the file. Its assertions likely check `id="staff-augmentation"` and
the two panel headings — keep those working since `StaffAugIntro.astro`
still owns the section wrapper and those panels are unchanged in this
task (only their border/background CSS changes).

- [ ] **Step 2: Update `content.ts`'s `staffAugBenefits`**

Replace the `items` array (keep all 7, including Cultural Integration,
split each `title` into `n`/`l`):

```typescript
export const staffAugBenefits = {
  heading: "Why augmentation over traditional hiring?",
  items: [
    { n: "50%", l: "Faster Onboarding", d: "Experienced developers productive within 1-2 weeks (vs. 3-6 months traditional hiring)" },
    { n: "30-40%", l: "Cost Savings", d: "No recruitment fees, benefits overhead, or onboarding waste" },
    { n: "0", l: "HR Complexity", d: "We manage recruitment, payroll, taxes, compliance, background checks" },
    { n: "100%", l: "Client Control", d: "Your team directs work; augmented staff report to you" },
    { n: "Flexible", l: "Scaling", d: "Add/reduce capacity in weeks as project demands change" },
    { n: "Global", l: "Talent Access", d: "Pre-vetted developers across multiple time zones and specializations" },
    { n: "Cultural", l: "Integration", d: "Pre-matched for technical fit and team alignment" },
  ],
};
```

- [ ] **Step 3: Add the 5th item to `staffAugServices`**

Insert after "Flexible Team Scaling":
```typescript
    {
      title: "AI, ML & Advanced Technical Roles",
      description: "Specialized talent in artificial intelligence, machine learning, and emerging technical domains.",
    },
```

- [ ] **Step 4: Update `tests/content.test.mjs`**

Replace:
```javascript
  assert.equal(c.staffAugBenefits.items.length, 7);
  assert.ok(c.staffAugBenefits.items.some((i) => i.title.includes("50%")));
  assert.ok(c.staffAugBenefits.items.some((i) => i.title.includes("30-40%")));
```
with:
```javascript
  assert.equal(c.staffAugBenefits.items.length, 7);
  assert.ok(c.staffAugBenefits.items.some((i) => i.n === "50%"));
  assert.ok(c.staffAugBenefits.items.some((i) => i.n === "30-40%"));
```
and:
```javascript
  assert.equal(c.staffAugServices.items.length, 4);
```
to:
```javascript
  assert.equal(c.staffAugServices.items.length, 5);
```

- [ ] **Step 5: Update `tests/staff-aug-benefits.test.mjs`**

```javascript
// tests/staff-aug-benefits.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("staff augmentation benefits section renders all 7 stats", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /50%[\s\S]{0,40}Faster Onboarding/);
  assert.match(html, /3-6 months traditional hiring/);
  assert.match(html, /30-40%[\s\S]{0,40}Cost Savings/);
  assert.match(html, /HR Complexity/);
  assert.match(html, /Client Control/);
  assert.match(html, /Scaling/);
  assert.match(html, /Talent Access/);
  assert.match(html, /Integration/);
});
```

- [ ] **Step 6: Update `tests/staff-aug-services.test.mjs`**

Add:
```javascript
  assert.match(html, /AI, ML (?:&#38;|&amp;|&) ?Advanced Technical Roles/);
```

- [ ] **Step 7: Run tests to verify they fail**

Run: `node --test tests/staff-aug-benefits.test.mjs tests/staff-aug-services.test.mjs tests/content.test.mjs`
Expected: FAIL.

- [ ] **Step 8: Rewrite `StaffAugIntro.astro`** (owns the section wrapper)

```astro
---
// src/components/StaffAugIntro.astro
import { staffAugIntro } from "../data/content";
---

<section id={staffAugIntro.id} class="staffaug" aria-labelledby="staff-aug-heading">
  <div class="container">
    <div class="section-head">
      <span class="tag"><span class="dot"></span>{staffAugIntro.eyebrow}</span>
      <h2 id="staff-aug-heading">{staffAugIntro.headline}</h2>
      <p class="staffaug__subhead">{staffAugIntro.subhead}</p>
    </div>

    <div class="sa-panels">
      <div class="sa-panel">
        <h3>{staffAugIntro.whatIsHeading}</h3>
        <p>{staffAugIntro.whatIsBody}</p>
      </div>
      <div class="sa-panel sa-panel--accent">
        <h3>{staffAugIntro.differenceHeading}</h3>
        <p>{staffAugIntro.differenceBody}</p>
      </div>
    </div>

    <slot />
  </div>
</section>

<style>
  .staffaug {
    padding-block: 6.5rem;
  }

  .staffaug__subhead {
    margin-top: 1rem;
    color: var(--dark-ink-dim);
    font-size: 1.02rem;
    max-width: 60ch;
  }

  .sa-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 780px) {
    .sa-panels {
      grid-template-columns: 1fr;
    }
  }

  .sa-panel {
    border: 1px solid var(--dark-line-strong);
    padding: 1.75rem;
    background: rgba(255, 255, 255, 0.02);
  }

  .sa-panel--accent {
    background: radial-gradient(120% 100% at 100% 0%, var(--teal-wash), transparent 60%), rgba(255, 255, 255, 0.02);
    border-color: var(--teal);
  }

  .sa-panel h3 {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 0.6rem;
    color: var(--dark-ink);
  }

  .sa-panel p {
    font-size: 0.9rem;
    color: var(--dark-ink-dim);
  }
</style>
```

(`<slot />` lets `index.astro` place `StaffAugBenefits` and
`StaffAugServices` inside this same `<section>` — see Step 11.)

- [ ] **Step 9: Rewrite `StaffAugBenefits.astro`** (content only, no
  `<section>`/heading)

```astro
---
// src/components/StaffAugBenefits.astro
import { staffAugBenefits } from "../data/content";
---

<div class="sa-benefits">
  {staffAugBenefits.items.map((item) => (
    <div class="sa-stat">
      <span class="n">{item.n}</span>
      <span class="l">{item.l}</span>
      <span class="d">{item.d}</span>
    </div>
  ))}
</div>

<style>
  .sa-benefits {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--dark-line);
    margin-bottom: 3rem;
  }

  @media (max-width: 860px) {
    .sa-benefits {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .sa-benefits {
      grid-template-columns: 1fr;
    }
  }

  .sa-stat {
    padding: 1.5rem;
    border-right: 1px solid var(--dark-line);
    border-bottom: 1px solid var(--dark-line);
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .sa-stat:nth-child(3n) {
    border-right: none;
  }

  .sa-stat:nth-last-child(-n + 1) {
    border-bottom: none;
  }

  @media (max-width: 860px) {
    .sa-stat:nth-child(3n) {
      border-right: 1px solid var(--dark-line);
    }
    .sa-stat:nth-child(2n) {
      border-right: none;
    }
  }

  @media (max-width: 560px) {
    .sa-stat {
      border-right: none !important;
    }
    .sa-stat:last-child {
      border-bottom: none;
    }
  }

  .sa-stat .n {
    font-family: var(--font-mono);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--teal-dim);
    font-variant-numeric: tabular-nums;
  }

  .sa-stat .l {
    font-family: var(--font-display);
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--dark-ink);
    margin-top: 0.2rem;
  }

  .sa-stat .d {
    font-size: 0.8rem;
    color: var(--dark-ink-dim);
    margin-top: 0.3rem;
  }
</style>
```

Note: with 7 items in a 3-col grid, the last row has 1 item (positions
7 = row 3, col 1). The `nth-last-child(-n+1)` rule (not `-n+3` as the
mockup's 6-item version used) removes the bottom border correctly only
from the actual last cell; item 7 sitting alone in row 3 will still show
a bottom border on cells 4-6 which is visually fine (they're not the last
row) — double check the rendered grid during Step 12's Lighthouse/manual
check and adjust the `nth-last-child` selector if the border pattern looks
wrong for 7 items specifically (this is the one piece of CSS math in this
plan worth eyeballing rather than trusting blindly, since the mockup was
authored for exactly 6 items in a clean 3×2 grid, and this task
deliberately diverges to 7 per the user's decision).

- [ ] **Step 10: Rewrite `StaffAugServices.astro`** (content only)

```astro
---
// src/components/StaffAugServices.astro
import { staffAugServices } from "../data/content";
---

<div class="sa-services">
  <span class="method-label">{staffAugServices.heading}</span>
  <ul>
    {staffAugServices.items.map((item) => (
      <li><strong>{item.title}</strong> — {item.description}</li>
    ))}
  </ul>
</div>

<style>
  .sa-services ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    border-top: 1px solid var(--dark-line);
    padding-top: 1.25rem;
  }

  .sa-services li {
    font-size: 0.92rem;
    color: var(--dark-ink-dim);
    line-height: 1.6;
  }

  .sa-services li strong {
    color: var(--dark-ink);
    font-weight: 700;
  }
</style>
```

- [ ] **Step 11: Update `index.astro`**

Replace:
```astro
  <StaffAugIntro />
  <StaffAugBenefits />
  <StaffAugServices />
```
with:
```astro
  <StaffAugIntro>
    <StaffAugBenefits />
    <StaffAugServices />
  </StaffAugIntro>
```

- [ ] **Step 12: Run tests to verify they pass**

Run: `node --test tests/staff-aug-benefits.test.mjs tests/staff-aug-services.test.mjs tests/staff-aug-intro.test.mjs tests/content.test.mjs`
Expected: PASS. Also run `npm run build` and eyeball
`dist/index.html`'s staff-aug section structure to confirm the 3-col
7-item grid border pattern looks right (per the Step 9 caveat) — this is
the one place in this task worth a manual look, not just a passing regex.

- [ ] **Step 13: Full suite**

Run: `npm test`

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Consolidate Staff Augmentation into one section; restyle benefits as 7-stat grid"
```

---

## Task 9: Why Kalos merge + logo marquee

**Files:**
- Modify: `src/data/content.ts` (`whyKalos` restructure)
- Modify: `src/components/WhyKalos.astro` (full rewrite)
- Modify: `tests/why-kalos.test.mjs`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `.tag`, `--dark-*`, `--teal*`, `--font-mono`, `--font-display`
  (Task 1). Uses `logo-icon.png` (already added to `src/assets/` per
  memory, confirm it exists — if not, fall back to `logo-lockup.png` and
  flag it rather than blocking).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Update `content.ts`'s `whyKalos`**

Replace the entire export:

```typescript
export const whyKalos = {
  heading: "Built by experts. Trusted by businesses.",
  intro:
    "Kalos Technology brings together experienced software engineers, architects, and product strategists with deep expertise in building mission-critical custom solutions. Whether you need innovative software or specialized developers to accelerate your projects, we deliver both.",
  items: [
    "Strong focus on reliability, scalability, security, and results.",
    "Proven experience delivering complex systems — both software and high-performing teams.",
    "Modern technology stack and best development practices.",
    "Clear documentation and long-term maintainability.",
    "Pre-vetted, globally distributed developer talent.",
  ],
  statement: "You're never just a client. You're a partner.",
  closing:
    "We don't just deliver software—we deliver confidence, clarity, and long-term value. We don't just fill seats—we integrate specialists who become an extension of your team.",
  marquee: [
    "KALOS TECHNOLOGY",
    "BESPOKE SOFTWARE",
    "SPECIALIZED TALENT",
    "BUILT TO SCALE",
    "YOUR PARTNER, NOT JUST A VENDOR",
    "CUSTOM SOFTWARE DEVELOPMENT",
    "STAFF AUGMENTATION",
  ],
};
```

- [ ] **Step 2: Update `tests/content.test.mjs`**

Replace:
```javascript
  assert.equal(c.whyKalos.bullets.length, 4);
  assert.equal(c.whyKalos.whyKalosItems.length, 4);
  assert.equal(c.whyKalos.quote, "You're never just a client. You're a partner.");
```
with:
```javascript
  assert.equal(c.whyKalos.items.length, 5);
  assert.equal(c.whyKalos.marquee.length, 7);
  assert.equal(c.whyKalos.statement, "You're never just a client. You're a partner.");
```

- [ ] **Step 3: Rewrite `tests/why-kalos.test.mjs`**

```javascript
// tests/why-kalos.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("why-kalos renders as one full-bleed proof section with a numbered list and a logo marquee", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Built by experts\. Trusted by businesses\./);
  assert.match(html, /Strong focus on reliability, scalability, security, and results\./);
  assert.match(html, /Pre-vetted, globally distributed developer talent\./);
  assert.match(html, /You(?:&#39;|&rsquo;|')re never just a client\./);
  assert.match(html, /team-collaboration/);
  assert.match(html, /class="logo-reel"/);
  assert.match(html, /KALOS TECHNOLOGY/);
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `node --test tests/why-kalos.test.mjs tests/content.test.mjs`
Expected: FAIL.

- [ ] **Step 5: Rewrite `WhyKalos.astro`**

```astro
---
// src/components/WhyKalos.astro
import { Image } from "astro:assets";
import { whyKalos } from "../data/content";
import teamPhoto from "../assets/photos/team-collaboration.png";
---

<section id="why-kalos" class="proof" aria-labelledby="why-kalos-heading">
  <Image src={teamPhoto} alt="" width={1600} height={900} />
  <div class="container proof-inner">
    <span class="tag"><span class="dot"></span>Why Kalos</span>
    <h2 id="why-kalos-heading">{whyKalos.heading}</h2>
    <p class="proof-intro">{whyKalos.intro}</p>
    <div class="proof-grid">
      <ol>
        {whyKalos.items.map((item, i) => (
          <li><span class="num">{String(i + 1).padStart(2, "0")}</span>{item}</li>
        ))}
      </ol>
      <div>
        <p class="statement">You&rsquo;re never just a client.<br />You&rsquo;re a partner.</p>
        <p class="proof-closing">{whyKalos.closing}</p>
      </div>
    </div>
  </div>

  <div class="logo-reel" aria-hidden="true">
    <div class="reel-track">
      {[...whyKalos.marquee, ...whyKalos.marquee].map((item, i) => (
        <span class="reel-item">
          {i % 2 === 0 && <span class="reel-dot"></span>}
          {item}
        </span>
      ))}
    </div>
  </div>
</section>

<style>
  .proof {
    padding-block: 0;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .proof :global(img) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 24%;
  }

  .proof::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg, rgba(10, 13, 18, 0.92) 32%, rgba(10, 13, 18, 0.35) 78%);
    z-index: 1;
  }

  .proof::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(10, 13, 18, 0.55), transparent 40%);
    z-index: 1;
  }

  .proof-inner {
    position: relative;
    z-index: 2;
    width: 100%;
    padding-block: 5rem;
  }

  .proof h2 {
    font-size: clamp(1.9rem, 2.4vw + 1rem, 2.6rem);
    margin-top: 1.25rem;
    color: var(--dark-ink);
    max-width: 24ch;
  }

  .proof-intro {
    margin-top: 1rem;
    max-width: 62ch;
    color: var(--dark-ink-dim);
    font-size: 1rem;
  }

  .proof-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
    margin-top: 2.5rem;
  }

  @media (max-width: 860px) {
    .proof-grid {
      grid-template-columns: 1fr;
    }
  }

  .proof-grid ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .proof-grid ol li {
    display: flex;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: var(--dark-ink-dim);
  }

  .proof-grid ol li .num {
    flex-shrink: 0;
    opacity: 0.7;
  }

  .statement {
    font-family: var(--font-display);
    font-weight: 800;
    font-style: italic;
    font-size: clamp(1.9rem, 2.6vw + 1rem, 2.75rem);
    color: var(--dark-ink);
    line-height: 1.08;
  }

  .proof-closing {
    margin-top: 1.25rem;
    color: var(--dark-ink-dim);
    font-size: 0.92rem;
    max-width: 44ch;
  }

  .logo-reel {
    position: relative;
    z-index: 2;
    margin-top: 4rem;
    border-top: 1px solid var(--dark-line);
    overflow: hidden;
    padding-block: 1.5rem;
    width: 100%;
    flex-shrink: 0;
  }

  .reel-track {
    display: flex;
    gap: 2.5rem;
    width: max-content;
    animation: reel 32s linear infinite;
  }

  .reel-item {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    color: var(--dark-ink-dim);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .reel-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--teal);
    box-shadow: 0 0 6px var(--teal);
    flex-shrink: 0;
  }

  @keyframes reel {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .reel-track {
      animation: none;
    }
  }
</style>
```

Simplify the `.statement` line-break handling in Step 5's markup — using
`set:html` with chained `.replace()` calls is fragile. Instead, don't put
the whole sentence in one `content.ts` string; keep `whyKalos.statement`
as plain text and hardcode the `<br>` split directly in the component,
same pattern as Task 4's Hero headline:

```astro
        <p class="statement">You&rsquo;re never just a client.<br />You&rsquo;re a partner.</p>
```
and drop the `set:html`/`.replace()` approach entirely — simpler, matches
the existing codebase's convention of literal markup for short fixed
strings (see Hero's `<h1>` from Task 4).

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/why-kalos.test.mjs tests/content.test.mjs`
Expected: PASS.

- [ ] **Step 7: Full suite**

Run: `npm test`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Merge Why Kalos into one full-bleed proof section; add scrolling logo marquee"
```

---

## Task 10: Contact restyle (preserve Netlify wiring)

**Files:**
- Modify: `src/components/Contact.astro`
- Test: `tests/contact.test.mjs` (read first — expect **no changes needed**,
  confirm after implementing)

**Interfaces:**
- Consumes: `--dark-*`, `--teal-wash`, `--violet` (Task 1).
- Produces: nothing consumed elsewhere.

**Critical constraint**: every Netlify-specific attribute/field must
survive byte-for-byte: `data-netlify="true"`, `netlify-honeypot="bot-field"`,
`action="/thank-you"`, the hidden `form-name` input, and the honeypot
`bot-field` input. Do not copy the mockup's `onsubmit="return false"` — it
doesn't exist in the current form and must not be added.

- [ ] **Step 1: Read `tests/contact.test.mjs` to confirm what must not break**

Read the file and note every assertion — they should all still pass after
this task since none of them touch the visual/CSS layer.

- [ ] **Step 2: Run the test now (before changes) as a baseline**

Run: `node --test tests/contact.test.mjs`
Expected: PASS (baseline, before this task's CSS/markup edits).

- [ ] **Step 3: Rewrite `Contact.astro`'s background motif and copy structure**

Replace the `<svg class="contact__motif">` block with:
```astro
  <div class="contact-mesh" aria-hidden="true"></div>
```

Update the copy block to match the mockup's bare-link pattern (still
reading from `content.ts`'s existing `contact.email`/`contact.website`
fields, just restyled, no field renames):

```astro
    <div class="contact__copy" data-reveal="left">
      <span class="tag"><span class="dot"></span>Contact</span>
      <h2 id="contact-heading">{contact.heading}</h2>
      <p>{contact.body}</p>
      <div class="contact-cta-block">
        <p class="mono contact-cta-label">{contact.ctaHeading}</p>
      </div>
      <div class="contact-direct">
        <a href={`mailto:${contact.email}`} class="mono">{contact.email}</a>
        <span class="mono">{contact.website}</span>
      </div>
    </div>
```

Keep the `<form>` element and everything inside it (all Netlify attributes,
hidden fields, honeypot, labels, inputs, select, textarea, submit button)
byte-for-byte unchanged — only add/adjust `class` attributes needed for
the new CSS below, do not remove or rename any `name`/`id`/`data-*`
attribute.

- [ ] **Step 4: Restyle the CSS**

Replace `.contact__mesh`/`.contact__motif` with:
```css
  .contact-mesh {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(55% 55% at 15% 20%, rgba(31, 230, 230, 0.14), transparent 65%),
      radial-gradient(45% 45% at 90% 90%, rgba(139, 127, 242, 0.1), transparent 65%);
    pointer-events: none;
  }
```

Wrap the form visually in a bordered panel by adding to `.contact__form`:
```css
  .contact__form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    border: 1px solid var(--dark-line-strong);
    background: rgba(16, 20, 27, 0.55);
    padding: 2rem;
  }
```

Update `.field input, .field select, .field textarea` to sharp corners and
darker fill:
```css
  .field input,
  .field select,
  .field textarea {
    background: rgba(10, 13, 18, 0.7);
    border: 1px solid var(--dark-line-strong);
    border-radius: 0;
    color: var(--dark-ink);
    padding: 0.75rem 0.85rem;
    font-family: inherit;
    font-size: 0.92rem;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: none;
    border-color: var(--teal);
    box-shadow: 0 0 0 1px var(--teal);
  }
```

Add `.contact-direct` and `.contact-cta-label` rules matching the mockup's
`.contact-direct`/mono label styling (font-family mono, dimmed color,
small font-size — copy values directly from
`docs/superpowers/specs/assets/2026-08-26-kalos-mockup-reference.html`
lines 259-262 for `.contact-direct`).

- [ ] **Step 5: Run the test to confirm it still passes**

Run: `node --test tests/contact.test.mjs`
Expected: PASS — if it fails, you removed or renamed something Netlify
depends on; diff against git to find what changed and restore it.

- [ ] **Step 6: Full suite**

Run: `npm test`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Restyle Contact with teal/violet mesh background and bordered form panel"
```

---

## Task 11: Footer + Industries visual restyle (content unchanged)

**Files:**
- Modify: `src/components/Footer.astro` (CSS only)
- Modify: `src/components/Industries.astro` (CSS only)
- Test: `tests/footer.test.mjs`, `tests/industries.test.mjs` (read first,
  expect no changes needed)

**Interfaces:**
- Consumes: `--dark-*`, `--font-mono`, `--teal` (Task 1).
- Produces: nothing consumed elsewhere.

**Constraint from the spec**: the mockup's footer is a throwaway
placeholder ("NOT FINAL COPY") — do not port its content. Keep Footer's
existing logo/nav/email/copyright; only restyle. Industries isn't in the
mockup at all — restyle only, no structural change.

- [ ] **Step 1: Baseline test run**

Run: `node --test tests/footer.test.mjs tests/industries.test.mjs`
Expected: PASS (before any changes — confirms these are pure-CSS tasks).

- [ ] **Step 2: Restyle `Footer.astro`**

Update `.site-footer` background/color and add mono styling:
```css
  .site-footer {
    background: var(--dark-bg);
    color: var(--dark-ink-dim);
    padding-block: var(--space-12);
    border-top: 1px solid var(--dark-line);
  }

  .site-footer__copyright {
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
```
Keep everything else (markup, nav loop, logo `<Image>`) unchanged.

- [ ] **Step 3: Restyle `Industries.astro`'s pills to hairline mono**

Replace `.industries__pills li`'s rounded/shimmer styling with a
hairline-bordered mono pill (drop the `::after` shimmer entirely, drop
`border-radius: 999px` in favor of `border-radius: 0`, per the global
sharp-corners constraint):

```css
  .industries__pills li {
    background: transparent;
    border: 1px solid var(--border-on-light);
    border-radius: 0;
    padding: var(--space-2) var(--space-4);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 600;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .industries__pills li:hover {
    border-color: var(--teal-400);
    transform: translateY(-2px);
  }
```
Remove the `::after` shimmer rule and the `@keyframes shimmer` usage from
this file if `shimmer` isn't used elsewhere (check `global.css` — it's
defined there and shared, so only remove the `li::after`/`:hover::after`
rules from `Industries.astro`, leave `@keyframes shimmer` in `global.css`
alone in case something else uses it; if grep shows nothing else does,
it's still fine to leave the unused keyframe, not worth a separate cleanup
task).

- [ ] **Step 4: Run tests to confirm no regressions**

Run: `node --test tests/footer.test.mjs tests/industries.test.mjs`
Expected: PASS (unchanged from baseline — content assertions, not visual).

- [ ] **Step 5: Full suite**

Run: `npm test`
Expected: every test in the suite should now pass — this is the last
section-level task.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Restyle Footer and Industries to match the techno-schematic visual system"
```

---

## Task 12: Final structural sweep, accessibility, and reduced-motion audit

**Files:**
- Check: `tests/accessibility-markers.test.mjs`, `tests/page-assembly.test.mjs`
- Possibly modify: any component where the sweep finds a gap

**Interfaces:**
- Consumes: the finished output of Tasks 1-11.
- Produces: a fully green `npm test` and a manually-verified
  reduced-motion / no-JS pass — the deliverable this task closes out is
  confidence, not new code (though it may produce small fixes).

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: PASS, all files. If anything is still red, stop and fix it
before continuing — this task assumes Tasks 1-11 are fully done first.

- [ ] **Step 2: Manually verify `prefers-reduced-motion` behavior**

Run: `npm run build && npm run preview`, open the site in a browser with
"Emulate CSS media feature prefers-reduced-motion: reduce" turned on (Chrome
DevTools Rendering tab). Confirm:
- Hero's branch-connector pulse lines are static (no dash-offset animation).
- Why Kalos's logo marquee (`.reel-track`) doesn't scroll.
- Existing `[data-reveal]` entrance animations still snap to visible
  immediately (this guarantee predates this redesign — just confirm it
  still holds after all the markup changes).

- [ ] **Step 3: Manually verify no-JS content**

Run: `npm run build`, open `dist/index.html` directly as a static file (or
via `npm run preview` with JS disabled in DevTools). Confirm every
section's real content (headings, all copy, the contact form fields) is
present and readable without JS — this guarantee also predates the
redesign; the changes in this plan are all Astro-rendered static markup
(no client-only rendering was introduced), so this should hold, but
verify rather than assume, especially for the Hero's branch diagram
(pure inline SVG, should render fine with JS off) and the Services bento
(rendered by the `ServiceBento` React island, which is SSR'd by Astro —
confirm its content appears in the static HTML, not just after hydration).

- [ ] **Step 4: Run `accessibility-markers.test.mjs` and `page-assembly.test.mjs` explicitly and read their output**

Run: `node --test tests/accessibility-markers.test.mjs tests/page-assembly.test.mjs`
Expected: PASS. These weren't directly modified by any task above since
none of the section id/heading-id pairs changed (Problem section kept
`id="about"`/`aria-labelledby="about-heading"`; every other section kept
its existing id scheme) — this step exists to explicitly confirm that
holds true given how much markup changed around those anchors.

- [ ] **Step 5: Run a Lighthouse pass**

Run: `npm run build && npm run preview`, then run Lighthouse (Chrome
DevTools > Lighthouse, or `npx lighthouse http://localhost:4321 --view`)
against the preview server. Compare Performance/Accessibility scores
against pre-redesign expectations — flag (don't silently fix by
downgrading the design) any regression, e.g. from the new grain-texture
overlay or the marquee animation running continuously.

- [ ] **Step 6: Commit any fixes found during this sweep**

If Steps 2-5 turned up real issues, fix them with small targeted commits
per issue (not one giant catch-all commit) — e.g.:
```bash
git add <fixed files>
git commit -m "Fix <specific accessibility/reduced-motion issue found in final sweep>"
```
If nothing was found, no commit is needed for this task — it's a
verification gate, not guaranteed to produce a diff.

---

## After this plan

Per the user's original 3-step request from last session: this plan
covers **step 1** (port the mockup into the real codebase). Steps 2
(more React-driven transitions via Motion) and 3 (deploy to Netlify) are
separate follow-on work, intentionally out of scope here — start a new
plan for those once this one is merged and verified live.
