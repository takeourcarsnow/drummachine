'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { AppState, TrackState, SynthParams } from './types'
import { NUM_STEPS, TRACKS } from './constants'
import { triggerDrum, setDrumHumanizeMs, audioCtx, setSynthWaveType, setBits, setVibratoRate, setVibratoDepth, setMasterVol, setSynthVol, setTrackVolume, setFilterCutoff, setFilterReso } from './audio'
import { setAttack, setDecay, setSustain, setRelease, setGlide, setOctave } from './synth-engine'

const initialState: AppState = {
  v: 2,
  bpm: 120,
  swingAmt: 0,
  humanizeMs: 0,
  pattern: Array(TRACKS.length).fill(null).map(() => Array(NUM_STEPS).fill(0)),
  volumes: [0.9, 0.8, 0.65, 0.7],
  trackState: TRACKS.map(() => ({ mute: false, solo: false })),
  synth: {
    wave: 'square',
    attack: 0.01,
    decay: 0.15,
    sustain: 0.6,
    release: 0.2,
    glide: 0.02,
    bits: 8,
    cutoff: 8000,
    reso: 0.7,
    vibRate: 0,
    vibDepth: 0,
    octave: 0,
    vol: 0.75
  },
  master: 0.9,
  isPlaying: false,
  currentStep: 0
}

interface AppContextType {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  toggleCell: (track: number, step: number) => void
  setCell: (track: number, step: number, val: number) => void
  toggleMute: (track: number) => void
  toggleSolo: (track: number) => void
  randomize: () => void
  clear: () => void
  togglePlay: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setDrumHumanizeMs(state.humanizeMs)
  }, [state.humanizeMs])

  useEffect(() => {
    setMasterVol(state.master)
  }, [state.master])

  useEffect(() => {
    setSynthWaveType(state.synth.wave)
    setAttack(state.synth.attack)
    setDecay(state.synth.decay)
    setSustain(state.synth.sustain)
    setRelease(state.synth.release)
    setGlide(state.synth.glide)
    setBits(state.synth.bits)
    setFilterCutoff(state.synth.cutoff)
    setFilterReso(state.synth.reso)
    setVibratoRate(state.synth.vibRate)
    setVibratoDepth(state.synth.vibDepth)
    setOctave(state.synth.octave)
    setSynthVol(state.synth.vol)
  }, [state.synth])

  useEffect(() => {
    state.volumes.forEach((vol, i) => setTrackVolume(i, vol))
  }, [state.volumes])

  useEffect(() => {
    if (state.isPlaying) {
      const stepTime = 60 / state.bpm / 4 // 16th notes
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const nextStep = (prev.currentStep + 1) % NUM_STEPS
          // Trigger drums
          const hasSolo = prev.trackState.some(ts => ts.solo)
          for (let track = 0; track < TRACKS.length; track++) {
            const val = prev.pattern[track][prev.currentStep]
            const ts = prev.trackState[track]
            if (val > 0 && !ts.mute && (!hasSolo || ts.solo)) {
              const accentMul = val === 2 ? 1.5 : 1
              triggerDrum(track, audioCtx ? audioCtx.currentTime : 0, accentMul)
            }
          }
          return { ...prev, currentStep: nextStep }
        })
      }, stepTime * 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isPlaying, state.bpm, state.pattern, state.trackState])

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const toggleCell = useCallback((track: number, step: number) => {
    setState(prev => {
      const newPattern = prev.pattern.map((row, r) =>
        r === track ? row.map((val, s) => s === step ? (val > 0 ? 0 : 1) : val) : row
      )
      return { ...prev, pattern: newPattern }
    })
  }, [])

  const setCell = useCallback((track: number, step: number, val: number) => {
    setState(prev => {
      const newPattern = prev.pattern.map((row, r) =>
        r === track ? row.map((v, s) => s === step ? val : v) : row
      )
      return { ...prev, pattern: newPattern }
    })
  }, [])

  const toggleMute = useCallback((track: number) => {
    setState(prev => {
      const newTrackState = prev.trackState.map((ts, i) =>
        i === track ? { ...ts, mute: !ts.mute } : ts
      )
      return { ...prev, trackState: newTrackState }
    })
  }, [])

  const toggleSolo = useCallback((track: number) => {
    setState(prev => {
      const newTrackState = prev.trackState.map((ts, i) =>
        i === track ? { ...ts, solo: !ts.solo } : ts
      )
      return { ...prev, trackState: newTrackState }
    })
  }, [])

  const randomize = useCallback(() => {
    setState(prev => {
      const newPattern = prev.pattern.map(row =>
        row.map(() => Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : 2) : 0)
      )
      return { ...prev, pattern: newPattern }
    })
  }, [])

  const clear = useCallback(() => {
    setState(prev => ({
      ...prev,
      pattern: Array(TRACKS.length).fill(null).map(() => Array(NUM_STEPS).fill(0))
    }))
  }, [])

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }, [])

  return (
    <AppContext.Provider value={{
      state,
      updateState,
      toggleCell,
      setCell,
      toggleMute,
      toggleSolo,
      randomize,
      clear,
      togglePlay
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}