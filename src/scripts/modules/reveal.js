// Certificate rows, result tiles and service tiles enter in sequence as they scroll into view;
// result tiles also tilt gently toward the pointer.
function stagger(list, selector, stepSeconds) {
  if (!list) return;
  list.classList.add('anim');
  const observer = new IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        entry.target.style.setProperty('--d', `${order++ * stepSeconds}s`);
        entry.target.classList.add('in');
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
  );
  for (const node of list.querySelectorAll(selector)) observer.observe(node);
}

export function initReveal({ reduceMotion, canObserve, canHover }) {
  if (reduceMotion || !canObserve) return;

  stagger(document.querySelector('.clist'), 'li', 0.07);
  stagger(document.querySelector('.stats'), '.stat', 0.1);
  stagger(document.querySelector('.services'), '.svc', 0.08);

  for (const node of document.querySelectorAll('.reveal')) {
    node.classList.add('anim');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          node.classList.add('in');
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
  }

  if (!canHover) return;
  for (const card of document.querySelectorAll('.stat')) {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      card.style.setProperty('--ry', `${((x - 0.5) * 4).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - y) * 4).toFixed(2)}deg`);
      card.style.setProperty('--mx', ((x - 0.5) * 2).toFixed(3));
      card.style.setProperty('--my', ((y - 0.5) * 2).toFixed(3));
      card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--mx', '0');
      card.style.setProperty('--my', '0');
    });
  }
}
