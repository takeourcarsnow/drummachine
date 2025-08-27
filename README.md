# CHIP-TRAX — 8‑bit Drum Machine + Synth

CHIP-TRAX is a browser-based 8-bit chiptune drum machine and monophonic synthesizer inspired by NES/retro/ASCII vibes. It features a step sequencer, real-time synth controls, and instant sharing—all running entirely in your browser with no external assets.

## Features

- **4-Track Drum Machine**: Kick, Snare, Hat, Clap with 16-step grid
- **Chiptune Synth**: Mono synth with Square, Pulse, and Triangle waves
- **ADSR Envelope**: Attack, Decay, Sustain, Release controls
- **Bitcrusher & Filter**: Adjustable bit depth, low-pass filter, resonance
- **Groove Tools**: BPM, Swing, Humanize, Randomize, Clear, Save, Load, Share
- **Keyboard & Mouse Input**: Play synth with your computer keyboard or click pads
- **Mute/Solo**: Per-track mute and solo
- **Instant Sharing**: Copy/paste state via URL hash
- **All Audio in Browser**: Uses WebAudio API, no samples or server required

## Usage

1. **Open `index.html` in your browser** (Chrome recommended for best WebAudio support).
2. **Create beats** by clicking pads in the drum grid. Alt/Option-click for accents.
3. **Play the synth** using your computer keyboard (Z/S/X/D/C... for lower octave, Q/2/W/3/E... for upper).
4. **Adjust controls** for BPM, swing, humanize, synth parameters, and more.
5. **Randomize, clear, save, load, or share** your patterns using the Tools section.

## Controls

- **Space**: Play/Stop
- **Z/S/X/D/C...**: Play synth notes (lower octave)
- **Q/2/W/3/E...**: Play synth notes (upper octave)
- **Click pads**: Toggle drum steps (Alt/Option = Accent)
- **Mute/Solo**: M/S buttons per track
- **Randomize**: Generate a new pattern
- **Save/Load**: Store/recall patterns in local storage
- **Share**: Copy pattern as a URL

## File Structure

- `index.html` — Main HTML UI
- `styles.css` — CRT/retro-inspired styles
- `js/` — All JavaScript modules:
  - `audio.js` — WebAudio engine for drums & synth
  - `constants.js` — Track and step definitions
  - `controls-synth.js` — Synth parameter controls
  - `controls-transport.js` — Transport (play, BPM, swing, etc.)
  - `grid.js` — Drum grid UI
  - `keyboard.js` — Computer keyboard input
  - `main.js` — App entry point
  - `pattern.js` — Pattern data & starter groove
  - `state.js` — Save/load/share state
  - `tools.js` — Randomize, clear, save, load, share
  - `transport.js` — Sequencer timing
  - `utils.js` — DOM and math helpers
  - `volumes.js` — Per-track volume controls

## Installation & Development

No installation required! Just clone/download and open `index.html` in your browser.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Made with ❤️ and WebAudio. Enjoy making chiptune beats!
