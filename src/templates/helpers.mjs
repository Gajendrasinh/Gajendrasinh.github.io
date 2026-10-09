// Small rendering helpers shared by every template.
// Templates hold structure only; every word comes from content/*.json.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text for use in HTML content or a double-quoted attribute. */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

/** Replace {token} placeholders with plain text taken from `tokens`. Unknown tokens throw. */
export function fill(text, tokens = {}) {
  return String(text ?? '').replace(/\{([a-zA-Z]+)\}/g, (match, key) => {
    if (!(key in tokens)) throw new Error(`Unknown token ${match} in content: "${text}"`);
    return tokens[key];
  });
}

/**
 * Render a content string that may use the light inline syntax:
 *   {name}          token, replaced from profile.json (see buildTokens in render.mjs)
 *   *text*          the quieter, grey part of a heading
 *   __text__        gradient text (used for the name)
 *   [label](url)    link, opened in a new tab
 * Everything else is escaped, so content can never inject markup.
 */
export function rich(text, tokens = {}, { mutedTag = 'span' } = {}) {
  let out = esc(fill(text, tokens));
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a class="inl" href="$2" target="_blank" rel="noopener">$1</a>');
  out = out.replace(/__([^_]+)__/g, '<span class="gname">$1</span>');
  out = out.replace(/\*([^*]+)\*/g, mutedTag === 'span' ? '<span class="serif">$1</span>' : `<${mutedTag}>$1</${mutedTag}>`);
  return out;
}

/** Two-digit ordinal used on the skill tiles: 1 -> "01". */
export const pad2 = (n) => String(n).padStart(2, '0');

/** Join template fragments. */
export const join = (items, render, separator = '') => items.map(render).join(separator);

/** External link attributes used everywhere a link leaves the site. */
export const EXTERNAL = 'target="_blank" rel="noopener"';

/** Standard section header: label, heading and optional intro. */
export function sectionHead(section, tokens, { introAttrs = '' } = {}) {
  const intro = typeof section.intro === 'string' ? section.intro : section.intro?.hover;
  return `<div class="head">
      <div>
        <div class="eyebrow mono">${esc(section.eyebrow)}</div>
        <h2>${rich(section.heading, tokens)}</h2>
      </div>
      ${intro ? `<p${introAttrs}>${rich(intro, tokens)}</p>` : ''}
    </div>`;
}

/** A pill button: scrolls to a section, opens a profile link, downloads the resume or starts a WhatsApp chat. */
export function action(item, ctx, extraClass = '') {
  const cls = ['btn', item.primary ? 'solid' : '', extraClass].filter(Boolean).join(' ');
  if (item.kind === 'section') return `<a class="${cls}" href="#${esc(item.section)}">${esc(item.label)}</a>`;
  if (item.kind === 'link') return `<a class="${cls}" href="${esc(ctx.profile.links[item.link].url)}" ${EXTERNAL}>${esc(item.label)}</a>`;
  if (item.kind === 'resume') return resumeLink(item.label, ctx, cls);
  if (item.kind === 'whatsapp') {
    const url = `https://wa.me/${ctx.profile.phone.whatsapp}?text=${encodeURIComponent(item.message)}`;
    return `<a class="${cls}" href="${esc(url)}" ${EXTERNAL}>${esc(item.label)}</a>`;
  }
  throw new Error(`Unknown action kind "${item.kind}"`);
}

/** Resume download link. Inside the Claude viewer a plain download is blocked, so the embed build opens it in a tab. */
export function resumeLink(label, ctx, cls) {
  const how = ctx.embed ? EXTERNAL : 'download';
  return `<a class="${cls} js-resume" href="${esc(ctx.profile.resume.file)}" ${how}>${esc(label)}</a>`;
}
