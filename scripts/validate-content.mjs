// Checks content/*.json without building. Exits with code 1 when something is wrong.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, validateContent } from './lib/content.mjs';
import { SECTIONS } from '../src/templates/page.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  const content = await loadContent(path.join(ROOT, 'content'));
  const problems = await validateContent(content, { schemaDir: path.join(ROOT, 'schema'), publicDir: path.join(ROOT, 'public'), sectionIds: Object.keys(SECTIONS) });
  if (problems.length) {
    console.error(`Content has ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('Content is valid.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
