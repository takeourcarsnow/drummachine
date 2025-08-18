import { NUM_STEPS, TRACKS } from './constants.js';

export const pattern = Array.from({ length: TRACKS.length }, () => Array(NUM_STEPS).fill(0));
// Starter groove
pattern[0] = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0]; // Kick
pattern[1] = [0,0,0,0, 2,0,0,0, 0,1,0,0, 2,0,0,0]; // Snare
pattern[2] = [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]; // Hat
pattern[3] = [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,2]; // Clap

export const trackState = TRACKS.map(() => ({ mute: false, solo: false }));