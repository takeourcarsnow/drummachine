'use client'

import { useState, useEffect } from 'react'
import Transport from '../components/Transport'
import DrumGrid from '../components/DrumGrid'
import SynthControls from '../components/SynthControls'
import Keyboard from '../components/Keyboard'
import Legend from '../components/Legend'

export default function Home() {
  const [audioInitialized, setAudioInitialized] = useState(false)

  useEffect(() => {
    // Initialize audio on first interaction
    const initAudio = () => {
      // Audio initialization logic here
      setAudioInitialized(true)
    }

    window.addEventListener('pointerdown', initAudio, { once: true })
    return () => window.removeEventListener('pointerdown', initAudio)
  }, [])

  return (
    <div className="wrap">
      <div className="ascii" aria-hidden="true">
        <pre>
{`   8-bit chiptune drum machine + mono synth • NES/ASCII vibe
   Space: Play/Stop • Z/S/X/D/C... = Keys • Click pads to toggle (Alt=Accent)`}
        </pre>
      </div>

      <Transport />

      <DrumGrid />

      <div className="row panel" style={{ gap: '24px' }}>
        <SynthControls />
        <Keyboard />
      </div>

      <Legend />

      <div className="footer">CHIP-TRAX • 8-bit drum machine + synth • made with WebAudio</div>

      <div id="toast" className="toast" role="status" aria-live="polite"></div>
    </div>
  )
}