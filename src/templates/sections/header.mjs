import { esc, join } from '../helpers.mjs';

export function header({ site, profile }) {
  const nav = site.navigation;
  return `<header class="top" id="topbar">
  <div class="wrap">
    <span class="brand">${esc(profile.name)}</span>
    <nav class="pill-nav" id="nav" aria-label="${esc(nav.label)}">
      ${join(nav.items, (item) => `<a${item.primary ? ' class="cta"' : ''} href="#${esc(item.section)}">${esc(item.label)}</a>`)}
    </nav>
    <button class="theme-btn" id="themebtn" type="button" hidden aria-label="${esc(nav.theme.toDark)}" title="${esc(nav.theme.toDark)}">
      <svg class="moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
      <svg class="sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.1"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.35 5.35l1.56 1.56M17.09 17.09l1.56 1.56M5.35 18.65l1.56-1.56M17.09 6.91l1.56-1.56"/></g></svg>
    </button>
    <button class="menu-btn" id="menubtn" type="button" aria-expanded="false" aria-controls="nav"><span class="bars" aria-hidden="true"></span><span class="sr" id="menulbl">${esc(nav.menu.open)}</span></button>
  </div>
</header>`;
}
