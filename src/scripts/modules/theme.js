// Day / night switch. The page follows the device setting until the visitor picks a side;
// the pick is kept in this browser, and picking the device's own setting hands control back to it.
import { THEME_KEY } from '../lib/env.js';

export function initTheme({ data, reduceMotion }) {
  const button = document.getElementById('themebtn');
  if (!button) return;
  const root = document.documentElement;
  const system = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const systemTheme = () => (system && system.matches ? 'dark' : 'light');
  const chosen = () => (root.dataset.theme === 'light' || root.dataset.theme === 'dark' ? root.dataset.theme : null);
  const current = () => chosen() ?? systemTheme();

  const metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'));
  for (const meta of metas) meta.dataset.auto = meta.content;

  const sync = () => {
    const label = current() === 'dark' ? data.theme.toLight : data.theme.toDark;
    button.setAttribute('aria-label', label);
    button.title = label;
    // The browser bar follows the device through media queries; an explicit pick has to be written in.
    const bar = chosen() ? getComputedStyle(root).getPropertyValue('--bg').trim() : '';
    for (const meta of metas) meta.content = bar || meta.dataset.auto;
  };

  const apply = (theme) => {
    const follow = theme === systemTheme();
    if (follow) delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      if (follow) localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage is unavailable (private window, blocked site data): the choice lasts for this visit.
    }
    sync();
  };

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    if (!reduceMotion && document.startViewTransition) document.startViewTransition(() => apply(next));
    else apply(next);
  });
  if (system && system.addEventListener) system.addEventListener('change', sync);

  button.hidden = false;
  sync();
}
