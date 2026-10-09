// Loads content/*.json and checks it: first against the JSON Schemas in schema/,
// then for mistakes a schema cannot see (a link that points nowhere, a missing file).
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv';

export const CONTENT_FILES = ['site', 'profile', 'hero', 'about', 'projects', 'results', 'experience', 'skills', 'certifications', 'services', 'contact'];

const readJson = async (file) => {
  const text = await readFile(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file} is not valid JSON: ${error.message}`);
  }
};

/** Read every content file into one object keyed by file name. */
export async function loadContent(contentDir) {
  const entries = await Promise.all(CONTENT_FILES.map(async (name) => [name, await readJson(path.join(contentDir, `${name}.json`))]));
  return Object.fromEntries(entries);
}

const exists = (file) => access(file).then(() => true, () => false);

/** Returns a list of human-readable problems. An empty list means the content is good to build. */
export async function validateContent(content, { schemaDir, publicDir, sectionIds }) {
  const problems = [];
  const ajv = new Ajv({ allErrors: true });

  for (const name of CONTENT_FILES) {
    const schema = await readJson(path.join(schemaDir, `${name}.schema.json`));
    const validate = ajv.compile(schema);
    if (!validate(content[name])) {
      for (const error of validate.errors) {
        const where = error.instancePath || '(top level)';
        const extra = error.params?.additionalProperty ? ` "${error.params.additionalProperty}"` : '';
        problems.push(`content/${name}.json ${where}: ${error.message}${extra}`);
      }
    }
  }
  if (problems.length) return problems; // the checks below assume the shapes are right

  const { site, profile, hero, about, projects, skills, services, contact } = content;
  const links = new Set(Object.keys(profile.links));
  const sections = new Set(site.sections);

  for (const id of site.sections) if (!sectionIds.includes(id)) problems.push(`site.json sections: no template for "${id}"`);
  if (new Set(site.sections).size !== site.sections.length) problems.push('site.json sections: a section is listed twice');
  for (const item of site.navigation.items) if (!sections.has(item.section)) problems.push(`site.json navigation: "${item.label}" points to "${item.section}", which is not in sections`);
  if (site.url && !/^https:\/\/[^\s]+$/.test(site.url)) problems.push('site.json url: must start with https:// (or be empty until the address is known)');
  if (site.description.length > 165) problems.push(`site.json description: ${site.description.length} characters; search engines cut it after about 165`);

  const actions = [...hero.actions, ...about.actions, ...services.actions];
  for (const item of actions) {
    if (item.kind === 'section' && !sections.has(item.section)) problems.push(`button "${item.label}" points to section "${item.section}", which is not in site.json sections`);
    if (item.kind === 'link' && !links.has(item.link)) problems.push(`button "${item.label}" uses link "${item.link}", which is not in profile.json links`);
  }
  for (const row of contact.rows) if (row.kind === 'link' && !links.has(row.link)) problems.push(`contact.json: row "${row.label}" uses link "${row.link}", which is not in profile.json links`);
  if (contact.rows.filter((row) => row.kind === 'email').length !== 1) problems.push('contact.json: exactly one row of kind "email" is needed');

  const open = projects.items.filter((item) => item.open).length;
  if (open !== 1) problems.push(`projects.json: exactly one project should have "open": true (found ${open})`);

  const families = new Set(skills.families.map((family) => family.id));
  const symbols = new Set();
  for (const item of skills.items) {
    if (!families.has(item.family)) problems.push(`skills.json: "${item.name}" uses family "${item.family}", which is not defined`);
    if (symbols.has(item.symbol)) problems.push(`skills.json: symbol "${item.symbol}" is used twice`);
    symbols.add(item.symbol);
    if (item.logo && !(await exists(path.join(publicDir, 'logos', `${item.logo}.svg`)))) problems.push(`skills.json: "${item.name}" expects public/logos/${item.logo}.svg, which does not exist`);
  }

  const files = [profile.resume.file, profile.photo.file, hero.video.file, hero.video.still, site.socialImage].filter(Boolean);
  for (const file of files) if (!(await exists(path.join(publicDir, file)))) problems.push(`public/${file} is referenced in content but does not exist`);

  return problems;
}
