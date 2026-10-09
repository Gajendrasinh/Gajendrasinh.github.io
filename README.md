# Gajendrasinh Zala: portfolio

A one-page portfolio. Every word, link and number lives in `content/*.json`. A small build
step renders those files through templates into static HTML, so the published page needs no
framework and search engines receive the full content.

## Quick start

```bash
npm install
npm run dev        # preview at http://localhost:5173, rebuilds when a file changes
npm run build      # writes the finished site to dist/
npm test           # 19 checks on content, templates and the built page
```

Requires Node 20 or newer.

## Structure

```
content/            the site's content, one JSON file per area (edit these)
schema/             JSON Schema for each content file: validation and editor autocomplete
src/
  templates/        HTML structure only, no copy
    sections/       one template per page section
    page.mjs        assembles sections, structured data and data for the browser scripts
    document.mjs    the <head> and document shell
    helpers.mjs     escaping and the inline syntax for content strings
  styles/           one stylesheet per section, imported in order by main.css
  scripts/          browser behaviour, one module per feature, started by main.js
public/             files copied as they are: video, images, resume, logos, favicon
scripts/            build, content validation and the dev server
tests/              node:test suites
.github/workflows/  CI: validate, test, build, deploy to GitHub Pages
dist/               build output (generated, not committed)
```

## Editing content

| File | What it holds |
|---|---|
| `site.json` | Page title and description, site address, navigation, day/night switch labels, section order, footer |
| `profile.json` | Name, contact details, links, resume and photo files, availability |
| `hero.json` | Typed roles, headline, tagline, buttons, video, client names |
| `about.json` | Introduction, "hire me for" list, quick facts, quote, ID card |
| `projects.json` | Work section: each project's need, build, highlights, tech and metrics |
| `results.json` | Measured results tiles |
| `experience.json` | Timeline of roles |
| `skills.json` | Skill families and the 42 tiles |
| `certifications.json` | Courses, certifications and degree |
| `services.json` | Part-time services: mentoring, training, resume writing, freelance |
| `contact.json` | Contact rows and the short messages shown by buttons |

Content strings can use a small inline syntax:

| Write | Result |
|---|---|
| `{name}` `{email}` `{location}` `{github}` `{linkedin}` | Value from `profile.json` |
| `*text*` | The quieter grey part of a heading |
| `__text__` | Gradient text |
| `[label](url)` | Link that opens in a new tab |

Everything else is escaped, so content cannot break the page.

`npm run validate` checks the content without building. It reports misspelled or missing
fields, buttons that point to a section or link that does not exist, skills whose logo file
is missing, and more. The build runs the same checks and stops if any fail.

### Common changes

- **Add a project:** add an object to `items` in `projects.json`. Exactly one project has `"open": true`.
- **Add a skill:** add an object to `items` in `skills.json`. For a logo, put `name.svg` in `public/logos/` and set `"logo": "name"`.
- **Reorder or remove sections:** edit `sections` in `site.json`. Navigation items must point to listed sections.
- **Replace the resume or video:** put the file in `public/` and update the file name in `profile.json` or `hero.json`.
- **Add a new kind of section:** create `src/templates/sections/<id>.mjs`, register it in `SECTIONS` in `page.mjs`, add `content/<id>.json` with a schema, and list it in `site.json`.

### Day and night mode

The page follows the visitor's device setting. The switch in the header overrides it and the choice is remembered in that browser; choosing the device's own setting hands control back to the device. Colours for both modes live in `src/styles/tokens.css`.

## Going live

Set `url` in `content/site.json` to the final address, for example `https://example.com`.
The build then also writes the canonical link, `og:url`, `sitemap.xml` and the sitemap line
in `robots.txt`. For link previews, add a 1200 x 630 image to `public/` and set `socialImage`.

`dist/` is a plain static site: upload it to any host. The included workflow deploys to
GitHub Pages on every push to `main` (in the repository settings choose Pages, Source,
"GitHub Actions"). CSS and JS file names carry a content hash, so they can be cached forever.

`npm run build:embed` writes one self-contained file to `dist-embed/` with CSS and JS inline,
for hosts that supply their own document shell.
