// The shipped content must pass validation, and validation must catch the mistakes it exists for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, validateContent } from '../scripts/lib/content.mjs';
import { SECTIONS } from '../src/templates/page.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = { schemaDir: path.join(ROOT, 'schema'), publicDir: path.join(ROOT, 'public'), sectionIds: Object.keys(SECTIONS) };
const load = () => loadContent(path.join(ROOT, 'content'));

test('shipped content is valid', async () => {
  assert.deepEqual(await validateContent(await load(), options), []);
});

test('a misspelled field is reported', async () => {
  const content = await load();
  content.hero.tagLine = content.hero.tagline;
  delete content.hero.tagline;
  const problems = await validateContent(content, options);
  assert.ok(problems.some((p) => p.includes('hero.json') && p.includes('tagline')), problems.join('\n'));
});

test('a navigation item pointing at a missing section is reported', async () => {
  const content = await load();
  content.site.navigation.items[0].section = 'nowhere';
  const problems = await validateContent(content, options);
  assert.ok(problems.some((p) => p.includes('nowhere')), problems.join('\n'));
});

test('a skill with an unknown family or a missing logo is reported', async () => {
  const content = await load();
  content.skills.items[0].family = 'gardening';
  content.skills.items[1].logo = 'does-not-exist';
  const problems = await validateContent(content, options);
  assert.ok(problems.some((p) => p.includes('gardening')), problems.join('\n'));
  assert.ok(problems.some((p) => p.includes('does-not-exist.svg')), problems.join('\n'));
});

test('two open projects are reported', async () => {
  const content = await load();
  for (const item of content.projects.items) item.open = true;
  const problems = await validateContent(content, options);
  assert.ok(problems.some((p) => p.includes('exactly one project')), problems.join('\n'));
});
