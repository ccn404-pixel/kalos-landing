# Kalos Landing Page — Techno-Schematic Redesign (v2, final)

Status: approved (mockup) — this spec supersedes
`2026-08-25-techno-schematic-redesign-design.md`, which documented an
earlier, now-superseded round of the same direction (all-dark, duotone
photos, static Approach diagram). The user pushed back twice more in the
same session and the design evolved further. **This spec documents what was
actually approved**, reconstructed from the final mockup artifact rather
than from the stale prior spec.

**Reference artifact (source of truth for exact CSS/markup):**
`docs/superpowers/specs/assets/2026-08-26-kalos-mockup-reference.html`
— a static HTML+CSS file (no framework, single `<style>` block). All colors,
spacing, class names, and CSS values referenced below are copied verbatim
from this file; when a plan task needs an exact rule not quoted here, read
it directly from that file rather than guessing.

Live version (may be edited further by the user, this saved copy is the
frozen reference used for this implementation pass):
https://claude.ai/code/artifact/58a4a338-c377-4fa5-b877-5f31e4b08d17

## 1. What stays the same

- **Information architecture**: Hero → Problem → Custom Software (Services)
  → Approach → Staff Augmentation → Why Kalos → Industries → Contact →
  Footer. (The mockup itself omits Industries and has a placeholder
  Footer — see §3 exceptions below; the user confirmed Industries stays as
  its own section, restyled but not redesigned from the mockup since the
  mockup doesn't cover it.)
- **Technical foundation**: Astro static output, React islands for
  interactive pieces (`client:load`/`client:visible`), Motion for
  animation, `prefers-reduced-motion` handling, no-JS-fallback content
  guarantees, and the existing `tests/*.test.mjs` suite's job (assert
  structural/accessibility facts against `dist/index.html`) all carry
  forward.
- **Brand accent**: teal, now `#1fe6e6` exactly as today (unchanged value,
  just applied more surgically — status dots, tag borders, glows — instead
  of soft gradient washes).
- **Real photography**: `hologram-hands.png`, `portrait-woman.png`,
  `team-collaboration.png` stay, full color (explicitly **not** duotone —
  the user rejected a duotone treatment during mockup iteration).
  `pair-coworking.png` is dropped from use on this page (its old bento slot
  becomes a status panel) but the file itself is not deleted from the repo.
- **Netlify contact form**: `data-netlify="true"`, honeypot field, hidden
  `form-name`, `/thank-you` redirect — all real, tested infrastructure,
  untouched by this visual pass.

## 2. Design tokens (new, exact values)

These are the mockup's `:root` custom properties, to be merged into
`src/styles/tokens.css` as a superset alongside the existing `--space-*`,
`--radius-*` (mockup uses `border-radius: 0` everywhere — hairline square
corners, so existing radius tokens stop being used on redesigned sections
but stay defined for anything not yet touched), and `--shadow-*` tokens:

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

--teal: #1fe6e6;       /* same value as existing --teal-400 — keep both names, alias new to old or vice versa, implementer's call, but don't duplicate the literal hex in two places: define one as var(--other) */
--teal-dim: #7ff2f2;   /* same value as existing --teal-300 */
--teal-deep: #0a8f8f;
--teal-wash: rgba(31, 230, 230, 0.10);
--violet: #8b7ff2;

--font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", monospace;
```

`--font-display` (Archivo) and `--max-width` already exist under those
exact names in `tokens.css` — do not introduce the mockup's differently
named `--max` token, just reuse `--max-width` (value differs: mockup uses
`1240px`, current uses `1200px` — take the mockup's `1240px`, it's a
one-line change with no other implications).

**Theme-block pattern**: sections default to the dark palette; a section
gets `class="on-light"` to flip to the light palette. This is implemented
via CSS custom property redeclaration scoped to `section`, not by
duplicating rules:

```css
section {
  --bg: var(--dark-bg); --panel: var(--dark-panel); --ink: var(--dark-ink);
  --ink-dim: var(--dark-ink-dim); --line: var(--dark-line); --line-strong: var(--dark-line-strong);
}
section.on-light {
  --bg: var(--light-bg); --panel: var(--light-panel); --ink: var(--light-ink);
  --ink-dim: var(--light-ink-dim); --line: var(--light-line); --line-strong: var(--light-line-strong);
}
```
Every redesigned section then styles itself purely in terms of `--bg`,
`--panel`, `--ink`, `--ink-dim`, `--line`, `--line-strong` — never the
`--dark-*`/`--light-*` tokens directly — so the same component CSS works in
either theme depending on which class is on the `<section>`.

**Global grain overlay** (new, `body::before`, fixed positioned, inline SVG
`feTurbulence` data-URI, `mix-blend-mode: overlay`, `opacity: 0.4`,
`pointer-events: none`) — purely decorative, static (no animation), so it
needs no `prefers-reduced-motion` gating, but must not block clicks
(`pointer-events: none`) or show up in a no-JS/no-CSS content dump.

**Shared components**: `.tag` (bordered mono pill, optional `.dot` status
indicator — teal+glow when active, dim gray with no glow when
`.status-off`), `.btn` (teal-filled, sharp corners, mono uppercase,
`translateY(-2px)` + glow shadow on hover), `.num`/`.mono` (mono, dimmed,
tracked-out utility text).

## 3. Section-by-section (final, approved)

| Section | Theme | Structural change from current |
|---|---|---|
| Header | dark, translucent+blur | Logo: icon+wordmark text instead of lockup image. Nav unchanged (same 5 links incl. Industries — mockup itself omits Industries from its nav, but the user asked to keep the Industries section, so its nav entry stays too). Reskin only. |
| Hero | dark | New 2-col grid layout. Right column: SVG/CSS branch diagram (one node → two output cards) instead of the R3F canvas. New 3-stat strip. `hologram-hands` becomes a faint background layer behind the diagram, not a corner flourish. |
| Problem (`About.astro`) | **light** (flip from dark) | Prose paragraphs replaced by a 2×2 grid of 4 problem cards (icon+title+description). New content (see §4). |
| Services/bento (`Services.astro`) | **light** (flip from dark) | Photo tile replaced by a mono status panel. 5 items → 7 (two new). Hairline-grid look instead of shadow cards. |
| Approach (`Process.astro`) | dark | **Kept**: the existing scroll-linked sticky-stack interaction (`ProcessStack.tsx`) — restyled to the new visual system, not replaced by the mockup's static grid. New methodology strip added below it. |
| Staff Augmentation | dark | Three existing components (`StaffAugIntro`, `StaffAugBenefits`, `StaffAugServices`) become one continuous visual section (single shared background/border, no gap between sub-blocks). Benefits: **7 stats kept** (mockup shows 6, user asked to keep "Cultural Integration" as a 7th — lands as an uneven last row in a 3-col grid), restyled from scroll-snap cards to a static bordered stat grid with big mono numbers. Services: card grid → plain vertical list with a 5th new item ("AI, ML & Advanced Technical Roles"). |
| Why Kalos (`WhyKalos.astro`) | dark | Merge the current 2-block layout (plain intro block + separate photo-proof block) into one full-bleed photo section. Bulleted list → numbered ordered list (5 items, enriched copy). Boxed blockquote → large italic display statement. New scrolling logo/tagline marquee added below. |
| Industries | dark | **Visual restyle only** — hairline-bordered mono pills instead of rounded shimmer pills. No structural or content change (the mockup doesn't cover this section at all). |
| Contact | dark | Background: SVG network motif → radial-gradient teal+violet mesh. Form: unstyled fields → bordered panel wrapper, sharp corners, dark input fill. All Netlify attributes/hidden fields/honeypot preserved exactly. |
| Footer | dark | **Visual restyle only** — the mockup's footer is a throwaway placeholder (its own copy literally reads "NOT FINAL COPY") and is not a content source. Keep existing footer content (logo, nav, email, copyright); apply mono/teal/hairline styling to match. |

## 4. New/changed content (`src/data/content.ts`)

- **`about` → `problem`** (rename export): drop `overview`/`reliability`
  prose. New shape:
  ```ts
  export const problem = {
    id: "about", // keep existing anchor id so nav/tests referencing #about don't need to change unless nav itself changes
    tag: "The Problem",
    heading: "Off-the-shelf software wasn't built for you.",
    items: [
      { title: "Generic templates", description: "..." },
      { title: "Licensing limits", description: "..." },
      { title: "Slow to evolve", description: "..." },
      { title: "Divided ownership", description: "..." },
    ],
  };
  ```
  Exact copy for each item's description: pull from the mockup reference
  file (`.problem-card p` text) verbatim — do not paraphrase.
- **`services.items`**: add two entries, in this order after the existing
  5 (matching mockup order, wide closer stays last):
  `{ title: "Digital transformation consulting", description: "Modernize operations and translate business goals into technical roadmaps." }`,
  `{ title: "Platform as a Service (Cloud)", description: "Scalable, secure cloud infrastructure that adapts as you grow." }`.
- **`process`**: add `methodology: string[]` = `["Digital Transformation Strategies", "Lean Six Sigma Optimization", "Systematic Problem-Solving", "Cloud Computing Strategy"]`. Keep existing `steps` copy as-is (current "Testing & Quality Assurance" wording is fine to keep — do not shorten to the mockup's "Testing & QA" unless the user asks; this is app copy, not a structural requirement).
- **`staffAugBenefits.items`**: restructure each item from `{title, description}` to `{n, l, d}` (number, label, description) so the big mono number can be pulled out visually, e.g.
  `{ n: "50%", l: "Faster Onboarding", d: "Experienced developers productive within 1-2 weeks (vs. 3-6 months traditional hiring)" }`.
  Apply the same split to all 7 existing items (including Cultural Integration, which is kept per user decision). Do not change the underlying facts/values, just split the existing title strings at the number/label boundary.
- **`staffAugServices.items`**: add a 5th item after "Flexible Team
  Scaling" (matching mockup order): `{ title: "AI, ML & Advanced Technical Roles", description: "Specialized talent in artificial intelligence, machine learning, and emerging technical domains." }`.
- **`whyKalos`**: consolidate `bullets` (4) + `whyKalosItems` (4) into one
  5-item ordered list `items: string[]`, enriched per the mockup: add a 5th
  item about global talent access, and close with a "we don't just fill
  seats" style line as the `closing` field (replacing the current
  `closing`). Drop `whyKalosHeading` (redundant with `heading`). Add
  `marquee: string[]` = the reel's repeating item list, e.g.
  `["KALOS TECHNOLOGY", "BESPOKE SOFTWARE", "SPECIALIZED TALENT", ...]`
  pulled verbatim from the mockup's `.logo-reel` markup.
- **`nav`**: unchanged (Industries stays per user decision).

## 5. Technical / dependency changes

- **Remove**: `@react-three/fiber`, `@react-three/drei`, `three`,
  `@types/three` (only consumed by `HeroScene.tsx` +
  `network-geometry.ts`, both deleted), `@astryxdesign/core`,
  `@stylexjs/stylex`, `vite-plugin-stylex` (only consumed by the orphaned
  `src/styles/stylex.tokens.ts`, also deleted; also remove the
  `vite-plugin-stylex` plugin registration from `astro.config.mjs`).
  Verify `.npmrc`'s `legacy-peer-deps` line is still needed after removal;
  drop it if nothing else requires it.
- **Add**: IBM Plex Mono, self-hosted the same way Archivo already is
  (Google Fonts `<link>` in `BaseLayout.astro`'s `<head>` +
  `--font-mono` token, already specified in §2).
- **Keep**: `motion` — used by `RevealOnScroll.tsx`, `ProcessStack.tsx`
  (kept per user decision), and `ServiceBento.tsx`'s per-tile stagger.
- Existing accessibility/perf guardrails carry forward unchanged:
  `prefers-reduced-motion` disables all new animation (branch-diagram
  pulse lines, logo marquee scroll) same as it already does for existing
  Motion-driven effects; content renders in SSR'd HTML with JS disabled;
  `tests/*.test.mjs` continues to assert against `dist/index.html`.

## 6. Testing

Existing test suite is per-section (`tests/<section>.test.mjs`), each
running `npm run build` then asserting against `dist/index.html`. This
pass:
- **Deletes** `hero-scene.test.mjs` (tests `network-geometry.ts`, which is
  deleted).
- **Rewrites** `about.test.mjs` (new Problem-section content),
  `why-kalos.test.mjs` (restructured content + new marquee), `services.test.mjs`
  (7 items, no photo), `staff-aug-benefits.test.mjs` (n/l/d shape, 7 items
  kept), `staff-aug-services.test.mjs` (5th item), `hero.test.mjs` +
  `react-islands.test.mjs` (drop the `class="hero-island"` assertion since
  Hero is no longer an island — `react-islands.test.mjs` should assert
  against a still-live island, e.g. `ServiceBento` or `ProcessStack`,
  instead).
- **Updates for section id consistency**: `accessibility-markers.test.mjs`
  and `page-assembly.test.mjs` don't hardcode section ids/counts by name in
  a way that breaks from a reskin alone, but must be re-run after each
  section task to confirm the count/anchor-integrity invariants still hold
  (ids are not changing in this plan except `about`'s content, which keeps
  its existing `id="about"`).
- **Preserved as-is**: `contact.test.mjs` (all Netlify-attribute assertions
  survive since none of them touch the visual layer), `footer.test.mjs`,
  `base-layout.test.mjs`, `scaffold.test.mjs`, `nav-toggle.test.mjs`,
  `scroll-reveal.test.mjs`, `industries.test.mjs` (visual-only restyle).
- **`process.test.mjs`**: survives structurally (asserts step-title order
  via `html.indexOf`), gets one addition for the new methodology strip
  items.
- **`content.test.mjs`**: needs count/shape updates matching every
  `content.ts` change in §4.

## 7. Open items resolved during spec review

- Industries section: **kept**, restyled only, not redesigned (mockup
  doesn't cover it).
- Staff Aug "Cultural Integration" stat: **kept** as a 7th item.
- Approach section motion: **kept** — the existing scroll-linked
  sticky-stack (`ProcessStack.tsx`) is restyled, not replaced by the
  mockup's static grid.
- **`WhyCustom.astro` ("Why custom instead of off-the-shelf?") is cut**,
  not carried forward. Its 4 bullets ("Built exactly for your workflows",
  "Easier to scale and evolve", "No unnecessary features or licensing
  limits", "Full ownership and long-term flexibility") are the positive
  mirror of the new Problem section's 4 cards (Generic templates /
  Licensing limits / Slow to evolve / Divided ownership) — the mockup
  folded this content into Problem and never carries a separate
  "why custom" section. Keeping both would read as repeating the same
  point twice in a row. This wasn't one of the three questions put to the
  user directly — flag it during plan review in case they want it kept or
  moved instead of deleted.
