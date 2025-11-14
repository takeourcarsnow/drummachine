import { audioCtx, synthOsc, synthEnvGain, lfoGain, pulse25, pulse125, synthWaveType, ensureAudio } from './audio-context'

let attack = 0.01
let decay = 0.15
let release = 0.20
let sustain = 0.6
let glide = 0.02
let octave = 0

function noteFrequency(semitoneFromC4: number): number {
  const base = 261.6255653005986
  return base * Math.pow(2, semitoneFromC4 / 12)
}

export function synthNoteOn(semi: number) {
  ensureAudio()
  if (!audioCtx) return
  audioCtx.resume()
  // initSynthOsc() already called in ensureAudio

  const now = audioCtx.currentTime
  const targetFreq = noteFrequency(semi + octave * 12)
  const tc = Math.max(0.0001, glide)
  if (synthOsc) synthOsc.frequency.setTargetAtTime(targetFreq, now, tc)

  const currentGain = synthEnvGain ? synthEnvGain.gain.value : 0
  const atk = Math.max(0.001, attack)
  if (synthEnvGain) {
    synthEnvGain.gain.cancelScheduledValues(now)
    if (currentGain < 0.01) {
      synthEnvGain.gain.setValueAtTime(0.0001, now)
    } else {
      synthEnvGain.gain.setTargetAtTime(0.15, now, 0.005)
    }
    synthEnvGain.gain.linearRampToValueAtTime(1.0, now + atk)
    synthEnvGain.gain.exponentialRampToValueAtTime(Math.max(0.001, sustain), now + atk + Math.max(0.005, decay))
  }
}

export function synthNoteOff() {
  if (!audioCtx || !synthEnvGain) return
  const now = audioCtx.currentTime
  const rel = Math.max(0.001, release)
  synthEnvGain.gain.cancelScheduledValues(now)
  synthEnvGain.gain.setTargetAtTime(0.0001, now, rel / 3)
}

export function retargetNote(semi: number) {
  if (!audioCtx || !synthOsc) return
  const now = audioCtx.currentTime
  const targetFreq = noteFrequency(semi + octave * 12)
  synthOsc.frequency.setTargetAtTime(targetFreq, now, Math.max(0.0001, glide))
}

export function setAttack(v: string | number) { attack = parseFloat(v.toString()) }
export function setDecay(v: string | number) { decay = parseFloat(v.toString()) }
export function setSustain(v: string | number) { sustain = Math.max(0, Math.min(1, parseFloat(v.toString()))) }
export function setRelease(v: string | number) { release = parseFloat(v.toString()) }
export function setGlide(v: string | number) { glide = parseFloat(v.toString()) }
export function setOctave(v: string | number) { octave = parseInt(v.toString(), 10) }