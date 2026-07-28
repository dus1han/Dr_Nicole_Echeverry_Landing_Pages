# Dr. Nicole Echeverry — Landing Pages

Campaign landing pages for Dr. Nicole Echeverry, Plastic, Aesthetic & Reconstructive Surgeon, Dubai.

**Live page:** `/mommy-makeover`
**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion

---

## Quick start

```bash
npm install
npm run assets     # one-time: optimise images, generate the plum logo + dummy before/afters
npm run dev        # http://localhost:3000/mommy-makeover
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `check:content` first) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run assets` | Rebuild `public/` images from the client's source folder |
| `npm run check:content` | Fails if any placeholder content remains |

---

## ⚠ Before this page is advertised to patients

Three content blocks are still placeholders. Every build prints a warning naming them:

```
⚠  Placeholder content is still present:
      content/mommy-makeover.ts:57   →  trust     (the four statistics)
      content/mommy-makeover.ts:232  →  results   (before/after gallery)
      content/mommy-makeover.ts:334  →  reviews   (patient reviews)
```

**The build continues** — no environment variable needed, deploys work out of the box.

Replace them with real, consented material and set `isPlaceholder: false`. Checklist:
[`docs/open-questions.md`](docs/open-questions.md).

### What protects you in the meantime
Placeholder reviews are **excluded from `Review` / `AggregateRating` structured data**
(`lib/schema.ts`), so no fabricated ratings are ever published to Google. That protection
is unconditional and does not depend on the warning above.

### Making it a hard failure
Once real content is in, set `STRICT_CONTENT=1` in your production pipeline. Any
placeholder that reappears then fails the build instead of warning.

```bash
STRICT_CONTENT=1 npm run build            # bash
$env:STRICT_CONTENT="1"; npm run build    # PowerShell
```

**Do not deploy an override build to production traffic.** Replace the content, set
`isPlaceholder: false`, and the gate clears itself. Full checklist:
[`docs/open-questions.md`](docs/open-questions.md).

---

## Editing content

**All copy lives in `content/`. Never type English into `components/`.**

| File | Contains |
|---|---|
| `content/site.ts` | Clinic-wide: phone, email, socials, address, list of landing pages |
| `content/mommy-makeover.ts` | Every string on this page |
| `content/types.ts` | The shared contract each page must satisfy |

Changing the clinic phone number is a one-line edit in `site.ts` — it updates the nav,
footer, map card, every WhatsApp deep link and the structured data at once.

### Adding landing page #2
A new page is **one content file plus a ~20-line route** — no new components, no design
work. Recipe: [`docs/adding-a-landing-page.md`](docs/adding-a-landing-page.md).

---

## Wiring up the booking form

`app/api/consultation/route.ts` validates, rate-limits and logs enquiries, but **no
destination is connected yet** — the client hasn't chosen one. Replace the `deliver()`
function; a Resend example is in the comments. Until then the WhatsApp and phone paths
are the live conversion routes and they work today.

---

## Project structure

```
app/
  layout.tsx                  fonts, global effects, base metadata
  page.tsx                    root index → lists the landing pages
  globals.css                 ALL design tokens + keyframes
  mommy-makeover/
    page.tsx                  composes the sections
    opengraph-image.tsx       generated social card
  api/consultation/route.ts   form handler
content/                      ← per-page copy (see above)
components/
  layout/                     Navbar · Footer · PageShell · FloatingCta · ScrollProgress
  sections/                   the 14 page sections
  ui/                         Button · Field · Reveal · SectionHeading · CheckDraw · …
  effects/                    Aurora · PetalCanvas · Tilt · Magnetic · CountUp · Marquee
lib/                          motion tokens, JSON-LD, validation schema, hooks
scripts/                      asset pipeline, content gate, and dev-only QA tools
docs/                         design system, content map, open questions
```

---

## Rules that keep the design coherent

**1. `--gradient-brand` is decorative. `--gradient-fill` is for white text.**
The brand gradient's lightest stop is near-white — white labels on it are unreadable.
Any surface carrying white text or icons uses `--gradient-fill`, whose every stop clears
4.5:1 against white. There is also `--gradient-text` for gradient-clipped headings, which
drops the pale stops so headings stay legible on a light page.

**2. Above-the-fold entrances must be CSS, not Motion.**
A Motion entrance renders its element at `opacity: 0` and only reveals it after React
hydrates. On a throttled phone that left the hero headline **blank for 4.3 seconds** and
made it the LCP element. The hero is therefore a server component using the `.anim-rise`
/ `.anim-scale-in` CSS classes. Below-the-fold sections may use `Reveal` freely — the user
can't reach them before hydration.

**3. Section spacing lives in one place.**
Every section uses the `section-y` utility in `globals.css` — currently
`clamp(1.75rem, 3.2vw, 2.75rem)` (44px desktop / 28px mobile). It was previously the same
value hardcoded in fourteen files. Retune the whole page from that one line.

**4. Ambient effects are rationed.**
Aurora fields, petal canvases and the grain overlay appear in the hero, *Meet Your Surgeon*
and the closing CTA — nowhere else. Six aurora instances and five canvases across one long
page cost more together than any of them did alone (8.7fps while scrolling). Aurora uses
soft radial-gradients, **never `filter: blur()`**, and animates translate only — never
`scale`, which forces a blurred layer to re-rasterise every frame.

**5. Never put a scroll-triggered wrapper on `display: contents`.**
It generates no box, so its `whileInView` observer never fires and its children stay
invisible. This silently blanked the whole Journey timeline once.

---

## Verified

Measured against the production build, not assumed. Re-run any of these yourself.

| Check | Result | Command |
|---|---|---|
| Core Web Vitals (mobile, 4× CPU, ~1.6 Mbps) | FCP **1.51s** · LCP **1.96s** · CLS **0.007** | `node scripts/measure-perf.mjs <url>` |
| Scroll smoothness (desktop, unthrottled) | **51 fps**, 0.7% frames over budget | `node scripts/check-scroll-perf.mjs <url> 1` |
| Text contrast (AA) | every measurable pair passes at 390 and 1440 | `node scripts/audit-contrast.mjs <url>` |
| Accessibility + reduced-motion + no-JS | all passing | `node scripts/audit-a11y.mjs <url>` |
| Layout stability | page height does not self-shift | `node scripts/check-layout-stability.mjs <url>` |
| Book CTA routing | desktop → section, mobile → form | `node scripts/check-book-anchor.mjs <url>` |
| Types | clean | `npm run typecheck` |
| API route | valid → 200 · invalid → 422 · honeypot → silent 200 | — |

First Load JS for the page is **192 kB** (target was 190 kB — 2 kB over; the overage is
Motion, and the vitals above are comfortably in the green, so it was not worth a
`LazyMotion` refactor).

### Dev-only QA scripts
Not part of the build or deploy; delete them if you'd rather not ship them.

| Script | Purpose |
|---|---|
| `scripts/shoot.mjs <url> <out> [--full]` | Screenshots at 390 / 834 / 1440 |
| `scripts/shoot-sections.mjs <url> <out> <width> [sel]` | Each section captured separately |
| `scripts/measure-perf.mjs <url>` | Core Web Vitals on a throttled mobile profile |
| `scripts/lcp-detail.mjs <url> [cpuRate]` | Which element is the LCP, and when |
| `scripts/audit-a11y.mjs <url>` | Structure, target sizes, reduced motion, no-JS |
| `scripts/audit-contrast.mjs <url> [width]` | Real text-contrast audit against the rendered page |
| `scripts/check-scroll-perf.mjs <url> [cpu] [width]` | Frame pacing while scrolling |
| `scripts/bisect-scroll-perf.mjs <url> [cpu]` | Scroll FPS with each effect disabled, to find the cost |
| `scripts/check-layout-stability.mjs <url> [secs]` | Detects a page that shifts its own height |
| `scripts/check-book-anchor.mjs <url>` | Verifies the mobile/desktop Book destination |
| `scripts/measure-gaps.mjs <url> [width]` | Section padding vs. real empty space |
| `scripts/measure-box.mjs <url> <width> <sel…>` | Geometry for arbitrary selectors |

> **Always measure performance on `next build` + `next start`, never `next dev`.** A dev
> sample once reported a 5.5-second frame that was just Next.js compiling a route.

> If you write your own perf script: **never scroll the page while measuring LCP.**
> LCP keeps updating until real user input, so programmatic scrolling makes every larger
> below-the-fold image re-register as the largest paint. That mistake reported 15.4s here
> when the true figure was under 2s.

---

## Deployment

Vercel is the recommended host (zero config for Next 15). Set the custom domain to
`dranicolecheverry.com`; this page serves at `/mommy-makeover`. Every future landing page
deploys through the same pipeline with no config change.

The clinic map is a **keyless Google Maps embed** — no API key, no billing account, works
the moment it deploys.

### Environment variables

| Key | When | Why |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | To switch on analytics | `GTM-XXXXXXX`. Without it the container never renders — no requests, no errors. See [`docs/conversion-tracking.md`](docs/conversion-tracking.md) |
| `STRICT_CONTENT=1` | Once real reviews and photos are in | Turns the placeholder warning into a build failure, so dummy content can never come back unnoticed |
| `RESEND_API_KEY`, `ENQUIRY_INBOX` | When the form destination is chosen | Whatever the chosen service needs |

**None are required to build or deploy.** Vercel needs no configuration.

---

## Conversion tracking

Built and tested. A successful submission redirects to `/mommy-makeover/thank-you`, which
pushes `generate_lead` to the GTM dataLayer **once** — refreshes, back-navigation and
shared links cannot re-fire it.

No Google Ads or GA4 ID lives in this repo; the marketing team wires tags in GTM against
that event, so new pixels never need a deploy. Google click IDs (`gclid`, and the iOS
`wbraid` / `gbraid` variants) are captured on landing and submitted with the enquiry,
which is what makes offline conversion import possible later.

Full setup guide: [`docs/conversion-tracking.md`](docs/conversion-tracking.md).
Verify with `node scripts/check-conversion-flow.mjs <url>` — 10 checks, all passing.

---

## Documentation

| Document | Contents |
|---|---|
| [`PLAN.md`](PLAN.md) | Strategy, design direction, full page architecture, build sequence |
| [`docs/section-review.md`](docs/section-review.md) | **The client review log** — every change, every bug found, section by section. Read this first to understand why the page looks the way it does |
| [`docs/design-system.md`](docs/design-system.md) | Colour, type, spacing, motion, component specs, contrast audit |
| [`docs/content-map.md`](docs/content-map.md) | Every line of client copy mapped to its section |
| [`docs/adding-a-landing-page.md`](docs/adding-a-landing-page.md) | Recipe for page #2 |
| [`docs/open-questions.md`](docs/open-questions.md) | What's still needed from the client |

---

## Current state

Fifteen sections reviewed with the client. Page height came down from 15,439px to
**10,653px (−31%)** with no content lost.

**Still open before launch** — see [`docs/open-questions.md`](docs/open-questions.md):

| | |
|---|---|
| 🔴 Real patient reviews | Build gate blocks release until supplied |
| 🔴 Real before/after photographs | Same gate |
| 🔴 Form destination | Route is built and validated; needs a target |
| 🟡 Clinic street address | Map now uses exact coordinates, but structured data still wants it |
| ⚠️ Medical disclaimer | Removed from the footer at the client's request; text retained in `site.ts` |
| ⚠️ Consent | Inline statement, no tick-box, at the client's request |

The last two are flagged for the clinic's own legal review — see
[`docs/section-review.md`](docs/section-review.md) §13 and §15.
