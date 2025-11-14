'use client'

import React from 'react'

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