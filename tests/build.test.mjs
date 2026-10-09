// Builds the site into a temporary folder and checks the result a visitor and a crawler would get.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, cp, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build.mjs';
import { loadContent } from '../scripts/lib/content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let work, html, content, result;

before(async () => {
  work = await mkdtemp(path.join(tmpdir(), 'portfolio-test-'));
  content = await loadContent(path.join(ROOT, 'content'));
  result = await build({ outDir: path.join(work, 'dist') });
  html = await readFile(path.join(work, 'dist', 'index.html'), 'utf8');
});
after(() => rm(work, { recursive: true, force: true }));

const text = (source) => source.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

test('the page has one h1 and a section for every entry in site.json', () => {
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  for (const id of content.site.sections) assert.ok(html.includes(`<section class="block" id="${id}">`), `section ${id} is missing`);
});

test('content from every JSON file reaches the HTML without needing scripts', () => {
  const visible = text(html);
  const expected = [
    content.profile.name, content.profile.email, content.hero.tagline, content.about.quote,
    ...content.hero.clients.names,
    ...content.projects.items.flatMap((p) => [p.title, ...p.highlights, ...p.metrics.map((m) => m.label)]),
    ...content.results.items.map((r) => r.title),
    ...content.experience.items.flatMap((e) => [e.title, e.organisation, e.period]),
    ...content.skills.items.map((s) => s.name),
    ...content.certifications.items.map((c) => c.title),
    ...content.services.items.flatMap((s) => [s.title, ...s.points]),
  ];
  for (const value of expected) assert.ok(visible.includes(value), `"${value}" is not in the page`);
});

test('nothing is left unrendered', () => {
  const visible = text(html);
  assert.ok(!/\bundefined\b|\[object Object\]|\bNaN\b/.test(visible), 'found undefined, NaN or [object Object] in the page');
  assert.ok(!/\{[a-zA-Z]+\}/.test(visible), 'found an unresolved {token} in the page');
  assert.ok(!/\*[^*\s][^*]*\*|__[^_]+__/.test(visible), 'found unrendered *muted* or __gradient__ syntax in the page');
});

test('head tags come from site.json', () => {
  assert.ok(html.includes(`<html lang="${content.site.language}">`));
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.ok(html.includes('<meta name="description" content="'));
  if (content.site.url) assert.ok(html.includes(`<link rel="canonical" href="${content.site.url.replace(/\/?$/, '/')}">`), 'canonical link uses site.url');
  else assert.ok(!html.includes('rel="canonical"'), 'no canonical link is written while site.url is empty');
});

test('the link preview image is announced when one is set', async () => {
  const { url, socialImage } = content.site;
  if (url && socialImage) {
    const image = url.replace(/\/?$/, '/') + socialImage;
    assert.ok(html.includes(`<meta property="og:image" content="${image}">`), 'og:image points at the public address');
    assert.ok(html.includes(`<meta name="twitter:image" content="${image}">`));
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
    await access(path.join(work, 'dist', socialImage));
  } else {
    assert.ok(!html.includes('og:image'), 'no og:image without an address and an image');
    assert.ok(html.includes('<meta name="twitter:card" content="summary">'));
  }
});

test('the day / night switch is in the header and a saved choice is applied before first paint', async () => {
  const { toDark, toLight } = content.site.navigation.theme;
  assert.match(html, new RegExp(`<button class="theme-btn" id="themebtn" type="button" hidden aria-label="${toDark}"`), 'the switch stays hidden until its script runs');
  const data = JSON.parse(html.match(/<script type="application\/json" id="page-data">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(data.theme, { toDark, toLight });
  const boot = html.indexOf("localStorage.getItem('theme')");
  assert.ok(boot > 0 && boot < html.indexOf('rel="stylesheet" href="assets/'), 'the saved theme is read before the stylesheet loads');
  const css = await readFile(path.join(work, 'dist', result.assets.css), 'utf8');
  assert.ok(css.includes(':root[data-theme=dark]') || css.includes(':root[data-theme="dark"]'), 'night colours can be forced');
  assert.ok(css.includes(':root:not([data-theme=light])') || css.includes(':root:not([data-theme="light"])'), 'day mode can be forced on a dark device');
});

test('structured data and page data are valid JSON', () => {
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld.mainEntity.name, content.profile.name);
  assert.equal(ld.mainEntity.knowsAbout.length, content.skills.items.length);
  const data = JSON.parse(html.match(/<script type="application\/json" id="page-data">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(data.roles, content.hero.roles);
  assert.equal(data.skills.items.length, content.skills.items.length);
});

test('every local file the page refers to exists in the build', async () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]).filter((ref) => !/^(https?:|mailto:|data:)/.test(ref));
  assert.ok(refs.length > 5);
  for (const ref of new Set(refs)) await access(path.join(work, 'dist', ref));
  for (const item of content.skills.items) if (item.logo) await access(path.join(work, 'dist', 'logos', `${item.logo}.svg`));
});

test('CSS and JS are fingerprinted so they can be cached forever', () => {
  assert.match(result.assets.css, /^assets\/styles-[A-Z0-9]+\.css$/);
  assert.match(result.assets.js, /^assets\/app-[A-Z0-9]+\.js$/);
});

test('editing a JSON file changes the page, and setting the address adds canonical and sitemap', async () => {
  const contentDir = path.join(work, 'content');
  await cp(path.join(ROOT, 'content'), contentDir, { recursive: true });
  const hero = JSON.parse(await readFile(path.join(contentDir, 'hero.json'), 'utf8'));
  hero.tagline = 'A tagline written by the test.';
  await writeFile(path.join(contentDir, 'hero.json'), JSON.stringify(hero));
  const site = JSON.parse(await readFile(path.join(contentDir, 'site.json'), 'utf8'));
  site.url = 'https://example.com';
  await writeFile(path.join(contentDir, 'site.json'), JSON.stringify(site));

  const outDir = path.join(work, 'dist-edited');
  await build({ contentDir, outDir });
  const edited = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.ok(edited.includes('A tagline written by the test.'));
  assert.ok(!edited.includes(content.hero.tagline));
  assert.ok(edited.includes('<link rel="canonical" href="https://example.com/">'));
  assert.ok((await readFile(path.join(outDir, 'sitemap.xml'), 'utf8')).includes('<loc>https://example.com/</loc>'));
  assert.ok((await readFile(path.join(outDir, 'robots.txt'), 'utf8')).includes('Sitemap: https://example.com/sitemap.xml'));
});

test('the embed build is one self-contained file', async () => {
  const outDir = path.join(work, 'embed');
  await build({ outDir, embed: true });
  const embed = await readFile(path.join(outDir, 'index.html'), 'utf8');
  assert.ok(embed.startsWith(`<title>${content.site.shortTitle}</title>`));
  assert.ok(!/<link[^>]+assets\//.test(embed) && !/<script[^>]+src=/.test(embed), 'CSS and JS must be inline');
  assert.ok(!/<!doctype|<html|<body/i.test(embed), 'the host supplies the document shell');
});

test('invalid content stops the build with a readable message', async () => {
  const contentDir = path.join(work, 'content-broken');
  await cp(path.join(ROOT, 'content'), contentDir, { recursive: true });
  const projects = JSON.parse(await readFile(path.join(contentDir, 'projects.json'), 'utf8'));
  delete projects.items[0].title;
  await writeFile(path.join(contentDir, 'projects.json'), JSON.stringify(projects));
  await assert.rejects(build({ contentDir, outDir: path.join(work, 'never') }), /projects\.json.*title/s);
});
