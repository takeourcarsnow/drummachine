// WebAudio API types
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

export let audioCtx: AudioContext | null = null
export let masterGain: GainNode | null = null
export let comp: DynamicsCompressorNode | null = null
export let drumGain: GainNode | null = null
export let synthGain: GainNode | null = null
export let synthCrusher: WaveShaperNode | null = null
export let synthEnvGain: GainNode | null = null
export let synthFilter: BiquadFilterNode | null = null
export let lfoOsc: OscillatorNode | null = null
export let lfoGain: GainNode | null = null
export let synthOsc: OscillatorNode | null = null
export let pulse25: PeriodicWave | null = null
export let pulse125: PeriodicWave | null = null
export const trackGains: GainNode[] = []

let noiseBuffer: AudioBuffer | null = null

export function ensureAudio() {
  if (audioCtx) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  masterGain = audioCtx.createGain()
  masterGain.gain.value = 0.9

  comp = audioCtx.createDynamicsCompressor()
  comp.threshold.value = -10
  comp.ratio.value = 6
  comp.attack.value = 0.003
  comp.release.value = 0.2

  masterGain.connect(comp).connect(audioCtx.destination)

  drumGain = audioCtx.createGain()
  drumGain.gain.value = 0.9
  drumGain.connect(masterGain)

  synthGain = audioCtx.createGain()
  synthGain.gain.value = 0.75

  synthCrusher = audioCtx.createWaveShaper()
  synthCrusher.curve = makeBitCrusherCurve(8) as any

  synthFilter = audioCtx.createBiquadFilter()
  synthFilter.type = 'lowpass'
  synthFilter.frequency.value = 8000
  synthFilter.Q.value = 0.7

  synthEnvGain = audioCtx.createGain()
  synthEnvGain.gain.value = 0.0

  // Chain: osc -> env -> crusher -> filter -> synthGain -> master
  synthEnvGain.connect(synthCrusher).connect(synthFilter).connect(synthGain).connect(masterGain)

  // Per-track gains
  for (let i = 0; i < 4; i++) {
    const g = audioCtx.createGain()
    g.gain.value = 0.9 - i * 0.1 // default volumes
    g.connect(drumGain)
    trackGains.push(g)
  }

  // Build pulse waves
  pulse25 = makePulseWave(0.25)
  pulse125 = makePulseWave(0.125)

  // Pre-warm synth oscillator (mono voice)
  initSynthOsc()

  // LFO for vibrato
  initSynthLFO()

  // Noise buffer for drums
  buildNoiseBuffer()
}

function buildNoiseBuffer() {
  if (!audioCtx) return
  const length = audioCtx.sampleRate * 2
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buffer
}

function makePulseWave(width: number): PeriodicWave {
  if (!audioCtx) throw new Error('Audio not initialized')
  const harmonics = 64
  const real = new Float32Array(harmonics + 1)
  const imag = new Float32Array(harmonics + 1)
  real[0] = 0
  for (let n = 1; n <= harmonics; n++) {
    imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * width)
    real[n] = 0
  }
  return audioCtx.createPeriodicWave(real, imag, { disableNormalization: true })
}

function makeBitCrusherCurve(bitDepth: number): Float32Array {
  const n = 1 << 16
  const curve = new Float32Array(n)
  const levels = Math.pow(2, bitDepth)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    const y = Math.round((x + 1) * 0.5 * (levels - 1)) / (levels - 1) * 2 - 1
    curve[i] = y
  }
  return curve
}

function initSynthOsc() {
  if (synthOsc) return
  if (!audioCtx || !synthEnvGain) return
  synthOsc = audioCtx.createOscillator()
  updateOscWave()
  synthOsc.frequency.setValueAtTime(261.6256, audioCtx.currentTime) // C4
  synthOsc.connect(synthEnvGain)
  synthOsc.start()

  if (lfoGain) {
    try { lfoGain.disconnect() } catch (e) {}
    lfoGain.connect(synthOsc.detune)
  }
}

function initSynthLFO() {
  if (lfoOsc) return
  if (!audioCtx) return
  lfoOsc = audioCtx.createOscillator()
  lfoOsc.type = 'sine'
  lfoGain = audioCtx.createGain()
  lfoGain.gain.value = 0
  lfoOsc.connect(lfoGain)
  if (synthOsc) lfoGain.connect(synthOsc.detune)
  lfoOsc.frequency.value = 0
  lfoOsc.start()
}

function updateOscWave() {
  if (!synthOsc) return
  switch (synthWaveType) {
    case 'square': synthOsc.type = 'square'; break
    case 'pulse25': if (pulse25) synthOsc.setPeriodicWave(pulse25); break
    case 'pulse125': if (pulse125) synthOsc.setPeriodicWave(pulse125); break
    case 'triangle': synthOsc.type = 'triangle'; break
  }
}

// Synth params (defaults)
export let synthWaveType = 'square'
let bits = 8
let attack = 0.01
let decay = 0.15
let release = 0.20
let sustain = 0.6
let glide = 0.02
let octave = 0
let vibratoRate = 0
let vibratoDepth = 0

export function setSynthWaveType(type: string) { synthWaveType = type; if (audioCtx) updateOscWave() }
export function setBits(v: string | number) { bits = parseInt(v.toString(), 10); ensureAudio(); if (synthCrusher) synthCrusher.curve = makeBitCrusherCurve(bits) as any }
export function setVibratoRate(v: string | number) { vibratoRate = parseFloat(v.toString()); if (lfoOsc) lfoOsc.frequency.value = vibratoRate }
export function setVibratoDepth(v: string | number) { vibratoDepth = parseFloat(v.toString()); if (lfoGain) lfoGain.gain.value = vibratoDepth }

export function setMasterVol(v: string | number) { ensureAudio(); if (masterGain) masterGain.gain.value = parseFloat(v.toString()) }
export function setSynthVol(v: string | number) { ensureAudio(); if (synthGain) synthGain.gain.value = parseFloat(v.toString()) }
export function setTrackVolume(i: number, v: string | number) { ensureAudio(); if (trackGains[i]) trackGains[i].gain.value = parseFloat(v.toString()) }

export function setFilterCutoff(v: string | number) { ensureAudio(); if (synthFilter) synthFilter.frequency.value = parseFloat(v.toString()) }
export function setFilterReso(v: string | number) { ensureAudio(); if (synthFilter) synthFilter.Q.value = parseFloat(v.toString()) }

export function getSynthParams() {
  return {
    wave: synthWaveType, attack, decay, sustain, release, glide, bits, octave,
    vibRate: vibratoRate, vibDepth: vibratoDepth,
    cutoff: synthFilter ? synthFilter.frequency.value : 8000,
    reso: synthFilter ? synthFilter.Q.value : 0.7,
    vol: synthGain ? synthGain.gain.value : 0.75
  }
}
export function getMasterVol() {
  return masterGain ? masterGain.gain.value : 0.9
}