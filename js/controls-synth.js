import { $, $$, clamp } from './utils.js';
import {
  ensureAudio, setSynthWaveType, setAttack, setDecay, setSustain, setRelease, setGlide,
  setBits, setFilterCutoff, setFilterReso, setVibratoRate, setVibratoDepth, setOctave, setSynthVol,
  synthNoteOn, synthNoteOff
} from './audio.js';

export function attachSynthControls() {
  $('#waveSel').addEventListener('change', e => setSynthWaveType(e.target.value));
  $('#att').addEventListener('input', e => setAttack(e.target.value));
  $('#dec').addEventListener('input', e => setDecay(e.target.value));
  $('#sus').addEventListener('input', e => setSustain(e.target.value));
  $('#rel').addEventListener('input', e => setRelease(e.target.value));
  $('#glide').addEventListener('input', e => setGlide(e.target.value));
  $('#bits').addEventListener('input', e => { ensureAudio(); setBits(e.target.value); });
  $('#cut').addEventListener('input', e => setFilterCutoff(e.target.value));
  $('#reso').addEventListener('input', e => setFilterReso(e.target.value));
  $('#vibRate').addEventListener('input', e => setVibratoRate(e.target.value));
  $('#vibDepth').addEventListener('input', e => setVibratoDepth(e.target.value));
  $('#oct').addEventListener('input', e => setOctave(clamp(parseInt(e.target.value, 10) || 0, -2, 3)));
  $('#synthVol').addEventListener('input', e => { ensureAudio(); setSynthVol(e.target.value); });
}

export function layoutKeyboard() {
  const wrap = $('#kbwrap');
  wrap.innerHTML = '';
  const whiteKeyOrder = [0,2,4,5,7,9,11];
  const positions = [0,1,2,3,4,5,6];
  const whiteW = 40 + 6;
  const kbW = positions.length * whiteW - 6;
  wrap.style.width = kbW + 'px';

  // Whites
  whiteKeyOrder.forEach((semi, i) => {
    const key = document.createElement('div');
    key.className = 'key kb-note white';
    key.dataset.note = semi.toString();
    key.style.left = (i * whiteW) + 'px';
    key.style.top = '8px';
    key.style.width = '40px';
    key.style.height = '140px';
    wrap.appendChild(key);
  });

  // Blacks
  const blackMap = [
    { semi: 1, pos: 0, offset: 30 },
    { semi: 3, pos: 1, offset: 30 },
    { semi: 6, pos: 3, offset: 30 },
    { semi: 8, pos: 4, offset: 30 },
    { semi: 10, pos: 5, offset: 30 },
  ];
  blackMap.forEach(({ semi, pos, offset }) => {
    const key = document.createElement('div');
    key.className = 'key black kb-note';
    key.dataset.note = semi.toString();
    key.style.left = (pos * whiteW + offset) + 'px';
    key.style.top = '8px';
    key.style.width = '28px';
    key.style.height = '92px';
    wrap.appendChild(key);
  });

  // Pointer handlers
  $$('.kb-note', wrap).forEach(el => {
    const semiInOct = parseInt(el.dataset.note, 10);
    let downed = false;
    const down = (ev) => {
      if (downed) return;
      downed = true;
      el.classList.add('down');
      synthNoteOn(semiInOct);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('mouseup', up, { once: true });
      ev.preventDefault();
    };
    const up = () => {
      if (!downed) return;
      downed = false;
      el.classList.remove('down');
      synthNoteOff();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('mousedown', down);
    el.addEventListener('touchstart', (e) => { down(e); }, { passive: false });
  });
}

export function blinkKeyUI(semiInOct, down) {
  const el = $(`.kb-note[data-note="${semiInOct}"]`);
  if (el) {
    if (down) el.classList.add('down'); else el.classList.remove('down');
  }
}