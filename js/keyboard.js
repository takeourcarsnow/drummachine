import { isTyping } from './utils.js';
import { synthNoteOn, synthNoteOff, retargetNote } from './audio.js';
import { blinkKeyUI } from './controls-synth.js';

export function attachComputerKeyboard() {
  // Lower row (Z row): Z S X D C V G B H N J M , => C to C
  // Upper row (Q row): Q 2 W 3 E R 5 T 6 Y 7 U I => C to E above
  const keyMap = {
    'z':0, 's':1, 'x':2, 'd':3, 'c':4, 'v':5, 'g':6, 'b':7, 'h':8, 'n':9, 'j':10, 'm':11, ',':12,
    'q':12, '2':13, 'w':14, '3':15, 'e':16, 'r':17, '5':18, 't':19, '6':20, 'y':21, '7':22, 'u':23, 'i':24
  };

  const pressed = new Set();

  document.addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    const k = e.key.toLowerCase();
    if (keyMap.hasOwnProperty(k) && !e.repeat) {
      const semi = keyMap[k];
      pressed.add(k);
      synthNoteOn(semi);
      blinkKeyUI(semi % 12, true);
    }
  });

  document.addEventListener('keyup', (e) => {
    if (isTyping(e)) return;
    const k = e.key.toLowerCase();
    if (keyMap.hasOwnProperty(k)) {
      const semi = keyMap[k];
      pressed.delete(k);
      blinkKeyUI(semi % 12, false);
      if (pressed.size === 0) {
        synthNoteOff();
      } else {
        const last = Array.from(pressed).at(-1);
        if (last != null) {
          retargetNote(keyMap[last]);
        }
      }
    }
  });
}