import type { Metadata } from 'next'
import { AppProvider } from '../components/AppContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'CHIP-TRAX — 8‑bit Drum Machine + Synth',
  description: '8-bit chiptune drum machine + mono synth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}