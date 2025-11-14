'use client'

import React from 'react'
import { useApp } from './AppContext'
import { NUM_STEPS, TRACKS } from './constants'
import { setTrackVolume } from './audio'

export default function DrumGrid() {
  const { state, updateState, toggleCell, setCell, toggleMute, toggleSolo } = useApp()

  return (
    <div className="row panel">
      <div className="title">Drum Machine</div>

      <div className="grid grid-head">
        <div className="track-name tiny">STEP</div>
        {Array.from({ length: NUM_STEPS }, (_, s) => (
          <div key={s} className={`step-head ${s % 2 === 0 ? 'even' : ''}`}>
            {s + 1}
          </div>
        ))}
      </div>

      <div className="grid">
        {TRACKS.map((track, r) => (
          <React.Fragment key={r}>
            <div className="track-name">
              <span>{track.name}</span>
              <span className="ms">
                <button
                  className={`toggle m ${state.trackState[r].mute ? 'active' : ''}`}
                  onClick={() => toggleMute(r)}
                  title="Mute"
                >
                  M
                </button>
                <button
                  className={`toggle s ${state.trackState[r].solo ? 'active' : ''}`}
                  onClick={() => toggleSolo(r)}
                  title="Solo"
                >
                  S
                </button>
              </span>
            </div>
            {Array.from({ length: NUM_STEPS }, (_, s) => {
              const val = state.pattern[r][s]
              return (
                <div
                  key={s}
                  className={`cell ${s % 2 === 0 ? 'even' : ''} ${val > 0 ? 'active' : ''} ${val === 2 ? 'accent' : ''} ${s === state.currentStep ? 'playing' : ''}`}
                  onClick={(e) => {
                    if (e.altKey) {
                      const newVal = val === 2 ? 1 : 2
                      setCell(r, s, newVal)
                    } else {
                      toggleCell(r, s)
                    }
                  }}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="vol-row">
        <span className="tiny">Track Volumes:</span>
        {TRACKS.map((track, i) => (
          <React.Fragment key={i}>
            <span className="tiny" style={{ color: 'var(--fg)', width: '64px', display: 'inline-block' }}>
              {track.name}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.volumes[i]}
              onChange={(e) => {
                const newVolumes = [...state.volumes]
                newVolumes[i] = parseFloat(e.target.value)
                updateState({ volumes: newVolumes })
                setTrackVolume(i, e.target.value)
              }}
              aria-label={`${track.name} Volume`}
            />
          </React.Fragment>
        ))}
      </div>

      <div className="help">
        Tips: Click pads to toggle. Alt/Option adds Accent. Drag to paint. Yellow frame shows the playing step. Randomize for instant fun. Use M/S to Mute or Solo tracks.
      </div>
    </div>
  )
}