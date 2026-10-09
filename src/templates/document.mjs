// Wraps the rendered body in a document. Two shapes:
//   full  - a complete index.html with head tags, linking hashed CSS and JS files
//   embed - one self-contained fragment (inline CSS and JS) for hosts that supply their own <head>
import { esc } from './helpers.mjs';

/** JSON that is safe to place inside a <script> element. */
const inlineJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const RESET = ':root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}';

function dataScripts(pageData) {
  return `<script type="application/json" id="page-data">${inlineJson(pageData)}</script>`;
}

export function fullDocument({ content, body, pageData, jsonLd, assets }) {
  const { site, profile, hero } = content;
  const base = site.url ? site.url.replace(/\/?$/, '/') : '';
  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    `<title>${esc(site.title)}</title>`,
    `<meta name="description" content="${esc(site.description)}">`,
    `<meta name="author" content="${esc(profile.name)}">`,
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    base ? `<link rel="canonical" href="${esc(base)}">` : '',
    `<meta name="theme-color" content="${esc(site.themeColor.light)}" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="${esc(site.themeColor.dark)}" media="(prefers-color-scheme: dark)">`,
    '<meta property="og:type" content="profile">',
    `<meta property="og:site_name" content="${esc(site.shortTitle)}">`,
    `<meta property="og:title" content="${esc(site.title)}">`,
    `<meta property="og:description" content="${esc(site.description)}">`,
    `<meta property="og:locale" content="${esc(site.locale)}">`,
    base ? `<meta property="og:url" content="${esc(base)}">` : '',
    base && site.socialImage ? `<meta property="og:image" content="${esc(base + site.socialImage)}">` : '',
    `<meta property="profile:first_name" content="${esc(profile.givenName)}">`,
    `<meta property="profile:last_name" content="${esc(profile.familyName)}">`,
    `<meta name="twitter:card" content="${base && site.socialImage ? 'summary_large_image' : 'summary'}">`,
    '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${esc(site.fonts)}">`,
    `<link rel="preload" as="image" href="${esc(hero.video.still)}">`,
    `<style>${RESET}</style>`,
    `<link rel="stylesheet" href="${esc(assets.css)}">`,
    `<script type="application/ld+json">${inlineJson(jsonLd)}</script>`,
  ].filter(Boolean);
  return `<!doctype html>
<html lang="${esc(site.language)}">
<head>
${head.join('\n')}
</head>
<body>
${body}
${dataScripts(pageData)}
<script src="${esc(assets.js)}" defer></script>
</body>
</html>
`;
}

export function embedDocument({ content, body, pageData, jsonLd, css, js }) {
  const { site } = content;
  return `<title>${esc(site.shortTitle)}</title>
<link rel="stylesheet" href="${esc(site.fonts)}">
<style>
${css}</style>
<script type="application/ld+json">${inlineJson(jsonLd)}</script>
${body}
${dataScripts(pageData)}
<script>
${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
}
