// Hero avatar. The video file carries the picture on its top half and a cut-out matte on its
// bottom half; WebGL draws the two together onto a canvas so the avatar has no background.
// It starts with sound where the browser allows, otherwise silently until the first interaction.

const ICON_PLAY = 'M8 5v14l11-7z';
const ICON_PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';

const VERTEX = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const FRAGMENT = 'precision mediump float;uniform sampler2D t;varying vec2 uv;void main(){float y=1.-uv.y;vec3 c=texture2D(t,vec2(uv.x,.001+y*.497)).rgb;float a=texture2D(t,vec2(uv.x,.502+y*.497)).g;gl_FragColor=vec4(c,smoothstep(.07,.93,a));}';

function createRenderer(canvas) {
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const shader = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.viewport(0, 0, canvas.width, canvas.height);

  return (video) => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

export function initHeroVideo({ data, reduceMotion }) {
  const labels = data.controls;
  const video = document.getElementById('intro');
  const controls = document.getElementById('vctl');
  const playButton = document.getElementById('play');
  const playIcon = document.getElementById('playpath');
  const soundButton = document.getElementById('sound');
  const soundLabel = document.getElementById('soundlbl');
  const canvas = document.getElementById('avatar');
  const still = document.getElementById('still');
  let wantSound = true; // sound is on unless the visitor mutes it
  let canvasShown = false;

  function tryPlay(onFail) {
    try {
      const promise = video.play();
      if (promise && promise.catch) promise.catch(onFail || (() => {}));
    } catch {
      if (onFail) onFail();
    }
  }
  function sync() {
    playIcon.setAttribute('d', video.paused ? ICON_PLAY : ICON_PAUSE);
    playButton.setAttribute('aria-label', video.paused ? labels.play : labels.pause);
    soundButton.setAttribute('aria-pressed', video.muted ? 'false' : 'true');
    soundLabel.textContent = video.muted ? labels.hear : labels.mute;
  }
  function quiet() {
    video.muted = true;
    video.loop = true;
    sync();
  }
  function rewind() {
    try {
      video.currentTime = 0;
    } catch {
      /* not seekable yet */
    }
  }
  function withSound() {
    video.muted = false;
    video.loop = false;
    rewind();
    tryPlay(() => {
      quiet();
      tryPlay();
    });
    sync();
  }
  function toggleSound() {
    if (video.muted) {
      wantSound = true;
      withSound();
    } else {
      wantSound = false;
      quiet();
    }
  }

  playButton.addEventListener('click', () => (video.paused ? tryPlay() : video.pause()));
  soundButton.addEventListener('click', toggleSound);
  document.getElementById('vbox').addEventListener('click', toggleSound);
  for (const event of ['play', 'pause', 'volumechange']) video.addEventListener(event, sync);
  video.addEventListener('ended', () => {
    wantSound = false; // the intro is spoken once, then loops silently
    quiet();
    rewind();
    if (!reduceMotion) tryPlay();
  });

  // No playable video: hide the controls and leave the still image in place.
  const hideControls = () => {
    controls.hidden = true;
  };
  const sources = video.querySelectorAll('source');
  if (sources.length) sources[sources.length - 1].addEventListener('error', hideControls);
  video.addEventListener('error', hideControls);
  // The error event may have fired before this script ran, so also look at the state directly.
  for (const delay of [600, 3000]) {
    setTimeout(() => {
      if (video.readyState === 0 && video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) hideControls();
    }, delay);
  }

  const render = createRenderer(canvas);
  if (render) {
    const draw = () => {
      if (video.readyState < 2) return;
      try {
        render(video);
        if (!canvasShown) {
          canvasShown = true;
          canvas.hidden = false;
          still.hidden = true;
        }
      } catch {
        /* a frame that cannot be read is skipped */
      }
    };
    if (video.requestVideoFrameCallback) {
      const onFrame = () => {
        draw();
        video.requestVideoFrameCallback(onFrame);
      };
      video.requestVideoFrameCallback(onFrame);
    } else {
      const tick = () => {
        if (!video.paused) draw();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    for (const event of ['loadeddata', 'seeked']) video.addEventListener(event, draw);
  }

  // A browser that refuses sound before any interaction gets a silent start; the first click
  // or key press anywhere on the page then restarts the intro with sound.
  function armSound() {
    const first = (event) => {
      document.removeEventListener('click', first, true);
      document.removeEventListener('keydown', first, true);
      if (event.type === 'click' && event.target.closest && event.target.closest('#vctl,#vbox')) return; // those have their own handlers
      if (wantSound && video.muted && !video.paused) withSound();
    };
    document.addEventListener('click', first, true);
    document.addEventListener('keydown', first, true);
  }

  if (!reduceMotion) {
    video.muted = false;
    video.loop = false;
    tryPlay(() => {
      quiet();
      tryPlay();
      armSound();
    });
  }
  sync();
}
