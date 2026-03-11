/**
 * Returns prediction info based on the last 7 days of logs.
 * Returns null if goal is complete.
 * Returns { type: 'no-data' } if not enough history.
 * Returns { type: 'prediction', daysNeeded: number } otherwise.
 */
export function calcPrediction(goal) {
  const remaining = goal.total - goal.current
  if (remaining <= 0) return null

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentLogs = goal.logs.filter(l => l.ts && l.ts >= cutoff)

  if (recentLogs.length === 0) return { type: 'no-data' }

  const totalAmount = recentLogs.reduce((sum, l) => sum + l.amount, 0)
  const avgPerDay = totalAmount / 7   // averaged over 7 calendar days

  if (avgPerDay <= 0) return { type: 'no-data' }

  const daysNeeded = Math.ceil(remaining / avgPerDay)
  return { type: 'prediction', daysNeeded }
}

/** True if the goal has at least one log entry dated today. */
export function checkedInToday(goal) {
  const today = new Date().toLocaleDateString('zh-CN')
  return goal.logs.some(l => l.date === today)
}
