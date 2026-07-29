# Reuse prompt — building another landing-page project like this one

Paste everything between the rules below into a fresh session, in an **empty folder** for
the new project. Replace the bracketed parts first.

It is deliberately long. Most of it is not instructions but *constraints already paid
for* — each numbered trap in §8 cost real debugging time on this project, and stating them
up front is the difference between reproducing the result and reproducing the mistakes.

---

You are an expert frontend developer and UI/UX designer. Build a premium landing-page
platform for **[CLIENT — e.g. a plastic surgeon in Dubai]**.

## 1 · What this is

A **multi-landing-page platform**, not a single page. One Next.js app serves every
campaign page for this client at `/<slug>` — `[/first-page]` now, more later. Adding page
two must be a content file, a route, and a push: no new port, container, DNS record or
proxy config.

Structure it as: shared design system + shared shell + shared section components, and one
typed content file per page. Nothing campaign-specific in a component.

First page: **[SLUG]**. Content is in **[PATH TO CONTENT DOC]**. Assets in
**[PATH TO IMAGES]**.

## 2 · Stack

Next.js (App Router) · TypeScript · Tailwind · Motion. Design tokens in CSS, not scattered
through class names. No component library.

## 3 · Design direction

**[e.g. cute pink, calm, premium; audience is women and mothers; must feel reassuring, not
clinical or panicky]**

Rules that are not negotiable:

- **WCAG AA contrast** — 4.5:1 body text, 3:1 large text. Verify with a script you write,
  not by eye. Evaluate text over gradients against *every stop*, not the average.
- **Keep three gradients separate and never interchangeable**: one decorative (may be
  near-white), one fill for white text (every stop ≥4.5:1), one for large display text.
  Merging them is how white labels vanish into a pale background.
- Motion supports comprehension; it never gates content. Respect
  `prefers-reduced-motion`.
- Touch targets ≥24px (WCAG 2.2 SC 2.5.8), interactive ones ≥44px.

## 4 · Performance targets — measure, do not assume

LCP < 2.5s · CLS < 0.1 · scroll ≥ 50fps unthrottled. Write scripts that measure these and
report real numbers. Put the measured figures in the README.

## 5 · Deployment — VPS, Docker, GitHub Actions

Build on GitHub's runners, publish to GHCR, have the VPS pull. One Caddy instance fronts
every site on the server with automatic TLS; each app listens on its own `127.0.0.1:<port>`
and is never directly exposed.

Deliver:

```
Dockerfile                     multi-stage, output: 'standalone', non-root user
docker-compose.yml             IMAGE / CONTAINER_NAME / SITE_PORT / BIND_ADDR from .env
deploy/remote-deploy.sh        what runs on the server — a file, not inline YAML
deploy/Caddyfile.example       reverse proxy + auto-TLS
.github/workflows/deploy.yml   build → GHCR → ssh → pull → restart → wait for healthy
```

**Use plain `ssh`, not a marketplace SSH action.** Pipe `remote-deploy.sh` in over stdin so
it crosses no shell-quoting layer, prepending its inputs as `printf %q` assignments.
Keeping it as a file means it can be run by hand when CI fails — which is the difference
between reading an error and guessing at one.

The deploy must:

- **Ship `docker-compose.yml` from the repo every time.** Left as server state it keeps
  whatever was placed there on day one, and every later change is silently ignored while
  the deploy still reports success.
- **Never ship `.env`** — port and bind address are genuinely per-machine.
- **Wait for the container's `HEALTHCHECK` to report healthy** before reporting success.
  `up -d` returns long before the app is serving.
- **Name the failing value.** A bare `cd $PATH` under `set -e` exits 1 with its message on
  stderr, which CI renders as an exit code and nothing else.
- Run as an **unprivileged `deploy` user** in the `docker` group, with a key used for
  nothing else — never the admin login.

## 6 · Conversion tracking

Google Ads via GTM. On successful submit: set a one-time flag, navigate to a real
`/<slug>/thank-you` page, and push `generate_lead` with `form_name` and `form_location`.

- **No Google Ads or GA4 ID in the repo.** The site announces a lead; GTM decides who
  hears about it. New pixels then need no deploy.
- Fire **once** — a refresh, back-navigation or shared link must not re-fire. Inflated
  counts are worse than none, because bidding optimises toward whatever you report.
- Capture `gclid`, `wbraid` and `gbraid` on landing, store 90 days, submit with the
  enquiry. This enables offline conversion import later and **cannot be backfilled**.
- `NEXT_PUBLIC_GTM_ID` is a build arg from a repository **variable**. A missing value must
  **warn, not fail** — tracking is a marketing concern and must never take the client's
  page offline.

## 7 · The public origin

One `SITE_URL`, fed by a repository variable, used by `sitemap.xml`, `robots.txt`,
canonical tags, OG tags and JSON-LD.

**It is a build arg, not a runtime variable.** Those routes are statically prerendered, so
the origin is compiled in; setting it on the running container does nothing. Changing the
hostname is a rebuild.

**Derive indexing from it.** A real deployment is HTTPS on a hostname; a bare IP, a port,
plain HTTP, or nothing set is a preview and must be `noindex` plus a `robots.txt`
disallow. Do not add a separate "is production" flag — that is one more thing to set
correctly under pressure, and it fails silently exactly when nobody is checking.

**Allow `AdsBot-Google` and `AdsBot-Google-Mobile` explicitly, in both states.** Google Ads
disapproves ads whose destination it cannot crawl. AdsBot ignores `User-agent: *` by
design, so the disallow does not actually block it — but state it, or someone tightening
robots.txt later takes the campaign down without knowing.

## 8 · Traps already paid for — do not rediscover these

1. **Never let a JS-driven entrance animation own the LCP element.** Motion renders
   `opacity: 0` until hydration; a hero headline animated that way stayed blank for 4.3s.
   Server-render the hero and animate with CSS.
2. **`AnimatePresence mode="wait"` between different-height panels shifts the page.** Stack
   every panel in one grid cell (`col-start-1 row-start-1`) so the tallest sets the height.
3. **A `display: contents` wrapper generates no box**, so `whileInView` on it never fires.
4. **Variant propagation does not cross arbitrary wrapper components.** Nested reveal
   children need to trigger themselves.
5. **`next/link` calls `preventDefault` first.** Overriding anchor behaviour needs a
   capture-phase listener.
6. **Never scroll while measuring LCP** — it ends the observation and reports nonsense.
7. **Scroll jank is cumulative, not one culprit.** Bisect it. `filter: blur()` on large
   elements is the usual cost; radial-gradients are far cheaper. Cap the number of
   simultaneous canvases and grain layers.
8. **Eyebrow//kicker labels are where contrast fails.** A muted gold on a pale tint reads
   as 2.29:1 and looks fine to the eye.
9. **`sharp` is loaded at runtime and missed by the standalone tracer.** Add it to
   `outputFileTracingIncludes` or the container starts clean and fails on the first image.
10. **`.dockerignore` must not exclude `scripts/`** if `prebuild` runs one.
11. **GHCR lowercases the image name; repository names are often not lowercase.** Docker
    rejects uppercase in references, and the mismatch surfaces as an opaque
    `docker compose pull` failure.
12. **A placeholder-content gate should warn and continue by default**, with a strict mode
    behind an env var. A hard gate blocks deploys at the worst moment.
13. **Never run `next build` while `next dev` is running** — they share `.next` and produce
    phantom failures.
14. **Keep a port register** in the deployment doc. Two projects on one port means the
    second container silently fails to start and the old one keeps serving.

## 9 · Verification — build the tooling, do not eyeball it

Write scripts that check contrast, accessibility, layout stability, scroll fps, Core Web
Vitals, the no-JS experience, and the full conversion flow end to end. Run them and report
real numbers. **When a check disagrees with your assumption, believe the check** — the
value of writing them is that they catch you, not the user.

## 10 · Documentation

`README.md` (quick start, editing content, verified numbers, QA scripts),
`docs/deployment.md` (ordered runbook, plus a short version for the next project),
`docs/conversion-tracking.md` (click-by-click GTM and Google Ads setup),
`docs/design-system.md` (tokens, contrast audit, motion budget),
`docs/open-questions.md` (what you still need from the client).

Write down **why**, not what. The reader can see what the code does.

## 11 · How to work

Plan first and show me the plan. Then build in phases and let me review **section by
section** — I will give feedback on spacing, colour and copy as we go, and I expect it
applied consistently across every section afterwards.

Ask me about: real vs placeholder reviews and photographs, name spelling, whether to show
a map, and where form submissions should be delivered. Use dummy content where I say so,
and make it obvious in the code that it is dummy.

## 12 · What I will give you when it is time to deploy

VPS host and credentials, the subdomain, and the GitHub repo. Until the subdomain exists,
serve on the IP with a temporary public bind, keep the build `noindex`, and tell me plainly
that it is HTTP without a certificate.

---

## Using this on a second project

Once the new project exists, the deployment side is mostly copy-paste — see
[`deployment.md` §6](deployment.md), which distinguishes *another page for the same
client* (a route and a push) from *another project* (its own port, hostname and stack).
The tracking side is [`conversion-tracking.md` §11](conversion-tracking.md); every file
there is free of slugs, domains and IDs by design.

Shared across projects on one server: Docker, the `/opt/sites` layout, Caddy, the `deploy`
user and its key, the firewall. Per project: a port, a DNS record, a Caddy block, a site
directory with its `.env`, and four GitHub secrets.
