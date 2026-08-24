# Kalos Technology Landing Page — Design Spec

Date: 2026-08-24
Status: Approved by user, proceeding to implementation

## 1. Purpose & Sources

Build a production-ready, Netlify-deployable landing page for Kalos Technology, a
bespoke software development company. This replaces the informal Wix draft at
`https://garojas0.wixstudio.com/kalos` with an independently hosted, high-quality
implementation.

**Authoritative content source:** `KALOS BROCHURE.ai` (9-page PDF-compatible
Illustrator brochure, read via rendered page images). All factual claims — services,
process, industries, differentiators, contact info — come from this document.

**Secondary reference (design/structure inspiration only, not fact source):** the
existing Wix Studio draft. It self-identifies as "Kalos Corporation" and includes
claims not present in the brochure (DEI/diversity statement, Lean Six Sigma
methodology, social responsibility/scholarship programs, "Platform as a Service").
**These are excluded** from the new page — the brochure is authoritative and doesn't
support them. The company name used throughout is **Kalos Technology** (per brochure
and per the shared email domain `kalostechnology.com`), not "Kalos Corporation."

**Imagery constraint:** the brochure's stock photography license does not clearly
extend to public website use. The page will not reuse those photos or source new
stock photography of people. Visual identity is built from original CSS/SVG:
geometric diagonal panels, circle motifs, and an abstract network/circuit graphic
recreating the brochure's "hologram over laptop" motif — all original, license-free
assets. The Kalos "S" logomark is recreated as an original SVG based on the
brochure's mark (angular interlocking S-shape + dot).

## 2. Extracted Brochure Content (source of truth)

**Company tagline:** "Software that fits. Not the other way around."
**Secondary tagline:** "Custom software. Built around your business."

**Overview:** Kalos Technology is a bespoke software development company
specializing in custom-built digital solutions designed around your business
goals — not generic templates. We partner with growing companies and enterprises to
design, build, and scale software that improves efficiency, unlocks new revenue, and
supports long-term growth.

**A partner you can rely on:** At Kalos Technology, we work as an extension of your
team — aligning technology decisions with business objectives from day one. Our
approach minimizes risk, accelerates decision-making, and ensures every solution is
built to evolve with your organization.

**Built by Experts. Trusted by Businesses.** Kalos Technology brings together
experienced software engineers, architects, and product strategists with deep
expertise in building mission-critical custom solutions.
- Strong focus on reliability, scalability, and security
- Proven experience delivering complex systems
- Modern technology stack and best development practices
- Clear documentation and long-term maintainability

"We don't just deliver software — we deliver confidence, clarity, and long-term
value."

**Why Kalos?**
1. We focus on outcomes, not just code
2. Every solution is built specifically for your needs
3. You work directly with experienced engineers and strategists
4. Clear communication, predictable delivery, and real results

**Our bespoke software services** (full product lifecycle):
- **Custom software development** — Business-critical platforms built from the
  ground up
- **SaaS product development** — Scalable, secure software ready for growth
- **Web & cloud applications** — Modern, high-performance applications
- **System integrations & automation** — Connect tools, eliminate manual work,
  improve efficiency
- **Modernization & optimization** — Upgrade legacy systems without disrupting
  operations

**Why custom instead of off-the-shelf?**
- Built exactly for your workflows
- Easier to scale and evolve
- No unnecessary features or licensing limits
- Full ownership and long-term flexibility

**Our development approach** (5 steps):
1. **Discovery & Strategy** — We understand your business, users, and objectives
2. **Solution Design** — Architecture and UX aligned with real-world use
3. **Agile Development** — Fast iterations, continuous feedback, visible progress
4. **Testing & Quality Assurance** — Performance, security, and reliability built in
5. **Launch & Scale** — Ongoing support as your product grows

**Industries & use cases:** Healthcare · SaaS · Logistics · Finance · Enterprise
Operations · Data-Driven Platforms

**Pull quote:** "You're never just a client. You're a partner."

**CTA copy:** "Let's build your custom solution. If you're ready to stop adapting
your business to software — and start using software that works for you — we're
ready to help." / "Start the conversation today."

**Contact info:**
- Website: kalostechnology.com
- Email: pbirdsong@kalostechnology.com
- QR code in brochure links to portfolio/consultation request (no URL captured in
  brochure — omitted from the web version since the target isn't known; the web
  contact form serves the same purpose)

## 3. Architecture

- **Framework:** Astro (`astro build`, static output, no client framework/islands —
  the page is content, not an interactive app).
- **Structure:**
  ```
  kalos-landing/
    src/
      components/
        Header.astro
        Hero.astro
        About.astro
        Services.astro
        WhyCustom.astro
        Process.astro
        Industries.astro
        WhyKalos.astro
        Contact.astro
        Footer.astro
      data/
        content.ts        # all copy, single source for text edits
      layouts/
        BaseLayout.astro  # <head>, SEO/OG meta, skip link, global CSS import
      pages/
        index.astro        # assembles components
      styles/
        tokens.css          # design tokens: color, type scale, spacing
        global.css           # resets, base element styles, utility classes
      assets/
        logo.svg             # recreated Kalos logomark
        (other original SVG graphics inline in components where practical)
    public/
      favicon.svg
      og-image.png            # generated for social sharing (or documented placeholder)
    netlify.toml
    astro.config.mjs
    package.json
    README.md
  ```
- **Contact form:** native HTML `<form name="contact" method="POST"
  data-netlify="true" netlify-honeypot="bot-field">` per Netlify Forms — no backend,
  no client JS submission handler required. Astro's static HTML output is compatible
  as long as the form's static markup (including a hidden duplicate form for Netlify's
  build-time form detection, per Netlify's documented Astro/SSG caveat) is present in
  the built HTML. Success state handled via a plain `/thank-you` static page (no JS
  required, works without JavaScript).
- **No tracking scripts, no external JS/CSS dependencies at runtime.** Fonts:
  system font stack (no external font requests) to keep the page dependency-free and
  fast — avoids a Google Fonts round trip for a marketing page where system fonts
  rendered well is an acceptable, honest trade-off.

## 4. Page Sections (order + purpose)

1. **Header** — sticky, logo (SVG), nav links (Services, Approach, Industries,
   Contact), primary CTA button ("Start the conversation" → `#contact`). Mobile:
   hamburger menu, accessible (button with `aria-expanded`, focus trap not required
   for a simple nav reveal but focus must remain manageable via Tab).
2. **Hero** — H1 "Software that fits. Not the other way around.", supporting line
   from the overview, two CTAs (primary → contact, secondary "See our approach" →
   process section), original SVG network/circuit graphic on the right (desktop) /
   below (mobile), replacing the brochure's stock photo.
3. **About** — overview paragraph + "A partner you can rely on" paragraph, two-column
   layout on desktop.
4. **Services** — "Our bespoke software services" as 5 cards, each with a short
   original SVG icon (line-style, matching brand geometry), title, description.
5. **Why Custom** — dark panel, italic-styled heading matching brochure's "Why custom
   instead of off-the-shelf?" treatment, 4-item checklist.
6. **Process** — "Our development approach," 5-step numbered list, timeline-style
   layout (vertical on mobile, connected steps on desktop).
7. **Industries** — pill/tag row of the 6 industries, simple and scannable.
8. **Why Kalos** — "Built by Experts. Trusted by Businesses." intro + reliability
   bullets, "Why Kalos?" 4-point list, pull quote "You're never just a client.
   You're a partner." as a distinct visual callout.
9. **Contact** — "Let's build your custom solution." heading + CTA copy, Netlify
   form (Name, Email, Message — required fields, accessible labels, inline
   validation via native HTML5 `required`/`type="email"`), plus direct `mailto:` link
   and `kalostechnology.com` reference as fallback contact methods.
10. **Footer** — logo, nav repeat, email (`mailto:`), copyright line, no fabricated
    social links (brochure/site don't establish verified social profiles).

## 5. Visual Design System

- **Palette** (sampled from brochure imagery, defined as CSS custom properties):
  - `--navy-950: #0a0e1f` (near-black navy, dominant dark background)
  - `--navy-900: #0d1224`
  - `--teal-400: #14e6e6` (electric cyan/teal accent, sampled from hologram graphic)
  - `--white: #ffffff`
  - `--lavender-50: #f4f4fb` (light section background, from brochure's off-white
    panels)
  - `--ink-900: #12131c` (body text on light backgrounds)
  - Exact hex values will be refined against the rendered brochure pages during
    implementation to ensure WCAG AA contrast on both dark and light sections.
- **Typography:** system font stack (`-apple-system, "Segoe UI", Roboto, Helvetica,
  Arial, sans-serif`) — no external font loading. Fluid type scale via `clamp()`.
  Semantic heading hierarchy: one `<h1>` (hero), `<h2>` per major section, `<h3>` for
  card/step titles.
- **Motifs:** diagonal-cut section transitions (`clip-path: polygon(...)`), large
  soft circle outlines (matching brochure's white circle accents), thin diagonal
  line details in dark sections — all pure CSS, no images.
- **Components:** consistent button styles (primary filled teal-on-navy /
  navy-on-white, secondary outline), card style (subtle border + shadow, hover
  lift), consistent spacing scale (`--space-1` … `--space-12` as CSS custom
  properties).
- **Motion:** small vanilla JS `IntersectionObserver` for fade/slide-in on scroll;
  wrapped in `@media (prefers-reduced-motion: no-preference)` so motion is fully
  disabled when the user prefers reduced motion. Mobile nav toggle is plain JS, no
  animation library. Page is fully usable with JavaScript disabled (nav becomes a
  simple always-visible or CSS-only `:target`/checkbox-toggle fallback — decide
  simplest accessible no-JS fallback during implementation).

## 6. Accessibility

- Skip-to-content link.
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, distinct `<section>`s with
  `aria-labelledby` pointing at their heading, `<footer>`.
- Visible focus states on all interactive elements (custom `:focus-visible` styling
  that meets contrast requirements, not just browser default suppressed).
- Color contrast checked against WCAG AA for all text/background combinations in the
  palette.
- All decorative SVGs `aria-hidden="true"`; meaningful icons get `<title>` or
  adjacent visible text.
- Form fields have associated `<label>` elements and accessible error states.

## 7. SEO / Metadata

- Descriptive `<title>`: "Kalos Technology | Bespoke Software Development for
  Growing Businesses"
- Meta description summarizing the value prop from brochure copy.
- Open Graph + Twitter Card tags (title, description, og:image referencing a
  generated `og-image.png` or a documented placeholder if none is generated).
- `theme-color`, canonical URL (placeholder domain, documented in README as needing
  update once the real Netlify/custom domain is known).
- Semantic heading hierarchy (see §5).

## 8. Deployment

- `netlify.toml`:
  ```toml
  [build]
    command = "npm run build"
    publish = "dist"
  ```
- README documents: local dev (`npm install`, `npm run dev`), production build
  (`npm run build`), Netlify deploy (drag-and-drop `dist/` or connect repo via
  Netlify CLI/dashboard with the build command/publish dir above), Netlify Forms
  setup notes (form name, spam honeypot field, where submissions appear in Netlify
  dashboard), and instructions for replacing the placeholder OG image / canonical
  domain once known.

## 9. Explicitly Out of Scope / Not Fabricated

- No testimonials, client logos, case studies, certifications, awards, team bios, or
  statistics — none appear in the brochure or are verifiable from the existing site.
- No social media links — none are established in either source.
- No street address — none given in either source; only website + email contact are
  provided.
- No pricing information — not present in either source.
- The QR code's destination URL is unknown (not decodable text in the brochure
  source); the contact form and direct email/website links serve the equivalent
  purpose instead of guessing at a portfolio URL.
