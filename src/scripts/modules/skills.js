// Periodic table of skills: hovering or focusing a tile shows its logo and note, chips filter by family.
import { fill, escapeHtml } from '../lib/env.js';

const pad2 = (n) => String(n).padStart(2, '0');

export function initSkills({ data }) {
  const { families, items, meta, logoAlt, logoDir } = data.skills;
  const grid = document.getElementById('grid');
  const chips = document.getElementById('chips');
  const detail = document.getElementById('detail');
  const tiles = Array.from(grid.children);
  let activeFamily = -1;

  function show(index) {
    const [family, symbol, name, text, logo] = items[index];
    tiles.forEach((tile, k) => tile.classList.toggle('sel', k === index));
    const mark = logo
      ? `<div class="plate"><img src="${logoDir}${logo}.svg" alt="${escapeHtml(fill(logoAlt, { name }))}" width="76" height="76"></div>`
      : `<div class="big f${family + 1}">${escapeHtml(symbol)}</div>`;
    const label = fill(meta, { family: families[family], number: pad2(index + 1) });
    detail.innerHTML = `${mark}<div><span class="mono">${escapeHtml(label)}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(text)}</p></div>`;
  }

  tiles.forEach((tile, index) => {
    for (const event of ['mouseenter', 'focus', 'click']) tile.addEventListener(event, () => show(index));
  });

  families.forEach((name, family) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.setAttribute('aria-pressed', 'false');
    chip.innerHTML = `<i class="f${family + 1}"></i>${escapeHtml(name)}`;
    chip.addEventListener('click', () => {
      activeFamily = activeFamily === family ? -1 : family;
      Array.from(chips.children).forEach((other, k) => other.setAttribute('aria-pressed', k === activeFamily ? 'true' : 'false'));
      grid.classList.toggle('filtered', activeFamily !== -1);
      tiles.forEach((tile, k) => tile.classList.toggle('lit', items[k][0] === activeFamily));
    });
    chips.appendChild(chip);
  });

  show(0);

  // Fetch the logos shortly after load so the panel swaps without a flash.
  setTimeout(() => {
    for (const item of items) if (item[4]) new Image().src = `${logoDir}${item[4]}.svg`;
  }, 1200);
}
