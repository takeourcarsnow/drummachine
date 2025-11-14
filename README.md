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

1. **Run the development server**: `npm run dev` and open `http://localhost:3000` in your browser (Chrome recommended for best WebAudio support).
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

- `app/` — Next.js app directory:
  - `layout.tsx` — Root layout
  - `page.tsx` — Main page
  - `globals.css` — Global styles
- `components/` — React components:
  - `AppContext.tsx` — Application context
  - `audio-context.ts` — Audio context setup
  - `audio.ts` — Audio utilities
  - `constants.ts` — Constants and definitions
  - `drum-synthesis.ts` — Drum synthesis logic
  - `DrumGrid.tsx` — Drum grid component
  - `Keyboard.tsx` — Keyboard input component
  - `Legend.tsx` — Legend component
  - `synth-engine.ts` — Synth engine
  - `SynthControls.tsx` — Synth controls component
  - `Transport.tsx` — Transport controls
  - `types.ts` — TypeScript types
- `styles.css` — Additional styles
- `next.config.js` — Next.js configuration
- `tsconfig.json` — TypeScript configuration
- `package.json` — Dependencies and scripts

## Installation & Development

1. Clone the repository: `git clone https://github.com/takeourcarsnow/drummachine.git`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open `http://localhost:3000` in your browser.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Made with ❤️ and WebAudio. Enjoy making chiptune beats!
