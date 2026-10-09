import { esc, rich, join, sectionHead } from '../helpers.mjs';

const role = (item, tokens) => `<div class="tl-item">
        <div class="year">${esc(item.year)}</div>
        <div class="card">
          <div class="row"><span class="mono">${esc(item.sector)}</span><span class="mono">${esc(item.period)}</span></div>
          <h3>${esc(item.title)}</h3>
          <div class="org">${esc([item.organisation, item.detail].filter(Boolean).join(' · '))}</div>
          <p>${rich(item.text, tokens)}</p>
          <div class="tags">${join(item.tags, (t) => `<span class="tag${t.highlight ? ' dark' : ''}">${esc(t.label)}</span>`)}</div>
        </div>
      </div>`;

export function experience({ experience: e, tokens }) {
  return `<section class="block" id="experience">
  <div class="wrap">
    ${sectionHead(e, tokens)}
    <div class="tl">
      ${join(e.items, (item) => role(item, tokens), '\n      ')}
    </div>
  </div>
</section>`;
}
