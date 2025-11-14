'use client'

import { useApp } from './AppContext'

export default function Transport() {
  const { state, updateState } = useApp()

  const handlePlay = () => {
    // TODO: implement play/stop
  }

  const handleTap = () => {
    // TODO: tap tempo
  }

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseFloat(e.target.value)
    updateState({ bpm })
  }

  const handleBpmNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseFloat(e.target.value)
    updateState({ bpm })
  }

  const handleSwingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const swingAmt = parseFloat(e.target.value)
    updateState({ swingAmt })
  }

  const handleHumanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const humanizeMs = parseFloat(e.target.value)
    updateState({ humanizeMs })
  }

  const handleRandomize = () => {
    // TODO: randomize
  }

  const handleClear = () => {
    // TODO: clear
  }

  const handleSave = () => {
    // TODO: save
  }

  const handleLoad = () => {
    // TODO: load
  }

  const handleShare = () => {
    // TODO: share
  }

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const master = parseFloat(e.target.value)
    updateState({ master })
  }

  return (
    <div className="row panel">
      <div className="title">Transport & Groove</div>
      <div className="controls">
        <button className="btn" onClick={handlePlay}>▶ Play</button>
        <button className="btn" onClick={handleTap}>Tap</button>
        <div className="ctrl">
          <label htmlFor="bpm">BPM</label>
          <input
            type="range"
            id="bpm"
            min="40"
            max="240"
            value={state.bpm}
            onChange={handleBpmChange}
          />
          <input
            type="number"
            id="bpmNum"
            min="40"
            max="240"
            value={state.bpm}
            onChange={handleBpmNumChange}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="swing">Swing</label>
          <input
            type="range"
            id="swing"
            min="0"
            max="0.6"
            step="0.01"
            value={state.swingAmt}
            onChange={handleSwingChange}
          />
          <span className="tiny">{Math.round(state.swingAmt * 100)}%</span>
        </div>
        <div className="ctrl">
          <label htmlFor="human">Humanize</label>
          <input
            type="range"
            id="human"
            min="0"
            max="30"
            step="1"
            value={state.humanizeMs}
            onChange={handleHumanChange}
          />
          <span className="tiny">{Math.round(state.humanizeMs)}ms</span>
        </div>
        <div className="ctrl">
          <label>Tools</label>
          <button className="btn" onClick={handleRandomize}>Randomize</button>
          <button className="btn" onClick={handleClear}>Clear</button>
          <button className="btn" onClick={handleSave}>Save</button>
          <button className="btn" onClick={handleLoad}>Load</button>
          <button className="btn" onClick={handleShare}>Share</button>
        </div>
        <div className="ctrl">
          <label>Scale</label>
          <span className="badge">16 Steps • 4 Tracks</span>
          <span className="inline-note">Alt-click pad = accent</span>
        </div>
        <div className="ctrl">
          <label htmlFor="masterVol">Master</label>
          <input
            type="range"
            id="masterVol"
            min="0"
            max="1"
            step="0.01"
            value={state.master}
            onChange={handleMasterChange}
          />
        </div>
      </div>
    </div>
  )
}