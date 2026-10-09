import { esc, rich, join, sectionHead } from '../helpers.mjs';

const stat = (item, tokens) =>
  `<div class="stat"><span class="mono">${esc(item.context)}</span><b>${esc(item.prefix ?? '')}<span data-count="${item.value}">${item.value}</span><sup>${esc(item.suffix ?? '')}</sup></b><strong>${esc(item.title)}</strong><span>${rich(item.text, tokens)}</span></div>`;

export function results({ results: r, tokens }) {
  return `<section class="block" id="results">
  <div class="wrap">
    ${sectionHead(r, tokens)}
    <div class="stats">
      ${join(r.items, (item) => stat(item, tokens), '\n      ')}
    </div>
  </div>
</section>`;
}
