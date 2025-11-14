'use client'

import React, { useEffect, useCallback } from 'react'
import { synthNoteOn, synthNoteOff } from './synth-engine'

export default function Keyboard() {
  const whiteKeyOrder = [0, 2, 4, 5, 7, 9, 11]
  const positions = [0, 1, 2, 3, 4, 5, 6]
  const whiteW = 40 + 6
  const kbW = positions.length * whiteW - 6

  const blackMap = [
    { semi: 1, pos: 0, offset: 30 },
    { semi: 3, pos: 1, offset: 30 },
    { semi: 6, pos: 3, offset: 30 },
    { semi: 8, pos: 4, offset: 30 },
    { semi: 10, pos: 5, offset: 30 },
  ]

  const handleKeyDown = useCallback((semi: number) => {
    synthNoteOn(semi)
  }, [])

  const handleKeyUp = useCallback(() => {
    synthNoteOff()
  }, [])

  useEffect(() => {
    const keyMap: { [key: string]: number } = {
      'z': 0, 's': 1, 'x': 2, 'd': 3, 'c': 4, 'v': 5, 'g': 6, 'b': 7, 'h': 8, 'n': 9, 'j': 10, 'm': 11, ',': 12
    }
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      const semi = keyMap[e.key.toLowerCase()]
      if (semi !== undefined) {
        e.preventDefault()
        handleKeyDown(semi)
      }
    }
    const handleKeyUpEvent = (e: KeyboardEvent) => {
      if (keyMap[e.key.toLowerCase()] !== undefined) {
        e.preventDefault()
        handleKeyUp()
      }
    }
    window.addEventListener('keydown', handleKeyDownEvent)
    window.addEventListener('keyup', handleKeyUpEvent)
    return () => {
      window.removeEventListener('keydown', handleKeyDownEvent)
      window.removeEventListener('keyup', handleKeyUpEvent)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <div style={{ flex: 1, minWidth: '320px' }}>
      <div className="title">Keys</div>
      <div className="keyboard">
        <div className="kb-wrap" style={{ width: `${kbW}px` }}>
          {/* Whites */}
          {whiteKeyOrder.map((semi, i) => (
            <div
              key={semi}
              className="key kb-note"
              data-note={semi.toString()}
              onMouseDown={() => handleKeyDown(semi)}
              onMouseUp={handleKeyUp}
              onMouseLeave={handleKeyUp}
              style={{
                left: `${i * whiteW}px`,
                top: '8px',
                width: '40px',
                height: '140px'
              }}
            />
          ))}
          {/* Blacks */}
          {blackMap.map(({ semi, pos, offset }) => (
            <div
              key={semi}
              className="key black kb-note"
              data-note={semi.toString()}
              onMouseDown={() => handleKeyDown(semi)}
              onMouseUp={handleKeyUp}
              onMouseLeave={handleKeyUp}
              style={{
                left: `${pos * whiteW + offset}px`,
                top: '8px',
                width: '28px',
                height: '92px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}