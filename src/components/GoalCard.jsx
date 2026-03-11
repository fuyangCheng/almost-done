import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  CheckCircle2, Circle, ChevronRight, ChevronDown,
  Pencil, Trash2, AlertTriangle,
  AlignLeft, CircleDot, LayoutGrid,
} from 'lucide-react'
import { getGoalColor } from './ProgressBar.jsx'
import LinearProgress from './progress/LinearProgress.jsx'
import CircleProgress from './progress/CircleProgress.jsx'
import PuzzleProgress from './progress/PuzzleProgress.jsx'
import HistoryLog from './HistoryLog.jsx'
import UpdateProgressModal from './UpdateProgressModal.jsx'
import EditGoalModal from './EditGoalModal.jsx'
import { calcPrediction, checkedInToday } from '../utils/analytics.js'

/* ── Confetti ── */
function fireConfetti() {
  const colors = ['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE']
  confetti({ particleCount: 110, spread: 65, origin: { y: 0.55 }, colors, startVelocity: 42, gravity: 0.9 })
  setTimeout(() => {
    confetti({ particleCount: 45, angle: 60,  spread: 50, origin: { x: 0, y: 0.6 }, colors })
    confetti({ particleCount: 45, angle: 120, spread: 50, origin: { x: 1, y: 0.6 }, colors })
  }, 110)
}

/* ── Visual type cycle ── */
const VISUAL_TYPES = ['linear', 'circle', 'puzzle']

function nextVisualType(current) {
  const idx = VISUAL_TYPES.indexOf(current ?? 'linear')
  return VISUAL_TYPES[(idx + 1) % VISUAL_TYPES.length]
}

/* Icon + tooltip for each type (shows what clicking WILL switch to) */
const TYPE_META = {
  linear: { icon: AlignLeft,  label: '线形' },
  circle: { icon: CircleDot,  label: '环形' },
  puzzle: { icon: LayoutGrid, label: '拼图' },
}

/* ── Spring presets ── */
const spring     = { type: 'spring', stiffness: 260, damping: 20 }
const springFast = { type: 'spring', stiffness: 300, damping: 25 }

export default function GoalCard({ goal, onUpdate, onDelete, onDeleteLog, onEdit, onSetVisualType }) {
  const [showUpdate,    setShowUpdate]    = useState(false)
  const [showEdit,      setShowEdit]      = useState(false)
  const [expanded,      setExpanded]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const percent    = goal.total > 0 ? Math.round((goal.current / goal.total) * 100) : 0
  const isDone     = percent >= 100
  const todayDone  = checkedInToday(goal)
  const prediction = isDone ? null : calcPrediction(goal)

  /* Fire confetti on completion */
  const prevDone = useRef(isDone)
  useEffect(() => {
    if (isDone && !prevDone.current) fireConfetti()
    prevDone.current = isDone
  }, [isDone])

  const accentColor  = getGoalColor(goal.id, isDone)
  const visualType   = goal.visualType ?? 'linear'
  const nextType     = nextVisualType(visualType)
  const NextIcon     = TYPE_META[nextType].icon

  /* Shared props passed to each progress component */
  const progressProps = {
    percent, goalId: goal.id, isDone,
    current: goal.current, total: goal.total, unit: goal.unit,
    todayDone, prediction,
  }

  return (
    <>
      <div className={`ios-card overflow-hidden ${isDone ? 'bg-[#F0FFF4] dark:bg-[#0D2818]' : ''}`}>

        {/* ── Header ── */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {isDone
              ? <CheckCircle2 size={18} strokeWidth={1.5} className="shrink-0 text-[#34C759]" />
              : <Circle       size={18} strokeWidth={1.5} className="shrink-0 text-[rgba(60,60,67,0.2)] dark:text-[rgba(235,235,245,0.2)]" />
            }
            <h3 className="text-headline font-semibold truncate text-black dark:text-white">
              {goal.name}
            </h3>
          </div>

          <div className="flex items-center gap-0.5 opacity-30 hover:opacity-100 transition-opacity shrink-0">
            {/* Visual type toggle */}
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={() => onSetVisualType(goal.id, nextType)}
              title={`切换到${TYPE_META[nextType].label}模式`}
              className="p-1.5 rounded-lg hover:bg-[rgba(0,122,255,0.08)] active:scale-90
                transition-all text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.5)]"
            >
              <NextIcon size={14} strokeWidth={1.5} />
            </motion.button>

            {/* Edit */}
            <button
              onClick={() => { setConfirmDelete(false); setShowEdit(true) }}
              className="p-1.5 rounded-lg hover:bg-[rgba(0,122,255,0.08)] active:scale-90
                transition-all text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.5)]"
            >
              <Pencil size={14} strokeWidth={1.5} />
            </button>

            {/* Delete */}
            <button
              onClick={() => setConfirmDelete(v => !v)}
              className="p-1.5 rounded-lg hover:bg-[rgba(255,59,48,0.08)] active:scale-90
                transition-all text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.5)]"
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* ── Inline delete confirm ── */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springFast}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl
                bg-[#FFF1F0] dark:bg-[#2C1615]
                border border-[rgba(255,59,48,0.15)]
                flex items-center gap-2"
              >
                <AlertTriangle size={13} strokeWidth={1.5} className="shrink-0 text-[#FF3B30]" />
                <span className="text-footnote text-[#FF3B30] flex-1">确认删除？不可撤销。</span>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-footnote text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.5)]
                    px-2 py-1 rounded active:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="text-footnote font-semibold text-white
                    bg-[#FF3B30] px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
                >
                  删除
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Progress visualisation (animated switch) ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={visualType}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {visualType === 'linear' && <LinearProgress {...progressProps} />}
            {visualType === 'circle' && <CircleProgress {...progressProps} />}
            {visualType === 'puzzle' && <PuzzleProgress {...progressProps} />}
          </motion.div>
        </AnimatePresence>

        {/* ── Separator ── */}
        <div className="ios-separator" />

        {/* ── Footer ── */}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          {/* Status label */}
          {isDone ? (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              transition={spring}
              className="inline-flex items-center gap-1.5 text-caption-1 font-semibold
                text-[#34C759] bg-[rgba(52,199,89,0.1)] dark:bg-[rgba(52,199,89,0.15)]
                px-2.5 py-1 rounded-full"
            >
              ✓ 已完成
            </motion.span>
          ) : (
            <span className="text-footnote text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.4)]">
              还差{' '}
              <span className="font-semibold text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.6)]">
                {(goal.total - goal.current).toLocaleString()}
              </span>{' '}{goal.unit}
            </span>
          )}

          <div className="flex items-center gap-2">
            {/* Expand history */}
            {goal.logs.length > 0 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-0.5 text-caption-1
                  text-[rgba(60,60,67,0.4)] dark:text-[rgba(235,235,245,0.35)]
                  active:opacity-50 transition-opacity"
              >
                <ChevronDown
                  size={13}
                  strokeWidth={1.5}
                  className={`transition-transform duration-250 ${expanded ? 'rotate-180' : ''}`}
                />
                {goal.logs.length}
              </button>
            )}

            {/* Update button */}
            {!isDone && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpdate(true)}
                className="flex items-center gap-1 text-footnote font-semibold
                  px-3 py-1.5 rounded-xl active:opacity-75 transition-opacity"
                style={{ color: accentColor, backgroundColor: `${accentColor}14` }}
              >
                更新进度
                <ChevronRight size={13} strokeWidth={2} />
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Collapsible history ── */}
        <div className={`collapsible ${expanded ? 'open' : ''}`}>
          <div>
            <div className="ios-separator" />
            <HistoryLog
              logs={goal.logs}
              unit={goal.unit}
              onDeleteLog={logId => onDeleteLog(goal.id, logId)}
            />
          </div>
        </div>
      </div>

      {showUpdate && (
        <UpdateProgressModal goal={goal} onUpdate={onUpdate} onClose={() => setShowUpdate(false)} />
      )}
      {showEdit && (
        <EditGoalModal goal={goal} onEdit={onEdit} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
