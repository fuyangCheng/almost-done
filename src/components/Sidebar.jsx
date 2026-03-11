import React from 'react'
import { Sparkles, Target, Zap, CheckCircle2, Plus, BarChart2, Download } from 'lucide-react'
import { usePWAInstall } from '../hooks/usePWAInstall.js'

const GOAL_NAV = [
  { key: 'all',    label: '全部目标', icon: Target },
  { key: 'active', label: '进行中',   icon: Zap },
  { key: 'done',   label: '已完成',   icon: CheckCircle2 },
]

export default function Sidebar({ goals, view, filter, onViewChange, onFilterChange, onAdd }) {
  const { canInstall, install, isInstalled } = usePWAInstall()
  const totalGoals  = goals.length
  const doneGoals   = goals.filter(g => g.current >= g.total).length
  const activeGoals = totalGoals - doneGoals

  const avgPercent = totalGoals > 0
    ? Math.round(goals.reduce((s, g) => s + g.current / g.total, 0) / totalGoals * 100)
    : 0

  const counts = { all: totalGoals, active: activeGoals, done: doneGoals }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60
      glass-panel border-r border-white/60 dark:border-gray-700/50 z-20
      animate-slide-right"
    >
      {/* ── Logo ── */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500
          flex items-center justify-center shadow-brand-sm animate-pulse-glow shrink-0"
        >
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
            Almost Done
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">目标追踪器</p>
        </div>
      </div>

      {/* ── Goal navigation ── */}
      <nav className="px-3 space-y-1">
        {GOAL_NAV.map(({ key, label, icon: Icon }) => {
          const isActive = view === 'goals' && filter === key
          return (
            <button
              key={key}
              onClick={() => { onViewChange('goals'); onFilterChange(key) }}
              className={`nav-item w-full ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {counts[key] > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${isActive
                    ? 'bg-brand-100 dark:bg-brand-800/60 text-brand-700 dark:text-brand-300'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-3 my-3 border-t border-gray-100 dark:border-gray-700/50" />

      {/* ── Analytics nav ── */}
      <div className="px-3">
        <button
          onClick={() => onViewChange('analytics')}
          className={`nav-item w-full ${view === 'analytics' ? 'active' : ''}`}
        >
          <BarChart2 size={16} className="shrink-0" />
          <span className="flex-1 text-left">数据统计</span>
        </button>
      </div>

      {/* ── Stats card (only on goals view) ── */}
      {totalGoals > 0 && (
        <div className="mx-3 mt-5 p-4 rounded-2xl bg-gradient-to-br
          from-brand-50 to-violet-50 dark:from-brand-900/30 dark:to-violet-900/20
          border border-brand-100/60 dark:border-brand-800/30"
        >
          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wide">
            总体进度
          </p>
          <div className="h-1.5 bg-brand-100 dark:bg-brand-900/50 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500
                transition-all duration-700"
              style={{ width: `${avgPercent}%` }}
            />
          </div>
          <p className="text-xl font-bold text-brand-700 dark:text-brand-300">
            {avgPercent}
            <span className="text-sm font-normal text-brand-500 ml-0.5">%</span>
          </p>
          <div className="mt-2 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{doneGoals} 已完成</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span>{activeGoals} 进行中</span>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* ── Add goal CTA ── */}
      <div className="px-3 pb-6 space-y-2">
        <button
          onClick={onAdd}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          新建目标
        </button>

        {/* Install PWA button — only shown when installable */}
        {canInstall && (
          <button
            onClick={install}
            className="w-full flex items-center justify-center gap-2 py-2 px-4
              text-[13px] font-medium rounded-xl transition-all
              text-[#007AFF] bg-[rgba(0,122,255,0.08)]
              hover:bg-[rgba(0,122,255,0.14)] active:scale-[0.97]"
          >
            <Download size={14} strokeWidth={2} />
            安装到桌面
          </button>
        )}
        {isInstalled && (
          <p className="text-center text-[11px] text-[rgba(60,60,67,0.4)] dark:text-[rgba(235,235,245,0.3)]">
            ✓ 已安装到桌面
          </p>
        )}
      </div>
    </aside>
  )
}
