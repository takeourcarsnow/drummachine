import { audioCtx, trackGains, ensureAudio } from './audio-context'

let noiseBuffer: AudioBuffer | null = null
let drumHumanizeMs = 0

function buildNoiseBuffer() {
  if (!audioCtx) return
  const length = audioCtx.sampleRate * 2
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buffer
}

export function triggerDrum(track: number, time: number, accentMul = 1) {
  ensureAudio()
  buildNoiseBuffer() // ensure noise buffer
  switch (track) {
    case 0: playKick(time, trackGains[0], accentMul); break
    case 1: playSnare(time, trackGains[1], accentMul); break
    case 2: playHat(time, trackGains[2], accentMul); break
    case 3: playClap(time, trackGains[3], accentMul); break
  }
}

function playKick(time: number, outNode: GainNode, mul = 1) {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  osc.type = 'triangle'
  const gain = audioCtx.createGain()
  const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.12 - 0.06) : 0)
  gain.gain.setValueAtTime(1.0 * mul * vJit, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22)

  osc.frequency.setValueAtTime(160, time)
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.22)

  osc.connect(gain).connect(outNode)
  osc.start(time)
  osc.stop(time + 0.23)
}

function playSnare(time: number, outNode: GainNode, mul = 1) {
  if (!audioCtx || !noiseBuffer) return
  const src = audioCtx.createBufferSource()
  src.buffer = noiseBuffer
  const bp = audioCtx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1800
  bp.Q.value = 0.7

  const hp = audioCtx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 800

  const gain = audioCtx.createGain()
  const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.18 - 0.09) : 0)
  gain.gain.setValueAtTime(0.9 * mul * vJit, time)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18)

  src.connect(bp).connect(hp).connect(gain).connect(outNode)
  src.start(time)
  src.stop(time + 0.2)
}

function playHat(time: number, outNode: GainNode, mul = 1) {
  if (!audioCtx || !noiseBuffer) return
  const src = audioCtx.createBufferSource()
  src.buffer = noiseBuffer

  const hp = audioCtx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 6000
  hp.Q.value = 0.7

  const gain = audioCtx.createGain()
  const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.2 - 0.1) : 0)
  gain.gain.setValueAtTime(0.5 * mul * vJit, time)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06)

  src.connect(hp).connect(gain).connect(outNode)
  src.start(time)
  src.stop(time + 0.07)
}

function playClap(time: number, outNode: GainNode, mul = 1) {
  if (!audioCtx || !noiseBuffer) return
  const burstTimes = [0, 0.015, 0.030]
  for (const dt of burstTimes) {
    const t = time + dt
    const src = audioCtx.createBufferSource()
    src.buffer = noiseBuffer

    const bp = audioCtx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1500
    bp.Q.value = 0.8

    const gain = audioCtx.createGain()
    const vJit = 1 + (drumHumanizeMs > 0 ? (Math.random() * 0.2 - 0.1) : 0)
    gain.gain.setValueAtTime(0.7 * mul * vJit, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)

    src.connect(bp).connect(gain).connect(outNode)
    src.start(t)
    src.stop(t + 0.13)
  }
}

export function setDrumHumanizeMs(ms: string | number) { drumHumanizeMs = parseFloat(ms.toString()) || 0 }