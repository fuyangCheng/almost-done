import React, { useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getGoalColor } from '../ProgressBar.jsx'
import { useCountUp } from '../../hooks/useCountUp.js'

/* ── Grid constants ── */
const ROWS = 4
const COLS = 4
const TOTAL_CELLS = ROWS * COLS
const PW   = 52        // piece width in SVG units
const PH   = 52        // piece height
const TAB  = PW * 0.22 // tab protrusion ~11.4
const PAD  = TAB + 4   // viewport padding so tabs aren't clipped

const VW = COLS * PW + PAD * 2
const VH = ROWS * PH + PAD * 2

/* ── Deterministic LCG PRNG seeded by goalId ── */
function idHash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h
}

function makeLCG(seed) {
  let s = seed >>> 0
  return () => {
    s = ((s * 1664525 + 1013904223) >>> 0)
    return s / 0xffffffff
  }
}

/* ── Edge generation ──
   hEdges[r][c] = bottom-edge sign of piece(r,c): +1 tab going DOWN, -1 blank
   vEdges[r][c] = right-edge sign of piece(r,c):  +1 tab going RIGHT, -1 blank
   Border edges are 0 (flat).
*/
function buildEdges(goalId) {
  const rand = makeLCG(idHash(goalId))
  // horizontal edges: rows 0..ROWS-2 (between rows)
  const hEdges = Array.from({ length: ROWS - 1 }, () =>
    Array.from({ length: COLS }, () => (rand() > 0.5 ? 1 : -1))
  )
  // vertical edges: cols 0..COLS-2 (between cols)
  const vEdges = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS - 1 }, () => (rand() > 0.5 ? 1 : -1))
  )
  return { hEdges, vEdges }
}

/* ── Bezier tab helpers ──
   Each tab is drawn as a cubic bezier bulge on top of a straight edge.
   sign: +1 = tab protrudes outward, -1 = blank (indents inward)
   perpDir: which direction is "outward" (+1 or -1 in the perpendicular axis)
*/

/**
 * Horizontal edge segment from (x0,y) to (x1,y).
 * dir: +1 = tab protrudes in +y direction (downward), -1 = protrudes in -y.
 * Returns SVG path fragment (no leading M).
 */
function hSide(x0, x1, y, sign, dir) {
  if (sign === 0) return `L ${x1} ${y}`
  const mx  = (x0 + x1) / 2
  const w   = (x1 - x0) * 0.28   // tab half-width
  const h   = TAB * sign * dir    // protrusion height (signed)
  const nk  = TAB * 0.15 * dir    // neck pull

  // Neck points
  const nx0 = mx - w * 0.6
  const nx1 = mx + w * 0.6
  // Tab tip control points
  const tx0 = mx - w
  const tx1 = mx + w
  const ty  = y + h

  return [
    `L ${nx0} ${y + nk}`,
    `C ${tx0} ${y + nk}, ${tx0} ${ty}, ${mx} ${ty}`,
    `C ${tx1} ${ty}, ${tx1} ${y + nk}, ${nx1} ${y + nk}`,
    `L ${x1} ${y}`,
  ].join(' ')
}

/**
 * Vertical edge segment from (x,y0) to (x,y1).
 * sign: +1 = tab protrudes in +x direction (rightward), -1 = protrudes in -x.
 */
function vSide(y0, y1, x, sign, dir) {
  if (sign === 0) return `L ${x} ${y1}`
  const my  = (y0 + y1) / 2
  const h   = (y1 - y0) * 0.28
  const w   = TAB * sign * dir
  const nk  = TAB * 0.15 * dir

  const ny0 = my - h * 0.6
  const ny1 = my + h * 0.6
  const tx  = x + w
  const ty0 = my - h
  const ty1 = my + h

  return [
    `L ${x + nk} ${ny0}`,
    `C ${x + nk} ${ty0}, ${tx} ${ty0}, ${tx} ${my}`,
    `C ${tx} ${ty1}, ${x + nk} ${ty1}, ${x + nk} ${ny1}`,
    `L ${x} ${y1}`,
  ].join(' ')
}

/* ── Build one piece's SVG path (clockwise) ── */
function makePiecePath(row, col, hEdges, vEdges) {
  const x0 = PAD + col * PW
  const y0 = PAD + row * PH
  const x1 = x0 + PW
  const y1 = y0 + PH

  // Derive edge signs from this piece's perspective
  const topSign    = row === 0        ? 0 : -hEdges[row - 1][col]
  const bottomSign = row === ROWS - 1 ? 0 :  hEdges[row][col]
  const rightSign  = col === COLS - 1 ? 0 :  vEdges[row][col]
  const leftSign   = col === 0        ? 0 : -vEdges[row][col - 1]

  return [
    `M ${x0} ${y0}`,
    hSide(x0, x1, y0, topSign,    -1),  // top: tab goes up (-y)
    vSide(y0, y1, x1, rightSign,  +1),  // right: tab goes right (+x)
    // bottom drawn right→left
    hSide(x1, x0, y1, bottomSign, +1),  // bottom: tab goes down (+y), reversed x
    // left drawn bottom→top
    vSide(y1, y0, x0, leftSign,   -1),  // left: tab goes left (-x), reversed y
    'Z',
  ].join(' ')
}

/* ── Generate all 16 piece paths + metadata ── */
function generatePuzzlePieces(goalId) {
  const { hEdges, vEdges } = buildEdges(goalId)
  return Array.from({ length: TOTAL_CELLS }, (_, i) => {
    const row = Math.floor(i / COLS)
    const col = i % COLS
    const cx  = PAD + col * PW + PW / 2
    const cy  = PAD + row * PH + PH / 2
    return {
      index: i,
      path:  makePiecePath(row, col, hEdges, vEdges),
      cx, cy,
    }
  })
}

/* ── Spring configs ── */
const springSnap = { type: 'spring', stiffness: 400, damping: 20 }

/* ══ PuzzleProgress ══════════════════════════════════════════════ */
export default function PuzzleProgress({
  percent, goalId, isDone, current, total, unit, todayDone, prediction,
}) {
  const color      = getGoalColor(goalId, isDone)
  const displayPct = useCountUp(percent)
  const uid        = useId().replace(/:/g, '')
  const gradId     = `pg-${uid}`

  const litCount = Math.round(Math.min(percent, 100) / 100 * TOTAL_CELLS)
  const pieces   = generatePuzzlePieces(goalId)

  /* Lighter gradient stop */
  const colorLight = `${color}88`

  return (
    <div className="px-4 pb-4">
      {/* SVG puzzle grid */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ aspectRatio: `${VW}/${VH}` }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={colorLight} />
            <stop offset="100%" stopColor={color}      />
          </linearGradient>
        </defs>

        {/* Unlit pieces (rendered first / underneath) */}
        {pieces.map(({ index, path }) => {
          if (index < litCount) return null
          return (
            <path
              key={`u-${index}`}
              d={path}
              fill={isDone
                ? 'rgba(52,199,89,0.06)'
                : 'rgba(60,60,67,0.05)'}
              stroke={isDone
                ? 'rgba(52,199,89,0.2)'
                : 'rgba(60,60,67,0.13)'}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
          )
        })}

        {/* Lit pieces with framer-motion snap-in */}
        <AnimatePresence>
          {pieces.map(({ index, path, cx, cy }) => {
            if (index >= litCount) return null
            const delay = (index % COLS) * 0.022 + Math.floor(index / COLS) * 0.014
            return (
              <motion.path
                key={`l-${index}`}
                d={path}
                fill={`url(#${gradId})`}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="0.8"
                initial={{ scale: 0.6, opacity: 0, y: -8 }}
                animate={{ scale: 1,   opacity: 1, y: 0  }}
                exit={{    scale: 0.6, opacity: 0, y: 4  }}
                transition={{ ...springSnap, delay }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            )
          })}
        </AnimatePresence>

        {/* Gloss overlay on lit pieces */}
        <AnimatePresence>
          {pieces.map(({ index, path, cx, cy }) => {
            if (index >= litCount) return null
            return (
              <motion.path
                key={`g-${index}`}
                d={path}
                fill="rgba(255,255,255,0.14)"
                stroke="none"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  pointerEvents: 'none',
                }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{    scale: 0.6, opacity: 0 }}
                transition={{ ...springSnap, delay: (index % COLS) * 0.022 + Math.floor(index / COLS) * 0.014 }}
              />
            )
          })}
        </AnimatePresence>
      </svg>

      {/* Percent + stats */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[22px] font-bold leading-none"
            style={{ color, fontVariantNumeric: 'tabular-nums' }}
          >
            {displayPct}
            <span className="text-footnote font-normal" style={{ color: `${color}88` }}>%</span>
          </span>

          {!isDone && !todayDone && (
            <span className="text-caption-2 text-[#FF9500] font-medium ml-1">· 今日尚未打卡</span>
          )}
          {!isDone && prediction?.type === 'prediction' && todayDone && (
            <span className="text-caption-2 text-[rgba(60,60,67,0.4)] dark:text-[rgba(235,235,245,0.3)] ml-1">
              · 还需 <span className="font-semibold">{prediction.daysNeeded}</span> 天
            </span>
          )}
        </div>

        <span className="text-footnote tabular-nums text-[rgba(60,60,67,0.45)] dark:text-[rgba(235,235,245,0.35)]">
          {current.toLocaleString()} / {total.toLocaleString()} {unit}
        </span>
      </div>
    </div>
  )
}
