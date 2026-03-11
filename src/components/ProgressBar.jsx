import React from 'react'
import { motion } from 'framer-motion'

/**
 * Apple iOS system color palette — one per goal, stable by ID hash.
 * Flat colors (no gradient) for authentic iOS feel.
 */
const APPLE_COLORS = [
  '#007AFF',  // Blue   (default)
  '#5856D6',  // Indigo
  '#FF9500',  // Orange
  '#AF52DE',  // Purple
  '#FF2D55',  // Pink
  '#5AC8FA',  // Teal
  '#FF6B00',  // Amber-orange
]
const DONE_COLOR = '#34C759'   // Apple Green

/** Returns a stable Apple system color for a goal ID. */
export function getGoalColor(goalId = '', isDone = false) {
  if (isDone) return DONE_COLOR
  let hash = 0
  for (const c of goalId) hash = (hash * 31 + c.charCodeAt(0)) & 0x7fffffff
  return APPLE_COLORS[hash % APPLE_COLORS.length]
}

/**
 * Thin Apple-style progress bar.
 * Width is animated with framer-motion spring — no useEffect needed.
 *
 * Props:
 *   percent  {number}   0–100
 *   goalId   {string}   determines the track color
 *   isDone   {boolean}  switches to Apple Green
 */
export default function ProgressBar({ percent, goalId = '', isDone = false }) {
  const color = getGoalColor(goalId, isDone)

  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ backgroundColor: isDone ? '#D1FAE5' : '#E5E5EA' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{
          type:      'spring',
          stiffness: 80,
          damping:   22,
          mass:      0.8,
        }}
      />
    </div>
  )
}
