import { buildHead, buildGrid } from './grid.js';
import { attachTransportControls } from './controls-transport.js';
import { attachSynthControls, layoutKeyboard } from './controls-synth.js';
import { attachComputerKeyboard } from './keyboard.js';
import { attachVolumeControls } from './volumes.js';
import { attachTools } from './tools.js';
import { loadFromHash } from './state.js';
import { ensureAudio } from './audio.js';

// Build UI
buildHead();
buildGrid();
attachSynthControls();
layoutKeyboard();
attachTransportControls();
attachVolumeControls();
attachTools();
attachComputerKeyboard();

// Load from URL hash if present
loadFromHash();

// Helpful: prevent context menu on long-press
document.addEventListener('contextmenu', e => e.preventDefault());

// Lazily initialize audio on first pointer (unlock audio)
window.addEventListener('pointerdown', () => { try { ensureAudio(); } catch (e) {} }, { once: true });