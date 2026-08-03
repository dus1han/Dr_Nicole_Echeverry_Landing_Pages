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
