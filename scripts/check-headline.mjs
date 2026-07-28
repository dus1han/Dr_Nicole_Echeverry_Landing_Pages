/** Dev aid: is the hero focal line actually animating, and does it degrade? */
import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch();

async function inspect(reducedMotion) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const el = document.querySelector('h1 .anim-headline');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const anims = el.getAnimations().map((a) => ({
      name: a.animationName ?? '(css)',
      state: a.playState,
    }));
    return {
      text: el.textContent.trim(),
      clipped: cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text',
      bgSize: cs.backgroundSize,
      animations: anims,
    };
  });

  await page.close();
  return info;
}

const normal = await inspect(false);
const reduced = await inspect(true);

console.log('\nHero focal line\n');
console.log(`  text            : "${normal.text}"`);
console.log(`  clipped to text : ${normal.clipped}`);
console.log(`  background-size : ${normal.bgSize}`);
console.log(`  animations      : ${JSON.stringify(normal.animations)}`);
console.log(`\n  prefers-reduced-motion:`);
console.log(`  animations      : ${JSON.stringify(reduced.animations)}`);

const ok = normal.animations.some((a) => a.state === 'running');
const reducedOk = !reduced.animations.some((a) => a.state === 'running');
console.log(
  `\n  ${ok ? '✓' : '✗'} sheen running normally    ${reducedOk ? '✓' : '✗'} halted under reduced motion\n`,
);

await browser.close();
process.exit(ok && reducedOk ? 0 : 1);
