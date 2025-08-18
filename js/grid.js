import { $, $$ } from './utils.js';
import { NUM_STEPS, TRACKS } from './constants.js';
import { pattern, trackState } from './pattern.js';

export const gridEl = $('#grid');
export const gridHeadEl = $('#gridHead');
export const cellsByRowStep = [];

export function buildHead() {
  gridHeadEl.innerHTML = '';
  const lbl = document.createElement('div');
  lbl.className = 'track-name tiny';
  lbl.textContent = 'STEP';
  gridHeadEl.appendChild(lbl);
  for (let s = 0; s < NUM_STEPS; s++) {
    const head = document.createElement('div');
    head.className = 'step-head ' + (s % 2 === 0 ? 'even' : 'odd');
    head.textContent = (s + 1);
    gridHeadEl.appendChild(head);
  }
}

export function buildGrid() {
  gridEl.innerHTML = '';
  cellsByRowStep.length = 0;

  for (let r = 0; r < TRACKS.length; r++) {
    const name = document.createElement('div');
    name.className = 'track-name';
    const left = document.createElement('span');
    left.textContent = TRACKS[r].name;

    const ms = document.createElement('span');
    ms.className = 'ms';

    const mBtn = document.createElement('button');
    mBtn.className = 'toggle m';
    mBtn.textContent = 'M';
    mBtn.title = 'Mute';
    mBtn.addEventListener('click', () => {
      trackState[r].mute = !trackState[r].mute;
      mBtn.classList.toggle('active', trackState[r].mute);
    });

    const sBtn = document.createElement('button');
    sBtn.className = 'toggle s';
    sBtn.textContent = 'S';
    sBtn.title = 'Solo';
    sBtn.addEventListener('click', () => {
      trackState[r].solo = !trackState[r].solo;
      sBtn.classList.toggle('active', trackState[r].solo);
    });

    ms.appendChild(mBtn); ms.appendChild(sBtn);
    name.appendChild(left); name.appendChild(ms);
    gridEl.appendChild(name);

    const rowCells = [];
    for (let s = 0; s < NUM_STEPS; s++) {
      const cell = document.createElement('div');
      cell.className = 'cell ' + (s % 2 === 0 ? 'even' : 'odd');
      cell.dataset.r = r; cell.dataset.s = s;

      const val = pattern[r][s] || 0;
      if (val > 0) cell.classList.add('active');
      if (val === 2) cell.classList.add('accent');

      gridEl.appendChild(cell);
      rowCells.push(cell);
    }
    cellsByRowStep.push(rowCells);
  }

  enableGridPainting();
}

function enableGridPainting() {
  let painting = false;
  let paintTo = null; // 0,1,2
  let accentMode = false;

  function applyToCell(cell) {
    const r = parseInt(cell.dataset.r, 10);
    const s = parseInt(cell.dataset.s, 10);
    if (accentMode) {
      const curr = pattern[r][s];
      const newVal = (paintTo !== null) ? paintTo : (curr === 2 ? 1 : 2);
      pattern[r][s] = newVal;
      cell.classList.toggle('active', newVal > 0);
      cell.classList.toggle('accent', newVal === 2);
    } else {
      const curr = pattern[r][s];
      const newVal = (paintTo !== null) ? paintTo : (curr > 0 ? 0 : 1);
      pattern[r][s] = newVal;
      cell.classList.toggle('active', newVal > 0);
      cell.classList.toggle('accent', newVal === 2);
    }
  }

  gridEl.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('.cell');
    if (!target) return;
    painting = true;
    accentMode = e.altKey || e.metaKey;
    if (accentMode) {
      const r = parseInt(target.dataset.r, 10), s = parseInt(target.dataset.s, 10);
      paintTo = (pattern[r][s] === 2) ? 1 : 2;
    } else {
      const r = parseInt(target.dataset.r, 10), s = parseInt(target.dataset.s, 10);
      paintTo = (pattern[r][s] > 0) ? 0 : 1;
    }
    applyToCell(target);
    e.preventDefault();
  });
  gridEl.addEventListener('pointerenter', (e) => {
    if (!painting) return;
    const target = e.target.closest('.cell');
    if (target) applyToCell(target);
  }, true);
  window.addEventListener('pointerup', () => {
    if (painting) { painting = false; paintTo = null; }
  });
}