import { esc, rich, join, fill, EXTERNAL } from '../helpers.mjs';

export function certifications({ certifications: c, tokens }) {
  const row = (item) => {
    const verify = item.url
      ? `<a class="verify" aria-label="${esc(fill(c.verify.description, { title: item.title }))}" href="${esc(item.url)}" ${EXTERNAL}>${esc(c.verify.label)}</a>`
      : '';
    return `<li><span class="mono">${esc(item.issuer)}</span><div><b>${esc(item.title)}</b><small>${esc(item.meta)}</small></div>${verify}</li>`;
  };
  return `<section class="block" id="certifications">
  <div class="wrap certs">
    <div class="reveal">
      <div class="eyebrow mono">${esc(c.eyebrow)}</div>
      <h2>${rich(c.heading, tokens)}</h2>
      <p class="note">${rich(c.intro, tokens)}</p>
    </div>
    <ul class="clist">
      ${join(c.items, row, '\n      ')}
    </ul>
  </div>
</section>`;
}
