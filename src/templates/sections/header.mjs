import { esc, join } from '../helpers.mjs';

export function header({ site, profile }) {
  const nav = site.navigation;
  return `<header class="top" id="topbar">
  <div class="wrap">
    <span class="brand">${esc(profile.name)}</span>
    <nav class="pill-nav" id="nav" aria-label="${esc(nav.label)}">
      ${join(nav.items, (item) => `<a${item.primary ? ' class="cta"' : ''} href="#${esc(item.section)}">${esc(item.label)}</a>`)}
    </nav>
    <button class="menu-btn" id="menubtn" type="button" aria-expanded="false" aria-controls="nav"><span class="bars" aria-hidden="true"></span><span class="sr" id="menulbl">${esc(nav.menu.open)}</span></button>
  </div>
</header>`;
}
