// ID card: flips on hover where there is a pointer, on tap or key press everywhere.
// Also swaps the two hints whose wording depends on the input device.
export function initBadge({ data, canHover }) {
  const badge = document.getElementById('badge');

  if (canHover) document.getElementById('fliphint').textContent = data.hints.flipHover;
  else document.getElementById('skillhint').textContent = data.hints.skillsTouch;

  badge.addEventListener('click', (event) => {
    if (canHover && event.detail !== 0) return; // a mouse click adds nothing to hover
    const flipped = badge.classList.toggle('flip');
    badge.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  });
}
