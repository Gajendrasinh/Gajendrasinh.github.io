// Assembles the page from content. Nothing here contains copy: it only decides structure and order.
import { header } from './sections/header.mjs';
import { hero } from './sections/hero.mjs';
import { about } from './sections/about.mjs';
import { work } from './sections/work.mjs';
import { results } from './sections/results.mjs';
import { experience } from './sections/experience.mjs';
import { skills } from './sections/skills.mjs';
import { certifications } from './sections/certifications.mjs';
import { services } from './sections/services.mjs';
import { contact } from './sections/contact.mjs';

/** Section id -> template. The order on the page comes from site.json "sections". */
export const SECTIONS = { about, work, results, experience, skills, certifications, services, contact };

/** Values available to content strings as {tokens}. */
export function buildTokens(profile) {
  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone.display,
    location: profile.location,
    linkedin: profile.links.linkedin.url,
    github: profile.links.github.url,
  };
}

/** The small data set the browser scripts need (labels they swap, skill details, typed roles). */
export function buildPageData(content) {
  const { site, hero: h, about: a, skills: s, contact: c, profile } = content;
  const familyIndex = new Map(s.families.map((f, i) => [f.id, i]));
  const inNav = new Set(site.navigation.items.map((item) => item.section));
  const spy = {};
  let current = null;
  for (const id of site.sections) {
    if (inNav.has(id)) current = id;
    if (current) spy[id] = current; // a section without its own nav item highlights the one before it
  }
  return {
    roles: h.roles,
    controls: h.controls,
    menu: site.navigation.menu,
    theme: site.navigation.theme,
    hints: { flipHover: a.badge.hint.hover, skillsTouch: s.intro.touch },
    skills: {
      families: s.families.map((f) => f.name),
      items: s.items.map((item) => [familyIndex.get(item.family), item.symbol, item.name, item.text, item.logo ?? null]),
      meta: s.detailMeta,
      logoAlt: s.logoAlt,
      logoDir: 'logos/',
    },
    spy,
    contact: { copy: c.rows.find((row) => row.kind === 'email')?.copy ?? '', ...c.messages },
    resume: { downloadName: profile.resume.downloadName },
  };
}

/** schema.org description of the person, read by search engines. */
export function buildJsonLd(content) {
  const { site, profile, skills: s, certifications: c } = content;
  const base = site.url ? site.url.replace(/\/?$/, '/') : '';
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: site.title,
    inLanguage: site.language,
    ...(base ? { url: base } : {}),
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      givenName: profile.givenName,
      familyName: profile.familyName,
      jobTitle: profile.jobTitle,
      description: profile.summary,
      image: base + profile.photo.file,
      email: `mailto:${profile.email}`,
      address: { '@type': 'PostalAddress', addressCountry: profile.countryCode, addressLocality: profile.location },
      sameAs: Object.values(profile.links).map((link) => link.url),
      alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education.name },
      knowsAbout: s.items.map((item) => item.name),
      hasCredential: c.items
        .filter((item) => item.kind !== 'degree')
        .map((item) => ({
          '@type': 'EducationalOccupationalCredential',
          name: item.title,
          recognizedBy: { '@type': 'Organization', name: item.issuer },
        })),
    },
  };
}

/** Render everything between <body> and the scripts. */
export function renderBody(content, { embed = false } = {}) {
  const ctx = { ...content, embed, tokens: buildTokens(content.profile) };
  const sections = content.site.sections.map((id) => {
    const template = SECTIONS[id];
    if (!template) throw new Error(`site.json lists section "${id}" but no template exists for it`);
    return template(ctx);
  });
  return `${header(ctx)}

${hero(ctx)}

<main>
${sections.join('\n\n')}
</main>`;
}
