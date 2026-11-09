// BinGi motion system — Apple-style springs + a few Telegram touches.
// Springs are physical (interruptible, keep velocity). Values derived from iOS-like
// dampingFraction / response pairs; CSS equivalents live in index.css as linear() curves.
import type { Transition } from 'motion/react'

const spring = (response: number, damping: number): Transition => {
  const stiffness = (2 * Math.PI / response) ** 2
  return { type: 'spring', stiffness, damping: 2 * damping * Math.sqrt(stiffness), mass: 1 }
}

export const ios = spring(0.42, 0.82)     // default UI: ~540 ms, 1% overshoot (iOS sheet / nav feel)
export const snappy = spring(0.3, 0.9)    // controls, toggles, pills: ~280 ms, no visible bounce
export const bouncy = spring(0.45, 0.68)  // Telegram-style pop: bubbles, success, counters

export const fade = { duration: 0.18, ease: [0.4, 0, 0.2, 1] } as const // exits are faster than entries
