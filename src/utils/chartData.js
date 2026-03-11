/**
 * chartData.js
 * ─────────────────────────────────────────────────────
 * Converts raw goal/log data into Recharts-ready arrays
 * and computes KPI metrics.
 */

/* ── Date helpers ─────────────────────────────────── */

/** Returns a "YYYY/M/D" key for a timestamp or log entry */
function dayKey(tsOrLog) {
  const ts = typeof tsOrLog === 'number' ? tsOrLog : (tsOrLog.ts ?? null)
  if (ts) {
    const d = new Date(ts)
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
  }
  // Fallback: legacy logs stored date as zh-CN string (same YYYY/M/D format)
  return tsOrLog.date ?? ''
}

/** Display label for axis: "M/D" */
function toLabel(key) {
  const parts = key.split('/')
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : key
}

/** Array of the last N days as "YYYY/M/D" keys, oldest first */
function lastNDayKeys(n) {
  const keys = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    keys.push(`${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`)
  }
  return keys
}

/* ── Main export ──────────────────────────────────── */

/**
 * processChartData(goals, trendDays)
 *
 * @param {Array}  goals      - goal objects from useGoals
 * @param {number} trendDays  - 7 or 30 (for trend + activity charts)
 * @returns {{ dailyActivity, trend, distribution, kpis }}
 */
export function processChartData(goals, trendDays = 30) {
  if (!goals.length) return { dailyActivity: [], trend: [], distribution: [], kpis: null }

  /* Flatten ALL logs across all goals */
  const allLogs = goals.flatMap(g => g.logs)

  /* ── 1. Daily activity (total input per day) ── */
  const activityMap = {}  // key → total amount
  for (const log of allLogs) {
    const k = dayKey(log)
    if (k) activityMap[k] = (activityMap[k] ?? 0) + log.amount
  }

  const dayKeys = lastNDayKeys(trendDays)
  const dailyActivity = dayKeys.map(k => ({
    date:  toLabel(k),
    total: activityMap[k] ?? 0,
    rawKey: k,
  }))

  /* ── 2. Cumulative trend (running sum of all inputs up to each day) ── */
  // Build a sorted map of all time: key → cumulative total
  const allDayKeys = Object.keys(activityMap).sort()
  let running = 0
  const cumulMap = {}
  for (const k of allDayKeys) {
    running += activityMap[k]
    cumulMap[k] = running
  }

  // Fill in the last N days (forward-fill from previous known value)
  let prev = 0
  const trend = dayKeys.map(k => {
    if (cumulMap[k] !== undefined) prev = cumulMap[k]
    return { date: toLabel(k), cumulative: prev }
  })

  /* ── 3. Goal distribution ── */
  const doneCount   = goals.filter(g => g.current >= g.total).length
  const activeCount = goals.length - doneCount
  const distribution = [
    { name: '进行中', value: activeCount, fill: '#6366f1' },
    { name: '已完成', value: doneCount,   fill: '#10b981' },
  ].filter(d => d.value > 0)

  /* ── 4. KPIs ── */
  // Total days since first goal was created
  const earliestCreated = Math.min(...goals.map(g => g.createdAt))
  const totalDays = Math.max(1, Math.floor((Date.now() - earliestCreated) / 86_400_000) + 1)

  // Busiest day (most total input in one day)
  let busiestDay = null
  for (const [k, total] of Object.entries(activityMap)) {
    if (!busiestDay || total > busiestDay.total) {
      busiestDay = { date: toLabel(k), total }
    }
  }

  // Overall completion %
  const overallPercent = Math.round(
    goals.reduce((s, g) => s + Math.min(g.current / g.total, 1), 0) / goals.length * 100
  )

  // Active days (days with at least one log)
  const activeDays = Object.keys(activityMap).length

  // Total log entries
  const totalLogEntries = allLogs.length

  const kpis = { totalDays, busiestDay, overallPercent, activeDays, totalLogEntries }

  return { dailyActivity, trend, distribution, kpis }
}
