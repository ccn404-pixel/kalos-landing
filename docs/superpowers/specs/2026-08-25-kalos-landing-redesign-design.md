# Kalos Landing Page — Ground-Up Redesign

Status: approved in chat, pending spec review
Supersedes: the in-progress motion revamp from 2026-08-25 (uncommitted working-tree changes to Hero/global.css/tokens.css etc.) — this redesign folds that work in or replaces it section by section.

## 1. Why

The current build (from `2026-08-24-kalos-landing-page-design.md`) is content-accurate but the user found it "too simple, static, and generic" even after a motion pass. The user wants a ground-up redesign benchmarked against award-tier tech/SaaS sites (Awwwards/Godly/Land-book tier), using React-based motion (Motion, née Framer Motion), a 3D hero (Three.js via react-three-fiber), Meta's Astryx design system for structured UI, and the *real* Kalos brand assets (logo + photography) extracted from the official brochure — replacing the placeholder/recreated assets from the first build.

## 2. Real assets (extracted from brochure, already in repo)

Source: `/Volumes/NCC/SOLTEC SALUD/KALOS BROCHURE.ai` (9-page, PDF-compatible, 400dpi render + luminance-key extraction for the logo). User confirmed rights to use the brochure's stock photography on the live site, not just in print.

Already copied into `src/assets/`:
- `logo-lockup.png` (565×202, transparent) — full "KALOS TECHNOLOGY" wordmark + icon
- `logo-icon.png` (142×202, transparent) — icon only, for compact/mobile header and favicon
- `photos/hologram-hands.png` (1022×927) — hands typing, holographic system-diagram overlay. Hero depth layer.
- `photos/portrait-woman.png` (2500×4375) — confident portrait, laptop in hand. Problem/editorial section.
- `photos/pair-coworking.png` (2500×4375) — two colleagues reviewing a screen. Custom Software bento tile.
- `photos/team-collaboration.png` (2500×6096) — team at a whiteboard. Why-Kalos proof section, full-bleed with overlay quote.

The existing recreated `logo.svg` and the hand-drawn hero SVG network graphic are retired in favor of the real logo and the new Three.js hero. All four photos are print-resolution PNGs; the plan (Section 6) downsamples and re-encodes them at build time via Astro's image pipeline — nothing ships at 2500px wide.

## 3. Technical architecture: hybrid Astro + React islands

Astro (`output: "static"`) stays the shell. Zero-JS baseline is preserved: every section's real content (headings, body copy, nav, the contact form) continues to render as plain server-rendered HTML, so the existing `npm run build` + grep-static-HTML test suite (`tests/*.test.mjs`) keeps working unmodified — Astro SSRs each React island's initial markup straight into `dist/index.html`, hydration only adds the motion/3D layer on top in the browser.

New dependencies:
```
astro                  ^4.15 (existing)
@astrojs/react         ^4.x
react / react-dom      ^19.0
motion                 ^13.1        // animation, whileInView reveals, layout transitions
three                  ^0.165
@react-three/fiber     ^9.7         // React renderer for three.js, React-19-compatible
@react-three/drei      ^10.7        // camera/controls/postprocessing helpers, React-19-compatible
@astryxdesign/core     ^0.5.0       // Meta's official design system (verified: facebook/astryx, real npm publish)
@stylexjs/stylex       ^0.19        // required peer for Astryx components
vite-plugin-stylex     ^0.13        // community Vite integration for StyleX (no official Vite plugin exists yet)
```

**Not installed:** the literal npm package `astryx` (0.0.0, unrelated placeholder — confirmed via registry inspection, not Meta's project) and `@designcodeio/threeui` as a runtime dependency (it's a 54MB component-source browser/template library, meant to be copied from via its own CLI, not imported at runtime). Its public components/templates (github.com/MengTo/threeui) are used as pattern reference for the hero scene; the actual runtime 3D code is hand-written react-three-fiber, since no off-the-shelf template matches "abstract engineering node-network" precisely.

**StyleX risk flag:** `vite-plugin-stylex` is third-party, not an official Meta package, and Astryx itself is a 0.5.0 beta. If wiring StyleX's compile step into Astro's Vite pipeline turns out to be unstable during implementation (dev-server HMR breaking, build-time extraction failing), the fallback is: drop `@astryxdesign/core`, hand-build the same structural components (nav, buttons, bento tiles) as plain React + the site's existing CSS custom-property tokens, and keep Motion + react-three-fiber (the two pieces that actually deliver the "wow" the user asked for). This fallback will be called out explicitly if taken, not silently substituted.

## 4. New file structure

```
src/
  assets/
    logo-lockup.png, logo-icon.png      # done
    photos/*.png                        # done
  react/                                 # new — all client-hydrated islands live here
    hero/
      HeroScene.tsx                     # r3f Canvas: node-network, mouse-reactive camera parallax
      HeroChips.tsx                     # Motion floating stat panels ("12 engineers embedded this quarter", real figures only)
      HeroIsland.tsx                    # composes HeroScene + HeroChips + headline/CTA slot
    process/
      ProcessStack.tsx                  # sticky-stack scroll for the 5 approach steps (Motion + IntersectionObserver, no GSAP — avoids mixing two scroll-animation libraries per taste-skill guidance)
    services/
      ServiceBento.tsx                  # Astryx Card/Grid primitives, asymmetric tile sizes, pair-coworking photo as one large tile
    shared/
      RevealOnScroll.tsx                # thin Motion whileInView wrapper, used by every island needing "enter on scroll"
      reduced-motion.ts                 # useReducedMotion hook wired to the same prefers-reduced-motion the CSS already respects
  components/                            # existing Astro components — updated, not replaced wholesale
    Hero.astro                          # now a thin shell: real logo/headline markup (SSR fallback) + <HeroIsland client:load />
    Process.astro                       # shell + <ProcessStack client:visible />
    Services.astro                      # shell + <ServiceBento client:visible />
    WhyKalos.astro                      # full-bleed team-collaboration.png background, overlay quote (no React needed, CSS only)
    About.astro                        # becomes the "Problem" editorial section, portrait-woman.png full-bleed
    [Industries/StaffAug*/Contact/Header/Footer].astro  # kept, real logo swapped in, layout-family pass per Section 5
  styles/
    tokens.css, global.css              # kept for all pure-Astro sections
    stylex.tokens.ts                    # new — StyleX token definitions mapped to the SAME palette values as tokens.css, so Astryx islands and static sections are visually one system, not two
astro.config.mjs                        # add @astrojs/react integration + vite-plugin-stylex
```

`client:load` only on the hero (above the fold, must be interactive immediately); `client:visible` on Process/Services islands so their JS doesn't block initial page load.

## 5. Section-by-section plan (Hook → Problem → Product → Experience → Features → Proof → Value → CTA)

Already approved in chat:

| Section | Narrative beat | Layout family | Real asset |
|---|---|---|---|
| Hero | Hook | React island: r3f node-network behind headline, Motion floating stat chips, hologram-hands photo as depth layer | hologram-hands.png |
| Problem (was About) | Problem | Full-bleed editorial statement | portrait-woman.png |
| Custom Software (Services) | Product | Bento grid via Astryx, 5 services, mixed tile sizes | pair-coworking.png (one large tile) |
| Approach (Process) | Experience | Sticky-stack scroll, 5 steps pin/transition | — |
| Staff Augmentation | Features | Editorial split panels + horizontal scroll-snap benefit strip | — |
| Why Kalos | Proof | Full-bleed photo, overlay pull-quote | team-collaboration.png |
| Industries | Value | Horizontal scroll-snap pills (kept, already distinct) | — |
| Contact | CTA | Full-width form, faint echo of the hero's node-network motif behind it | — |

No section repeats an adjacent section's layout family, addressing the "headline → paragraph → cards" repetition the user called out.

## 6. Image pipeline

All four brochure photos move through Astro's built-in `astro:assets` `<Image>` component at build time: automatic responsive `srcset`, WebP output, explicit `width`/`height` to prevent CLS. Source PNGs stay in `src/assets/photos/` as the high-res originals; nothing 2500px-wide ships to the browser untouched.

## 7. Accessibility & performance guardrails (carried over + extended)

- `prefers-reduced-motion`: the existing CSS-level override stays for Astro-only sections; the new `useReducedMotion` hook (Section 4) gates every Motion/r3f animation the same way — infinite loops, parallax, and the 3D scene all collapse to a static frame.
- No-JS: content in every island still renders (SSR), only the animated/3D layer is JS-dependent — matches the existing "usable with JS disabled" constraint.
- Animate only `transform`/`opacity` in CSS; r3f scene renders to its own canvas, isolated from layout-triggering properties.
- Existing test suite (`npm test`) must still pass unmodified against `dist/index.html` after the rewrite — this is the acceptance bar for "SSR fallback is real, not decorative."
- Lighthouse pass (perf + accessibility) before calling this done, per the project's existing standard.

## 8. Open implementation risk, called out explicitly

StyleX + Astro/Vite wiring (Section 3) is the one piece with real "might not work cleanly" risk, since it depends on a third-party Vite plugin and a 0.5.0 beta design system. Everything else in this stack (Astro+React islands, Motion, react-three-fiber) is a well-trodden combination. If StyleX integration burns disproportionate time, the fallback in Section 3 is pre-approved — implementation should say so out loud when/if it's taken, not swap silently.
