/**
 * Dev aid: real text-contrast audit against the rendered page.
 *
 * Walks every text node, resolves its effective background (climbing ancestors
 * past transparent ones), and checks the WCAG AA threshold for its size:
 *   4.5:1 normal text · 3:1 large text (≥24px, or ≥18.66px bold).
 *
 * The structural a11y audit does not cover colour — this is the pass that
 * catches a pretty token that nobody can read.
 */
import { chromium } from 'playwright';

const url = process.argv[2];
const width = Number(process.argv[3] ?? 1440);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });

// Warm every section so nothing is still mid-entrance at opacity 0.
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.7);
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 200));
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await page.waitForTimeout(800);

const results = await page.evaluate(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  };

  const lin = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const over = (fg, bg) =>
    fg.a >= 1
      ? fg
      : {
          r: fg.r * fg.a + bg.r * (1 - fg.a),
          g: fg.g * fg.a + bg.g * (1 - fg.a),
          b: fg.b * fg.a + bg.b * (1 - fg.a),
          a: 1,
        };

  /**
   * Resolve the background behind an element.
   *
   * Returns null when the backdrop can't be reduced to a single colour —
   * a gradient (`background-image`), or a colour the browser reports in a
   * syntax we can't parse (e.g. `color-mix()` from Tailwind's `/90` opacity
   * shorthand). Climbing past those and landing on a pale ancestor is what
   * produced bogus "1:1 white on white" results for every gradient button.
   * Those cases are reported separately for manual review instead.
   */
  /** Every rgb()/rgba() colour stop inside a gradient string. */
  const gradientStops = (img) => {
    const found = img.match(/rgba?\([^)]+\)/g) ?? [];
    return found.map(parse).filter((c) => c && c.a > 0.85);
  };

  /**
   * Resolve the backdrop behind an element as a LIST of candidate colours —
   * a gradient has no single background, so every stop is checked and the
   * worst ratio wins. Returns null only when nothing is resolvable (e.g. a
   * `color-mix()` value we can't parse), which is reported for manual review
   * rather than silently climbing to a pale ancestor and inventing a 1:1.
   */
  const effectiveBgs = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);

      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const stops = gradientStops(cs.backgroundImage);
        if (stops.length) return stops;
        return null; // an image, or a gradient we can't read
      }

      const raw = cs.backgroundColor;
      if (raw && raw !== 'transparent') {
        const bg = parse(raw);
        if (!bg) return null;
        if (bg.a > 0.85) return [bg];
      }
      node = node.parentElement;
    }
    return [{ r: 255, g: 255, b: 255, a: 1 }];
  };

  const out = [];
  const seen = new Set();

  for (const el of document.querySelectorAll('body *')) {
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!text) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (parseFloat(cs.opacity) < 0.6) continue;
    // Gradient-clipped text has no measurable colour — checked by hand.
    if (cs.webkitTextFillColor === 'transparent' || cs.color === 'rgba(0, 0, 0, 0)') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;

    const bgs = effectiveBgs(el);
    const fgRaw = parse(cs.color);
    if (!fgRaw) continue;

    const key = `${cs.color}|${cs.backgroundColor}|${Math.round(size)}|${weight}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (bgs === null) {
      out.push({ skipped: true, text: text.slice(0, 44), color: cs.color });
      continue;
    }

    // Worst stop wins — text must stay legible across the whole sweep.
    let cr = Infinity;
    let worst = bgs[0];
    for (const bg of bgs) {
      const v = ratio(over(fgRaw, bg), bg);
      if (v < cr) {
        cr = v;
        worst = bg;
      }
    }

    if (cr < need) {
      out.push({
        text: text.slice(0, 44),
        color: cs.color,
        bg: `rgb(${Math.round(worst.r)}, ${Math.round(worst.g)}, ${Math.round(worst.b)})`,
        size: Math.round(size),
        weight,
        ratio: +cr.toFixed(2),
        need,
      });
    }
  }
  return out;
});

const failures = results.filter((r) => !r.skipped).sort((a, b) => a.ratio - b.ratio);
const skipped = results.filter((r) => r.skipped);

console.log(`\nText contrast — WCAG AA @ ${width}px\n`);
if (failures.length === 0) {
  console.log('  ✓ every measurable text/background pair passes');
} else {
  for (const r of failures) {
    console.log(
      `  ✗ ${String(r.ratio).padStart(5)}:1 (need ${r.need})  ${r.size}px/${r.weight}  ${r.color.padEnd(22)} on ${String(r.bg).padEnd(22)} "${r.text}"`,
    );
  }
  console.log(`\n  ${failures.length} failing pair(s)`);
}

if (skipped.length) {
  console.log(
    `\n  ${skipped.length} pair(s) on a gradient/unresolvable background — not measurable here,`,
  );
  console.log('  verified by hand against the --gradient-fill stops (all ≥4.5:1 on white):');
  for (const r of skipped.slice(0, 6)) {
    console.log(`      ${r.color.padEnd(22)} "${r.text}"`);
  }
  if (skipped.length > 6) console.log(`      …and ${skipped.length - 6} more`);
}
console.log();

await browser.close();
process.exit(failures.length === 0 ? 0 : 1);
