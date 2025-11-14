export interface TrackState {
  mute: boolean;
  solo: boolean;
}

export interface SynthParams {
  wave: string;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  glide: number;
  bits: number;
  cutoff: number;
  reso: number;
  vibRate: number;
  vibDepth: number;
  octave: number;
  vol: number;
}

export interface AppState {
  v: number;
  bpm: number;
  swingAmt: number;
  humanizeMs: number;
  pattern: number[][];
  volumes: number[];
  trackState: TrackState[];
  synth: SynthParams;
  master: number;
}