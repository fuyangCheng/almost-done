import React, { useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Plus, Target, Inbox, BarChart2, Sparkles } from 'lucide-react'
import { useGoals }       from './hooks/useGoals.js'
import GoalCard           from './components/GoalCard.jsx'
import AddGoalModal       from './components/AddGoalModal.jsx'
import Sidebar            from './components/Sidebar.jsx'
import BottomNav          from './components/BottomNav.jsx'
import AnalyticsDashboard from './pages/AnalyticsDashboard.jsx'

/* ── Spring config ── */
const spring = { type: 'spring', stiffness: 260, damping: 20 }

/* ── Card list stagger variants ── */
const listVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: spring },
}

/* ══ Empty State ════════════════════════════════════ */
const EMPTY_MESSAGES = {
  all:    { icon: Target, title: '还没有目标',       desc: '轻点右上角 + 创建你的第一个目标' },
  active: { icon: Sparkles,  title: '暂无进行中的目标', desc: '所有目标已完成，或尚未创建目标' },
  done:   { icon: Inbox,  title: '还没有完成的目标', desc: '继续加油，完成后会显示在这里' },
}

function EmptyState({ filter, onAdd }) {
  const { icon: Icon, title, desc } = EMPTY_MESSAGES[filter] ?? EMPTY_MESSAGES.all
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="w-[72px] h-[72px] rounded-[22px] bg-[#F2F2F7] dark:bg-[#2C2C2E]
        flex items-center justify-center mb-5"
      >
        <Icon size={32} strokeWidth={1.5} className="text-[rgba(60,60,67,0.4)] dark:text-[rgba(235,235,245,0.3)]" />
      </div>
      <h2 className="text-title-3 font-semibold text-black dark:text-white mb-1.5">{title}</h2>
      <p className="text-subhead text-[rgba(60,60,67,0.55)] dark:text-[rgba(235,235,245,0.4)] mb-7 max-w-[260px] leading-relaxed">
        {desc}
      </p>
      {filter !== 'done' && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onAdd}
          className="btn-primary flex items-center gap-2 px-6"
        >
          <Plus size={16} strokeWidth={2} />
          创建目标
        </motion.button>
      )}
    </motion.div>
  )
}

/* ══ iOS Large Title Navigation Bar ════════════════ */
const FILTER_LABELS = { all: '全部目标', active: '进行中', done: '已完成', analytics: '数据统计' }

function IOSNavBar({ view, filter, onAdd }) {
  const { scrollY } = useScroll()
  /* Compact title fades in as user scrolls past the large title */
  const compactOpacity = useTransform(scrollY, [55, 90], [0, 1])

  const pageTitle = view === 'analytics' ? FILTER_LABELS.analytics : FILTER_LABELS[filter]

  return (
    <header className="md:hidden sticky top-0 z-30">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-[#F2F2F7]/82 dark:bg-black/82 backdrop-blur-xl" />

      {/* Nav bar content */}
      <div className="relative flex items-center justify-between px-4 h-11 pt-safe">
        {/* Compact title — fades in on scroll */}
        <motion.span
          style={{ opacity: compactOpacity }}
          className="text-headline font-semibold text-black dark:text-white absolute left-1/2 -translate-x-1/2"
        >
          {pageTitle}
        </motion.span>

        {/* Spacer left */}
        <div className="w-10" />

        {/* Right actions */}
        {view === 'goals' && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onAdd}
            className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center
              shadow-[0_2px_8px_rgba(0,122,255,0.35)]"
          >
            <Plus size={18} strokeWidth={2.5} className="text-white" />
          </motion.button>
        )}
      </div>

      {/* Bottom hairline */}
      <div className="relative h-px bg-[rgba(60,60,67,0.15)] dark:bg-[rgba(84,84,88,0.55)]" />
    </header>
  )
}

/* ══ Large Title (scrolls in content) ═════════════ */
function LargeTitle({ view, filter }) {
  const title = view === 'analytics' ? FILTER_LABELS.analytics : FILTER_LABELS[filter]
  return (
    <motion.h1
      key={title}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="md:hidden text-[34px] font-bold leading-tight tracking-tight
        text-black dark:text-white mb-5 px-1"
    >
      {title}
    </motion.h1>
  )
}

/* ══ Main App ════════════════════════════════════════ */
export default function App() {
  const { goals, addGoal, updateProgress, deleteLog, editGoal, deleteGoal, clearAll, setVisualType } = useGoals()
  const [showAdd, setShowAdd] = useState(false)
  const [view,    setView]    = useState('goals')   // 'goals' | 'analytics'
  const [filter,  setFilter]  = useState('all')     // 'all' | 'active' | 'done'

  const filteredGoals = goals.filter(g => {
    if (filter === 'active') return g.current < g.total
    if (filter === 'done')   return g.current >= g.total
    return true
  })

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <Sidebar
        goals={goals}
        view={view}
        filter={filter}
        onViewChange={setView}
        onFilterChange={setFilter}
        onAdd={() => setShowAdd(true)}
      />

      {/* Mobile iOS nav bar */}
      <IOSNavBar view={view} filter={filter} onAdd={() => setShowAdd(true)} />

      {/* ── Main scroll area ── */}
      <main className="md:ml-60 min-h-dvh pb-28 md:pb-12">
        <div className="max-w-2xl mx-auto px-4 py-3 md:py-7">

          {/* Desktop section heading */}
          {goals.length > 0 && (
            <div className="hidden md:flex items-center justify-between mb-6">
              <div>
                <h1 className="text-title-2 font-bold text-black dark:text-white">
                  {view === 'analytics' ? '数据统计' : FILTER_LABELS[filter]}
                </h1>
                {view === 'goals' && (
                  <p className="text-footnote text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.4)] mt-0.5">
                    {filteredGoals.length} 个目标
                    {filter === 'all' && goals.filter(g => g.current >= g.total).length > 0 && (
                      <span className="ml-2 text-[#34C759] font-medium">
                        · {goals.filter(g => g.current >= g.total).length} 个已完成
                      </span>
                    )}
                  </p>
                )}
              </div>
              {view === 'goals' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdd(true)}
                  className="btn-primary flex items-center gap-1.5 py-2 px-4"
                >
                  <Plus size={15} strokeWidth={2} />
                  新建目标
                </motion.button>
              )}
            </div>
          )}

          {/* Mobile large title */}
          <LargeTitle view={view} filter={filter} />

          {/* ── Goals view ── */}
          <AnimatePresence mode="wait">
            {view === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {filteredGoals.length > 0 ? (
                  <motion.div
                    className="grid gap-3 sm:grid-cols-2"
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredGoals.map(goal => (
                      <motion.div key={goal.id} variants={itemVariants} layout>
                        <GoalCard
                          goal={goal}
                          onUpdate={updateProgress}
                          onDelete={deleteGoal}
                          onDeleteLog={deleteLog}
                          onEdit={editGoal}
                          onSetVisualType={setVisualType}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState filter={filter} onAdd={() => setShowAdd(true)} />
                )}
              </motion.div>
            )}

            {/* ── Analytics view ── */}
            {view === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
              >
                <AnalyticsDashboard goals={goals} onClearAll={clearAll} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <BottomNav
        view={view}
        filter={filter}
        onViewChange={setView}
        onFilterChange={setFilter}
        onAdd={() => setShowAdd(true)}
      />

      {/* Add goal modal */}
      <AnimatePresence>
        {showAdd && (
          <AddGoalModal onAdd={addGoal} onClose={() => setShowAdd(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
