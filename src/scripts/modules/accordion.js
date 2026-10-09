// Work section: one project panel is open at a time. Hover opens on wide pointer screens, click everywhere.
export function initAccordion() {
  const panels = Array.from(document.querySelectorAll('#acc .panel'));
  const wide = window.matchMedia('(min-width: 1181px) and (hover: hover)');

  function open(panel, moveFocus) {
    for (const other of panels) {
      const on = other === panel;
      other.classList.toggle('open', on);
      other.querySelector('.tab').setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    if (moveFocus) panel.querySelector('h3')?.focus({ preventScroll: true });
  }

  for (const panel of panels) {
    panel.querySelector('.tab').addEventListener('click', () => open(panel, true));
    panel.addEventListener('mouseenter', () => {
      if (wide.matches) open(panel, false);
    });
  }
}
