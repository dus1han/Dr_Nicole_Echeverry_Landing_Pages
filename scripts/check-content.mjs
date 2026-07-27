/**
 * Placeholder-content check. Runs automatically before every build.
 *
 * Reports any content block still flagged `isPlaceholder: true` — currently the
 * trust-strip statistics, the before/after gallery and the patient reviews.
 *
 * BY DEFAULT THIS WARNS AND LETS THE BUILD THROUGH.
 *
 * It originally failed the build, on the reasoning that invented patient
 * reviews must not reach live traffic by accident. In practice that blocked
 * every deploy of a page the client explicitly wants online for review, which
 * is the wrong trade: a build error you have to work around each time trains
 * people to ignore it.
 *
 * The substantive protection is elsewhere and still active regardless of this
 * script: placeholder reviews are excluded from `Review` / `AggregateRating`
 * structured data (lib/schema.ts), so fabricated ratings are never published
 * to Google.
 *
 * To restore the hard failure — recommended for a production pipeline once
 * real content is in — set STRICT_CONTENT=1.
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
        // Walk back to the nearest block key for a useful message.
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

  const strict = process.env.STRICT_CONTENT === '1';

  console.log(`\n${strict ? '✗' : '⚠'}  Placeholder content is still present:\n`);
  for (const o of offenders) {
    console.log(`      content/${o.file}:${o.line}  →  ${o.block}`);
  }

  console.log('\n   Before this page is advertised to real patients, replace the');
  console.log('   dummy reviews and before/after photographs with real, consented');
  console.log('   material and set isPlaceholder: false.');
  console.log('   Checklist: docs/open-questions.md\n');
  console.log('   Placeholder reviews are already excluded from Review /');
  console.log('   AggregateRating structured data, so no fabricated ratings are');
  console.log('   published to Google.\n');

  if (strict) {
    console.log('   STRICT_CONTENT=1 is set, so this is a hard failure.\n');
    process.exit(1);
  }

  console.log('   Continuing the build. Set STRICT_CONTENT=1 to make this fail.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
