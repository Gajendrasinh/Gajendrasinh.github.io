import { esc, rich, join, action, fill } from '../helpers.mjs';

function badge({ about, profile, tokens }) {
  const b = about.badge;
  const photo = profile.photo;
  return `<div class="about-badge">
      <div class="hook"></div>
      <div class="hang">
        <div class="strap"><span class="gname on-dark">${esc(fill(b.strap, tokens))}</span></div>
        <div class="clip"></div>
        <button class="badge" id="badge" type="button" aria-pressed="false">
          <span class="sr">${esc(b.pressLabel)}</span>
          <div class="badge-in">
            <div class="face front">
              <div class="b-head"><span class="b-dot">${esc(profile.initials)}</span><div><b>${esc(b.title)}</b><small>${esc(b.subtitle)}</small></div></div>
              <div class="b-photo"><img src="${esc(photo.file)}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}"></div>
              <div class="b-name"><span class="gname">${esc(profile.name)}</span></div>
              <div class="b-role">${esc(b.role)}</div>
              <div class="b-row">${join(b.fields, (f) => `<div><span>${esc(f.label)}</span>${esc(f.value)}</div>`)}</div>
              <div class="b-foot"><div class="b-bar"></div><div class="b-holo"></div></div>
            </div>
            <div class="face back">
              <h3>${esc(b.back.title)}</h3>
              <ul>
                ${join(b.back.items, (item) => `<li>${esc(item)}</li>`, '\n                ')}
              </ul>
              <div class="sig"><span class="gname">${esc(profile.name)}</span></div>
            </div>
          </div>
        </button>
        <div class="mono flip-hint" id="fliphint">${esc(b.hint.touch)}</div>
      </div>
    </div>`;
}

export function about(ctx) {
  const { about: a, tokens } = ctx;
  return `<section class="block" id="about">
  <div class="wrap about">
    <div>
      <div class="eyebrow mono">${esc(a.eyebrow)}</div>
      <h2>${rich(a.heading, tokens)}</h2>
      <p class="lead">${rich(a.lead, tokens)}</p>
      <p class="sub">${rich(a.body, tokens)}</p>
      <div class="mono roles-label">${esc(a.roles.label)}</div>
      <ul class="roles">
        ${join(a.roles.items, (r) => `<li><b>${esc(r.title)}</b><span>${rich(r.text, tokens)}</span></li>`, '\n        ')}
      </ul>
      <div class="links">
        ${join(a.actions, (item) => action(item, ctx), '\n        ')}
      </div>
    </div>
    ${badge(ctx)}
    <div>
      <div class="mono facts-label">${esc(a.facts.label)}</div>
      <dl class="facts">
        ${join(a.facts.items, (f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`, '\n        ')}
      </dl>
      <p class="quote">${rich(a.quote, tokens)}</p>
    </div>
  </div>
</section>`;
}
