import { esc, rich, join, action } from '../helpers.mjs';

const ICON_SOUND = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z';
const ICON_PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';

export function hero(ctx) {
  const { hero: h, profile, tokens } = ctx;
  const v = h.video;
  return `<section class="hero" id="top">
  <div class="wrap">
    <div class="stage" id="stage">
      <div class="ghost" id="ghost" aria-hidden="true"><span><b class="ty">${esc(h.roles[0])}</b><i class="caret"></i><b class="rest"></b></span></div>
      <div class="vbox" id="vbox">
        <img class="still" id="still" src="${esc(v.still)}" alt="${esc(v.stillAlt)}" width="${v.width}" height="${v.height}">
        <canvas id="avatar" width="${v.width}" height="${v.height}" role="img" aria-label="${esc(v.canvasLabel)}" hidden></canvas>
        <video id="intro" playsinline muted loop preload="auto" aria-label="${esc(v.videoLabel)}">
          <source src="${esc(v.file)}" type="video/mp4">
        </video>
      </div>
      <div class="vctl" id="vctl">
        <button class="vbtn" id="sound" type="button" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON_SOUND}"/></svg><span id="soundlbl">${esc(h.controls.hear)}</span></button>
        <button class="vbtn round" id="play" type="button" aria-label="${esc(h.controls.pause)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path id="playpath" d="${ICON_PAUSE}"/></svg></button>
      </div>
    </div>
    <div class="hero-text">
      <div class="avail"><i aria-hidden="true"></i>${esc(profile.availability)}</div>
      <h1><span class="who">${rich(h.who, tokens)}</span> ${rich(h.title, tokens, { mutedTag: 'i' })}</h1>
      <p>${rich(h.tagline, tokens)}</p>
    </div>
    <div class="hero-cta">
      ${join(h.actions, (item) => action(item, ctx), '\n      ')}
    </div>
  </div>
</section>

<div class="proof">
  <div class="wrap">
    <span class="mono">${esc(h.clients.label)}</span>
    <ul>
      ${join(h.clients.names, (name) => `<li>${esc(name)}</li>`)}
    </ul>
  </div>
</div>`;
}
