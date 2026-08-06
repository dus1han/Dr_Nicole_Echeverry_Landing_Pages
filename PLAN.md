# Mommy Makeover in Dubai — Landing Page
### Dr. Nicole Echeverry · Master Build Plan

**Version:** 1.1 — *built and verified. See [README.md](README.md) for how to run it.*
**Date:** 27 July 2026

> **Status: complete.** All 18 blocks are built. Verified on the production build:
> FCP 1.54s · LCP 1.94s · CLS 0.009 (throttled mobile), accessibility and no-JS
> audits passing, types clean. Three items still carry approved dummy content and the
> build is gated until they're replaced — see [`docs/open-questions.md`](docs/open-questions.md).
>
> Two things changed during the build and the docs below have been corrected to match:
> the single brand gradient was **split into three** (decorative / white-text fill /
> text-clip) after the original washed out white labels, and hero entrances moved from
> Motion to **CSS** after the JS version left the headline blank for 4.3s on a slow phone.
**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion (Framer Motion)
**Route:** `/mommy-makeover`
**Goal:** A premium, emotionally-resonant landing page that makes mothers in Dubai feel *seen*, trust Dr. Nicole, and book a consultation.

> **This is landing page #1 of several.** The project is built from day one as a **multi-landing-page platform** for Dr. Nicole — a shared design system, shared shell, and shared component kit, with each campaign living at its own route and owning only its content file. See §5.0.

---

## 1. Strategy & Positioning

### 1.1 Who we are talking to
A 30–45 year old woman in Dubai — often an expat, financially comfortable, image-conscious, time-poor. She has had one or more children. Her body changed in ways diet and exercise have not fixed. She is **not** looking to become someone else; she wants to feel like *herself* again. She is nervous about: looking "done", scarring, recovery time away from her kids, and being sold to.

### 1.2 The emotional promise
> *"You don't want a different body. You want yours back."*

Every section must serve one of three jobs:

| Job | Emotional question she's asking | Sections that answer it |
|---|---|---|
| **Desire** | "Could I actually feel like me again?" | Hero, Confidence CTA, Before & After |
| **Trust** | "Is she safe, skilled, and will she listen?" | Meet Dr. Nicole, Why Trust, Reviews, FAQ |
| **Clarity** | "What is it, am I eligible, what happens next?" | What Is It, Procedures, Candidacy, Journey, Booking |

### 1.3 Conversion architecture
- **Primary CTA:** *Book Your Consultation* — repeated 6× down the page (hero, after procedures, after candidacy, after doctor, after reviews, final form).
- **Secondary CTA:** *See The Results* — anchors to Before & After (low-commitment path for browsers).
- **Persistent CTA:** floating WhatsApp bubble (desktop + mobile) and a sticky bottom bar on mobile.
- **Zero-friction fallback:** every CTA that isn't the form is a `wa.me` / `tel:` deep link — she can convert in one tap without filling anything in.

### 1.4 Tone rules (non-negotiable)
- Never use "flaws", "fix", "problem areas", "bounce back", or "snap back".
- Never show a number-driven "before/after weight loss" framing.
- Always say *restore, refine, harmony, yourself again*.
- Medical honesty over hype — no guaranteed results, no pricing promises, no "risk-free".

---

## 2. Design Direction

**Concept name: "Blush Atelier"** — the softness of a rose garden with the precision of a surgical suite.

Not bubblegum. Not clinical white. The look is **couture**: deep plum, champagne gold hairlines, blush gradients that bloom, high-contrast serif display type borrowed straight from her logo.

### 2.1 Color system — "Cute pink, grown-up execution"

| Token | Hex | Use |
|---|---|---|
| `cream` | `#FFFCFA` | Page base |
| `blush-50` | `#FFF7F9` | Section alt background |
| `blush-100` | `#FDEEF3` | Cards, chips |
| `blush-200` | `#FADCE6` | Borders, dividers |
| `rose-300` | `#F3B8CC` | Gradient mid, glows |
| `rose-400` | `#E993B1` | Accents, icons |
| **`rose-500`** | **`#DD6E96`** | **Primary brand pink / buttons** |
| `rose-600` | `#C4527C` | Hover state |
| `plum-700` | `#8E3560` | Emphasis text |
| `plum-800` | `#5E2340` | Dark section base |
| `plum-900` | `#3D162A` | Deepest dark, footer |
| `gold-400` | `#D9B98C` | Hairlines, badges |
| `gold-500` | `#C9A063` | Award/credential accents |
| `ink` | `#2B1620` | Body text (warm near-black) |

**Signature gradient:** `linear-gradient(135deg, #FDEEF3 0%, #F3B8CC 38%, #DD6E96 72%, #8E3560 100%)`
Used for: headline text-clip, button fills, glow auras, section dividers.

**Contrast guardrail:** all body copy meets WCAG AA (4.5:1). `rose-500` on white is used for *large* text and UI only; small text uses `plum-700` or `ink`.

### 2.2 Typography

| Role | Font | Notes |
|---|---|---|
| Display / H1–H3 | **Playfair Display** (700, 500 italic) | High-contrast Didone — matches the "NE / EN" logo mark exactly |
| Body / UI | **Manrope** (400, 500, 700) | Warm geometric sans, excellent at small sizes |
| Eyebrow labels | Manrope 600, `0.18em` letter-spacing, uppercase | The "couture label" detail |

Loaded via `next/font/google` → zero layout shift, self-hosted, no external request.

Fluid type scale using `clamp()`: H1 `clamp(2.75rem, 7vw, 5.5rem)` down to body `clamp(1rem, 1.05vw, 1.125rem)`.

### 2.3 Texture & depth
- Soft **noise/grain overlay** (SVG `feTurbulence`, 3% opacity) over gradient areas — kills banding, adds print-like quality.
- **Gold hairline** dividers (1px, 40% opacity) between major sections.
- Glassmorphism only on the sticky nav and floating badges — never on content cards.
- Card shadows are *pink-tinted*, never grey: `0 24px 60px -20px rgba(221,110,150,0.28)`.
- Organic **petal / blob shapes** as SVG masks for image frames (asymmetric rounded corners: `border-radius: 48% 52% 40% 60% / 55% 45% 55% 45%`).

---

## 3. Page Architecture (18 blocks, top to bottom)

> Legend — **[C]** = copy comes verbatim/adapted from the client doc · **[N]** = new copy written by us · **[A]** = needs an asset decision

| # | Section | Purpose | Source |
|---|---|---|---|
| 0 | Announcement marquee | Scarcity + credibility | [N] |
| 1 | Sticky navigation | Persistent CTA | [N] |
| 2 | **Hero** | Desire + primary CTA | [C] |
| 3 | Trust strip | Instant credibility | [N] |
| 4 | **What is a Mommy Makeover** | Clarity | [C] |
| 5 | **The Procedures** (3 cards) | Clarity + depth | [C] |
| 6 | **Am I the right candidate?** | Self-qualification | [C] |
| 7 | **Meet Dr. Nicole** | Trust (person) | [C] |
| 8 | **Why Trust Dr. Nicole** | Trust (philosophy) | [C] |
| 9 | Before & After | Proof | [C] [A] |
| 10 | Your Journey (5 steps) | Removes fear of unknown | [N] |
| 11 | Patient Reviews | Social proof | [C] [A] |
| 12 | **FAQ** (7 questions) | Objection handling | [C] |
| 13 | **Your Confidence Deserves Your Attention** | Emotional close | [C] |
| 14 | Booking form | Conversion | [N] |
| 15 | **Visit the Clinic** (live map) | Legitimacy + logistics | [C] [A] |
| 16 | Footer | Contact + legal | [C] |
| 17 | Floating WhatsApp + mobile sticky bar | Always-on conversion | [N] |

### 3.1 Section detail

**0 · Announcement marquee**
Thin gradient strip, infinite horizontal scroll: `Colombian Aesthetic Artistry` · `Board-Certified Plastic Surgeon` · `Private Consultations in Dubai` · `Personalised Treatment Plans` — separated by gold diamond glyphs. Pauses on hover.

**1 · Sticky navigation**
Transparent over hero → on scroll (>60px) becomes frosted `blur(20px)` cream with gold hairline bottom border and a shrunken logo. Links: What Is It · Procedures · Dr. Nicole · Results · FAQ. Right side: `+971 56 663 6359` (tel link) + gradient pill **Book Consultation**. Mobile: full-screen overlay menu with staggered link entrance.

**2 · Hero** — *the money shot*
- **Layout:** 55/45 split. Left = copy, right = the Dubai balcony image (`03_32_08 AM.png`) in an organic blob-masked frame with a slow Ken Burns drift.
- **H1:** *"Feel Like Yourself Again"* (line 1, plum) / *"with a Mommy Makeover in Dubai"* (line 2, gradient-clipped, with a shimmer sweep on load).
- **Sub:** "with Dr. Nicole Echeverry — world-class body contouring inspired by Colombian aesthetic artistry."
- **CTAs:** primary gradient **Book Your Consultation** (magnetic, glow pulse) + ghost **See The Results** (arrow slides right on hover).
- **Background:** three animated aurora blobs (blush → rose → plum) drifting on 20–30s loops + drifting petal particles on a `<canvas>` + grain overlay.
- **Below fold hint:** animated scroll cue.
- **Floating glass badges** over the image: *"Colombian-trained"* and *"Personalised to your anatomy"*.

**3 · Trust strip**
Four animated count-up stats on a blush band: *Years of Surgical Experience* · *Procedures Performed* · *Countries Trained In* · *Patient Satisfaction*. **[A] — real numbers needed; placeholders used until supplied.**

**4 · What is a Mommy Makeover**
Two columns. Left: the operating-theatre portrait (`dra-nicole-echeverry-en-cirugia-1.jpg`) in a plum-framed asymmetric mask with a gold offset outline, parallax on scroll. Right: eyebrow *"THE PROCEDURE"*, H2, the definition paragraph, then three animated chips (Tummy Tuck / Breast Lift or Augmentation / Liposuction) that highlight and scroll-link to their card in section 5.

**5 · The Procedures**
Three cards in a responsive grid. Each: procedure image, name in Playfair, one-line description, three benefit bullets with animated gold check marks.
Interaction: 3D tilt following the cursor (`rotateX/rotateY`, max 8°), pink glow bloom behind on hover, image zooms 1.06. On mobile the tilt is disabled and cards reveal in a stagger.
Images: `02_59_12 AM.png` (Tummy Tuck), `03_08_24 AM.png` (Breast), `grok-image-...jpg` (Liposuction).

**6 · Am I the right candidate?**
Dark plum section — the visual "breath" of the page. Left: the six-point checklist, each revealing on scroll with a gold tick that draws itself (SVG path animation). Right: sticky body-contour image with a soft rose glow. Closes with a warm line + CTA: *"Not sure? A consultation will tell you honestly."*

**7 · Meet Dr. Nicole**
Her white-suit portrait (`482030689_...jpg`) — the hero of trust. Framed in a blush arch (`border-radius: 50% 50% 0 0 / 30% 30% 0 0`) with a rotating dashed gold ring behind it. Two glass credential cards float in and gently bob. Right: eyebrow *"MEET YOUR SURGEON"*, H2 "Dr. Nicole Echeverry", the bio paragraph, and a handwritten-style signature that draws on scroll.

**8 · Why Trust Dr. Nicole with Your Mommy Makeover?**
The paragraph is broken into **four pillars** with icons so it's scannable: *Colombian Aesthetic Artistry* · *Fully Personalised Plans* · *Natural, Refined Results* · *Continuous Personal Care*. Cards lift and grow a gradient top-border on hover.

**9 · Before & After**
Interactive **drag-to-reveal** slider (mouse, touch, and keyboard-arrow accessible) with a gold handle. Thumbnail row to switch between three cases. Case captions: *"Tummy tuck + 360° liposuction · 6 months post-op"* etc. Disclaimer beneath: *"Individual results vary. Photos published with patient consent."*

**[A] — using dummy content for now, per client instruction.** Three placeholder pairs are generated from the supplied body imagery: the "before" plate is a softened, slightly desaturated derivative and the "after" plate is the original, so the drag interaction demonstrates properly. Each pair carries a small `SAMPLE` corner ribbon, and every dummy asset lives behind a single `isPlaceholder: true` flag in the content file — flip it to `false` when real photos arrive and the ribbons and dev-console warning disappear together. See §7.2.

**10 · Your Journey**
Five-step horizontal timeline (vertical on mobile) with a gradient line that **fills as you scroll**: Private Consultation → Personalised Plan → Pre-Op Preparation → Your Surgery Day → Guided Recovery. Directly targets her fear of the unknown. **[N] — copy drafted by us, needs Dr. Nicole's sign-off for medical accuracy.**

**11 · Patient Reviews**
Auto-advancing carousel, 3-up on desktop / 1-up swipeable on mobile. Blush cards with an oversized gold quotation glyph, 5-star row, name + descriptor ("Mother of two · Dubai"), and a small gold "Verified patient" chip.
**[A] — using dummy content for now, per client instruction.** Six sample reviews are written (full text in `docs/content-map.md` §11), sitting behind the same `isPlaceholder: true` flag. Swapping in real ones is a text edit in one file. See §7.2.

**12 · FAQ**
All seven questions, accordion with spring height animation, a `+` that rotates to `×`, and a gradient left-edge that grows on the open item. Emitted with **FAQPage JSON-LD** schema for rich results in Google.

**13 · Your Confidence Deserves Your Attention**
Full-bleed deep plum with a slow-moving mesh gradient and floating petals. Centred Playfair statement, the two paragraphs, one large gradient CTA. This is the emotional peak — maximum whitespace, minimum noise.

**14 · Booking form**
Two columns. Left: *"Your consultation is a conversation, not a commitment"* + contact methods (phone, email, WhatsApp, location) as hover-lifting rows. Right: the form on a white card with a gradient border.
Fields: Full name · Phone (with UAE dial prefix) · Email · Procedure of interest (multi-select chips) · Preferred contact time · Message.
Micro-interactions: floating labels, inline validation, gradient submit with a loading shimmer, and a success state where a check mark draws itself. Honeypot + rate limiting for spam.
**[A] — where should submissions go?** See open questions.

**15 · Visit the Clinic — live map**
Sits directly under the booking form, so the moment she decides to enquire she can see *where* she'd be going. A real clinic on a real map is one of the strongest legitimacy signals a medical page has.

- **Layout:** 60/40 split — map on the left, details card on the right. Stacks on mobile with the map on top at 16:9.
- **Map:** Google Maps `output=embed` iframe — **no API key or billing account required**, so it works the moment we deploy. `loading="lazy"` and it only mounts when scrolled near, so it costs nothing on page load.
- **Brand treatment:** the raw Google embed is grey and clashes with the palette, so it sits inside a `radius-lg` frame with a 1px gold hairline, `shadow-card`, and a soft blush vignette overlay (`pointer-events: none`) that tints the edges toward the brand without touching legibility. A gradient-ringed pin marker pulses over the clinic position.
- **Details card:** clinic name, full address, a "Get Directions" button (deep-links to the Google Maps app on mobile, web on desktop), phone, WhatsApp, and consultation hours.
- **Fallback:** if the iframe is blocked (strict privacy extensions, some corporate networks), a static branded map card with the same "Get Directions" link renders instead — the section never appears broken.
- **Structured data:** the address feeds the `MedicalBusiness` JSON-LD with `geo` coordinates, which is what actually earns the Google Business panel for "plastic surgeon near me" searches.

**[A] — clinic name confirmed, address not.** The supplied share link resolves to **Kasaesthetic Clinic**. Her own site (`dranicolecheverry.com`) lists only the Bogotá practice, and no Dubai street address for that clinic could be verified from public sources. Until you confirm it, the map is driven by the place query and the address line is flagged in-code. **This is the one item on the page where a guess would be actively harmful — a wrong address sends patients to the wrong building — so it is left explicitly unfilled rather than approximated.**

**16 · Footer**
Deep plum. Logo (white version — the supplied PNG is white-on-transparent and sits here perfectly), contact block, social icons (Facebook, Instagram) with gradient hover fill, Google Maps link, quick links, and the medical disclaimer + copyright.

**17 · Persistent conversion layer**
- Floating WhatsApp bubble, bottom-right, with a pulsing ring; appears after 25% scroll.
- Mobile-only sticky bottom bar: **Call** | **WhatsApp** | **Book** — appears after the hero leaves the viewport.
- Thin gradient scroll-progress bar pinned to the top of the viewport.

---

## 4. Motion System

Motion is the "eye-catching" requirement — but it must feel *expensive*, which means restrained, slow and consistent, not busy.

### 4.1 Global rules
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (soft overshoot) for entrances; `cubic-bezier(0.4, 0, 0.2, 1)` for state changes.
- **Durations:** micro 180ms · standard 520ms · ambient loops 18–30s.
- **Stagger:** 70–90ms between siblings.
- **Trigger:** `whileInView` with `{ once: true, amount: 0.25 }` — nothing re-animates on scroll-back (that reads as cheap).
- **Only** `transform` and `opacity` are animated. No layout-property animation anywhere.

### 4.2 The effect inventory
| Effect | Where | Technique |
|---|---|---|
| Aurora gradient blobs | Hero, CTA, Journey | CSS `@keyframes` translate/scale, `filter: blur(90px)` |
| Drifting petal particles | Hero, Confidence CTA | `<canvas>`, ~28 particles, `requestAnimationFrame`, pauses off-screen |
| Headline shimmer sweep | Hero H1 | Animated `background-position` on a clipped gradient |
| Reveal on scroll | Every section | Motion `whileInView`, `y: 32 → 0`, `opacity: 0 → 1` |
| Staggered list entrance | Bullets, cards, nav | Motion `staggerChildren` |
| Magnetic buttons | All primary CTAs | Cursor-proximity `translate`, spring return |
| 3D card tilt | Procedure cards | `useMotionValue` + `useTransform` → `rotateX/Y`, `perspective: 1000px` |
| Count-up numbers | Trust strip | `useInView` + `animate()` on a motion value |
| Parallax images | What Is It, Candidacy | `useScroll` + `useTransform` on `y` |
| SVG draw-on | Check ticks, signature | `pathLength: 0 → 1` |
| Progress-fill timeline | Your Journey | `scaleY/scaleX` bound to scroll progress |
| Drag-reveal slider | Before & After | Pointer events → clip-path `inset()` |
| Accordion spring | FAQ | Motion `AnimatePresence` + height auto |
| Infinite marquee | Announcement bar | Duplicated track, CSS translate loop |
| Cursor glow | Desktop only | Fixed radial-gradient div following pointer, `mix-blend-mode: soft-light` |
| Scroll progress bar | Global | `useScroll().scrollYProgress` → `scaleX` |
| Page-load curtain | First paint | Logo fade + blush curtain wipe, ≤900ms, once per session |

### 4.3 Accessibility
A global `prefers-reduced-motion: reduce` handler: disables the particle canvas, marquee, cursor glow, tilt, and Ken Burns; converts all entrance animations to a plain 150ms opacity fade. Focus rings are visible everywhere (2px `rose-500` offset). The before/after slider is operable with arrow keys. All animation-wrapped content is present in the DOM at full opacity if JS fails.

---

## 5. Technical Implementation

### 5.0 Multi-landing-page architecture

This repository is the **home for all of Dr. Nicole's campaign landing pages**, not a one-off. The rule:

> **Shared = design system, shell, and section components. Per-page = one content file and one route.**

```
/mommy-makeover     ← this build
/breast-augmentation   ┐
/tummy-tuck            ├─ future pages: new content file + route, zero new components
/liposuction           ┘
```

Adding landing page #2 should be **a content file and a 20-line `page.tsx`** — not a redesign. To make that true:

- Every section component takes its copy as **typed props**, never hard-coded strings.
- Content lives in `content/<page-slug>.ts`, all conforming to a shared `LandingPageContent` type in `content/types.ts`. TypeScript then *forces* every new page to supply a complete, well-formed set of copy.
- Sections are **composable and optional** — a page assembles the blocks it needs. A breast-augmentation page might skip "Candidacy" and add a "Implant Options" block; the other 14 blocks come free.
- The shell (nav, footer, floating CTAs, announcement bar) is defined **once** in `app/layout.tsx` and driven by `content/site.ts` (clinic contact details, socials, nav links) so a phone-number change is one edit across every page, forever.
- Metadata, OG image, and JSON-LD are generated **per page** from that page's content object.

`/` (root) ships as a lightweight index that routes to the available landing pages — replaceable with a real homepage later without touching any campaign page.

### 5.1 Project structure
```
Pages/
├── app/
│   ├── layout.tsx                  # fonts, shell, global effects, base metadata
│   ├── page.tsx                    # root index → links to landing pages
│   ├── globals.css                 # Tailwind v4 @theme tokens, base, utilities
│   ├── mommy-makeover/
│   │   ├── page.tsx                # composes sections from content/mommy-makeover.ts
│   │   └── opengraph-image.tsx     # per-page OG card
│   └── api/consultation/route.ts   # shared form handler (validated, rate-limited)
├── content/                        # ← THE PER-PAGE LAYER
│   ├── types.ts                    # LandingPageContent + section prop types
│   ├── site.ts                     # clinic-wide: contact, socials, nav, legal
│   └── mommy-makeover.ts           # all copy for this page
├── components/
│   ├── layout/      Navbar · Footer · AnnouncementBar · ScrollProgress
│   │                FloatingCta · MobileCtaBar · PageCurtain
│   ├── sections/    Hero · TrustStrip · WhatIsIt · Procedures · Candidacy
│   │                MeetDoctor · WhyTrust · BeforeAfter · Journey · Reviews
│   │                Faq · ConfidenceCta · BookingForm · ClinicMap
│   ├── ui/          Button · Card · Chip · Accordion · Input · Reveal
│   │                SectionHeading · GoldDivider · GlassBadge
│   └── effects/     AuroraBackground · PetalCanvas · CursorGlow · Marquee
│                    TiltCard · CountUp · Magnetic · GrainOverlay
├── lib/
│   ├── motion.ts                   # shared variants & easings
│   ├── schema.ts                   # JSON-LD builders
│   └── utils.ts                    # cn(), validators
├── scripts/
│   ├── prepare-assets.mjs          # rename/optimise images, generate plum logo
│   │                               # + generate dummy before/after pairs
│   └── check-content.mjs           # fails the build on leftover isPlaceholder
├── public/
│   ├── images/mommy-makeover/      # page-scoped assets
│   └── logo/                       # logo-white.png + generated logo-plum.png
├── docs/
│   ├── design-system.md
│   ├── content-map.md
│   ├── adding-a-landing-page.md    # the recipe for page #2
│   └── open-questions.md
└── PLAN.md
```

**Why content is separated from components:** the client will want copy changes, and there will be many pages. One typed file per page means edits never touch component code, every page is guaranteed structurally complete by the compiler, and it's a clean migration path if this ever moves to a CMS.

### 5.2 Dependencies
```
next@15  react@19  typescript  tailwindcss@4  @tailwindcss/postcss
motion            # Framer Motion v11+ (package renamed to `motion`)
lucide-react      # icons
clsx tailwind-merge
zod               # form validation, shared client + server
```
Deliberately **no** UI kit, no carousel library, no animation library beyond Motion — every component is hand-built so nothing looks templated.

### 5.3 Asset pipeline
1. Copy the six source images into `public/images/` with semantic names (`hero-dubai.png`, `surgeon-operating.jpg`, `doctor-portrait.jpg`, `procedure-tummy.png`, `procedure-breast.png`, `procedure-lipo.jpg`).
2. The supplied `logo.png` is **white on transparent** (800×450) — perfect for the dark footer. We generate a second **plum-tinted variant** programmatically for the light navigation bar.
3. All images through `next/image` with explicit `sizes`, `priority` on the hero only, and blurred placeholders. Target: hero LCP image ≤ 180KB.

### 5.4 Performance — targets vs. measured

Measured against the production build on a 4× CPU-throttled, ~1.6 Mbps mobile profile
(`node scripts/measure-perf.mjs`).

| Metric | Target | Measured | |
|---|---|---|---|
| FCP | < 1.8s | **1.54s** | ✅ |
| LCP | < 2.5s | **1.94s** | ✅ |
| CLS | < 0.05 | **0.009** | ✅ |
| Initial JS | < 190KB | **194KB** | ⚠️ 4KB over |

The JS overage is Motion. A `LazyMotion` refactor would recover ~15KB, but with the
vitals comfortably green it wasn't worth the churn across ten files late in the build.
Flagged rather than hidden.

Achieved by: server components everywhere except the ~10 interactive islands, `next/font` self-hosting, `content-visibility: auto` on below-fold sections, particle canvas lazy-mounted and paused when off-screen, and effects gated behind a `useIsDesktop()` hook so phones never run the tilt/cursor/particle code.

### 5.5 SEO & metadata
- Canonical URL: `https://dranicolecheverry.com/mommy-makeover`
- Title: *Mommy Makeover in Dubai | Dr. Nicole Echeverry — Plastic Surgeon*
- Structured data: `Physician` + `MedicalBusiness` + `FAQPage` + `MedicalProcedure` JSON-LD, generated **per page** from its content object.
- Generated OpenGraph/Twitter card via a per-page `opengraph-image.tsx`.
- Semantic landmarks, one `<h1>`, descriptive alt text on every image, `sitemap.ts` (auto-enumerates every landing page) + `robots.ts`.
- `lang="en"`, `dir="ltr"` — with the structure ready for an `ar` locale later.

### 5.6 Deployment
Vercel (recommended — zero-config for Next 15, free tier is sufficient) or static export for shared hosting if the form is switched to a third-party endpoint. Custom domain: `dranicolecheverry.com`, this page served at `/mommy-makeover`. Every future landing page deploys with the same pipeline, no config change.

---

## 6. Build Sequence

| Phase | Work | Output |
|---|---|---|
| **1. Foundation** | Scaffold Next.js + TS + Tailwind v4, install deps, define `@theme` tokens, wire fonts, copy & rename assets, generate plum logo | App boots with the design system live |
| **2. Content layer** | Define `content/types.ts` + `content/site.ts`, author `content/mommy-makeover.ts` with every string from the client doc | Copy locked and type-safe; the contract every future page implements |
| **3. Primitives** | Button, Card, Chip, Input, Accordion, Reveal, SectionHeading, GoldDivider, plus the effects library | Reusable kit |
| **4. Shell** | AnnouncementBar, Navbar, Footer, ScrollProgress, floating CTAs, page-load curtain — all driven by `site.ts` | Navigable frame shared by every future page |
| **5. Above the fold** | Hero + aurora + petals + trust strip | The hook — reviewable early |
| **6. Education blocks** | What Is It, Procedures, Candidacy | Core clarity content |
| **7. Trust blocks** | Meet Dr. Nicole, Why Trust, Before & After, Journey, Reviews | Credibility |
| **8. Conversion blocks** | FAQ, Confidence CTA, Booking form + API route, Clinic map | Conversion complete |
| **9. Polish** | Responsive pass (360 / 768 / 1024 / 1440 / 1920), reduced-motion pass, keyboard + screen-reader pass, Lighthouse tuning, metadata & JSON-LD | Launch-ready |
| **10. Handover** | README with run/deploy/edit-copy instructions, `docs/adding-a-landing-page.md` recipe, open-questions checklist | Client can maintain it; page #2 is a copy-paste away |

Phases 5–8 each end in a reviewable state, so you can course-correct the direction without waiting for the whole build.

---

## 7. Decisions, Assumptions & Risks

### 7.1 Resolved by the client

1. **Name spelling → "Echeverry"** (the logo spelling), used in all display copy.
   Independently corroborated: her own site, Doctify and RealSelf all use *Echeverry*.
   **Not changed:** the email `info@dranicolecheverry.com`, the domain `dranicolecheverry.com`, and the Facebook/Instagram URLs. Those are live endpoints — "correcting" the spelling in them would break real, working links.
2. **Dummy reviews and before/after content approved for now.** Implemented as described in §7.2.
3. **Clinic location shown on a live map.** New section 15. The share link resolves to **Kasaesthetic Clinic**; the street address still needs confirming (§7.3).

### 7.2 How placeholder content is handled

Dummy content is fine for building and reviewing — it becomes a problem only if it quietly survives to launch. So every placeholder is engineered to be *impossible to miss*:

| Guard | Behaviour |
|---|---|
| Single flag | `isPlaceholder: true` on the `reviews` and `results` content blocks. One boolean controls everything below. |
| Visual marker | A small gold `SAMPLE` corner ribbon on placeholder review cards and before/after plates. Removed automatically when the flag flips. |
| Dev warning | A grouped `console.warn` in development listing every block still flagged as placeholder. Never runs in production. |
| Build gate | `npm run check:content` fails if any `isPlaceholder` is still `true`, and is wired into `prebuild`. **Launching with dummy content requires a deliberate override**, not an oversight. |
| Structured data | Placeholder reviews are excluded from `Review`/`AggregateRating` JSON-LD. Publishing fake ratings to Google is a search-penalty and compliance risk that a visual ribbon wouldn't cover. |

Before/after dummy pairs are generated from the supplied body imagery — the "before" plate is a softened, desaturated derivative of the "after" — so the drag-reveal genuinely demonstrates. No real patient is depicted.

**Still worth saying once:** UAE consumer-protection and DHA health-advertising rules apply to published patient testimonials and before/after imagery. The guards above mean the page can't accidentally go live with dummy content, and real reviews drop in as a text edit.

### 7.3 Still open

4. **Clinic street address.** Name confirmed (*Kasaesthetic Clinic*); no Dubai address verifiable from public sources. Needed for the map pin, footer, and `MedicalBusiness` structured data. Deliberately left blank rather than guessed.
5. **Trust-strip statistics** are not supplied. → Placeholders, flagged in-code with `// TODO: real figure`.
6. **Form destination** is undefined. → Ships with a validated API route that logs and returns success, plus a WhatsApp deep-link fallback that works today. Wiring it to Resend / a CRM / an inbox is a 15-minute change once you choose.
7. **Consultation hours** for the map details card.
8. **English only** for v1. Structure supports adding Arabic later.

Full checklist: [`docs/open-questions.md`](docs/open-questions.md)

---

## 8. Companion Documents

| Document | Contents |
|---|---|
| [`docs/design-system.md`](docs/design-system.md) | Full token reference, type scale, spacing, motion values, component specs |
| [`docs/content-map.md`](docs/content-map.md) | Every line of source copy mapped to its section, plus all new copy written for the page |
| [`docs/adding-a-landing-page.md`](docs/adding-a-landing-page.md) | The step-by-step recipe for building landing page #2 on this foundation |
| [`docs/open-questions.md`](docs/open-questions.md) | Prioritised list of assets and decisions needed from the client |
