// Resume links. On a normal host the link's own download attribute does the work.
// Inside the Claude viewer downloads go through its save dialog, when that is offered.
export function initResume({ data }) {
  const note = document.getElementById('resumenote');
  const labels = data.contact;
  let saver = null;
  try {
    if (window.claude && window.claude.use) window.claude.use('downloads').then((downloads) => (saver = downloads), () => {});
  } catch {
    /* no viewer: plain links are used */
  }

  for (const link of document.querySelectorAll('.js-resume')) {
    link.addEventListener('click', (event) => {
      if (!saver) return;
      event.preventDefault();
      const say = (text) => {
        if (note) note.textContent = text;
      };
      say(labels.preparing);
      fetch(link.getAttribute('href'))
        .then((response) => {
          if (!response.ok) throw new Error('missing');
          return response.blob();
        })
        .then((blob) => saver.save({ filename: data.resume.downloadName, data: blob }))
        .then(
          () => say(labels.saved),
          (error) => say(error && error.code === 'declined' ? '' : labels.saveFailed),
        );
    });
  }
}
