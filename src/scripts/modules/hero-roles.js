// Roles behind the avatar: one size fits the longest role, then each is typed, held and deleted.
// The letters still to come keep their space, unseen, so the word stays centred while it is typed.

const TYPE_MS = 78;
const DELETE_MS = 38;
const HOLD_MS = 1900;
const BETWEEN_MS = 380;
const START_MS = 2200;

export function initHeroRoles({ data, reduceMotion }) {
  const roles = data.roles;
  const ghost = document.getElementById('ghost');
  const line = ghost.firstElementChild;
  const typed = line.querySelector('.ty');
  const rest = line.querySelector('.rest');
  let roleIndex = 0;
  let visible = roles[0].length;

  const setRole = (text, count) => {
    typed.textContent = text.slice(0, count);
    rest.textContent = text.slice(count);
  };

  function fit() {
    let widest = 0;
    line.style.fontSize = '100px';
    for (const role of roles) {
      setRole(role, role.length);
      widest = Math.max(widest, line.getBoundingClientRect().width);
    }
    setRole(roles[roleIndex], visible);
    if (widest > 0) line.style.fontSize = `${Math.min(300, (100 * ghost.clientWidth * 0.93) / widest).toFixed(1)}px`;
  }

  fit();
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  if (reduceMotion || roles.length < 2) return;

  let deleting = true;
  const step = () => {
    if (document.hidden) return setTimeout(step, 600);
    const word = roles[roleIndex];
    let wait;
    ghost.classList.add('typing'); // the caret stays solid while keys are going
    if (deleting) {
      visible -= 1;
      setRole(word, visible);
      wait = DELETE_MS;
      if (visible === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setRole(roles[roleIndex], 0);
        wait = BETWEEN_MS;
      }
    } else {
      visible += 1;
      setRole(word, visible);
      wait = TYPE_MS;
      if (visible === word.length) {
        deleting = true;
        wait = HOLD_MS;
        ghost.classList.remove('typing');
      }
    }
    return setTimeout(step, wait);
  };
  setTimeout(step, START_MS);
}
