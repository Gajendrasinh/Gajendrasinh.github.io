// Work section: one project panel is open at a time. Hover opens on wide pointer screens, click everywhere.
export function initAccordion() {
  const acc = document.getElementById('acc');
  const panels = Array.from(acc.querySelectorAll('.panel'));
  const wide = window.matchMedia('(min-width: 1181px) and (hover: hover)');
  const sideBySide = window.matchMedia('(min-width: 1181px)'); // matches the breakpoint in responsive.css

  // Projects differ in length. Left alone, the row would change height with every project and the text
  // would re-wrap while a panel slides open. So in the side-by-side layout: fix the open width, measure
  // every project at that width, and give the row the height of the tallest one.
  let lastWidth = -1;
  function size(force) {
    if (!sideBySide.matches) {
      acc.classList.remove('sized');
      lastWidth = -1;
      return;
    }
    const width = acc.clientWidth;
    if (!force && width === lastWidth) return;
    lastWidth = width;
    const style = getComputedStyle(acc);
    const closed = panels.find((panel) => !panel.classList.contains('open')) ?? panels[0];
    const closedWidth = parseFloat(getComputedStyle(closed).flexBasis) || 0;
    const gap = parseFloat(style.columnGap) || 0;
    const openWidth = Math.max(0, width - (panels.length - 1) * (closedWidth + gap));
    acc.style.setProperty('--open-w', `${openWidth}px`);
    acc.classList.add('sized', 'measuring');
    let tallest = 0;
    for (const panel of panels) tallest = Math.max(tallest, panel.querySelector('.body').offsetHeight);
    acc.classList.remove('measuring');
    acc.style.setProperty('--acc-h', `${Math.max(tallest, parseFloat(style.minHeight) || 0)}px`);
  }
  size(true);
  if ('ResizeObserver' in window) new ResizeObserver(() => size(false)).observe(acc);
  else window.addEventListener('resize', () => size(false));
  sideBySide.addEventListener?.('change', () => size(true));
  document.fonts?.ready.then(() => size(true)); // text is measured again once the web font is in

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
