import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ProgressBar, { getGoalColor } from './ProgressBar.jsx'

const spring = { type: 'spring', stiffness: 280, damping: 24 }

export default function UpdateProgressModal({ goal, onUpdate, onClose }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const remaining     = goal.total - goal.current
  const previewAmount = Math.min(Number(value) || 0, remaining)
  const previewPct    = Math.round((goal.current + previewAmount) / goal.total * 100)
  const accentColor   = getGoalColor(goal.id)

  useEffect(() => {
    inputRef.current?.focus()
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault()
    const num = Number(value)
    if (!value || num <= 0) { setError('请输入大于 0 的数值'); return }
    onUpdate(goal.id, num)
    onClose()
  }

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        bg-black/30 dark:bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0,      opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={spring}
        className="w-full sm:max-w-sm mx-0 sm:mx-4
          bg-[#F2F2F7] dark:bg-[#1C1C1E]
          rounded-t-[20px] sm:rounded-[20px]
          overflow-hidden"
      >
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-[rgba(60,60,67,0.18)] dark:bg-[rgba(235,235,245,0.18)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="min-w-0">
            <p className="text-caption-1 text-[rgba(60,60,67,0.55)] dark:text-[rgba(235,235,245,0.4)]">
              更新进度
            </p>
            <h2 className="text-headline font-semibold text-black dark:text-white truncate max-w-[220px]">
              {goal.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[rgba(60,60,67,0.1)] dark:bg-[rgba(235,235,245,0.1)]
              flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={14} strokeWidth={2} className="text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]" />
          </button>
        </div>

        {/* Progress preview card */}
        <div className="mx-4 mb-3 p-4 rounded-2xl bg-white dark:bg-[#2C2C2E]">
          <div className="flex items-end justify-between mb-2">
            <span className="text-[28px] font-bold leading-none tabular-nums" style={{ color: accentColor }}>
              {previewPct}<span className="text-subhead font-normal text-[rgba(60,60,67,0.4)] ml-1">%</span>
            </span>
            <span className="text-footnote text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.4)] pb-0.5 tabular-nums">
              {(goal.current + previewAmount).toLocaleString()} / {goal.total.toLocaleString()} {goal.unit}
            </span>
          </div>
          <ProgressBar percent={previewPct} goalId={goal.id} />
          <p className="mt-2 text-caption-1 text-[rgba(60,60,67,0.45)] dark:text-[rgba(235,235,245,0.35)]">
            剩余 <span className="font-semibold text-[rgba(60,60,67,0.65)] dark:text-[rgba(235,235,245,0.55)]">
              {(remaining - previewAmount).toLocaleString()}
            </span>{' '}{goal.unit}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
          <div>
            <label className="block text-footnote font-semibold
              text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.5)] mb-1.5 px-1"
            >
              今日完成量（{goal.unit}）
            </label>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={value}
              placeholder={`最多 ${remaining}`}
              onChange={e => { setValue(e.target.value); setError('') }}
              className={`input-field text-[17px] ${error ? 'error' : ''}`}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1.5 text-footnote text-[#FF3B30] px-1"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2.5">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-center py-3">
              取消
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white
                active:opacity-80 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              记录
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
