// What the page can know about its visitor's device, plus the data the build left in the page.

/** Data written by the build into <script type="application/json" id="page-data">. */
export function readPageData() {
  const node = document.getElementById('page-data');
  if (!node) throw new Error('page-data is missing from the page');
  return JSON.parse(node.textContent);
}

export function readEnvironment() {
  const matches = (query) => Boolean(window.matchMedia && window.matchMedia(query).matches);
  return {
    reduceMotion: matches('(prefers-reduced-motion: reduce)'),
    canHover: matches('(hover: hover)'),
    canObserve: 'IntersectionObserver' in window,
  };
}

/** Replace {key} placeholders in a label that came from content. */
export const fill = (text, values) => text.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));

/** Escape text before placing it in innerHTML. */
export function escapeHtml(text) {
  const holder = document.createElement('div');
  holder.textContent = text;
  return holder.innerHTML;
}
