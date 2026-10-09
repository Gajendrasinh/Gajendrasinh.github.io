// Numbers marked with data-count run up to their value the first time they scroll into view.
const DURATION_MS = 1100;

export function initCountUp({ reduceMotion, canObserve }) {
  if (reduceMotion || !canObserve) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const node = entry.target;
        const end = Number(node.getAttribute('data-count'));
        let startedAt = null;
        const step = (now) => {
          if (startedAt === null) startedAt = now;
          const progress = Math.min(1, (now - startedAt) / DURATION_MS);
          node.textContent = Math.round(end * (1 - (1 - progress) ** 3));
          if (progress < 1) requestAnimationFrame(step);
          else node.textContent = end;
        };
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.6 },
  );
  for (const node of document.querySelectorAll('[data-count]')) observer.observe(node);
}
