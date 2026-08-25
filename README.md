# Kalos Technology — Landing Page

Production landing page for Kalos Technology (bespoke software development and
staff augmentation), built with Astro as a static site.

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321`.

## Production Build

```bash
npm run build
npm run preview   # serves the built dist/ locally to sanity-check
```

Build output goes to `dist/`.

## Tests

```bash
npm test
```

Runs Node's built-in test runner over `tests/`. Most tests build the site and
assert on the generated HTML (content presence, anchor integrity, accessibility
markers); a few test pure JS logic (nav toggle, scroll reveal) directly.

Requires Node.js >= 22.6.0 — `tests/content.test.mjs` imports `src/data/content.ts`
directly and relies on Node's native TypeScript type-stripping support.

## Deploying to Netlify

**Build command:** `npm run build`
**Publish directory:** `dist`

Either:
1. Connect this repository to a new Netlify site (Netlify auto-detects the
   settings above from `netlify.toml`), or
2. Drag-and-drop the `dist/` folder after running `npm run build` locally, via
   the Netlify dashboard's manual deploy.

### Contact form (Netlify Forms)

The contact section (`src/components/Contact.astro`) uses a native HTML form with
`data-netlify="true"` and a honeypot field (`netlify-honeypot="bot-field"`) — no
backend or client-side submission code required. Netlify detects the form at build
time from the static HTML output.

Submissions appear in the Netlify dashboard under **Site settings → Forms**. To get
notified of new submissions, add a notification (email/Slack/webhook) under
**Forms → Settings and usage → Form notifications**.

The form posts to `/thank-you`, a static confirmation page
(`src/pages/thank-you.astro`) that works with JavaScript disabled.

## Content

All page copy lives in `src/data/content.ts` — edit it directly to change any
text on the page; no other file needs to change for a copy-only update.

## React islands

The Hero, Custom Software (bento grid), and Approach (sticky-stack) sections
are React islands hydrated client-side (`client:load` on the Hero since it's
above the fold, `client:visible` elsewhere). Every island's real text content
is still server-rendered by Astro — only the Motion/react-three-fiber
animation layer depends on JavaScript. When adding a new island, put it under
`src/react/<section>/` and reuse `src/react/shared/RevealOnScroll.tsx` and
`useReducedMotion` from `src/react/shared/reduced-motion.ts` rather than
writing new scroll-reveal or reduced-motion logic per component.

## Replacing Placeholder Assets

- **OG image:** no `og-image.png` is included (spec explicitly avoids
  fabricating a generated placeholder for an unshared image). Add a
  `public/og-image.png` (1200×630px recommended) and reference it with an
  `og:image` meta tag in `src/layouts/BaseLayout.astro` once a real image
  exists.
- **Canonical domain:** `astro.config.mjs` and `BaseLayout.astro` assume
  `https://kalostechnology.com`. Update both if the site deploys to a
  different domain (e.g., a `*.netlify.app` staging URL) before going live.
- **Favicon/logo:** `src/assets/logo.svg` and `public/favicon.svg` are
  recreations of the Kalos "S" logomark based on the brochure. Replace with
  the official vector logo file if/when available.

## Source Material

Content is sourced from `KALOS BROCHURE.ai` (company brochure) and
Staff-Augmentation content supplied directly by the company. See
`docs/superpowers/specs/2026-08-24-kalos-landing-page-design.md` for the full
content-to-source mapping and explicit scope exclusions.
