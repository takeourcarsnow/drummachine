export default function Legend() {
  return (
    <div className="row panel">
      <div className="title">Legend</div>
      <div className="help">
        • Space: Play/Stop • Click pads to toggle • Alt-click for Accent • Drag to paint • Keyboard for synth: ZSXDCVGBHNJ,M for lower, Q2W3ER5T6Y7UI for upper<br />
        • Wave: Square/Pulse/Triangle • Bits: 4–16 bit waveshaper for crunch • Glide: portamento • ADSR + low-pass filter + optional vibrato<br />
        • Tools: Randomize, Clear, Save to local storage, Load, Share (copies URL) • All audio runs in-browser via WebAudio; no assets needed.
      </div>
    </div>
  )
}