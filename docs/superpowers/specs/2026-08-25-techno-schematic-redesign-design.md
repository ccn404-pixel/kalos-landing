# Kalos Landing Page — Techno-Schematic Redesign

Status: approved in chat, pending spec review
Supersedes: the motion/photo-fit revamp from `2026-08-25-kalos-landing-redesign-design.md` (commit `8f321dd` on `redesign/landing-v2`). That pass fixed image cropping and typography on top of the original ground-up redesign; the user then rejected the overall look as "too simple, poorly designed" and asked for a full visual-direction pivot. This spec replaces the *visual system* (color, type, motifs, section treatments) while keeping the existing information architecture and Astro+React-islands technical foundation.

## 1. Why

The user wants something "highly tech, innovative, and focused on new AI," benchmarked against current Awwwards/Dribbble-tier sites, and pointed at five specific references — most importantly **rig.ai**, which they flagged as the priority. rig.ai's visual language (near-black + off-white + one accent color, huge bold display type, monospace uppercase eyebrow tags in bordered pills, hairline-grid layouts with numbered spec-sheet cards, technical architecture diagrams used *as* hero visuals rather than decoration, subtle grain texture, restrained motion) is the direction this spec adopts, adapted to Kalos's existing teal brand accent and B2B custom-software/staff-augmentation content.

## 2. What stays the same

- **Information architecture**: same section order — Hero → Problem → Custom Software → Approach → Staff Augmentation → Why Kalos → Industries → Contact. No new or removed sections; content facts (services, benefits, process steps, industries) are unchanged.
- **Technical foundation**: Astro static output, React islands for interactive pieces, Motion for animation, the existing `prefers-reduced-motion` and no-JS-fallback guarantees, and the existing test suite's job (verify `dist/index.html` structure) all carry forward unmodified in spirit — tests will need updates for new class names/content but the *guarantees* they check (accessible names, landmarks, anchor integrity, SSR fallback, reduced-motion) stay.
- **Brand accent color**: teal `#1fe6e6`, carried over from the current site — now used surgically (status dots, tag borders, key lines) rather than as soft gradient washes.

## 3. What changes

### 3.1 Visual system

- **Background**: deepen the existing `navy-950` toward near-black (still cool/navy-tinted, not neutral gray-black, so it stays recognizably Kalos rather than a generic reskin).
- **Type**: `Archivo` stays as the bold display face (already self-hosted from the prior pass), pushed bigger/bolder for headlines. Add a self-hosted monospace face — **IBM Plex Mono** (SIL OFL, free for commercial use, wide weight range) — for eyebrow tags, numbered items, and data readouts.
- **Grain texture**: a subtle noise/grain overlay applied globally via a CSS `background-image` (inline SVG turbulence `<filter>` data-URI — no image asset, no JS) at low opacity, matching rig.ai's textured-black surface instead of a flat color.
- **Hairline grid system**: replace the current shadow-card style (`.card` with `box-shadow`) with 1px low-opacity border dividers — content sits in bordered cells like a spec sheet/blueprint, echoing rig's 2×2 problem grid and boxed architecture diagram.
- **Mono eyebrow tags**: replace plain uppercase eyebrow text (`.eyebrow`) with a bordered pill component — icon (✓ or a small dot) + uppercase mono label, matching rig's `✓ INTRODUCING RIG` / `✗ THE PROBLEM` tags.
- **Numbered items**: a reusable numbered-item pattern (`001`, `002`, mono, low-opacity) for problem-grid cards and spec lists, replacing the current checkmark-list style in a few sections.
- **Live data-panel accent**: at least one floating/inline "live status" micro-UI element (borrowed from the leedlime/webflow references) — e.g. a small bordered panel with a status dot and a value that updates via Motion (like rig's `<300ms · ON DEVICE` readout) — used in the hero diagram and/or the services panel.

### 3.2 Section-by-section treatment

| Section | Current (redesign/landing-v2) | New |
|---|---|---|
| Hero | r3f node-network canvas + Motion stat chips + `hologram-hands` photo layer at 0.35 opacity | SVG/CSS architecture diagram (hairline boxes + dotted connectors + status dots, lines drawing in on load via Motion/SVG `stroke-dashoffset`) showing the shape of engaging Kalos (e.g. `YOUR BUSINESS → KALOS → CUSTOM SOFTWARE / STAFF AUGMENTATION`); `hologram-hands` stays as a duotone-treated depth layer behind it; bold headline, mono eyebrow tag, grain texture |
| Problem (was About, merges in Why-Custom's content) | Two-column: contained `portrait-woman` tile + text | Bold statement headline + `portrait-woman` (duotone-treated, contained tile as in the current pass) beside a 2×2 hairline-grid of numbered problem cards (adapting the current "why custom instead of off-the-shelf" bullets into rig's problem-card format) |
| Custom Software (bento) | Bento grid; `pair-coworking` photo tile + 5 service tiles | Same bento shape, hairline borders instead of shadow cards; photo tile replaced by a mono status/engagement panel (stack labels, a live-style readout) |
| Approach | Sticky-stack scroll of 5 steps | Connected-node schematic: 5 steps as hairline boxes joined by dotted/drawn connector lines, numbered mono labels |
| Staff Augmentation | Card grid + horizontal scroll-snap benefit strip | Same structure, stat callouts restyled as mono data readouts (`50% · FASTER ONBOARDING`) instead of card+checkmark |
| Why Kalos | Full-bleed `team-collaboration` photo + scrim + pull-quote | Same full-bleed photo (kept, duotone-treated) + bold statement + numbered list + pull-quote, restyled with hairline borders and mono labels |
| Industries | Rounded pill tags with shimmer hover | Hairline-bordered mono pills |
| Contact | Light-bordered form on dark bg | Same form, mono field labels, hairline borders, status-style submit affordance |

### 3.3 Photography

Down from 4 photos to 3 — `pair-coworking.png` is dropped (its bento tile becomes a diagram/panel). The remaining three (`hologram-hands`, `portrait-woman`, `team-collaboration`) get a duotone treatment (CSS `mix-blend-mode` + a navy/teal gradient overlay, or a `filter` duotone approach) so they read as part of this system instead of clashing with the diagram-driven aesthetic. `pair-coworking.png` stays in the repo (unused on this page) in case it's wanted elsewhere.

### 3.4 Technical / dependency changes

- **Remove** `@react-three/fiber`, `@react-three/drei`, `three`, and `@types/three` — the WebGL node-network scene is replaced by an SVG/CSS diagram. This also removes the GPU/WebGL-decode fragility that caused rendering issues during testing of the prior pass.
- **Remove** `@astryxdesign/core`, `@stylexjs/stylex`, `vite-plugin-stylex`, and `src/styles/stylex.tokens.ts` — confirmed unused anywhere except the orphaned tokens file (the original ground-up redesign's StyleX fallback was silently taken; no component ever imported Astryx). Cleaning these up removes dead weight and the "0.5.0 beta dependency" risk flagged in the original spec.
- **Add** IBM Plex Mono (self-hosted, same pattern as Archivo: Google Fonts `<link>` + `--font-mono` token).
- **Keep** Motion — it now carries all "feels alive" motion: staggered reveals (existing `RevealOnScroll`/`data-reveal` patterns extend to new sections), hover-triggered panel states, live-updating stat readouts, and SVG line-drawing animation in the hero and process diagrams.
- **New shared patterns**: a hairline-grid CSS utility, a mono eyebrow-tag component (Astro or React, used in both static and island contexts), a numbered-item component, and the grain-texture CSS overlay.
- Existing accessibility/perf guardrails (Section 7 of the prior spec) carry forward unchanged: `prefers-reduced-motion` disables all animation including SVG line-draws, content is real in SSR'd HTML with JS disabled, Lighthouse pass before calling this done.

## 4. Testing

The existing `tests/*.test.mjs` suite asserts structural/accessibility facts (accessible names, landmark integrity, anchor/id matching, SSR fallback content, reduced-motion behavior) against `dist/index.html`. These tests get updated for new markup/class names as sections are rebuilt, but their *assertions* (what must remain true) don't change. New components (diagram, numbered-item, eyebrow-tag) get the same kind of coverage the existing sections have.

## 5. Open questions / risks

- **Hero diagram content**: the exact labels/shape of the architecture diagram (what boxes, what connects to what) needs final copy — draft during implementation using the existing hero copy (`hero.eyebrow`, `hero.headline`, `hero.subhead`) as the source of truth, refine wording collaboratively if it reads oddly once built.
- **Duotone treatment**: exact CSS approach (blend-mode vs SVG filter vs pre-processed image) gets decided during implementation based on what renders correctly across browsers without adding a build-time image-processing step; if one approach fights the tooling, fall back to the next and say so explicitly rather than silently downgrading the visual.
