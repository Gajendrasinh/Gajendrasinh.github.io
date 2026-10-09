import { esc, rich, join, resumeLink, EXTERNAL } from '../helpers.mjs';

function row(item, i, ctx) {
  const { profile } = ctx;
  const cls = `way rise r${i + 2}`;
  const label = `<span class="mono">${esc(item.label)}</span>`;
  switch (item.kind) {
    case 'email': {
      const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(item.subject)}`;
      return `<div class="${cls}">
            ${label}
            <code id="email">${esc(profile.email)}</code>
            <span class="send">
              <a class="btn inv" href="${esc(mailto)}">${esc(item.send)}</a>
              <button class="btn" id="copy" type="button">${esc(item.copy)}</button>
            </span>
          </div>`;
    }
    case 'whatsapp':
      return `<div class="${cls}">
            ${label}
            <code>${esc(profile.phone.display)}</code>
            <a class="btn inv" href="https://wa.me/${esc(profile.phone.whatsapp)}" ${EXTERNAL}>${esc(item.action)}</a>
          </div>`;
    case 'link': {
      const link = profile.links[item.link];
      return `<div class="${cls}">
            ${label}
            <code>${esc(link.display)}</code>
            <a class="btn inv" href="${esc(link.url)}" ${EXTERNAL}>${esc(item.action)}</a>
          </div>`;
    }
    case 'resume':
      return `<div class="${cls}">
            ${label}
            ${resumeLink(item.action, ctx, 'btn inv push')}
            <span class="mono note" id="resumenote" role="status"></span>
          </div>`;
    default:
      throw new Error(`Unknown contact row kind "${item.kind}"`);
  }
}

export function contact(ctx) {
  const { contact: c, site, profile, tokens } = ctx;
  const word = (w) => `<span class="w"><span${w.muted ? ' class="serif"' : ''}>${esc(w.text)}</span></span>`;
  return `<section class="block" id="contact">
  <div class="wrap">
    <div class="contact" id="contactcard">
      <div class="glow" aria-hidden="true"></div>
      <div class="c-in">
        <div>
          <div class="avail"><i aria-hidden="true"></i>${esc(profile.availability)}</div>
          <div class="eyebrow mono">${esc(c.eyebrow)}</div>
          <h2>${join(c.heading, word, ' ')}</h2>
        </div>
        <p class="rise r1">${rich(c.intro, tokens)}</p>
        <div class="ways">
          ${join(c.rows, (item, i) => row(item, i, ctx), '\n          ')}
        </div>
      </div>
    </div>
    <footer><span>${rich(site.footer.left, tokens)}</span><span>${rich(site.footer.right, tokens)}</span></footer>
  </div>
</section>`;
}
