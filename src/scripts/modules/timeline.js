// Experience: the line draws down to each role as it scrolls into view.
export function initTimeline({ reduceMotion, canObserve }) {
  const timeline = document.querySelector('.tl');
  if (!timeline || reduceMotion || !canObserve) return;

  const items = Array.from(timeline.querySelectorAll('.tl-item'));
  let furthest = -1;

  // Wrap each year so it can change colour on its own.
  for (const item of items) {
    const year = item.querySelector('.year');
    const span = document.createElement('span');
    span.textContent = year.textContent;
    year.textContent = '';
    year.appendChild(span);
  }

  const fill = document.createElement('div');
  fill.className = 'tl-fill';
  fill.setAttribute('aria-hidden', 'true');
  timeline.appendChild(fill);
  timeline.classList.add('anim');

  const narrow = window.matchMedia('(max-width: 820px)');
  function grow() {
    const item = items[furthest];
    if (!item) return;
    const length = timeline.offsetHeight - 20;
    const y = furthest === items.length - 1 ? length : item.offsetTop + (narrow.matches ? 28 : item.offsetHeight / 2) - 10;
    fill.style.transform = `scaleY(${Math.max(0, Math.min(1, y / length))})`;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        entry.target.classList.add('in');
        const index = items.indexOf(entry.target);
        if (index > furthest) {
          furthest = index;
          grow();
        }
      }
    },
    { threshold: 0.3, rootMargin: '0px 0px -10% 0px' },
  );
  for (const item of items) observer.observe(item);
  window.addEventListener('resize', grow);
}
