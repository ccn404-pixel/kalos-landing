# Kalos Technology Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy-ready-package a production-quality, accessible, responsive Astro landing page for Kalos Technology covering both its Custom Software Development and Staff Augmentation offerings, using only brochure- and user-supplied content.

**Architecture:** Astro static site (`output: 'static'`, zero client framework/islands). All copy lives in one typed data module (`src/data/content.ts`) consumed by presentational `.astro` components assembled in `src/pages/index.astro`. Two small vanilla-JS behaviors (mobile nav toggle, scroll-reveal) have their pure decision logic extracted into testable functions; DOM wiring itself is verified by build + manual check, not unit tests (no jsdom dependency). Netlify Forms handles the contact form with no backend and no client JS submission handler.

**Tech Stack:** Astro (static output), plain CSS with custom properties (no CSS framework), vanilla JS (no libraries), Node's built-in `node:test`/`node:assert` for the few pure-logic unit tests, Netlify Forms, Netlify deployment.

**Spec:** `/Users/trixie/Desktop/CLAUDE VSCODE/kalos-landing/docs/superpowers/specs/2026-08-24-kalos-landing-page-design.md`

## Global Constraints

- No stock photography of people; all imagery is original CSS/SVG (spec §1).
- No external font loading — system font stack only (spec §3, §5).
- No tracking scripts, no unnecessary runtime dependencies (spec §3).
- Company name is **Kalos Technology** everywhere, never "Kalos Corporation" (spec §1).
- Do not add testimonials, client logos, case studies, certifications, awards, team bios, social links, street address, or pricing — none exist in either source (spec §9).
- The Staff Augmentation stats (50% faster onboarding, 30-40% cost savings, etc.) are user-supplied and must be reproduced verbatim, not altered or hedged (spec §2, "Staff Augmentation" subsection).
- Every page section needs a semantic landmark and `aria-labelledby` pointing at its own heading (spec §6).
- All decorative SVGs get `aria-hidden="true"` (spec §6).
- Motion must be wrapped in `@media (prefers-reduced-motion: no-preference)` (spec §5).
- Netlify config: build command `npm run build`, publish dir `dist` (spec §8).
- Project root: `/Users/trixie/Desktop/CLAUDE VSCODE/kalos-landing`

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `netlify.toml`
- Create: `src/pages/index.astro` (placeholder)
- Create: `.gitignore`
- Test: `tests/scaffold.test.mjs`

**Interfaces:**
- Produces: a working `npm run build` command that outputs `dist/index.html`. All later tasks assume this exists and extend `src/pages/index.astro`.

- [ ] **Step 1: Write package.json**

```json
{
  "name": "kalos-landing",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node --test tests/"
  },
  "devDependencies": {
    "astro": "^4.15.0"
  }
}
```

- [ ] **Step 2: Write astro.config.mjs**

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kalostechnology.com",
  output: "static",
});
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: Write netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

- [ ] **Step 5: Write .gitignore**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 6: Write placeholder index.astro**

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Kalos Technology</title>
  </head>
  <body>
    <main><h1>Kalos Technology</h1></main>
  </body>
</html>
```

- [ ] **Step 7: Install dependencies**

Run: `cd "/Users/trixie/Desktop/CLAUDE VSCODE/kalos-landing" && npm install`
Expected: `astro` installed into `node_modules`, `package-lock.json` created.

- [ ] **Step 8: Write the build smoke test**

```js
// tests/scaffold.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("astro build produces dist/index.html", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  assert.ok(fs.existsSync("dist/index.html"), "dist/index.html should exist after build");
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Kalos Technology/);
});
```

- [ ] **Step 9: Run test to verify it passes**

Run: `node --test tests/scaffold.test.mjs`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json netlify.toml .gitignore src/pages/index.astro tests/scaffold.test.mjs package-lock.json
git commit -m "Scaffold Astro project with build smoke test"
```

---

## Task 2: Content Data Module

**Files:**
- Create: `src/data/content.ts`
- Test: `tests/content.test.mjs`

**Interfaces:**
- Produces: named exports `site`, `nav`, `hero`, `about`, `services`, `whyCustom`, `staffAugIntro`, `staffAugBenefits`, `staffAugServices`, `process`, `industries`, `whyKalos`, `contact`, `footer` — every later component task imports from this module and no other content source.

- [ ] **Step 1: Write the failing test**

```js
// tests/content.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

test("content module exports all required sections with correct shapes", async () => {
  const c = await import("../src/data/content.ts");
  assert.equal(c.site.name, "Kalos Technology");
  assert.equal(c.site.email, "pbirdsong@kalostechnology.com");
  assert.equal(c.site.domain, "kalostechnology.com");

  assert.equal(c.nav.length, 5);

  assert.equal(c.hero.headline, "Software that fits. Teams that scale.");

  assert.equal(c.services.items.length, 5);
  assert.equal(c.whyCustom.items.length, 4);

  assert.equal(c.staffAugBenefits.items.length, 7);
  assert.ok(c.staffAugBenefits.items.some((i) => i.title.includes("50%")));
  assert.ok(c.staffAugBenefits.items.some((i) => i.title.includes("30-40%")));

  assert.equal(c.staffAugServices.items.length, 4);

  assert.equal(c.process.steps.length, 5);
  assert.equal(c.industries.items.length, 6);

  assert.equal(c.whyKalos.bullets.length, 4);
  assert.equal(c.whyKalos.whyKalosItems.length, 4);
  assert.equal(c.whyKalos.quote, "You're never just a client. You're a partner.");

  assert.equal(c.contact.email, "pbirdsong@kalostechnology.com");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/content.test.mjs`
Expected: FAIL (module not found — `src/data/content.ts` doesn't exist yet)

- [ ] **Step 3: Write src/data/content.ts**

```ts
export const site = {
  name: "Kalos Technology",
  domain: "kalostechnology.com",
  email: "pbirdsong@kalostechnology.com",
};

export const nav = [
  { label: "Custom Software", href: "#custom-software" },
  { label: "Staff Augmentation", href: "#staff-augmentation" },
  { label: "Approach", href: "#approach" },
  { label: "Industries", href: "#industries" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  eyebrow: "Kalos Technology",
  headline: "Software that fits. Teams that scale.",
  subhead:
    "We design and build custom software around your business goals, and put experienced engineers directly on your team — without the recruitment overhead. You stay in control. We handle the complexity.",
  primaryCta: { label: "Start the conversation", href: "#contact" },
  secondaryCta: { label: "See our approach", href: "#approach" },
};

export const about = {
  heading: "A partner you can rely on",
  overview:
    "Kalos Technology is a bespoke software development company specializing in custom-built digital solutions designed around your business goals — not generic templates. We partner with growing companies and enterprises to design, build, and scale software that improves efficiency, unlocks new revenue, and supports long-term growth.",
  reliability:
    "At Kalos Technology, we work as an extension of your team — aligning technology decisions with business objectives from day one. Our approach minimizes risk, accelerates decision-making, and ensures every solution is built to evolve with your organization.",
};

export const services = {
  id: "custom-software",
  eyebrow: "Custom Software Development",
  heading: "Our bespoke software services",
  intro: "We design and develop custom solutions across the full product lifecycle:",
  items: [
    {
      title: "Custom software development",
      description: "Business-critical platforms built from the ground up",
    },
    {
      title: "SaaS product development",
      description: "Scalable, secure software ready for growth",
    },
    {
      title: "Web & cloud applications",
      description: "Modern, high-performance applications",
    },
    {
      title: "System integrations & automation",
      description: "Connect tools, eliminate manual work, improve efficiency",
    },
    {
      title: "Modernization & optimization",
      description: "Upgrade legacy systems without disrupting operations",
    },
  ],
};

export const whyCustom = {
  heading: "Why custom instead of off-the-shelf?",
  items: [
    "Built exactly for your workflows",
    "Easier to scale and evolve",
    "No unnecessary features or licensing limits",
    "Full ownership and long-term flexibility",
  ],
};

export const staffAugIntro = {
  id: "staff-augmentation",
  eyebrow: "Staff Augmentation",
  headline: "Custom teams. Built to scale.",
  subhead:
    "Access world-class engineering talent without the recruitment overhead. Your developers report to you. We handle the complexity.",
  whatIsHeading: "What is Staff Augmentation?",
  whatIsBody:
    "Staff augmentation is specialized talent on your terms. We recruit, vet, manage payroll, and handle compliance for experienced developers who integrate directly into your team. They report to your leadership, work your processes, and contribute immediately.",
  differenceHeading: "Key Difference from Outsourcing",
  differenceBody:
    "Unlike traditional outsourcing where an external firm owns the work, augmented staff maintain YOUR full control. You direct priorities. You maintain quality standards. You lead the architecture. We simply eliminate the hiring complexity.",
};

export const staffAugBenefits = {
  heading: "Why augmentation over traditional hiring?",
  items: [
    {
      title: "50% Faster Onboarding",
      description:
        "Experienced developers productive within 1-2 weeks (vs. 3-6 months traditional hiring)",
    },
    {
      title: "30-40% Cost Savings",
      description: "No recruitment fees, benefits overhead, or onboarding waste",
    },
    {
      title: "Zero HR Complexity",
      description: "We manage recruitment, payroll, taxes, compliance, background checks",
    },
    {
      title: "Full Control",
      description: "Your team directs work; augmented staff report to you",
    },
    {
      title: "Flexible Scaling",
      description: "Add/reduce capacity in weeks as project demands change",
    },
    {
      title: "Global Talent Access",
      description: "Pre-vetted developers across multiple time zones and specializations",
    },
    {
      title: "Cultural Integration",
      description: "Pre-matched for technical fit and team alignment",
    },
  ],
};

export const staffAugServices = {
  heading: "Services Offered",
  items: [
    {
      title: "Specialized Developer Augmentation",
      description:
        "Integrate experienced software engineers directly into your team reporting to your leadership.",
    },
    {
      title: "Flexible Team Scaling",
      description:
        "Scale your development capacity based on project demands—no long-term commitments, no overhead.",
    },
    {
      title: "Technical Expertise on Demand",
      description:
        "Fill critical skill gaps with specialists in your required technologies—React, Node.js, Cloud Architecture, DevOps, and more.",
    },
    {
      title: "Hybrid Partnerships",
      description: "Combine custom development with augmented staff for maximum velocity.",
    },
  ],
};

export const process = {
  id: "approach",
  heading: "Our development approach",
  intro:
    "We follow a collaborative, agile, and transparent process—so you always know what's happening and why.",
  steps: [
    {
      number: "01",
      title: "Discovery & Strategy",
      description: "We understand your business, users, and objectives",
    },
    {
      number: "02",
      title: "Solution Design",
      description: "Architecture and UX aligned with real-world use",
    },
    {
      number: "03",
      title: "Agile Development",
      description: "Fast iterations, continuous feedback, visible progress",
    },
    {
      number: "04",
      title: "Testing & Quality Assurance",
      description: "Performance, security, and reliability built in",
    },
    {
      number: "05",
      title: "Launch & Scale",
      description: "Ongoing support as your product grows",
    },
  ],
};

export const industries = {
  id: "industries",
  heading: "Industries & use cases",
  items: [
    "Healthcare",
    "SaaS",
    "Logistics",
    "Finance",
    "Enterprise Operations",
    "Data-Driven Platforms",
  ],
};

export const whyKalos = {
  heading: "Built by Experts. Trusted by Businesses.",
  intro:
    "Kalos Technology brings together experienced software engineers, architects, and product strategists with deep expertise in building mission-critical custom solutions.",
  bullets: [
    "Strong focus on reliability, scalability, and security",
    "Proven experience delivering complex systems",
    "Modern technology stack and best development practices",
    "Clear documentation and long-term maintainability",
  ],
  closing: "We don't just deliver software—we deliver confidence, clarity, and long-term value.",
  whyKalosHeading: "Why Kalos?",
  whyKalosItems: [
    "We focus on outcomes, not just code",
    "Every solution is built specifically for your needs",
    "You work directly with experienced engineers and strategists",
    "Clear communication, predictable delivery, and real results",
  ],
  quote: "You're never just a client. You're a partner.",
};

export const contact = {
  id: "contact",
  heading: "Let's build your custom solution.",
  body: "If you're ready to stop adapting your business to software—and start using software that works for you—we're ready to help.",
  ctaHeading: "Start the conversation today.",
  email: "pbirdsong@kalostechnology.com",
  website: "kalostechnology.com",
  interestOptions: ["Custom Software Development", "Staff Augmentation", "Not sure yet"],
};

export const footer = {
  copyright: `© ${new Date().getFullYear()} Kalos Technology. All rights reserved.`,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/content.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/content.ts tests/content.test.mjs
git commit -m "Add typed content data module with tests"
```

---

## Task 3: Design Tokens, Global CSS, and Base Layout

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/assets/logo.svg`
- Create: `public/favicon.svg`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/base-layout.test.mjs`

**Interfaces:**
- Consumes: `site` from `src/data/content.ts` (Task 2).
- Produces: `BaseLayout.astro` accepting props `{ title: string; description: string }`, rendering `<slot />` inside `<main id="main">`, with a skip link, SEO/OG meta tags, and global CSS imported. All later section components are placed inside this slot via `index.astro`.

- [ ] **Step 1: Write design tokens**

```css
/* src/styles/tokens.css */
:root {
  --navy-950: #0a0e1f;
  --navy-900: #10152c;
  --navy-800: #161d3a;
  --teal-400: #1fe6e6;
  --teal-300: #7ff2f2;
  --white: #ffffff;
  --lavender-50: #f4f4fb;
  --ink-900: #12131c;
  --ink-600: #4a4d5e;
  --border-on-dark: rgba(255, 255, 255, 0.14);
  --border-on-light: rgba(10, 14, 31, 0.12);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;

  --text-sm: clamp(0.875rem, 0.85rem + 0.1vw, 0.95rem);
  --text-base: clamp(1rem, 0.97rem + 0.15vw, 1.125rem);
  --text-lg: clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem);
  --text-xl: clamp(1.75rem, 1.5rem + 1vw, 2.25rem);
  --text-2xl: clamp(2.25rem, 1.8rem + 1.8vw, 3.5rem);

  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  --shadow-card: 0 8px 24px rgba(10, 14, 31, 0.08);
  --shadow-card-hover: 0 16px 32px rgba(10, 14, 31, 0.14);

  --max-width: 1200px;
}
```

- [ ] **Step 2: Write global CSS**

```css
/* src/styles/global.css */
@import "./tokens.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--ink-900);
  background: var(--white);
}

h1,
h2,
h3 {
  line-height: 1.15;
  margin: 0 0 var(--space-4);
}

p {
  margin: 0 0 var(--space-4);
}

a {
  color: inherit;
}

img,
svg {
  max-width: 100%;
  display: block;
}

.container {
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--teal-400);
  color: var(--navy-950);
  padding: var(--space-3) var(--space-4);
  z-index: 1000;
  font-weight: 600;
  border-radius: 0 0 var(--radius-md) 0;
}

.skip-link:focus {
  left: 0;
}

:focus-visible {
  outline: 3px solid var(--teal-400);
  outline-offset: 2px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: var(--text-base);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary {
  background: var(--teal-400);
  color: var(--navy-950);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--white);
  border-color: var(--border-on-dark);
}

.btn-secondary:hover {
  border-color: var(--teal-400);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 3: Create the recreated Kalos logomark SVG**

```svg
<!-- src/assets/logo.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" role="img" aria-labelledby="kalosLogoTitle">
  <title id="kalosLogoTitle">Kalos Technology</title>
  <g fill="currentColor">
    <path d="M20 4 L34 14 L20 20 L6 14 Z" />
    <path d="M6 26 L20 20 L34 26 L20 36 Z" opacity="0.55" />
    <circle cx="6" cy="30" r="3" />
  </g>
  <text x="46" y="22" font-family="-apple-system, 'Segoe UI', Roboto, Arial, sans-serif" font-size="16" font-weight="700" fill="currentColor">KALOS</text>
  <text x="46" y="34" font-family="-apple-system, 'Segoe UI', Roboto, Arial, sans-serif" font-size="8" letter-spacing="2" fill="currentColor" opacity="0.75">TECHNOLOGY</text>
</svg>
```

- [ ] **Step 4: Create a favicon**

```svg
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="8" fill="#0a0e1f" />
  <path d="M20 6 L32 14 L20 19 L8 14 Z" fill="#1fe6e6" />
  <path d="M8 24 L20 19 L32 24 L20 34 Z" fill="#1fe6e6" opacity="0.55" />
</svg>
```

- [ ] **Step 5: Write BaseLayout.astro**

```astro
---
// src/layouts/BaseLayout.astro
import "../styles/global.css";
import { site } from "../data/content";

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, `https://${site.domain}`);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#0a0e1f" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
  </head>
  <body>
    <a href="#main" class="skip-link">Skip to main content</a>
    <slot name="header" />
    <main id="main">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

- [ ] **Step 6: Wire the placeholder index.astro through BaseLayout**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout
  title="Kalos Technology | Bespoke Software Development & Staff Augmentation"
  description="Kalos Technology designs custom software around your business and augments your engineering team with experienced developers who report to you."
>
  <h1>Kalos Technology</h1>
</BaseLayout>
```

- [ ] **Step 7: Write the test**

```js
// tests/base-layout.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("base layout renders SEO meta, skip link, and canonical URL", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /<title>Kalos Technology \| Bespoke Software Development/);
  assert.match(html, /name="description" content="Kalos Technology designs custom software/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /rel="canonical" href="https:\/\/kalostechnology\.com/);
});
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node --test tests/base-layout.test.mjs`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/styles src/assets/logo.svg public/favicon.svg src/layouts/BaseLayout.astro src/pages/index.astro tests/base-layout.test.mjs
git commit -m "Add design tokens, global CSS, logo, and base layout with SEO meta"
```

---

## Task 4: Header with Accessible Mobile Navigation

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/scripts/nav-toggle.js`
- Modify: `src/pages/index.astro`
- Test: `tests/nav-toggle.test.mjs`
- Test: `tests/header.test.mjs`

**Interfaces:**
- Consumes: `nav`, `site` from `content.ts` (Task 2), `logo.svg` (Task 3).
- Produces: pure function `nextAriaExpanded(current: "true" | "false"): "true" | "false"` exported from `nav-toggle.js`, used by the header's inline mobile-menu script. `Header.astro` renders into the `header` named slot of `BaseLayout`.

- [ ] **Step 1: Write the failing test for the pure toggle logic**

```js
// tests/nav-toggle.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { nextAriaExpanded } from "../src/scripts/nav-toggle.js";

test("nextAriaExpanded flips the boolean string state", () => {
  assert.equal(nextAriaExpanded("false"), "true");
  assert.equal(nextAriaExpanded("true"), "false");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/nav-toggle.test.mjs`
Expected: FAIL (module not found)

- [ ] **Step 3: Write src/scripts/nav-toggle.js**

```js
// src/scripts/nav-toggle.js
export function nextAriaExpanded(current) {
  return current === "true" ? "false" : "true";
}

export function initNavToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") ?? "false";
    const next = nextAriaExpanded(expanded);
    toggle.setAttribute("aria-expanded", next);
    menu.toggleAttribute("data-open", next === "true");
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/nav-toggle.test.mjs`
Expected: PASS

- [ ] **Step 5: Write Header.astro**

```astro
---
// src/components/Header.astro
import { site, nav, hero } from "../data/content";
import Logo from "../assets/logo.svg?raw";
---

<header class="site-header">
  <div class="container site-header__inner">
    <a href="#main" class="site-header__logo" aria-label={`${site.name} home`} set:html={Logo} />

    <button
      type="button"
      class="site-header__toggle"
      data-nav-toggle
      aria-expanded="false"
      aria-controls="primary-nav"
    >
      <span class="visually-hidden">Toggle menu</span>
      <span aria-hidden="true">☰</span>
    </button>

    <nav id="primary-nav" class="site-header__nav" data-nav-menu aria-label="Primary">
      <ul>
        {nav.map((item) => (
          <li><a href={item.href}>{item.label}</a></li>
        ))}
      </ul>
      <a href={hero.primaryCta.href} class="btn btn-primary site-header__cta">
        {hero.primaryCta.label}
      </a>
    </nav>
  </div>
</header>

<script>
  import { initNavToggle } from "../scripts/nav-toggle.js";
  initNavToggle();
</script>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--navy-950);
    color: var(--white);
    border-bottom: 1px solid var(--border-on-dark);
  }

  .site-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: var(--space-4);
  }

  .site-header__logo {
    color: var(--white);
    width: 140px;
  }

  .site-header__toggle {
    background: transparent;
    border: 1px solid var(--border-on-dark);
    color: var(--white);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-lg);
    display: none;
  }

  .site-header__nav ul {
    list-style: none;
    display: flex;
    gap: var(--space-6);
    margin: 0;
    padding: 0;
  }

  .site-header__nav {
    display: flex;
    align-items: center;
    gap: var(--space-6);
  }

  .site-header__nav a {
    text-decoration: none;
    color: var(--white);
    font-size: var(--text-sm);
  }

  .site-header__nav a:hover {
    color: var(--teal-400);
  }

  @media (max-width: 860px) {
    .site-header__toggle {
      display: inline-flex;
    }

    .site-header__nav {
      position: absolute;
      inset-inline: 0;
      top: 100%;
      background: var(--navy-950);
      flex-direction: column;
      align-items: flex-start;
      padding: var(--space-6);
      display: none;
      border-bottom: 1px solid var(--border-on-dark);
    }

    .site-header__nav[data-open] {
      display: flex;
    }

    .site-header__nav ul {
      flex-direction: column;
      gap: var(--space-4);
    }
  }
</style>
```

- [ ] **Step 6: Add Header to index.astro's header slot**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
---

<BaseLayout
  title="Kalos Technology | Bespoke Software Development & Staff Augmentation"
  description="Kalos Technology designs custom software around your business and augments your engineering team with experienced developers who report to you."
>
  <Header slot="header" />
  <h1>Kalos Technology</h1>
</BaseLayout>
```

- [ ] **Step 7: Write the header build test**

```js
// tests/header.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("header renders all nav links, logo, and CTA", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /aria-label="Primary"/);
  assert.match(html, /href="#custom-software"/);
  assert.match(html, /href="#staff-augmentation"/);
  assert.match(html, /href="#approach"/);
  assert.match(html, /href="#industries"/);
  assert.match(html, /href="#contact"/);
  assert.match(html, /Start the conversation/);
  assert.match(html, /aria-expanded="false"/);
});
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node --test tests/header.test.mjs`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/Header.astro src/scripts/nav-toggle.js src/pages/index.astro tests/nav-toggle.test.mjs tests/header.test.mjs
git commit -m "Add accessible sticky header with mobile nav toggle"
```

---

## Task 5: Hero Section

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/hero.test.mjs`

**Interfaces:**
- Consumes: `hero` from `content.ts`.
- Produces: `<section id="hero">` with `<h1>` — the page's only `h1`.

- [ ] **Step 1: Write Hero.astro**

```astro
---
// src/components/Hero.astro
import { hero } from "../data/content";
---

<section id="hero" class="hero" aria-labelledby="hero-heading">
  <div class="container hero__inner">
    <div class="hero__copy">
      <p class="hero__eyebrow">{hero.eyebrow}</p>
      <h1 id="hero-heading">{hero.headline}</h1>
      <p class="hero__subhead">{hero.subhead}</p>
      <div class="hero__actions">
        <a href={hero.primaryCta.href} class="btn btn-primary">{hero.primaryCta.label}</a>
        <a href={hero.secondaryCta.href} class="btn btn-secondary">{hero.secondaryCta.label}</a>
      </div>
    </div>
    <div class="hero__graphic" aria-hidden="true">
      <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="160" cy="160" r="150" stroke="var(--teal-400)" stroke-opacity="0.3" />
        <circle cx="160" cy="160" r="100" stroke="var(--teal-400)" stroke-opacity="0.5" />
        <g stroke="var(--teal-400)" stroke-width="1.5">
          <line x1="40" y1="260" x2="120" y2="180" />
          <line x1="120" y1="180" x2="200" y2="200" />
          <line x1="200" y1="200" x2="280" y2="120" />
          <line x1="120" y1="180" x2="140" y2="90" />
        </g>
        <g fill="var(--teal-400)">
          <circle cx="40" cy="260" r="6" />
          <circle cx="120" cy="180" r="6" />
          <circle cx="200" cy="200" r="6" />
          <circle cx="280" cy="120" r="6" />
          <circle cx="140" cy="90" r="6" />
        </g>
      </svg>
    </div>
  </div>
</section>

<style>
  .hero {
    background: var(--navy-950);
    color: var(--white);
    padding-block: var(--space-24) var(--space-16);
  }

  .hero__inner {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: var(--space-12);
    align-items: center;
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
    font-size: var(--text-2xl);
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

  @media (max-width: 860px) {
    .hero__inner {
      grid-template-columns: 1fr;
    }

    .hero__graphic {
      order: -1;
      max-width: 240px;
      margin-inline: auto;
    }
  }
</style>
```

- [ ] **Step 2: Add Hero to index.astro, remove placeholder h1**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
import Hero from "../components/Hero.astro";
---

<BaseLayout
  title="Kalos Technology | Bespoke Software Development & Staff Augmentation"
  description="Kalos Technology designs custom software around your business and augments your engineering team with experienced developers who report to you."
>
  <Header slot="header" />
  <Hero />
</BaseLayout>
```

- [ ] **Step 3: Write the test**

```js
// tests/hero.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("hero renders headline as the only h1, subhead, and both CTAs", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  const h1Matches = html.match(/<h1[ >]/g) ?? [];
  assert.equal(h1Matches.length, 1, "page should have exactly one h1");
  assert.match(html, /Software that fits\. Teams that scale\./);
  assert.match(html, /See our approach/);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/hero.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro tests/hero.test.mjs
git commit -m "Add hero section with dual-offering headline and SVG graphic"
```

---

## Task 6: About Section

**Files:**
- Create: `src/components/About.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/about.test.mjs`

**Interfaces:**
- Consumes: `about` from `content.ts`.

- [ ] **Step 1: Write About.astro**

```astro
---
// src/components/About.astro
import { about } from "../data/content";
---

<section id="about" class="about" aria-labelledby="about-heading">
  <div class="container about__inner">
    <h2 id="about-heading">{about.heading}</h2>
    <div class="about__columns">
      <p>{about.overview}</p>
      <p>{about.reliability}</p>
    </div>
  </div>
</section>

<style>
  .about {
    padding-block: var(--space-16);
    background: var(--lavender-50);
  }

  .about__columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
  }

  .about h2 {
    font-size: var(--text-xl);
    max-width: 20ch;
  }

  @media (max-width: 720px) {
    .about__columns {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Add About to index.astro**

```astro
<Header slot="header" />
<Hero />
<About />
```

(Add `import About from "../components/About.astro";` alongside the other imports.)

- [ ] **Step 3: Write the test**

```js
// tests/about.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("about section renders overview and reliability copy", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /A partner you can rely on/);
  assert.match(html, /not generic templates/);
  assert.match(html, /minimizes risk, accelerates decision-making/);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/about.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/About.astro src/pages/index.astro tests/about.test.mjs
git commit -m "Add about section"
```

---

## Task 7: Custom Software Services Section

**Files:**
- Create: `src/components/Services.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/services.test.mjs`

**Interfaces:**
- Consumes: `services` from `content.ts`.
- Produces: `<section id="custom-software">` — the anchor target for the header's "Custom Software" nav link.

- [ ] **Step 1: Write Services.astro**

```astro
---
// src/components/Services.astro
import { services } from "../data/content";
---

<section id={services.id} class="services" aria-labelledby="services-heading">
  <div class="container">
    <p class="eyebrow">{services.eyebrow}</p>
    <h2 id="services-heading">{services.heading}</h2>
    <p class="services__intro">{services.intro}</p>
    <ul class="services__grid">
      {services.items.map((item) => (
        <li class="card">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
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

  .services__grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-6);
  }

  .card {
    background: var(--white);
    border: 1px solid var(--border-on-light);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-card);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
  }

  .card h3 {
    font-size: var(--text-lg);
  }
</style>
```

- [ ] **Step 2: Add Services to index.astro**

Add `import Services from "../components/Services.astro";` and `<Services />` after `<About />`.

- [ ] **Step 3: Write the test**

```js
// tests/services.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("services section renders id anchor and all 5 service cards", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="custom-software"/);
  assert.match(html, /Custom software development/);
  assert.match(html, /SaaS product development/);
  assert.match(html, /Web &#38;? ?cloud applications|Web & cloud applications/);
  assert.match(html, /System integrations &#38;? ?automation|System integrations & automation/);
  assert.match(html, /Modernization &#38;? ?optimization|Modernization & optimization/);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/services.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Services.astro src/pages/index.astro tests/services.test.mjs
git commit -m "Add custom software services section"
```

---

## Task 8: Why Custom Section

**Files:**
- Create: `src/components/WhyCustom.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/why-custom.test.mjs`

**Interfaces:**
- Consumes: `whyCustom` from `content.ts`.

- [ ] **Step 1: Write WhyCustom.astro**

```astro
---
// src/components/WhyCustom.astro
import { whyCustom } from "../data/content";
---

<section id="why-custom" class="why-custom" aria-labelledby="why-custom-heading">
  <div class="container">
    <h2 id="why-custom-heading">{whyCustom.heading}</h2>
    <ul class="why-custom__list">
      {whyCustom.items.map((item) => (
        <li>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
            <path d="M4 10l4 4 8-9" stroke="var(--teal-400)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .why-custom {
    background: var(--navy-950);
    color: var(--white);
    padding-block: var(--space-16);
    clip-path: polygon(0 4%, 100% 0, 100% 96%, 0 100%);
  }

  .why-custom h2 {
    font-style: italic;
    font-size: var(--text-xl);
    max-width: 20ch;
  }

  .why-custom__list {
    list-style: none;
    margin: var(--space-8) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-4);
  }

  .why-custom__list li {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
</style>
```

- [ ] **Step 2: Add WhyCustom to index.astro**

Add `import WhyCustom from "../components/WhyCustom.astro";` and `<WhyCustom />` after `<Services />`.

- [ ] **Step 3: Write the test**

```js
// tests/why-custom.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("why-custom section renders all 4 checklist items", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Built exactly for your workflows/);
  assert.match(html, /Easier to scale and evolve/);
  assert.match(html, /No unnecessary features or licensing limits/);
  assert.match(html, /Full ownership and long-term flexibility/);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/why-custom.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/WhyCustom.astro src/pages/index.astro tests/why-custom.test.mjs
git commit -m "Add why-custom-vs-off-the-shelf section"
```

---

## Task 9: Staff Augmentation Intro Section

**Files:**
- Create: `src/components/StaffAugIntro.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/staff-aug-intro.test.mjs`

**Interfaces:**
- Consumes: `staffAugIntro` from `content.ts`.
- Produces: `<section id="staff-augmentation">` — the anchor target for the header's "Staff Augmentation" nav link.

- [ ] **Step 1: Write StaffAugIntro.astro**

```astro
---
// src/components/StaffAugIntro.astro
import { staffAugIntro } from "../data/content";
---

<section id={staffAugIntro.id} class="staff-aug-intro" aria-labelledby="staff-aug-heading">
  <div class="container">
    <p class="eyebrow">{staffAugIntro.eyebrow}</p>
    <h2 id="staff-aug-heading">{staffAugIntro.headline}</h2>
    <p class="staff-aug-intro__subhead">{staffAugIntro.subhead}</p>

    <div class="staff-aug-intro__panels">
      <div class="panel">
        <h3>{staffAugIntro.whatIsHeading}</h3>
        <p>{staffAugIntro.whatIsBody}</p>
      </div>
      <div class="panel panel--accent">
        <h3>{staffAugIntro.differenceHeading}</h3>
        <p>{staffAugIntro.differenceBody}</p>
      </div>
    </div>
  </div>
</section>

<style>
  .staff-aug-intro {
    padding-block: var(--space-16);
    background: var(--lavender-50);
  }

  .staff-aug-intro h2 {
    font-size: var(--text-xl);
  }

  .staff-aug-intro__subhead {
    max-width: 60ch;
    font-size: var(--text-lg);
  }

  .staff-aug-intro__panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
    margin-top: var(--space-8);
  }

  .panel {
    background: var(--white);
    border: 1px solid var(--border-on-light);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
  }

  .panel--accent {
    background: var(--navy-950);
    color: var(--white);
    border-color: transparent;
  }

  @media (max-width: 780px) {
    .staff-aug-intro__panels {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Add StaffAugIntro to index.astro**

Add `import StaffAugIntro from "../components/StaffAugIntro.astro";` and `<StaffAugIntro />` after `<WhyCustom />`.

- [ ] **Step 3: Write the test**

```js
// tests/staff-aug-intro.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("staff augmentation intro renders id anchor, headline, and both explainer panels", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="staff-augmentation"/);
  assert.match(html, /Custom teams\. Built to scale\./);
  assert.match(html, /What is Staff Augmentation\?/);
  assert.match(html, /Key Difference from Outsourcing/);
  assert.match(html, /augmented staff maintain YOUR full control/);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/staff-aug-intro.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StaffAugIntro.astro src/pages/index.astro tests/staff-aug-intro.test.mjs
git commit -m "Add staff augmentation intro section"
```

---

## Task 10: Staff Augmentation Benefits Section

**Files:**
- Create: `src/components/StaffAugBenefits.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/staff-aug-benefits.test.mjs`

**Interfaces:**
- Consumes: `staffAugBenefits` from `content.ts`.

- [ ] **Step 1: Write StaffAugBenefits.astro**

```astro
---
// src/components/StaffAugBenefits.astro
import { staffAugBenefits } from "../data/content";
---

<section id="staff-aug-benefits" class="staff-aug-benefits" aria-labelledby="staff-aug-benefits-heading">
  <div class="container">
    <h2 id="staff-aug-benefits-heading">{staffAugBenefits.heading}</h2>
    <ul class="staff-aug-benefits__grid">
      {staffAugBenefits.items.map((item) => (
        <li class="card">
          <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
            <path d="M4 10l4 4 8-9" stroke="var(--teal-400)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .staff-aug-benefits {
    padding-block: var(--space-16);
  }

  .staff-aug-benefits__grid {
    list-style: none;
    margin: var(--space-8) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--space-6);
  }

  .staff-aug-benefits__grid .card {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }

  .staff-aug-benefits__grid h3 {
    font-size: var(--text-base);
    margin-bottom: var(--space-1);
  }

  .staff-aug-benefits__grid svg {
    flex-shrink: 0;
    margin-top: 4px;
  }
</style>
```

- [ ] **Step 2: Add StaffAugBenefits to index.astro**

Add `import StaffAugBenefits from "../components/StaffAugBenefits.astro";` and `<StaffAugBenefits />` after `<StaffAugIntro />`.

- [ ] **Step 3: Write the test**

```js
// tests/staff-aug-benefits.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("staff augmentation benefits section renders all 7 items with their stats", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /50% Faster Onboarding/);
  assert.match(html, /3-6 months traditional hiring/);
  assert.match(html, /30-40% Cost Savings/);
  assert.match(html, /Zero HR Complexity/);
  assert.match(html, /Full Control/);
  assert.match(html, /Flexible Scaling/);
  assert.match(html, /Global Talent Access/);
  assert.match(html, /Cultural Integration/);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/staff-aug-benefits.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StaffAugBenefits.astro src/pages/index.astro tests/staff-aug-benefits.test.mjs
git commit -m "Add staff augmentation benefits section"
```

---

## Task 11: Staff Augmentation Services Section

**Files:**
- Create: `src/components/StaffAugServices.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/staff-aug-services.test.mjs`

**Interfaces:**
- Consumes: `staffAugServices` from `content.ts`. Reuses the `.card` class defined in Task 7's `Services.astro` scoped style — since Astro scopes styles per-component, this component defines its own equivalent `.card` rule to stay visually consistent (duplication is intentional here per Astro's style-scoping model, not a maintenance hazard since both are trivial and driven by the same design tokens).

- [ ] **Step 1: Write StaffAugServices.astro**

```astro
---
// src/components/StaffAugServices.astro
import { staffAugServices } from "../data/content";
---

<section id="staff-aug-services" class="staff-aug-services" aria-labelledby="staff-aug-services-heading">
  <div class="container">
    <h2 id="staff-aug-services-heading">{staffAugServices.heading}</h2>
    <ul class="staff-aug-services__grid">
      {staffAugServices.items.map((item) => (
        <li class="card">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .staff-aug-services {
    padding-block: var(--space-16);
    background: var(--lavender-50);
  }

  .staff-aug-services__grid {
    list-style: none;
    margin: var(--space-8) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-6);
  }

  .card {
    background: var(--white);
    border: 1px solid var(--border-on-light);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-card);
  }

  .card h3 {
    font-size: var(--text-lg);
  }
</style>
```

- [ ] **Step 2: Add StaffAugServices to index.astro**

Add `import StaffAugServices from "../components/StaffAugServices.astro";` and `<StaffAugServices />` after `<StaffAugBenefits />`.

- [ ] **Step 3: Write the test**

```js
// tests/staff-aug-services.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("staff augmentation services section renders all 4 services", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Specialized Developer Augmentation/);
  assert.match(html, /Flexible Team Scaling/);
  assert.match(html, /Technical Expertise on Demand/);
  assert.match(html, /Hybrid Partnerships/);
  assert.match(html, /React, Node\.js, Cloud Architecture, DevOps/);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/staff-aug-services.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StaffAugServices.astro src/pages/index.astro tests/staff-aug-services.test.mjs
git commit -m "Add staff augmentation services-offered section"
```

---

## Task 12: Development Approach (Process) Section

**Files:**
- Create: `src/components/Process.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/process.test.mjs`

**Interfaces:**
- Consumes: `process` from `content.ts`.
- Produces: `<section id="approach">` — the anchor target for the header's "Approach" nav link and the hero's secondary CTA.

- [ ] **Step 1: Write Process.astro**

```astro
---
// src/components/Process.astro
import { process } from "../data/content";
---

<section id={process.id} class="process" aria-labelledby="process-heading">
  <div class="container">
    <h2 id="process-heading">{process.heading}</h2>
    <p class="process__intro">{process.intro}</p>
    <ol class="process__steps">
      {process.steps.map((step) => (
        <li>
          <span class="process__number" aria-hidden="true">{step.number}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  </div>
</section>

<style>
  .process {
    padding-block: var(--space-16);
  }

  .process__intro {
    max-width: 60ch;
  }

  .process__steps {
    list-style: none;
    margin: var(--space-8) 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .process__steps li {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
    border-left: 2px solid var(--border-on-light);
    padding-left: var(--space-6);
  }

  .process__number {
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

  .process__steps h3 {
    font-size: var(--text-lg);
    margin-bottom: var(--space-1);
  }
</style>
```

- [ ] **Step 2: Add Process to index.astro**

Add `import Process from "../components/Process.astro";` and `<Process />` after `<StaffAugServices />`.

- [ ] **Step 3: Write the test**

```js
// tests/process.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("process section renders id anchor and all 5 steps in order", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="approach"/);
  const order = [
    "Discovery & Strategy",
    "Solution Design",
    "Agile Development",
    "Testing & Quality Assurance",
    "Launch & Scale",
  ];
  let lastIndex = -1;
  for (const title of order) {
    const idx = html.indexOf(title);
    assert.ok(idx > lastIndex, `${title} should appear after the previous step`);
    lastIndex = idx;
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/process.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Process.astro src/pages/index.astro tests/process.test.mjs
git commit -m "Add development approach process section"
```

---

## Task 13: Industries Section

**Files:**
- Create: `src/components/Industries.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/industries.test.mjs`

**Interfaces:**
- Consumes: `industries` from `content.ts`.
- Produces: `<section id="industries">` — the anchor target for the header's "Industries" nav link.

- [ ] **Step 1: Write Industries.astro**

```astro
---
// src/components/Industries.astro
import { industries } from "../data/content";
---

<section id={industries.id} class="industries" aria-labelledby="industries-heading">
  <div class="container">
    <h2 id="industries-heading">{industries.heading}</h2>
    <ul class="industries__pills">
      {industries.items.map((item) => (
        <li>{item}</li>
      ))}
    </ul>
  </div>
</section>

<style>
  .industries {
    padding-block: var(--space-16);
    background: var(--lavender-50);
  }

  .industries__pills {
    list-style: none;
    margin: var(--space-6) 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .industries__pills li {
    background: var(--white);
    border: 1px solid var(--border-on-light);
    border-radius: 999px;
    padding: var(--space-2) var(--space-4);
    font-weight: 600;
    font-size: var(--text-sm);
  }
</style>
```

- [ ] **Step 2: Add Industries to index.astro**

Add `import Industries from "../components/Industries.astro";` and `<Industries />` after `<Process />`.

- [ ] **Step 3: Write the test**

```js
// tests/industries.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("industries section renders id anchor and all 6 industries", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="industries"/);
  for (const item of [
    "Healthcare",
    "SaaS",
    "Logistics",
    "Finance",
    "Enterprise Operations",
    "Data-Driven Platforms",
  ]) {
    assert.ok(html.includes(item), `expected industry "${item}" in output`);
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/industries.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Industries.astro src/pages/index.astro tests/industries.test.mjs
git commit -m "Add industries and use cases section"
```

---

## Task 14: Why Kalos Section

**Files:**
- Create: `src/components/WhyKalos.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/why-kalos.test.mjs`

**Interfaces:**
- Consumes: `whyKalos` from `content.ts`.

- [ ] **Step 1: Write WhyKalos.astro**

```astro
---
// src/components/WhyKalos.astro
import { whyKalos } from "../data/content";
---

<section id="why-kalos" class="why-kalos" aria-labelledby="why-kalos-heading">
  <div class="container">
    <h2 id="why-kalos-heading">{whyKalos.heading}</h2>
    <p class="why-kalos__intro">{whyKalos.intro}</p>
    <ul class="why-kalos__bullets">
      {whyKalos.bullets.map((bullet) => (
        <li>{bullet}</li>
      ))}
    </ul>
    <p class="why-kalos__closing">{whyKalos.closing}</p>

    <div class="why-kalos__grid">
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
    padding-block: var(--space-16);
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

  .why-kalos__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
    margin-top: var(--space-8);
    align-items: center;
  }

  .why-kalos__quote {
    background: var(--navy-950);
    color: var(--white);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    margin: 0;
    font-size: var(--text-xl);
    font-weight: 700;
    font-style: italic;
  }

  @media (max-width: 780px) {
    .why-kalos__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Add WhyKalos to index.astro**

Add `import WhyKalos from "../components/WhyKalos.astro";` and `<WhyKalos />` after `<Industries />`.

- [ ] **Step 3: Write the test**

```js
// tests/why-kalos.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("why-kalos section renders bullets, why-kalos items, and pull quote", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Built by Experts\. Trusted by Businesses\./);
  assert.match(html, /Strong focus on reliability, scalability, and security/);
  assert.match(html, /We focus on outcomes, not just code/);
  assert.match(html, /You&#39;re never just a client\. ?You&#39;re a partner\.|You're never just a client\./);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/why-kalos.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/WhyKalos.astro src/pages/index.astro tests/why-kalos.test.mjs
git commit -m "Add why-Kalos differentiators section with pull quote"
```

---

## Task 15: Contact Section with Netlify Form

**Files:**
- Create: `src/components/Contact.astro`
- Create: `src/pages/thank-you.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/contact.test.mjs`

**Interfaces:**
- Consumes: `contact` from `content.ts`.
- Produces: `<section id="contact">` — the anchor target for the header's "Contact" nav link and the hero's primary CTA. The form posts to `/thank-you`.

- [ ] **Step 1: Write Contact.astro**

```astro
---
// src/components/Contact.astro
import { contact } from "../data/content";
---

<section id={contact.id} class="contact" aria-labelledby="contact-heading">
  <div class="container contact__inner">
    <div class="contact__copy">
      <h2 id="contact-heading">{contact.heading}</h2>
      <p>{contact.body}</p>
      <h3>{contact.ctaHeading}</h3>
      <p>
        Website: <a href={`https://${contact.website}`}>{contact.website}</a><br />
        Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>
    </div>

    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      action="/thank-you"
      class="contact__form"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p class="visually-hidden">
        <label>Don't fill this out if you're human: <input name="bot-field" /></label>
      </p>

      <div class="field">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" required autocomplete="name" />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email" />
      </div>

      <div class="field">
        <label for="interest">What are you interested in?</label>
        <select id="interest" name="interest">
          {contact.interestOptions.map((option) => (
            <option value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div class="field">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5" required></textarea>
      </div>

      <button type="submit" class="btn btn-primary">Send message</button>
    </form>
  </div>
</section>

<style>
  .contact {
    padding-block: var(--space-16);
    background: var(--navy-950);
    color: var(--white);
  }

  .contact__inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
  }

  .contact h2 {
    font-size: var(--text-xl);
  }

  .contact a {
    color: var(--teal-400);
  }

  .contact__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field label {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .field input,
  .field select,
  .field textarea {
    background: var(--navy-900);
    border: 1px solid var(--border-on-dark);
    border-radius: var(--radius-md);
    color: var(--white);
    padding: var(--space-3);
    font-family: inherit;
    font-size: var(--text-base);
  }

  @media (max-width: 780px) {
    .contact__inner {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Write the thank-you page**

```astro
---
// src/pages/thank-you.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
---

<BaseLayout
  title="Thank You | Kalos Technology"
  description="Thanks for reaching out to Kalos Technology — we'll be in touch soon."
>
  <Header slot="header" />
  <section class="container" style="padding-block: 6rem; text-align: center;">
    <h1>Thank you for reaching out.</h1>
    <p>We've received your message and will get back to you shortly.</p>
    <a href="/" class="btn btn-primary">Back to home</a>
  </section>
  <Footer slot="footer" />
</BaseLayout>
```

Note: `Footer.astro` doesn't exist yet — it's created in Task 16. Add this file now but leave it uncommitted until Task 16 (or stub `Footer.astro` temporarily is unnecessary since Task 16 immediately follows; simplest is to defer creating `thank-you.astro`'s Footer import until Task 16 — instead, for this task, build `thank-you.astro` without the Footer import/slot so it builds standalone):

```astro
---
// src/pages/thank-you.astro (Task 15 version, no Footer yet)
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
---

<BaseLayout
  title="Thank You | Kalos Technology"
  description="Thanks for reaching out to Kalos Technology — we'll be in touch soon."
>
  <Header slot="header" />
  <section class="container" style="padding-block: 6rem; text-align: center;">
    <h1>Thank you for reaching out.</h1>
    <p>We've received your message and will get back to you shortly.</p>
    <a href="/" class="btn btn-primary">Back to home</a>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Add Contact to index.astro**

Add `import Contact from "../components/Contact.astro";` and `<Contact />` after `<WhyKalos />`.

- [ ] **Step 4: Write the test**

```js
// tests/contact.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("contact section renders Netlify-compatible form and direct contact links", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="contact"/);
  assert.match(html, /name="contact"/);
  assert.match(html, /data-netlify="true"/);
  assert.match(html, /netlify-honeypot="bot-field"/);
  assert.match(html, /name="form-name" value="contact"/);
  assert.match(html, /type="email" required/);
  assert.match(html, /href="mailto:pbirdsong@kalostechnology\.com"/);
  assert.match(html, /href="https:\/\/kalostechnology\.com"/);

  assert.ok(fs.existsSync("dist/thank-you/index.html") || fs.existsSync("dist/thank-you.html"));
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/contact.test.mjs`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/Contact.astro src/pages/thank-you.astro src/pages/index.astro tests/contact.test.mjs
git commit -m "Add contact section with Netlify form and thank-you page"
```

---

## Task 16: Footer

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/thank-you.astro`
- Test: `tests/footer.test.mjs`

**Interfaces:**
- Consumes: `site`, `nav`, `footer` from `content.ts`, `logo.svg`.
- Produces: `Footer.astro` rendered into the `footer` named slot.

- [ ] **Step 1: Write Footer.astro**

```astro
---
// src/components/Footer.astro
import { site, nav, footer } from "../data/content";
import Logo from "../assets/logo.svg?raw";
---

<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__brand" set:html={Logo} />
    <nav aria-label="Footer">
      <ul>
        {nav.map((item) => (
          <li><a href={item.href}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
    <p class="site-footer__contact">
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </p>
    <p class="site-footer__copyright">{footer.copyright}</p>
  </div>
</footer>

<style>
  .site-footer {
    background: var(--navy-950);
    color: var(--white);
    padding-block: var(--space-12);
  }

  .site-footer__inner {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
    align-items: center;
    justify-content: space-between;
  }

  .site-footer__brand {
    width: 130px;
  }

  .site-footer nav ul {
    list-style: none;
    display: flex;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
  }

  .site-footer a {
    color: var(--white);
    text-decoration: none;
  }

  .site-footer a:hover {
    color: var(--teal-400);
  }

  .site-footer__copyright {
    width: 100%;
    font-size: var(--text-sm);
    opacity: 0.7;
    margin: 0;
  }
</style>
```

- [ ] **Step 2: Add Footer to index.astro's footer slot**

```astro
<Footer slot="footer" />
```

(Add `import Footer from "../components/Footer.astro";` and place `<Footer slot="footer" />` as the last child of `<BaseLayout>`.)

- [ ] **Step 3: Add Footer to thank-you.astro**

```astro
---
// src/pages/thank-you.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
---

<BaseLayout
  title="Thank You | Kalos Technology"
  description="Thanks for reaching out to Kalos Technology — we'll be in touch soon."
>
  <Header slot="header" />
  <section class="container" style="padding-block: 6rem; text-align: center;">
    <h1>Thank you for reaching out.</h1>
    <p>We've received your message and will get back to you shortly.</p>
    <a href="/" class="btn btn-primary">Back to home</a>
  </section>
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 4: Write the test**

```js
// tests/footer.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("footer renders nav, email, and copyright on both index and thank-you pages", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const indexHtml = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(indexHtml, /aria-label="Footer"/);
  assert.match(indexHtml, /href="mailto:pbirdsong@kalostechnology\.com"/);
  assert.match(indexHtml, /Kalos Technology\. All rights reserved\./);

  const thankYouPath = fs.existsSync("dist/thank-you/index.html")
    ? "dist/thank-you/index.html"
    : "dist/thank-you.html";
  const thankYouHtml = fs.readFileSync(thankYouPath, "utf-8");
  assert.match(thankYouHtml, /aria-label="Footer"/);
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/footer.test.mjs`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro src/pages/thank-you.astro tests/footer.test.mjs
git commit -m "Add footer with nav, contact, and copyright"
```

---

## Task 17: Full-Page Assembly and Landmark/Anchor Integrity Check

**Files:**
- Modify: `src/pages/index.astro` (final review pass — verify all imports/order match spec §4)
- Test: `tests/page-assembly.test.mjs`

**Interfaces:**
- Consumes: every component from Tasks 4–16.
- Produces: the finished `index.astro` in the exact section order from spec §4: Header, Hero, About, Services, WhyCustom, StaffAugIntro, StaffAugBenefits, StaffAugServices, Process, Industries, WhyKalos, Contact, Footer.

- [ ] **Step 1: Confirm index.astro matches the required order**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
import Hero from "../components/Hero.astro";
import About from "../components/About.astro";
import Services from "../components/Services.astro";
import WhyCustom from "../components/WhyCustom.astro";
import StaffAugIntro from "../components/StaffAugIntro.astro";
import StaffAugBenefits from "../components/StaffAugBenefits.astro";
import StaffAugServices from "../components/StaffAugServices.astro";
import Process from "../components/Process.astro";
import Industries from "../components/Industries.astro";
import WhyKalos from "../components/WhyKalos.astro";
import Contact from "../components/Contact.astro";
import Footer from "../components/Footer.astro";
---

<BaseLayout
  title="Kalos Technology | Bespoke Software Development & Staff Augmentation"
  description="Kalos Technology designs custom software around your business and augments your engineering team with experienced developers who report to you."
>
  <Header slot="header" />
  <Hero />
  <About />
  <Services />
  <WhyCustom />
  <StaffAugIntro />
  <StaffAugBenefits />
  <StaffAugServices />
  <Process />
  <Industries />
  <WhyKalos />
  <Contact />
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 2: Write the anchor-integrity test**

This test parses every `href="#..."` in the built page and asserts a matching `id="..."` exists — catching broken nav anchors, a real bug class for a single-page site.

```js
// tests/page-assembly.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("every in-page anchor link has a matching id, and all landmarks are present", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");

  const hrefIds = [...html.matchAll(/href="#([\w-]+)"/g)].map((m) => m[1]);
  assert.ok(hrefIds.length > 0, "expected at least one in-page anchor link");

  for (const id of hrefIds) {
    const hasId = new RegExp(`id="${id}"`).test(html);
    assert.ok(hasId, `no element with id="${id}" found for href="#${id}"`);
  }

  assert.match(html, /<header/);
  assert.match(html, /<main id="main"/);
  assert.match(html, /<footer/);

  const sectionCount = (html.match(/<section/g) ?? []).length;
  const labelledbyCount = (html.match(/aria-labelledby="/g) ?? []).length;
  assert.ok(
    labelledbyCount >= sectionCount - 1,
    `expected most sections to have aria-labelledby (sections: ${sectionCount}, labelledby: ${labelledbyCount})`
  );
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `node --test tests/page-assembly.test.mjs`
Expected: PASS. If it fails on a missing id, fix the offending section's `id` attribute (not the nav link) and rerun.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: All tests across all files PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro tests/page-assembly.test.mjs
git commit -m "Finalize page assembly order and verify anchor/landmark integrity"
```

---

## Task 18: Scroll-Reveal Motion with Reduced-Motion Support

**Files:**
- Create: `src/scripts/scroll-reveal.js`
- Modify: `src/components/Hero.astro`, `src/components/About.astro`, `src/components/Services.astro`, `src/components/StaffAugIntro.astro`, `src/components/WhyKalos.astro` (add `data-reveal` to top-level content blocks)
- Modify: `src/layouts/BaseLayout.astro` (load the script once, globally)
- Test: `tests/scroll-reveal.test.mjs`

**Interfaces:**
- Produces: pure function `shouldAnimate(prefersReducedMotion: boolean): boolean` and `initScrollReveal(prefersReducedMotion, observerFactory)` — the DOM-touching parts are injected so the decision logic is testable without a real browser.

- [ ] **Step 1: Write the failing test**

```js
// tests/scroll-reveal.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldAnimate } from "../src/scripts/scroll-reveal.js";

test("shouldAnimate returns false when the user prefers reduced motion", () => {
  assert.equal(shouldAnimate(true), false);
  assert.equal(shouldAnimate(false), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/scroll-reveal.test.mjs`
Expected: FAIL (module not found)

- [ ] **Step 3: Write src/scripts/scroll-reveal.js**

```js
// src/scripts/scroll-reveal.js
export function shouldAnimate(prefersReducedMotion) {
  return !prefersReducedMotion;
}

export function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const elements = document.querySelectorAll("[data-reveal]");

  if (!shouldAnimate(prefersReducedMotion)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/scroll-reveal.test.mjs`
Expected: PASS

- [ ] **Step 5: Add the reveal CSS to global.css**

```css
/* append to src/styles/global.css */
[data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 6: Load the script once in BaseLayout.astro**

Add before `</body>` in `src/layouts/BaseLayout.astro`:

```astro
    <script>
      import { initScrollReveal } from "../scripts/scroll-reveal.js";
      initScrollReveal();
    </script>
  </body>
```

- [ ] **Step 7: Add data-reveal to key content blocks**

In `Hero.astro`, add `data-reveal` to the `.hero__copy` div. In `About.astro`, add `data-reveal` to `.about__columns`. In `Services.astro`, add `data-reveal` to `.services__grid`. In `StaffAugIntro.astro`, add `data-reveal` to `.staff-aug-intro__panels`. In `WhyKalos.astro`, add `data-reveal` to `.why-kalos__grid`.

- [ ] **Step 8: Run the full build and test suite**

Run: `npm run build && npm test`
Expected: build succeeds, all tests PASS (the reveal script doesn't run at build time since it's browser-only, so no build test asserts on `is-visible`; this is verified manually in Task 20).

- [ ] **Step 9: Commit**

```bash
git add src/scripts/scroll-reveal.js src/styles/global.css src/layouts/BaseLayout.astro src/components/Hero.astro src/components/About.astro src/components/Services.astro src/components/StaffAugIntro.astro src/components/WhyKalos.astro tests/scroll-reveal.test.mjs
git commit -m "Add reduced-motion-aware scroll reveal animation"
```

---

## Task 19: Accessibility and Diagonal/Circle Motif Polish Pass

**Files:**
- Modify: `src/styles/global.css` (focus-visible refinement, contrast fixes if any found)
- Modify: `src/components/About.astro`, `src/components/Industries.astro` (add diagonal `clip-path` section transitions per spec §5, alternating with `WhyCustom.astro`'s existing diagonal treatment so dark/light sections visually connect)
- Test: `tests/accessibility-markers.test.mjs`

**Interfaces:**
- No new exports — this task is a CSS/markup refinement pass over existing components from Tasks 6 and 13.

- [ ] **Step 1: Add diagonal clip-path to About and Industries for visual rhythm**

In `About.astro`'s `<style>`, add:

```css
.about {
  clip-path: polygon(0 0, 100% 3%, 100% 100%, 0 97%);
}
```

In `Industries.astro`'s `<style>`, add:

```css
.industries {
  clip-path: polygon(0 3%, 100% 0, 100% 100%, 0 100%);
}
```

- [ ] **Step 2: Write the accessibility-markers test**

```js
// tests/accessibility-markers.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("decorative SVGs are aria-hidden and every section has an accessible name", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");

  const svgBlocks = [...html.matchAll(/<svg[^>]*>/g)].map((m) => m[0]);
  assert.ok(svgBlocks.length > 0, "expected decorative SVGs in the page");
  const decorativeSvgs = svgBlocks.filter((tag) => !tag.includes('role="img"'));
  for (const tag of decorativeSvgs) {
    assert.match(tag, /aria-hidden="true"/, `decorative svg missing aria-hidden: ${tag}`);
  }

  const sectionIds = [...html.matchAll(/<section id="([\w-]+)"[^>]*aria-labelledby="([\w-]+)"/g)];
  assert.ok(sectionIds.length >= 10, "expected most sections to declare id + aria-labelledby together");
  for (const [, , headingId] of sectionIds) {
    assert.match(html, new RegExp(`id="${headingId}"`), `no heading found with id="${headingId}"`);
  }
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `node --test tests/accessibility-markers.test.mjs`
Expected: PASS. If any decorative SVG lacks `aria-hidden="true"`, add it in the offending component now.

- [ ] **Step 4: Manual visual/keyboard check**

Run: `npm run build && npm run preview`
Open the preview URL and manually verify:
- Tab through the entire page: focus is visible on every interactive element (nav links, mobile toggle, buttons, form fields).
- Resize to 375px, 768px, 1024px, 1440px widths: no horizontal overflow, mobile nav opens/closes correctly.
- Enable "prefers-reduced-motion: reduce" in browser dev tools: scroll-reveal content is immediately visible with no animation.
- Zoom to 200%: layout remains usable, no text clipping.

Record the outcome in the task notes (pass/fail per check) before committing.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/components/About.astro src/components/Industries.astro tests/accessibility-markers.test.mjs
git commit -m "Add diagonal section motifs and verify accessibility markers"
```

---

## Task 20: README and Final Deployment Verification

**Files:**
- Create: `README.md`
- Test: `tests/full-suite.test.mjs` (aggregate sanity check; also run `npm test` directly)

**Interfaces:**
- No new code interfaces — this is documentation plus a final end-to-end verification.

- [ ] **Step 1: Write README.md**

```markdown
# Kalos Technology — Landing Page

Production landing page for Kalos Technology (bespoke software development and
staff augmentation), built with Astro as a static site.

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:4321`.

## Production Build

\`\`\`bash
npm run build
npm run preview   # serves the built dist/ locally to sanity-check
\`\`\`

Build output goes to `dist/`.

## Tests

\`\`\`bash
npm test
\`\`\`

Runs Node's built-in test runner over `tests/`. Most tests build the site and
assert on the generated HTML (content presence, anchor integrity, accessibility
markers); a few test pure JS logic (nav toggle, scroll reveal) directly.

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
```

- [ ] **Step 2: Run the full test suite one final time**

Run: `npm test`
Expected: every test file passes.

- [ ] **Step 3: Run a clean production build**

Run: `rm -rf dist .astro && npm run build`
Expected: build completes with no errors or warnings about missing modules.

- [ ] **Step 4: Verify netlify.toml is correct**

Run: `cat netlify.toml`
Expected output:
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Add README with dev, build, deploy, and content-editing instructions"
```

---

## Self-Review Notes

**Spec coverage:** §1 (sources, imagery constraint) → Task 3/1 (spec preamble honored, no stock photos used anywhere). §2 (all content) → Tasks 2, 5–16 (every field consumed by a component). §3 (architecture) → Tasks 1, 2, 3, 15 (Netlify Forms). §4 (section order) → Task 17. §5 (visual system) → Tasks 3, 18, 19. §6 (accessibility) → Tasks 3, 4, 19. §7 (SEO) → Task 3. §8 (deployment) → Tasks 1, 20. §9 (exclusions) → enforced by Task 2's content.ts being the *only* content source (no component invents copy).

**Placeholder scan:** no TBD/TODO markers; every step has literal code or literal shell commands.

**Type consistency:** `content.ts` field names (`id`, `heading`, `items`, `title`, `description`, etc.) are used identically by every consuming component across Tasks 5–16 — verified during drafting by cross-checking each component's frontmatter against the Task 2 export shapes.
