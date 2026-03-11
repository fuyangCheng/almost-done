import React from 'react'
import { motion } from 'framer-motion'
import { getGoalColor } from '../ProgressBar.jsx'
import { useCountUp } from '../../hooks/useCountUp.js'

/**
 * Apple-style thin bar — same as the existing ProgressBar
 * but includes the percent number and stats line for standalone use.
 */
export default function LinearProgress({ percent, goalId, isDone, current, total, unit, todayDone, prediction }) {
  const color        = getGoalColor(goalId, isDone)
  const displayPct   = useCountUp(percent)
  const trackColor   = isDone ? '#D1FAE5' : '#E5E5EA'

  return (
    <div className="pb-4 px-4">
      {/* Percent + amounts */}
      <div className="flex items-end justify-between mb-2">
        <motion.span
          key={percent}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-[34px] font-bold leading-none"
          style={{ color, fontVariantNumeric: 'tabular-nums' }}
        >
          {displayPct}
          <span className="text-callout font-normal text-[rgba(60,60,67,0.4)] dark:text-[rgba(235,235,245,0.4)] ml-1">%</span>
        </motion.span>
        <span className="text-footnote text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.4)] pb-1 tabular-nums">
          {current.toLocaleString()} / {total.toLocaleString()} {unit}
        </span>
      </div>

      {/* Thin bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: trackColor }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 22, mass: 0.8 }}
        />
      </div>

      {/* Analytics micro-text */}
      {!isDone && (
        <div className="mt-2 flex items-center gap-1.5 min-h-[18px]">
          {!todayDone && (
            <span className="text-caption-1 text-[#FF9500] font-medium">· 今日尚未打卡</span>
          )}
          {prediction?.type === 'prediction' && (
            <span className="text-caption-1 text-[rgba(60,60,67,0.45)] dark:text-[rgba(235,235,245,0.35)]">
              {!todayDone ? '' : '· '}预计还需{' '}
              <span className="font-semibold text-[rgba(60,60,67,0.65)] dark:text-[rgba(235,235,245,0.55)]">
                {prediction.daysNeeded}
              </span>{' '}天
            </span>
          )}
          {prediction?.type === 'no-data' && todayDone && (
            <span className="text-caption-1 text-[rgba(60,60,67,0.35)] dark:text-[rgba(235,235,245,0.3)]">
              · 累积更多数据以显示预测
            </span>
          )}
        </div>
      )}
    </div>
  )
}
