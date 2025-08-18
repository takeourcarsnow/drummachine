import { clamp } from './utils.js';
import { NUM_STEPS } from './constants.js';
import { pattern, trackState } from './pattern.js';
import { ensureAudio, audioCtx, triggerDrum, setDrumHumanizeMs } from './audio.js';
import { cellsByRowStep } from './grid.js';

let schedulerTimer = null;
const scheduleAheadTime = 0.10; // seconds
const lookahead = 25; // ms

export let isPlaying = false;
let currentStep = 0;
let nextNoteTime = 0;

let bpm = 120;
let swingAmt = 0;
let humanizeMs = 0;

export function getBPM() { return bpm; }
export function getSwing() { return swingAmt; }
export function getHuman() { return humanizeMs; }

export function setBPM(val) {
  bpm = clamp(parseFloat(val) || 120, 40, 240);
}
export function setSwing(val) {
  swingAmt = clamp(parseFloat(val) || 0, 0, 0.6);
}
export function setHuman(val) {
  humanizeMs = clamp(parseFloat(val) || 0, 0, 30);
  setDrumHumanizeMs(humanizeMs);
}

export function togglePlay() {
  ensureAudio();
  audioCtx.resume();
  if (isPlaying) { stop(); } else { start(); }
  return isPlaying;
}
export function start() {
  isPlaying = true;
  currentStep = 0;
  nextNoteTime = audioCtx.currentTime + 0.06;
  schedulerTimer = setInterval(scheduler, lookahead);
}
export function stop() {
  isPlaying = false;
  clearInterval(schedulerTimer);
  schedulerTimer = null;
  clearPlayheads();
}

function scheduler() {
  const spb = 60.0 / bpm;
  const stepDur = spb / 4.0; // 16ths

  while (audioCtx && nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleStep(currentStep, nextNoteTime);

    const swingDelta = (currentStep % 2 === 0) ? stepDur * (1 - swingAmt) : stepDur * (1 + swingAmt);
    nextNoteTime += swingDelta;

    currentStep = (currentStep + 1) % NUM_STEPS;
  }
}

function anySolo() {
  return trackState.some(t => t.solo);
}

function scheduleStep(stepIndex, time) {
  // Trigger drums
  for (let r = 0; r < pattern.length; r++) {
    const val = pattern[r][stepIndex];
    if (val > 0) {
      if (trackState[r].mute) continue;
      if (anySolo() && !trackState[r].solo) continue;

      const accentMul = (val === 2) ? 1.5 : 1.0;
      const jitter = (humanizeMs > 0) ? ((Math.random() * 2 - 1) * (humanizeMs / 1000)) : 0;
      triggerDrum(r, time + jitter, accentMul);
    }
  }

  // Visual playhead aligned to audio
  const uiDelay = Math.max(0, (time - audioCtx.currentTime) * 1000 - 2);
  setTimeout(() => {
    if (lastVisStep != null) {
      for (let r = 0; r < pattern.length; r++) {
        const prevCell = cellsByRowStep[r][lastVisStep];
        if (prevCell) prevCell.classList.remove('playing');
      }
    }
    for (let r = 0; r < pattern.length; r++) {
      const cell = cellsByRowStep[r][stepIndex];
      if (cell) cell.classList.add('playing');
    }
    lastVisStep = stepIndex;
  }, uiDelay);
}

let lastVisStep = null;
export function clearPlayheads() {
  if (lastVisStep != null) {
    for (let r = 0; r < pattern.length; r++) {
      const cell = cellsByRowStep[r][lastVisStep];
      if (cell) cell.classList.remove('playing');
    }
    lastVisStep = null;
  }
}