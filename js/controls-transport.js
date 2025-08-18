import { $, clamp, isTyping } from './utils.js';
import { setBPM, setSwing, setHuman, togglePlay, getBPM } from './transport.js';
import { ensureAudio, setMasterVol } from './audio.js';

export function attachTransportControls() {
  const playBtn = $('#playBtn');
  const tapBtn = $('#tapBtn');
  const bpmSlider = $('#bpm');
  const bpmNum = $('#bpmNum');
  const swingSlider = $('#swing');
  const swingTxt = $('#swingTxt');
  const humanSlider = $('#human');
  const humanTxt = $('#humanTxt');

  function updateBPM(val) {
    setBPM(val);
    const v = clamp(parseFloat(val)||120, 40, 240);
    bpmSlider.value = v;
    bpmNum.value = v;
  }
  function updateSwing(val) {
    setSwing(val);
    const v = clamp(parseFloat(val)||0, 0, 0.6);
    swingSlider.value = v;
    swingTxt.textContent = Math.round(v * 100) + '%';
  }
  function updateHuman(val) {
    setHuman(val);
    const v = clamp(parseFloat(val)||0, 0, 30);
    humanSlider.value = v;
    humanTxt.textContent = Math.round(v) + 'ms';
  }

  // Wire controls
  playBtn.addEventListener('click', () => {
    const playing = togglePlay();
    playBtn.textContent = playing ? '■ Stop' : '▶ Play';
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat && !isTyping(e)) {
      e.preventDefault();
      const playing = togglePlay();
      playBtn.textContent = playing ? '■ Stop' : '▶ Play';
    }
  });

  bpmSlider.addEventListener('input', e => updateBPM(e.target.value));
  bpmNum.addEventListener('input', e => updateBPM(e.target.value));
  swingSlider.addEventListener('input', e => updateSwing(e.target.value));
  humanSlider.addEventListener('input', e => updateHuman(e.target.value));

  // Init
  updateBPM(120);
  updateSwing(0);
  updateHuman(0);

  // Master volume
  $('#masterVol').addEventListener('input', e => {
    ensureAudio();
    setMasterVol(e.target.value);
  });

  // Tap tempo
  const tapTimes = [];
  let tapTimeout = null;
  tapBtn.addEventListener('click', () => {
    const now = performance.now();
    tapTimes.push(now);
    if (tapTimes.length > 6) tapTimes.shift();
    if (tapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimes.length; i++) intervals.push(tapTimes[i] - tapTimes[i - 1]);
      const avg = intervals.slice(-4).reduce((a, b) => a + b, 0) / Math.min(4, intervals.length);
      const newBpm = clamp(60000 / avg, 40, 240);
      updateBPM(newBpm.toFixed(0));
    }
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => tapTimes.length = 0, 1500);
  });
}