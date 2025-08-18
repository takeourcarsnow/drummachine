import { $ } from './utils.js';
import { TRACKS } from './constants.js';
import { ensureAudio, setTrackVolume } from './audio.js';

export function attachVolumeControls() {
  for (let i = 0; i < TRACKS.length; i++) {
    $(`#vol${i}`).addEventListener('input', e => {
      ensureAudio();
      setTrackVolume(i, e.target.value);
    });
  }
}