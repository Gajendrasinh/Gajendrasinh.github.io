import { esc, rich, join, sectionHead, action } from '../helpers.mjs';

const card = (item, tokens) => `<article class="svc">
        <h3>${esc(item.title)}</h3>
        <p>${rich(item.text, tokens)}</p>
        <ul>${join(item.points, (point) => `<li>${esc(point)}</li>`)}</ul>
      </article>`;

export function services(ctx) {
  const { services: s, tokens } = ctx;
  return `<section class="block" id="services">
  <div class="wrap">
    ${sectionHead(s, tokens)}
    <div class="services">
      ${join(s.items, (item) => card(item, tokens), '\n      ')}
    </div>
    <div class="links services-actions">
      ${join(s.actions, (item) => action(item, ctx), '\n      ')}
    </div>
  </div>
</section>`;
}
