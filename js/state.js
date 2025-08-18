import { $, $$, clamp, showToast } from './utils.js';
import { NUM_STEPS, TRACKS } from './constants.js';
import { pattern, trackState } from './pattern.js';
import { ensureAudio, getSynthParams, setSynthWaveType, setAttack, setDecay, setSustain, setRelease, setGlide, setBits, setOctave, setVibratoRate, setVibratoDepth, setFilterCutoff, setFilterReso, setSynthVol, setMasterVol, trackGains, synthFilter, synthGain, masterGain } from './audio.js';
import { getBPM, getSwing, getHuman, setBPM, setSwing, setHuman } from './transport.js';
import { cellsByRowStep, gridEl } from './grid.js';

export function getState() {
  return {
    v: 2,
    bpm: getBPM(),
    swingAmt: getSwing(),
    humanizeMs: getHuman(),
    pattern,
    volumes: trackGains.length
      ? trackGains.map((g, i) => g.gain.value)
      : [parseFloat($('#vol0').value), parseFloat($('#vol1').value), parseFloat($('#vol2').value), parseFloat($('#vol3').value)],
    trackState,
    synth: getSynthParams(),
    master: masterGain ? masterGain.gain.value : parseFloat($('#masterVol').value)
  };
}

export function applyState(st) {
  try {
    if (!st) return;
    if (typeof st.bpm === 'number') { setBPM(st.bpm); $('#bpm').value = st.bpm; $('#bpmNum').value = st.bpm; }
    if (typeof st.swingAmt === 'number') { setSwing(st.swingAmt); $('#swing').value = st.swingAmt; $('#swingTxt').textContent = Math.round(st.swingAmt * 100) + '%'; }
    if (typeof st.humanizeMs === 'number') { setHuman(st.humanizeMs); $('#human').value = st.humanizeMs; $('#humanTxt').textContent = Math.round(st.humanizeMs) + 'ms'; }

    if (Array.isArray(st.pattern) && st.pattern.length === TRACKS.length) {
      for (let r = 0; r < TRACKS.length; r++) {
        for (let s = 0; s < NUM_STEPS; s++) {
          const v = clamp((st.pattern[r][s] || 0) | 0, 0, 2);
          pattern[r][s] = v;
          const cell = cellsByRowStep[r][s];
          cell.classList.toggle('active', v > 0);
          cell.classList.toggle('accent', v === 2);
        }
      }
    }

    if (Array.isArray(st.volumes)) {
      st.volumes.forEach((v, i) => {
        const val = clamp(parseFloat(v) || 0, 0, 1);
        const el = $(`#vol${i}`); if (el) el.value = val;
        ensureAudio();
        if (trackGains[i]) trackGains[i].gain.value = val;
      });
    }

    if (Array.isArray(st.trackState)) {
      st.trackState.forEach((ts, i) => {
        if (!ts) return;
        trackState[i].mute = !!ts.mute;
        trackState[i].solo = !!ts.solo;
        const rowName = gridEl.children[i * (NUM_STEPS + 1)];
        const btns = $$('.toggle', rowName);
        if (btns[0]) btns[0].classList.toggle('active', trackState[i].mute);
        if (btns[1]) btns[1].classList.toggle('active', trackState[i].solo);
      });
    }

    if (st.synth) {
      const s = st.synth;
      if (s.wave) { $('#waveSel').value = s.wave; setSynthWaveType(s.wave); }
      if (typeof s.attack === 'number') { $('#att').value = s.attack; setAttack(s.attack); }
      if (typeof s.decay === 'number') { $('#dec').value = s.decay; setDecay(s.decay); }
      if (typeof s.sustain === 'number') { const v = clamp(s.sustain, 0, 1); $('#sus').value = v; setSustain(v); }
      if (typeof s.release === 'number') { $('#rel').value = s.release; setRelease(s.release); }
      if (typeof s.glide === 'number') { $('#glide').value = s.glide; setGlide(s.glide); }
      if (typeof s.bits === 'number') { $('#bits').value = s.bits; ensureAudio(); setBits(s.bits); }
      if (typeof s.octave === 'number') { $('#oct').value = s.octave; setOctave(s.octave); }
      if (typeof s.vibRate === 'number') { $('#vibRate').value = s.vibRate; setVibratoRate(s.vibRate); }
      if (typeof s.vibDepth === 'number') { $('#vibDepth').value = s.vibDepth; setVibratoDepth(s.vibDepth); }
      if (typeof s.cutoff === 'number') { $('#cut').value = s.cutoff; ensureAudio(); setFilterCutoff(s.cutoff); }
      if (typeof s.reso === 'number') { $('#reso').value = s.reso; ensureAudio(); setFilterReso(s.reso); }
      if (typeof s.vol === 'number') { $('#synthVol').value = s.vol; ensureAudio(); setSynthVol(s.vol); }
    }

    if (typeof st.master === 'number') { $('#masterVol').value = st.master; ensureAudio(); setMasterVol(st.master); }

    showToast('Loaded');
  } catch (err) {
    console.error(err);
    showToast('Load failed', 1200);
  }
}

export function loadFromHash() {
  const h = location.hash;
  const m = h.match(/#s=([^&]+)/);
  if (!m) return;
  try {
    const json = decodeURIComponent(escape(atob(m[1])));
    const state = JSON.parse(json);
    applyState(state);
    showToast('Preset loaded from link', 1000);
  } catch (e) {
    console.warn('Failed to load state from hash', e);
  }
}