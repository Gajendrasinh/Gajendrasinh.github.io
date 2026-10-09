import { esc, join, sectionHead, pad2 } from '../helpers.mjs';

export function skills({ skills: s, tokens }) {
  const familyIndex = new Map(s.families.map((f, i) => [f.id, i]));
  const tile = (item, i) => {
    const f = familyIndex.get(item.family);
    return `<button type="button" class="tile f${f + 1}" title="${esc(item.name)}"><span class="n">${pad2(i + 1)}</span> <span class="s">${esc(item.symbol)}</span> <span class="l">${esc(item.name)}</span><span class="sr">, ${esc(s.families[f].name)}</span></button>`;
  };
  return `<section class="block" id="skills">
  <div class="wrap">
    ${sectionHead(s, tokens, { introAttrs: ' id="skillhint"' })}
    <div class="chips" id="chips" role="group" aria-label="${esc(s.filterLabel)}"></div>
    <div class="ptable">
      <div class="grid" id="grid">${s.items.map(tile).join('')}</div>
      <aside class="detail" id="detail" aria-live="polite"></aside>
    </div>
  </div>
</section>`;
}
