import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip,
} from 'recharts'
import { processChartData } from '../utils/chartData.js'
import {
  Calendar, Flame, TrendingUp, Activity,
  BarChart2, PieChart as PieIcon, Trash2, AlertTriangle,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════
   Sub-components
═══════════════════════════════════════════════════ */

/** KPI card with gradient accent */
function KpiCard({ icon: Icon, label, value, sub, color = '#6366f1' }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-2 animate-fade-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-none">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug">{sub}</p>
      )}
    </div>
  )
}

/** Section heading */
function SectionHeading({ icon: Icon, title, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-brand-500" />
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

/** Shared tooltip style */
const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.92)',
  border:          '1px solid rgba(99,102,241,0.15)',
  borderRadius:    '12px',
  boxShadow:       '0 4px 20px rgba(0,0,0,0.08)',
  backdropFilter:  'blur(12px)',
  fontSize:        '12px',
  color:           '#374151',
}
const tooltipDarkStyle = {
  backgroundColor: 'rgba(17,24,39,0.92)',
  border:          '1px solid rgba(99,102,241,0.2)',
  borderRadius:    '12px',
  boxShadow:       '0 4px 20px rgba(0,0,0,0.3)',
  backdropFilter:  'blur(12px)',
  fontSize:        '12px',
  color:           '#e5e7eb',
}

/* Custom tooltip renderer for both charts */
function CustomTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return (
    <div style={isDark ? tooltipDarkStyle : tooltipStyle} className="px-3 py-2">
      <p className="text-gray-400 dark:text-gray-500 mb-0.5 text-[11px]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color ?? p.fill ?? '#6366f1' }}>
          {p.value.toLocaleString()}{unit && ` ${unit}`}
        </p>
      ))}
    </div>
  )
}

/* Custom donut label */
function DonutLabel({ cx, cy, name, value, total }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan
        x={cx} dy="-0.4em"
        className="text-3xl font-black"
        style={{ fill: '#6366f1', fontSize: 28, fontWeight: 900 }}
      >
        {Math.round(value / total * 100)}%
      </tspan>
      <tspan
        x={cx} dy="1.5em"
        style={{ fill: '#9ca3af', fontSize: 11 }}
      >
        {name}
      </tspan>
    </text>
  )
}

/* ═══════════════════════════════════════════════════
   Main Dashboard
═══════════════════════════════════════════════════ */
export default function AnalyticsDashboard({ goals, onClearAll }) {
  const [trendDays,     setTrendDays]     = useState(30)
  const [confirmClear,  setConfirmClear]  = useState(false)

  const { dailyActivity, trend, distribution, kpis } = useMemo(
    () => processChartData(goals, trendDays),
    [goals, trendDays]
  )

  /* ── Empty state ── */
  if (!goals.length) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30
          flex items-center justify-center mb-4 shadow-glass"
        >
          <BarChart2 size={28} className="text-brand-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">暂无数据</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
          先创建目标并记录进度，数据统计将在这里展示。
        </p>
      </div>
    )
  }

  /* Color helpers */
  const axisProps = {
    tick:  { fill: '#9ca3af', fontSize: 11 },
    axisLine: false,
    tickLine: false,
  }
  const gridProps = {
    strokeDasharray: '3 3',
    stroke: '#f3f4f6',
    vertical: false,
  }

  return (
    <div className="space-y-8 animate-fade-up pb-4">

      {/* ══ KPI Cards ══════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          icon={Calendar}
          label="坚持天数"
          value={kpis.totalDays}
          sub="从创建第一个目标起"
          color="#6366f1"
        />
        <KpiCard
          icon={Flame}
          label="最勤奋"
          value={kpis.busiestDay ? kpis.busiestDay.total.toLocaleString() : '—'}
          sub={kpis.busiestDay ? kpis.busiestDay.date : '尚无记录'}
          color="#f97316"
        />
        <KpiCard
          icon={TrendingUp}
          label="完成率"
          value={`${kpis.overallPercent}%`}
          sub={`${kpis.activeDays} 天有记录`}
          color="#10b981"
        />
      </div>

      {/* ══ Trend Line Chart ═══════════════════════════ */}
      <div className="glass-card rounded-2xl p-5">
        <SectionHeading icon={TrendingUp} title="累积进度趋势">
          {/* Day range toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl">
            {[7, 30].map(d => (
              <button
                key={d}
                onClick={() => setTrendDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${trendDays === d
                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                {d}天
              </button>
            ))}
          </div>
        </SectionHeading>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"   stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%"  stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...axisProps}
              interval={trendDays === 7 ? 0 : 'preserveStartEnd'}
            />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="累积进度"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ══ Daily Activity Bar Chart ═══════════════════ */}
      <div className="glass-card rounded-2xl p-5">
        <SectionHeading icon={Activity} title={`每日投入（近 ${trendDays} 天）`} />

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyActivity} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
            barSize={trendDays === 7 ? 24 : 10}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...axisProps}
              interval={trendDays === 7 ? 0 : 'preserveStartEnd'}
            />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total"
              name="当日投入"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ══ Goal Distribution Donut ════════════════════ */}
      <div className="glass-card rounded-2xl p-5">
        <SectionHeading icon={PieIcon} title="目标完成分布" />

        {distribution.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Donut */}
            <div className="w-full sm:w-56 shrink-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {distribution.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.fill}
                        stroke="none"
                        style={{ filter: `drop-shadow(0 2px 8px ${entry.fill}40)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} 个`, name]}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend details */}
            <div className="flex-1 w-full space-y-3">
              {distribution.map(d => {
                const total = distribution.reduce((s, x) => s + x.value, 0)
                const pct   = Math.round(d.value / total * 100)
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: d.fill }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {d.value} 个 <span className="font-normal text-gray-400">({pct}%)</span>
                      </span>
                    </div>
                    {/* Mini bar */}
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: d.fill }}
                      />
                    </div>
                  </div>
                )
              })}

              {/* Total */}
              <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                共 <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {goals.length}
                </span> 个目标 · 记录了{' '}
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {kpis.totalLogEntries}
                </span> 次进度
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
            暂无目标数据
          </p>
        )}
      </div>

      {/* ══ Danger Zone ════════════════════════════════ */}
      <div className="rounded-2xl border border-red-200/70 dark:border-red-800/30
        bg-red-50/40 dark:bg-red-900/10 p-5"
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={16} className="shrink-0 text-red-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400">危险操作</h3>
            <p className="text-xs text-red-500 dark:text-red-500/80 mt-0.5">
              清空所有目标和记录，此操作不可撤销。
            </p>
          </div>
        </div>

        {confirmClear ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-red-600 dark:text-red-400 flex-1">
              真的要删除全部数据吗？
            </span>
            <button
              onClick={() => setConfirmClear(false)}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              取消
            </button>
            <button
              onClick={() => { onClearAll(); setConfirmClear(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                bg-red-500 hover:bg-red-600 text-white active:scale-95 transition-all"
            >
              <Trash2 size={12} />
              确认清空
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
              border border-red-300 dark:border-red-700/50
              text-red-600 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-900/30
              active:scale-95 transition-all"
          >
            <Trash2 size={13} />
            清空所有数据
          </button>
        )}
      </div>
    </div>
  )
}
