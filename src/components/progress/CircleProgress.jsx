import React, { useId } from 'react'
import { motion } from 'framer-motion'
import { getGoalColor } from '../ProgressBar.jsx'
import { useCountUp } from '../../hooks/useCountUp.js'

/* SVG ring parameters */
const SIZE   = 100        // viewBox units
const CX     = SIZE / 2
const CY     = SIZE / 2
const R      = 38         // ring radius
const STROKE = 7          // ring stroke width
const CIRC   = 2 * Math.PI * R   // ≈ 238.76

/**
 * Animated SVG ring progress.
 * The arc starts at 12 o'clock and sweeps clockwise.
 * Percent text is a div overlay centered over the SVG.
 */
export default function CircleProgress({ percent, goalId, isDone, current, total, unit, todayDone, prediction }) {
  const color      = getGoalColor(goalId, isDone)
  const displayPct = useCountUp(percent)

  /* strokeDashoffset: CIRC = empty, 0 = full circle */
  const offset = CIRC * (1 - Math.min(percent, 100) / 100)

  /* Unique gradient ID per goal (avoid SVG id collisions) */
  const uid     = useId().replace(/:/g, '')
  const gradId  = `cg-${uid}`
  const glowId  = `glow-${uid}`

  /* Lighter shade of accent for gradient end */
  const colorLight = `${color}99`

  return (
    <div className="px-4 pb-4">
      {/* Ring + center text */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-[108px] h-[108px] shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full h-full -rotate-90"  /* start from top */
            aria-hidden="true"
          >
            <defs>
              {/* Arc gradient follows the stroke direction */}
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor={colorLight} />
                <stop offset="100%" stopColor={color}      />
              </linearGradient>
              {/* Subtle glow filter */}
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(0,0,0,0.07)"
              strokeWidth={STROKE}
              className="dark:stroke-[rgba(255,255,255,0.08)]"
            />

            {/* Animated foreground arc */}
            <motion.circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              filter={isDone ? undefined : `url(#${glowId})`}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: offset }}
              transition={{ type: 'spring', stiffness: 55, damping: 18, mass: 1 }}
            />

            {/* Done: small filled dot at the start position (decorative) */}
            {isDone && (
              <circle cx={CX} cy={CY - R} r={STROKE / 2} fill={color} />
            )}
          </svg>

          {/* Centered text overlay — not rotated */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span
              className="text-[22px] font-bold leading-none"
              style={{ color, fontVariantNumeric: 'tabular-nums' }}
            >
              {displayPct}
              <span className="text-[13px] font-normal" style={{ color: `${color}99` }}>%</span>
            </span>
            {isDone && (
              <span className="text-[10px] font-semibold text-[#34C759] mt-0.5">完成</span>
            )}
          </div>
        </div>

        {/* Stats below ring */}
        <div className="text-center space-y-0.5 w-full">
          <p className="text-footnote tabular-nums text-[rgba(60,60,67,0.55)] dark:text-[rgba(235,235,245,0.4)]">
            {current.toLocaleString()} / {total.toLocaleString()}
            <span className="ml-1">{unit}</span>
          </p>

          {!isDone && (
            <div className="flex items-center justify-center gap-2 min-h-[16px]">
              {!todayDone && (
                <span className="text-caption-2 text-[#FF9500] font-medium">· 今日尚未打卡</span>
              )}
              {prediction?.type === 'prediction' && (
                <span className="text-caption-2 text-[rgba(60,60,67,0.4)] dark:text-[rgba(235,235,245,0.3)]">
                  {!todayDone ? '' : '· '}还需{' '}
                  <span className="font-semibold">{prediction.daysNeeded}</span> 天
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
