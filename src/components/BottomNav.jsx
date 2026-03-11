import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Zap, CheckCircle2, BarChart2, Plus } from 'lucide-react'

/**
 * iOS-style Tab Bar.
 * 5 tabs: 全部 | 进行中 | [+] | 已完成 | 统计
 */
const TABS = [
  { key: 'goals/all',    label: '全部',   icon: Target },
  { key: 'goals/active', label: '进行中', icon: Zap },
  { key: '__add__' },
  { key: 'goals/done',   label: '已完成', icon: CheckCircle2 },
  { key: 'analytics',    label: '统计',   icon: BarChart2 },
]

const APPLE_BLUE = '#007AFF'

export default function BottomNav({ view, filter, onViewChange, onFilterChange, onAdd }) {
  const activeKey = view === 'analytics' ? 'analytics' : `goals/${filter}`

  return (
    /* iOS Tab Bar: blurred white / black strip pinned to bottom */
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 pb-safe">
      {/* Hairline top border */}
      <div className="h-px bg-[rgba(60,60,67,0.15)] dark:bg-[rgba(84,84,88,0.55)]" />

      {/* Blur layer */}
      <div className="absolute inset-0 bg-[#F2F2F7]/85 dark:bg-[#1C1C1E]/90 backdrop-blur-xl" />

      {/* Tab items */}
      <div className="relative flex items-end justify-around px-2 h-[49px]">
        {TABS.map(tab => {
          /* ── Center add button ── */
          if (tab.key === '__add__') {
            return (
              <motion.button
                key="add"
                whileTap={{ scale: 0.85 }}
                onClick={onAdd}
                className="flex flex-col items-center justify-center mb-1 -mt-3"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center
                  bg-[#007AFF] shadow-[0_4px_16px_rgba(0,122,255,0.40)]"
                >
                  <Plus size={22} strokeWidth={2.5} className="text-white" />
                </div>
              </motion.button>
            )
          }

          const Icon     = tab.icon
          const isActive = activeKey === tab.key

          function handleClick() {
            if (tab.key === 'analytics') {
              onViewChange('analytics')
            } else {
              const [, f] = tab.key.split('/')
              onViewChange('goals')
              onFilterChange(f)
            }
          }

          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.85 }}
              onClick={handleClick}
              className="flex flex-col items-center justify-end gap-[2px]
                pb-1 px-3 min-w-0 h-full"
            >
              <div className="relative">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? APPLE_BLUE : 'rgba(142,142,147,1)' }}
                />
                {/* Active indicator dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2
                        w-1 h-1 rounded-full bg-[#007AFF]"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span
                className="text-[10px] font-medium truncate"
                style={{ color: isActive ? APPLE_BLUE : 'rgba(142,142,147,1)' }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
