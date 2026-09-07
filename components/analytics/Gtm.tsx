import Script from 'next/script';

/**
 * Google Tag Manager container.
 *
 * The ID comes from the `id` prop, falling back to NEXT_PUBLIC_GTM_ID. Passing
 * it in keeps the container ID with the client's other settings, where a
 * derived project replaces it rather than inheriting it; the env var still
 * wins when set, so a staging build can point somewhere else. Copying this file
 * into another project and passing nothing still works.
 *
 * With neither, both components render nothing — no network request, no console
 * noise. Nothing else in the codebase needs to know whether analytics is on.
 *
 * No Google Ads or GA4 identifiers live in this repo by design: those are
 * configured inside GTM, so a new pixel never requires a deploy. The container
 * ID is different — it is public by nature, visible in the source of every site
 * that uses GTM.
 */

const resolveId = (id?: string) => process.env.NEXT_PUBLIC_GTM_ID || id || '';

export function GtmScript({ id }: { id?: string }) {
  const GTM_ID = resolveId(id);
  if (!GTM_ID) return null;

  /*
   * `afterInteractive`, and NOT `lazyOnload` — this was measured both ways.
   *
   * The container is by far the heaviest thing on the page and none of it is
   * ours: gtm.js is 148KB, and it then pulls a SEPARATE 187KB gtag.js for each
   * of the two GA4 properties configured inside it. ~524KB of third-party
   * JavaScript against ~144KB for the whole application, and Lighthouse
   * attributes 1,136ms of blocking time to it.
   *
   * Deferring it looks like the obvious fix and makes things worse. On
   * `lazyOnload` the container waits for the load event, so on a real
   * connection the two gtag.js evaluations landed at 8.3s and 10.7s as 411ms
   * and 600ms long tasks — alone, late, with nothing to overlap. Total
   * Blocking Time went from 380ms to 1,076ms and the performance score fell
   * from 79 to 60, because TBT counts every long task between FCP and
   * interactive and pushing the work later only drags interactive out with it.
   *
   * On `afterInteractive` the same work runs early, overlapping hydration that
   * has to happen anyway, and the page settles sooner.
   *
   * The real cost here is not the strategy, it is the payload: TWO GA4
   * properties each loading their own gtag.js. Removing one is worth ~187KB
   * and roughly half that blocking time, and it is a change inside the GTM
   * container rather than in this file.
   */
  return (
    <Script id="gtm-container" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

/**
 * The <noscript> half of the container. Must sit immediately after <body> —
 * without it, visitors with JavaScript disabled are invisible to analytics.
 */
export function GtmNoScript({ id }: { id?: string }) {
  const GTM_ID = resolveId(id);
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
