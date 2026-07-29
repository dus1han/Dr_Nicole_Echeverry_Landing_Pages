# Conversion Tracking — GTM + Google Ads

**This is the pattern for every landing page, not just this one.** The code is portable
as written — no slug, domain or tracking ID is hardcoded anywhere in it. To put the same
setup on another project, jump to [§11 Reusing this on another project](#11--reusing-this-on-another-project).

**No Google Ads or GA4 identifier lives in this repository.** The site only announces
*"a lead was submitted"*; GTM decides who hears about it. Adding Meta Pixel, TikTok or
GA4 later needs no code change and no deploy.

### How it works in one picture

```
Ad click  →  /<slug>?gclid=…
                │  ClickIdCapture stores the click ID (90 days)
                ▼
           form submit
                │  POST /api/consultation
                │  on success: sessionStorage flag, then a real navigation
                ▼
        /<slug>/thank-you
                │  LeadEvent reads the flag, clears it, and pushes:
                │     { event: 'generate_lead', form_name, form_location }
                ▼
        GTM trigger: Custom Event = generate_lead
                │
                ▼
        Google Ads conversion  (matched to the click via Conversion Linker)
```

### The files involved

| File | Role |
|---|---|
| `lib/analytics.ts` | dataLayer helper, storage keys, click-ID capture/read |
| `components/analytics/Gtm.tsx` | Container script + `<noscript>`. Renders nothing without an ID |
| `components/analytics/ClickIdCapture.tsx` | Stores `gclid` / `wbraid` / `gbraid` on landing |
| `components/analytics/LeadEvent.tsx` | Fires the event once on the thank-you page |
| `app/<slug>/thank-you/page.tsx` | The confirmation screen, `noindex` |
| `components/sections/BookingForm.tsx` | Sets the flag, then navigates |
| `.github/workflows/deploy.yml` | Passes the ID as a build arg; fails if it is missing |

---

## 1 · Create the GTM container

1. Go to [tagmanager.google.com](https://tagmanager.google.com) and sign in with the
   Google account that owns (or will own) the Google Ads account.
2. **Create Account**
   - Account Name: `Dr. Nicole Echeverry`
   - Country: `United Arab Emirates`
   - Container name: `dranicolecheverry.com`
   - Target platform: **Web**
3. **Create** → accept the terms.
4. A dialog appears with two code snippets. **Ignore them — both are already in the
   site.** You only need the ID at the top: `GTM-XXXXXXX`. Copy it.

---

## 2 · Switch it on in GitHub

The ID lives in the **repository**, not in the code and not on the server. Set it once
and every future deploy picks it up automatically — pushing code never changes or clears
it.

1. Go to the repo on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Open the **Variables** tab (*not* Secrets — this value ships to the browser anyway,
   so there is nothing to hide, and Variables are readable in logs which makes them far
   easier to debug)
4. **New repository variable**

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` |

5. **Add variable**
6. **Actions** tab → **Build and deploy** → **Run workflow** → **Run workflow**

> ⚠️ **Step 6 is not optional.** `NEXT_PUBLIC_*` variables are compiled into the
> JavaScript at build time, not read at runtime. Saving the variable changes nothing
> until a new build runs. Restarting the container does nothing either — the old value
> is already inside the image.

**Verify it worked:** open the live page, view source (Ctrl-U), search for `GTM-`.
You should see your ID. If not, the rebuild hasn't happened.

### Deploying without it

**A missing GTM ID does not block anything.** The workflow logs a warning and carries on.
`components/analytics/Gtm.tsx` returns `null` when the variable is unset, so the container
script never renders — no requests, no errors, no console noise. The site is byte-for-byte
a normal site that happens to have no analytics.

This is deliberate: tracking is a marketing concern, and a marketing concern should never
be able to take the clinic's page offline. The warning exists only because the failure is
otherwise invisible — the site looks perfect and simply never reports a conversion.

### Building with it outside CI

If you build the image by hand on the server:

```bash
docker build --build-arg NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX -t dr-nicole-mommy-makeover:latest .
```

Omit the flag and you get the same no-analytics build described above.

---

## 3 · What the site sends

On a successful submission the visitor is taken to
`/mommy-makeover/thank-you`, and this is pushed to the dataLayer:

```js
{
  event: 'generate_lead',
  form_name: 'consultation_request',
  form_location: 'mommy-makeover'
}
```

That is the whole contract. Build every tag against it.

---

## 4 · Create the conversion action in Google Ads

1. Google Ads → **Goals → Conversions → Summary → + New conversion action**
2. Choose **Website**
3. Enter `dranicolecheverry.com` → **Scan**
4. When the scan finishes, choose **+ Add a conversion action manually**
5. Fill in:

   | Field | Value |
   |---|---|
   | Goal and action optimisation | **Submit lead form** |
   | Conversion name | `Consultation request` |
   | Value | *Don't use a value* — or set one if the clinic knows a lead's worth |
   | Count | **One** ← important; a person only becomes a patient once |
   | Click-through conversion window | 30 days |
   | Attribution model | Data-driven |

6. **Done → Save and continue**
7. On the next screen choose **Use Google Tag Manager**
8. It shows a **Conversion ID** (`AW-…`) and a **Conversion label**. Keep this tab open —
   you need both in the next step.

---

## 5 · Create the trigger in GTM

**Triggers → New → Trigger Configuration → Custom Event**

| Field | Value |
|---|---|
| Event name | `generate_lead` |
| This trigger fires on | All Custom Events |

Name it `Lead — generate_lead` → **Save**.

---

## 6 · Create the two tags in GTM

### a. Conversion Linker — do not skip this

**Tags → New → Tag Configuration → Conversion Linker**
**Trigger:** All Pages. Name it `Google Ads — Conversion Linker` → Save.

Without it Google Ads cannot read the click ID stored when the visitor arrived, so
conversions get attributed to "direct" rather than to the ad that paid for them. It is
the single most commonly forgotten tag in a Google Ads setup, and everything appears to
work while quietly mis-attributing.

### b. Google Ads Conversion Tracking

**Tags → New → Tag Configuration → Google Ads Conversion Tracking**

| Field | Value |
|---|---|
| Conversion ID | from step 4 |
| Conversion Label | from step 4 |

**Trigger:** `Lead — generate_lead`. Name it `Google Ads — Consultation Lead` → Save.

### c. GA4 event (optional)

**Tag type:** Google Analytics: GA4 Event · **Event name:** `generate_lead` · same
trigger. GA4 already treats `generate_lead` as a recommended event name, so it reports
without any custom configuration.

---

## Why a custom event, not a URL rule

You *can* point Google Ads at "any page load where the URL contains `/thank-you`", and
that will work. It also counts a conversion every time someone refreshes, presses back,
or opens a shared link.

The site sets a one-time flag on submit which the thank-you page reads, fires the event,
and clears. **One conversion per genuine enquiry.** Inflated counts are worse than no
counts — Google's bidding optimises toward whatever you report, so false positives spend
the budget in the wrong direction.

The URL still exists and is still testable, so a URL rule remains available if you prefer
it. The event is simply more accurate.

---

## 7 · Test before publishing

1. In GTM click **Preview** (top right)
2. Enter `https://dranicolecheverry.com/mommy-makeover` → **Connect**
3. The site opens in a new tab with Tag Assistant attached
4. Fill in the three fields and submit a real test enquiry
5. Switch to the Tag Assistant tab. In the left-hand event stream you should see:

   ```
   Container Loaded        → Conversion Linker fired
   generate_lead           → Google Ads — Consultation Lead fired
   ```

6. Click the `generate_lead` event → **Tags Fired** must list the conversion tag
7. **Now refresh the thank-you page.** No new `generate_lead` should appear — this is the
   guard against double-counting, and it is the step most people skip

If `generate_lead` never appears, the container isn't on the page — go back to step 2 and
confirm the redeploy happened.

---

## 8 · Publish

GTM → **Submit** → name the version (e.g. `Google Ads lead conversion`) → **Publish**.

Nothing is live until you publish. Preview mode only affects your own browser.

---

## 9 · Confirm in Google Ads

**Goals → Conversions** — the action's status moves from *"No recent conversions"* to
*"Recording conversions"*.

This can take **3–24 hours**. Do not judge the setup by this on the first day; Tag
Assistant in step 7 is the reliable signal.

---

## 10 · Automated check

```bash
node scripts/check-conversion-flow.mjs http://localhost:3000
```

Verifies click-ID capture (including the iOS `wbraid` / `gbraid` variants), the redirect,
the click ID reaching the API, the event firing exactly once with context, the flag
clearing, that neither a refresh nor a direct visit fires anything, and that the
thank-you page is `noindex`. 10 checks.

Run it after any change to the form or the thank-you page.

---

## Click IDs are already being captured

`gclid` — plus `wbraid` and `gbraid`, which Google substitutes on iOS — is read from the
landing URL, stored for 90 days, and submitted with the enquiry.

Nothing uses it yet. It is there so the clinic can later import **offline conversions**:
telling Google Ads which enquiries became real consultations. That is the difference
between bidding for form fills and bidding for patients, and it cannot be backfilled —
the click ID has to be captured at the time.

---

## 11 · Reusing this on another project

The tracking code is deliberately free of project-specific values. Copying it is a file
copy plus two props.

### a. Copy these files unchanged

```
lib/analytics.ts
components/analytics/Gtm.tsx
components/analytics/ClickIdCapture.tsx
components/analytics/LeadEvent.tsx
scripts/check-conversion-flow.mjs
```

Nothing in them mentions a slug, a domain or a tracking ID.

> One thing to check: `lib/analytics.ts` namespaces its storage keys with `nme:`
> (`nme:click-id`, `nme:lead-submitted`). If two of your sites can ever be open in the
> same browser **on the same domain**, give each its own prefix. Different domains are
> already isolated by the browser.

### b. Wire them into the new app

**`app/layout.tsx`** — inside `<body>`, first:

```tsx
<GtmNoScript />
<GtmScript />
<ClickIdCapture />
```

**The form**, on a successful submit — flag, then a *real* navigation:

```tsx
window.sessionStorage.setItem(LEAD_FLAG, '1');
window.location.assign(`/${slug}/thank-you`);
```

**The thank-you page** — `noindex`, and:

```tsx
<LeadEvent formLocation={content.slug} />
```

`formLocation` is what lets one GTM container serve several landing pages and still
report which one produced the lead. Use the slug, or any stable label.

### c. Configuration

| Where | What |
|---|---|
| GitHub → Actions → **Variables** | `NEXT_PUBLIC_GTM_ID` = `GTM-XXXXXXX` |
| Dockerfile | already passes it as `ARG NEXT_PUBLIC_GTM_ID` |
| Workflow | already fails the build if it is unset |

Set the variable **once per repository**. Every later push reuses it automatically —
pushing code never changes or clears it.

### d. In GTM

You can reuse **one container across all the sites** — same `NEXT_PUBLIC_GTM_ID`
everywhere — since every site emits the same `generate_lead` event and distinguishes
itself with `form_location`. To report per-site in Google Ads, add a Data Layer Variable
on `form_location` and put a trigger condition on it.

Use a **separate container per client** when the clients are different businesses with
different Google Ads accounts, or when different people need access. Same tags either
way.

### e. Verify

```bash
node scripts/check-conversion-flow.mjs https://newsite.example.com
```

10 checks. It reads only `#book-form`, the three input names, and the thank-you URL, so
it works against any site built from this template without modification.

---

## Still outstanding

| | |
|---|---|
| 🔴 **Lead delivery** | `deliver()` in `app/api/consultation/route.ts` still only logs. Conversions will be reported for enquiries nobody receives until this is wired to an inbox. |
| 🟡 **Consent Mode v2** | Required for EEA visitors. Without it their conversions may not be counted. Needs a consent banner feeding GTM's consent settings. |
