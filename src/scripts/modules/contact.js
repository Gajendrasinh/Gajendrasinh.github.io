// Contact tile: entrance when it scrolls into view, a light that follows the pointer, and "Copy email".
export function initContact({ data, reduceMotion, canObserve }) {
  const card = document.getElementById('contactcard');
  if (card && !reduceMotion && canObserve) {
    card.classList.add('anim');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          card.classList.add('in');
        }
      },
      { threshold: 0.22 },
    );
    observer.observe(card);
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
  }

  const button = document.getElementById('copy');
  const email = document.getElementById('email');
  if (!button || !email) return;
  const labels = data.contact;
  const flash = (text, ms) => {
    button.textContent = text;
    setTimeout(() => {
      button.textContent = labels.copy;
    }, ms);
  };
  // Where the clipboard is refused, select the address so the visitor can copy it by hand.
  const selectInstead = () => {
    const range = document.createRange();
    range.selectNodeContents(email);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    flash(labels.selected, 2600);
  };
  button.addEventListener('click', () => {
    try {
      navigator.clipboard.writeText(email.textContent).then(() => flash(labels.copied, 1800), selectInstead);
    } catch {
      selectInstead();
    }
  });
}
