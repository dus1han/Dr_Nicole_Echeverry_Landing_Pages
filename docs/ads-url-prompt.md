# Retrofit prompt — URL, indexing and Google Ads readiness

For an **existing** Next.js project that is about to run Google Ads, and is being previewed
on an IP or staging address before its real domain is live.

Paste everything between the rules into a session opened in that project.

The reference implementation is included because the subtle part is not writing it — it is
knowing *which* of these is a build-time value, *why* AdsBot is an exception, and *which
default is the safe one*. Those three are the whole point.

---

This project is about to run Google Ads. It is currently served from
**[e.g. `http://1.2.3.4:3101` — a bare IP over plain HTTP]** and its real address will be
**[e.g. `https://book.example.com`]**, which does not exist yet.

Audit and fix how it handles its own public URL. Four requirements.

## 1 · One origin, and it is a build-time value

Find every hardcoded hostname — typically `app/sitemap.ts`, `app/robots.ts`,
`metadataBase` in `app/layout.tsx`, and any JSON-LD helper. Replace them with a single
exported constant fed by a `SITE_URL` environment variable.

**Pass it as a Docker build arg, not a runtime environment variable**, and make the
comments say why. `sitemap.xml`, `robots.txt` and page metadata are statically prerendered
during `next build`, so the origin is compiled into the output. Setting `SITE_URL` on the
running container looks authoritative and changes nothing — verify this yourself before
believing it, by setting it at runtime and re-reading `/sitemap.xml`.

Consequence to document: changing the hostname is a **rebuild**, not a restart.

## 2 · Derive indexing from the origin — do not add a flag

The site is publicly reachable right now. If `robots.txt` says `Allow`, Google can index it
at an address that will stop existing, and on launch day the real domain competes with that
copy for the same content. Removing a page from the index afterwards is slow and manual.

A real deployment is HTTPS on a hostname. **A bare IP, a port, plain HTTP, or nothing
configured is a preview and must be `noindex` plus a `robots.txt` disallow.**

Derive this from `SITE_URL`. Do not introduce a separate `PRODUCTION=true` flag: that is
one more thing to set correctly under time pressure, and it fails silently in exactly the
situation where nobody is checking. The origin already carries the answer, so the day the
variable becomes a real HTTPS domain, indexing switches on by itself.

**Unset must mean noindex.** A fallback origin exists so URLs are well-formed, not as a
claim that the site is launched.

## 3 · Allow AdsBot explicitly, in both states

Google Ads crawls landing pages with AdsBot to assess quality and policy. An ad whose
destination it cannot fetch is disapproved as *destination not crawlable* — that stops the
campaign, not just the SEO.

`AdsBot-Google` and `AdsBot-Google-Mobile` ignore `User-agent: *` by design, so the
disallow above does not actually block them. **State the exception anyway.** The behaviour
is non-obvious, and someone tightening `robots.txt` later would otherwise take the ads down
with no way of knowing.

Serving ads and being indexed are unrelated: a `noindex` page runs ads perfectly well.

## 4 · Warn when the origin is wrong or missing

Both failure directions are invisible from looking at the page, so make the deploy say so:

- **Missing** — the build is `noindex` and will never appear in search. Correct while
  previewing; wrong the moment it launches.
- **Stale** — someone changed the variable and expected a restart to apply it, so every
  canonical URL and sitemap entry still points at the old host.

Print what the image was actually built with on every deploy, and warn when it disagrees
with the configured value.

## Reference implementation

`lib/site-url.ts`:

```ts
const CONFIGURED = (process.env.SITE_URL || '').trim();

/** No trailing slash, or every generated URL gets a double one. */
export const ORIGIN = (CONFIGURED || 'https://fallback.example.com').replace(/\/+$/, '');

export const INDEXABLE = (() => {
  // Nothing configured means nobody has said where this is served from, which
  // is not a state to start inviting Google into.
  if (!CONFIGURED) return false;
  try {
    const { protocol, hostname } = new URL(ORIGIN);
    if (protocol !== 'https:') return false;
    // IPv4 literal, or IPv6 in brackets — never a production hostname.
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith('[')) return false;
    return hostname.includes('.');
  } catch {
    return false;
  }
})();
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';
import { ORIGIN, INDEXABLE } from '@/lib/site-url';

const ADS_BOTS = ['AdsBot-Google', 'AdsBot-Google-Mobile'];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return {
      rules: [
        { userAgent: '*', disallow: '/' },
        { userAgent: ADS_BOTS, allow: '/' },
      ],
    };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      { userAgent: ADS_BOTS, allow: '/' },
    ],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
```

`app/layout.tsx` — belt and braces with `robots.txt`, because a disallowed URL discovered
elsewhere can still be *listed* without being fetched; the meta tag is what keeps it out
of results:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  robots: { index: INDEXABLE, follow: INDEXABLE },
};
```

`Dockerfile`, in the builder stage:

```dockerfile
ARG SITE_URL=""
ENV SITE_URL=$SITE_URL
```

CI, wherever the image is built:

```yaml
build-args: |
  SITE_URL=${{ vars.SITE_URL }}
```

A repository **variable**, not a secret — it is the site's own public address.

## Verify by building, not by reading

Build the image three times and read the real output each time. Do not report this as done
on the basis of the code looking right:

| `SITE_URL` | `robots.txt` | meta robots | page |
|---|---|---|---|
| unset | `Disallow: /` + AdsBot allow | `noindex, nofollow` | 200, form works |
| `http://<ip>:<port>` | `Disallow: /` + AdsBot allow | `noindex, nofollow` | 200, form works |
| `https://real.host` | `Allow: /` + sitemap | `index, follow` | 200, form works |

`curl` the container for `/robots.txt`, `/sitemap.xml` and the page's
`<meta name="robots">`. The page must serve identically in all three — the origin changes
what the site *advertises about itself*, never whether it works.

## Then tell me, in plain terms

Whether ads can point at the current address, and what has to be true first.

---

## What the answer to that last question was here

**No — do not run ads on an IP.** Google Ads rejects IP-address final URLs, and a form
collecting a name, phone number and medical interest over plain HTTP shows *"Not secure"*
in Chrome. That is a conversion problem before it is a policy problem.

**Naming matters if more campaigns are coming.** A campaign-named subdomain forces
`mommymakeover.example.com/mommy-makeover` — redundant as a display URL, and every new
campaign then needs its own DNS record and proxy block. A generic one —
`book.example.com/mommy-makeover`, `book.example.com/breast-augmentation` — is one record,
one container, unlimited pages. Avoid `go.` and `lp.`: the first reads as a redirect or
tracker, the second is internal jargon, and both quietly undercut trust in a medical ad.
The display URL in the ad does not have to match the real path, so the path can stay tidy.

**Order before spending:** DNS → TLS → `SITE_URL` set and rebuilt → GTM and the conversion
action tested with Tag Assistant → *then* point ads at it. Spend that happens before
conversion tracking works is spend Google cannot learn from, and it cannot be backfilled.
