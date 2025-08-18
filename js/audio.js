import { $ } from './utils.js';
import { TRACKS } from './constants.js';

export let audioCtx = null;
export let masterGain, comp;
export let drumGain, synthGain, synthCrusher, synthEnvGain, synthFilter;
export let lfoOsc, lfoGain;
export let synthOsc = null;
export let pulse25 = null, pulse125 = null;
export const trackGains = [];

let noiseBuffer = null;

// Synth params (defaults)
export let synthWaveType = 'square';
let bits = 8;
let attack = 0.01, decay = 0.15, release = 0.20, sustain = 0.6;
let glide = 0.02;
let octave = 0;
let vibratoRate = 0, vibratoDepth = 0; // Hz, cents

let drumHumanizeMs = 0;

export function ensureAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  masterGain = audioCtx.createGain();
  masterGain.gain.value = parseFloat($('#masterVol').value || '0.9');

  comp = audioCtx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.ratio.value = 6;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;

  masterGain.connect(comp).connect(audioCtx.destination);

  drumGain = audioCtx.createGain();
  drumGain.gain.value = 0.9;
  drumGain.connect(masterGain);

  synthGain = audioCtx.createGain();
  synthGain.gain.value = parseFloat($('#synthVol').value || '0.75');

  synthCrusher = audioCtx.createWaveShaper();
  synthCrusher.curve = makeBitCrusherCurve(bits);

  synthFilter = audioCtx.createBiquadFilter();
  synthFilter.type = 'lowpass';
  synthFilter.frequency.value = parseFloat($('#cut').value || '8000');
  synthFilter.Q.value = parseFloat($('#reso').value || '0.7');

  synthEnvGain = audioCtx.createGain();
  synthEnvGain.gain.value = 0.0;

  // Chain: osc -> env -> crusher -> filter -> synthGain -> master
  synthEnvGain.connect(synthCrusher).connect(synthFilter).connect(synthGain).connect(masterGain);

  // Per-track gains
  for (let i = 0; i < TRACKS.length; i++) {
    const g = audioCtx.createGain();
    g.gain.value = parseFloat($(`#vol${i}`).value);
    g.connect(drumGain);
    trackGains.push(g);
  }

  // Build pulse waves
  pulse25 = makePulseWave(0.25);
  pulse125 = makePulseWave(0.125);

  // Pre-warm synth oscillator (mono voice)
  initSynthOsc();

  // LFO for vibrato
  initSynthLFO();

  // Noise buffer for drums
  buildNoiseBuffer();
}

// ========= Drum voices =========
function buildNoiseBuffer() {
  const length = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
}

export function triggerDrum(track, time, accentMul = 1) {
  switch (track) {
    case 0: playKick(time, trackGains[0], accentMul); break;
    case 1: playSnare(time, trackGains[1], accentMul); break;
    case 2: playHat(time, trackGains[2], accentMul); break;
    case 3: playClap(time, trackGains[3], accentMul); break;
  }
}
function playKick(time, outNode, mul = 1) {
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  const gain = audioCtx.createGain();
  const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.12 - 0.06) : 0);
  gain.gain.setValueAtTime(1.0 * mul * vJit, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  osc.frequency.setValueAtTime(160, time);
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.22);

  osc.connect(gain).connect(outNode);
  osc.start(time);
  osc.stop(time + 0.23);
}
function playSnare(time, outNode, mul = 1) {
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer;
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1800;
  bp.Q.value = 0.7;

  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 800;

  const gain = audioCtx.createGain();
  const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.18 - 0.09) : 0);
  gain.gain.setValueAtTime(0.9 * mul * vJit, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

  src.connect(bp).connect(hp).connect(gain).connect(outNode);
  src.start(time);
  src.stop(time + 0.2);
}
function playHat(time, outNode, mul = 1) {
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer;

  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6000;
  hp.Q.value = 0.7;

  const gain = audioCtx.createGain();
  const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.2 - 0.1) : 0);
  gain.gain.setValueAtTime(0.5 * mul * vJit, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

  src.connect(hp).connect(gain).connect(outNode);
  src.start(time);
  src.stop(time + 0.07);
}
function playClap(time, outNode, mul = 1) {
  const burstTimes = [0, 0.015, 0.030];
  for (const dt of burstTimes) {
    const t = time + dt;
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;

    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1500;
    bp.Q.value = 0.8;

    const gain = audioCtx.createGain();
    const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.2 - 0.1) : 0);
    gain.gain.setValueAtTime(0.7 * mul * vJit, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    src.connect(bp).connect(gain).connect(outNode);
    src.start(t);
    src.stop(t + 0.13);
  }
}

// ========= Pulse waves =========
function makePulseWave(width) {
  const harmonics = 64;
  const real = new Float32Array(harmonics + 1);
  const imag = new Float32Array(harmonics + 1);
  real[0] = 0;
  for (let n = 1; n <= harmonics; n++) {
    imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * width);
    real[n] = 0;
  }
  return audioCtx.createPeriodicWave(real, imag, { disableNormalization: true });
}
function makeBitCrusherCurve(bitDepth) {
  const n = 1 << 16;
  const curve = new Float32Array(n);
  const levels = Math.pow(2, bitDepth);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    const y = Math.round((x + 1) * 0.5 * (levels - 1)) / (levels - 1) * 2 - 1;
    curve[i] = y;
  }
  return curve;
}

// ========= Synth Engine =========
function initSynthOsc() {
  if (synthOsc) return;
  synthOsc = audioCtx.createOscillator();
  updateOscWave();
  synthOsc.frequency.setValueAtTime(261.6256, audioCtx.currentTime); // C4
  synthOsc.connect(synthEnvGain);
  synthOsc.start();

  if (lfoGain) {
    try { lfoGain.disconnect(); } catch (e) {}
    lfoGain.connect(synthOsc.detune);
  }
}
function initSynthLFO() {
  if (lfoOsc) return;
  lfoOsc = audioCtx.createOscillator();
  lfoOsc.type = 'sine';
  lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0;
  lfoOsc.connect(lfoGain);
  if (synthOsc) lfoGain.connect(synthOsc.detune);
  lfoOsc.frequency.value = vibratoRate;
  lfoOsc.start();
}
function updateOscWave() {
  if (!synthOsc) return;
  switch (synthWaveType) {
    case 'square': synthOsc.type = 'square'; break;
    case 'pulse25': synthOsc.setPeriodicWave(pulse25); break;
    case 'pulse125': synthOsc.setPeriodicWave(pulse125); break;
    case 'triangle': synthOsc.type = 'triangle'; break;
  }
}
function noteFrequency(semitoneFromC4) {
  const base = 261.6255653005986;
  return base * Math.pow(2, semitoneFromC4 / 12);
}

export function synthNoteOn(semi) {
  ensureAudio();
  audioCtx.resume();
  initSynthOsc();
  initSynthLFO();

  const now = audioCtx.currentTime;
  const targetFreq = noteFrequency(semi + octave * 12);
  const tc = Math.max(0.0001, glide);
  synthOsc.frequency.setTargetAtTime(targetFreq, now, tc);

  const currentGain = synthEnvGain.gain.value;
  const atk = Math.max(0.001, attack);
  synthEnvGain.gain.cancelScheduledValues(now);
  if (currentGain < 0.01) {
    synthEnvGain.gain.setValueAtTime(0.0001, now);
  } else {
    synthEnvGain.gain.setTargetAtTime(0.15, now, 0.005);
  }
  synthEnvGain.gain.linearRampToValueAtTime(1.0, now + atk);
  synthEnvGain.gain.exponentialRampToValueAtTime(Math.max(0.001, sustain), now + atk + Math.max(0.005, decay));
}
export function synthNoteOff() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const rel = Math.max(0.001, release);
  synthEnvGain.gain.cancelScheduledValues(now);
  synthEnvGain.gain.setTargetAtTime(0.0001, now, rel / 3);
}
export function retargetNote(semi) {
  if (!audioCtx || !synthOsc) return;
  const now = audioCtx.currentTime;
  const targetFreq = noteFrequency(semi + octave * 12);
  synthOsc.frequency.setTargetAtTime(targetFreq, now, Math.max(0.0001, glide));
}

// ========= Setters/Getters for UI/state =========
export function setMasterVol(v) { ensureAudio(); masterGain.gain.value = parseFloat(v); }
export function setSynthVol(v) { ensureAudio(); synthGain.gain.value = parseFloat(v); }
export function setTrackVolume(i, v) { ensureAudio(); if (trackGains[i]) trackGains[i].gain.value = parseFloat(v); }

export function setFilterCutoff(v) { ensureAudio(); synthFilter.frequency.value = parseFloat(v); }
export function setFilterReso(v) { ensureAudio(); synthFilter.Q.value = parseFloat(v); }
export function setBits(v) { bits = parseInt(v, 10); ensureAudio(); synthCrusher.curve = makeBitCrusherCurve(bits); }
export function setSynthWaveType(type) { synthWaveType = type; if (audioCtx) updateOscWave(); }

export function setAttack(v) { attack = parseFloat(v); }
export function setDecay(v) { decay = parseFloat(v); }
export function setSustain(v) { sustain = Math.max(0, Math.min(1, parseFloat(v))); }
export function setRelease(v) { release = parseFloat(v); }
export function setGlide(v) { glide = parseFloat(v); }
export function setOctave(v) { octave = parseInt(v, 10); }
export function setVibratoRate(v) { vibratoRate = parseFloat(v); if (lfoOsc) lfoOsc.frequency.value = vibratoRate; }
export function setVibratoDepth(v) { vibratoDepth = parseFloat(v); if (lfoGain) lfoGain.gain.value = vibratoDepth; }
export function setDrumHumanizeMs(ms) { drumHumanizeMs = parseFloat(ms) || 0; }

export function getSynthParams() {
  return {
    wave: synthWaveType, attack, decay, sustain, release, glide, bits, octave,
    vibRate: vibratoRate, vibDepth: vibratoDepth,
    cutoff: synthFilter ? synthFilter.frequency.value : parseFloat($('#cut').value),
    reso: synthFilter ? synthFilter.Q.value : parseFloat($('#reso').value),
    vol: synthGain ? synthGain.gain.value : parseFloat($('#synthVol').value)
  };
}
export function getMasterVol() {
  return masterGain ? masterGain.gain.value : parseFloat($('#masterVol').value);
}