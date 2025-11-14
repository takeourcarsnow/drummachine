'use client'

import React from 'react'
import { useApp } from './AppContext'

const SynthControls = () => {
  const { state, updateState } = useApp()

  const handleWaveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateState({ synth: { ...state.synth, wave: e.target.value } })
  }

  const handleAttackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, attack: parseFloat(e.target.value) } })
  }

  const handleDecayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, decay: parseFloat(e.target.value) } })
  }

  const handleSustainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, sustain: parseFloat(e.target.value) } })
  }

  const handleReleaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, release: parseFloat(e.target.value) } })
  }

  const handleGlideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, glide: parseFloat(e.target.value) } })
  }

  const handleBitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, bits: parseInt(e.target.value) } })
  }

  const handleCutoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, cutoff: parseFloat(e.target.value) } })
  }

  const handleResoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, reso: parseFloat(e.target.value) } })
  }

  const handleVibRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, vibRate: parseFloat(e.target.value) } })
  }

  const handleVibDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, vibDepth: parseFloat(e.target.value) } })
  }

  const handleOctaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, octave: parseInt(e.target.value) } })
  }

  const handleSynthVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ synth: { ...state.synth, vol: parseFloat(e.target.value) } })
  }

  return (
    <div style={{ minWidth: '300px', flex: 1 }}>
      <div className="title">Chippy Synth</div>
      <div className="controls" style={{ gap: '12px' }}>
        <div className="ctrl">
          <label htmlFor="waveSel">Wave</label>
          <select id="waveSel" value={state.synth.wave} onChange={handleWaveChange}>
            <option value="square">Square 50%</option>
            <option value="pulse25">Pulse 25%</option>
            <option value="pulse125">Pulse 12.5%</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="ctrl">
          <label htmlFor="att">Attack</label>
          <input
            type="range"
            id="att"
            min="0"
            max="0.5"
            step="0.005"
            value={state.synth.attack}
            onChange={handleAttackChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="dec">Decay</label>
          <input
            type="range"
            id="dec"
            min="0"
            max="1.5"
            step="0.01"
            value={state.synth.decay}
            onChange={handleDecayChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="sus">Sustain</label>
          <input
            type="range"
            id="sus"
            min="0"
            max="1.0"
            step="0.01"
            value={state.synth.sustain}
            onChange={handleSustainChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="rel">Release</label>
          <input
            type="range"
            id="rel"
            min="0"
            max="2.0"
            step="0.01"
            value={state.synth.release}
            onChange={handleReleaseChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="glide">Glide</label>
          <input
            type="range"
            id="glide"
            min="0"
            max="0.2"
            step="0.005"
            value={state.synth.glide}
            onChange={handleGlideChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="bits">Bits</label>
          <input
            type="range"
            id="bits"
            min="4"
            max="16"
            step="1"
            value={state.synth.bits}
            onChange={handleBitsChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="cut">Cutoff</label>
          <input
            type="range"
            id="cut"
            min="200"
            max="12000"
            step="1"
            value={state.synth.cutoff}
            onChange={handleCutoffChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="reso">Reso</label>
          <input
            type="range"
            id="reso"
            min="0.1"
            max="12"
            step="0.1"
            value={state.synth.reso}
            onChange={handleResoChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="vibRate">Vib Hz</label>
          <input
            type="range"
            id="vibRate"
            min="0"
            max="12"
            step="0.1"
            value={state.synth.vibRate}
            onChange={handleVibRateChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="vibDepth">Vib Cents</label>
          <input
            type="range"
            id="vibDepth"
            min="0"
            max="80"
            step="1"
            value={state.synth.vibDepth}
            onChange={handleVibDepthChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="oct">Oct</label>
          <input
            type="number"
            id="oct"
            min="-2"
            max="3"
            value={state.synth.octave}
            onChange={handleOctaveChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="synthVol">Vol</label>
          <input
            type="range"
            id="synthVol"
            min="0"
            max="1"
            step="0.01"
            value={state.synth.vol}
            onChange={handleSynthVolChange}
          />
        </div>
      </div>

      <div className="help">
        Keyboard: Z S X D C V G B H N J M , (C–C) and Q 2 W 3 E R 5 T 6 Y 7 U I (upper octave). Hold keys for glide.
      </div>
    </div>
  )
}

export default React.memo(SynthControls)