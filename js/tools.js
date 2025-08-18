import { $, $$, showToast } from './utils.js';
import { NUM_STEPS, TRACKS } from './constants.js';
import { pattern } from './pattern.js';
import { cellsByRowStep } from './grid.js';
import { getState, applyState } from './state.js';

export function attachTools() {
  $('#randomizeBtn').addEventListener('click', () => {
    const density = [0.7, 0.45, 0.85, 0.35];
    for (let r = 0; r < TRACKS.length; r++) {
      for (let s = 0; s < NUM_STEPS; s++) {
        let base = density[r] * (s % 4 === 0 ? 1.1 : 0.9) * (s % 8 === 0 ? 1.15 : 1.0);
        const on = Math.random() < base;
        const acc = on && Math.random() < 0.18 ? 2 : (on ? 1 : 0);
        pattern[r][s] = acc;
        const cell = cellsByRowStep[r][s];
        cell.classList.toggle('active', acc > 0);
        cell.classList.toggle('accent', acc === 2);
      }
    }
  });

  $('#clearBtn').addEventListener('click', () => {
    for (let r = 0; r < TRACKS.length; r++) {
      for (let s = 0; s < NUM_STEPS; s++) {
        pattern[r][s] = 0;
        const cell = cellsByRowStep[r][s];
        cell.classList.remove('active', 'accent');
      }
    }
  });

  $('#saveBtn').addEventListener('click', () => {
    const state = getState();
    localStorage.setItem('chiptrax_state_v2', JSON.stringify(state));
    showToast('Saved');
  });

  $('#loadBtn').addEventListener('click', () => {
    const txt = localStorage.getItem('chiptrax_state_v2');
    if (!txt) return showToast('Nothing saved');
    const state = JSON.parse(txt);
    applyState(state);
  });

  $('#shareBtn').addEventListener('click', async () => {
    const state = getState();
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    const url = location.origin + location.pathname + '#s=' + payload;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied');
    } catch (e) {
      location.hash = 's=' + payload;
      showToast('Link set in URL');
    }
  });
}