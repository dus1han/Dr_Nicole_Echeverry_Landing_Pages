/**
 * Launch gate for placeholder content. Wired into `prebuild`.
 *
 * Dummy reviews and before/after photos are fine while the page is being
 * built and reviewed — the risk is that they quietly survive to production.
 * This fails the build while any content block is still flagged
 * `isPlaceholder: true`, so shipping dummy content takes a deliberate
 * override rather than an oversight.
 *
 * To ship anyway (e.g. a client preview deploy):
 *   ALLOW_PLACEHOLDER_CONTENT=1 npm run build
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(HERE, '..', 'content');

const SKIP = new Set(['types.ts', 'site.ts']);

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter(
    (f) => f.endsWith('.ts') && !SKIP.has(f),
  );

  const offenders = [];

  for (const file of files) {
    const source = await readFile(join(CONTENT_DIR, file), 'utf8');
    const lines = source.split('\n');

    lines.forEach((line, i) => {
      if (/isPlaceholder:\s*true/.test(line)) {
        // Walk back to the nearest block key for a useful error message.
        let block = '(unknown block)';
        for (let j = i; j >= 0 && j > i - 40; j--) {
          const m = lines[j].match(/^\s{2}(\w+):\s*\{/);
          if (m) {
            block = m[1];
            break;
          }
        }
        offenders.push({ file, line: i + 1, block });
      }
    });
  }

  if (offenders.length === 0) {
    console.log('✓ content check: no placeholder blocks remain.');
    return;
  }

  const allowed = process.env.ALLOW_PLACEHOLDER_CONTENT === '1';
  const heading = allowed
    ? '⚠ Building WITH placeholder content (ALLOW_PLACEHOLDER_CONTENT=1):'
    : '✗ Build blocked — placeholder content is still present:';

  console.log(`\n${heading}\n`);
  for (const o of offenders) {
    console.log(`    content/${o.file}:${o.line}  →  ${o.block}`);
  }

  if (allowed) {
    console.log('\n  Proceeding because the override is set. Do not deploy this');
    console.log('  build to production traffic.\n');
    return;
  }

  console.log('\n  Replace the dummy content with real, consented material and');
  console.log('  set isPlaceholder: false. See docs/open-questions.md.\n');
  console.log('  To deploy anyway (client preview / staging):\n');
  console.log('    Vercel, Netlify, or any CI:');
  console.log('      add an environment variable  ALLOW_PLACEHOLDER_CONTENT = 1');
  console.log('      (Vercel: Project → Settings → Environment Variables)\n');
  console.log('    Locally:');
  console.log('      ALLOW_PLACEHOLDER_CONTENT=1 npm run build          # bash');
  console.log('      $env:ALLOW_PLACEHOLDER_CONTENT="1"; npm run build  # PowerShell\n');
  console.log('  This gate exists so invented patient reviews cannot reach live');
  console.log('  traffic unnoticed. Setting the variable is a deliberate override.\n');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
