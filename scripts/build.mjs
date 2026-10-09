// Builds the site: content/*.json + src/ -> dist/
//   node scripts/build.mjs            full site in dist/
//   node scripts/build.mjs --embed    one self-contained file in dist-embed/ (inline CSS and JS)
// Options: --out <dir>  --content <dir>  --no-minify
import { build as esbuild } from 'esbuild';
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, validateContent } from './lib/content.mjs';
import { renderBody, buildPageData, buildJsonLd, SECTIONS } from '../src/templates/page.mjs';
import { fullDocument, embedDocument } from '../src/templates/document.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function bundle({ outdir, minify, write }) {
  const result = await esbuild({
    entryPoints: { app: path.join(ROOT, 'src/scripts/main.js'), styles: path.join(ROOT, 'src/styles/main.css') },
    bundle: true,
    minify,
    format: 'iife',
    outdir,
    entryNames: write ? 'assets/[name]-[hash]' : '[name]',
    write,
    metafile: true,
    logLevel: 'silent',
    legalComments: 'none',
  });
  return result;
}

/**
 * @param {object} options
 * @param {string} [options.contentDir] folder holding the content JSON files
 * @param {string} [options.outDir]     where to write the result
 * @param {boolean} [options.embed]     write one self-contained fragment instead of a full site
 * @param {boolean} [options.minify]
 */
export async function build({ contentDir = path.join(ROOT, 'content'), outDir, embed = false, minify = true } = {}) {
  const publicDir = path.join(ROOT, 'public');
  outDir ??= path.join(ROOT, embed ? 'dist-embed' : 'dist');

  const content = await loadContent(contentDir);
  const problems = await validateContent(content, { schemaDir: path.join(ROOT, 'schema'), publicDir, sectionIds: Object.keys(SECTIONS) });
  if (problems.length) throw new Error(`Content has ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);

  const body = renderBody(content, { embed });
  const pageData = buildPageData(content);
  const jsonLd = buildJsonLd(content);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  if (embed) {
    const { outputFiles } = await bundle({ outdir: outDir, minify, write: false });
    const text = (suffix) => outputFiles.find((file) => file.path.endsWith(suffix)).text;
    const file = path.join(outDir, 'index.html');
    await writeFile(file, embedDocument({ content, body, pageData, jsonLd, css: text('.css'), js: text('.js') }));
    return { outDir, files: [file] };
  }

  await cp(publicDir, outDir, { recursive: true });
  const { metafile } = await bundle({ outdir: outDir, minify, write: true });
  const built = Object.keys(metafile.outputs).map((file) => path.relative(outDir, path.resolve(file)).split(path.sep).join('/'));
  const assets = { css: built.find((file) => file.endsWith('.css')), js: built.find((file) => file.endsWith('.js')) };

  await writeFile(path.join(outDir, 'index.html'), fullDocument({ content, body, pageData, jsonLd, assets }));

  const base = content.site.url ? content.site.url.replace(/\/?$/, '/') : '';
  await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n${base ? `\nSitemap: ${base}sitemap.xml\n` : ''}`);
  if (base) {
    const today = new Date().toISOString().slice(0, 10);
    await writeFile(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`);
  }
  return { outDir, assets, files: ['index.html', 'robots.txt', ...(base ? ['sitemap.xml'] : []), assets.css, assets.js] };
}

// Run from the command line.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
  const started = Date.now();
  try {
    const result = await build({
      embed: args.includes('--embed'),
      minify: !args.includes('--no-minify'),
      outDir: value('--out') && path.resolve(value('--out')),
      contentDir: value('--content') && path.resolve(value('--content')),
    });
    console.log(`Built ${path.relative(process.cwd(), result.outDir) || '.'} in ${Date.now() - started} ms`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
