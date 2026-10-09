import { esc, rich, join, sectionHead, EXTERNAL } from '../helpers.mjs';

function panel(item, labels, tokens) {
  const open = Boolean(item.open);
  return `
      <article class="panel${open ? ' open' : ''}">
        <button class="tab" type="button" aria-expanded="${open}"><span class="vt">${esc(item.tab)}</span><span class="plus" aria-hidden="true">+</span></button>
        <div class="body">
          <div>
            <span class="mono">${esc(item.label)}</span>
            <h3 tabindex="-1">${esc(item.title)}</h3>
            <p><strong>${esc(labels.need)}</strong> ${rich(item.need, tokens)}</p>
            <p><strong>${esc(labels.built)}</strong> ${rich(item.built, tokens)}</p>
            <ul>${join(item.highlights, (h) => `<li>${esc(h)}</li>`)}</ul>
            <div class="tech">${join(item.tech, (t) => `<span>${esc(t)}</span>`)}</div>${item.link ? `
            <a class="more" href="${esc(item.link.url)}" ${EXTERNAL}>${esc(item.link.label)}</a>` : ''}
          </div>
          <div class="metrics">
            <span class="mono">${esc(item.metricsLabel)}</span>
${join(item.metrics, (m) => `            <div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`, '\n')}
          </div>
        </div>
      </article>
`;
}

export function work({ projects, tokens }) {
  return `<section class="block" id="work">
  <div class="wrap">
    ${sectionHead(projects, tokens)}
    <div class="acc" id="acc">
${join(projects.items, (item) => panel(item, projects.labels, tokens))}
    </div>
    <p class="fine">${rich(projects.note, tokens)}</p>
  </div>
</section>`;
}
