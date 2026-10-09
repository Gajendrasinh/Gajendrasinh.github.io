// Header: smooth scrolling for in-page links, highlighting the section in view, and the small-screen menu.
export function initNavigation({ data, reduceMotion, canObserve }) {
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    link.addEventListener('click', (event) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  if (canObserve) {
    const navLinks = Array.from(document.querySelectorAll('.pill-nav a'));
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = data.spy[entry.target.id] ?? entry.target.id;
          for (const link of navLinks) link.classList.toggle('on', link.getAttribute('href') === `#${id}`);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const section of document.querySelectorAll('main section[id]')) spy.observe(section);
  }

  const bar = document.getElementById('topbar');
  const button = document.getElementById('menubtn');
  const label = document.getElementById('menulbl');
  const setMenu = (open) => {
    bar.classList.toggle('open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    label.textContent = open ? data.menu.close : data.menu.open;
  };
  button.addEventListener('click', () => setMenu(!bar.classList.contains('open')));
  document.getElementById('nav').addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!bar.contains(event.target)) setMenu(false);
  });
}
