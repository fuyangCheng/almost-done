import { useState, useEffect } from 'react'

const STORAGE_KEY = 'almost-done-goals'

function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useGoals() {
  const [goals, setGoals] = useState(loadGoals)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  }, [goals])

  function addGoal({ name, total, unit }) {
    setGoals(prev => [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        total: Number(total),
        unit: unit.trim(),
        current: 0,
        createdAt: Date.now(),
        logs: [],
        visualType: 'linear',   // 'linear' | 'circle' | 'puzzle'
      },
      ...prev,
    ])
  }

  /** Cycle or set the visualType for a single goal. */
  function setVisualType(goalId, type) {
    setGoals(prev =>
      prev.map(g => g.id !== goalId ? g : { ...g, visualType: type })
    )
  }

  function updateProgress(id, increment) {
    const amount = Number(increment)
    if (!amount || amount <= 0) return
    setGoals(prev =>
      prev.map(g => {
        if (g.id !== id) return g
        const actual = Math.min(amount, g.total - g.current)
        if (actual <= 0) return g
        return {
          ...g,
          current: g.current + actual,
          logs: [
            ...g.logs,
            {
              id: crypto.randomUUID(),
              amount: actual,
              date: new Date().toLocaleDateString('zh-CN'),
              ts: Date.now(),
            },
          ],
        }
      })
    )
  }

  /** Delete a single log entry and roll back its amount from current progress. */
  function deleteLog(goalId, logId) {
    setGoals(prev =>
      prev.map(g => {
        if (g.id !== goalId) return g
        const log = g.logs.find(l => l.id === logId)
        if (!log) return g
        return {
          ...g,
          current: Math.max(0, g.current - log.amount),
          logs: g.logs.filter(l => l.id !== logId),
        }
      })
    )
  }

  /** Edit goal metadata. If new total < current, caps current at new total. */
  function editGoal(goalId, { name, total, unit }) {
    const newTotal = Number(total)
    setGoals(prev =>
      prev.map(g => {
        if (g.id !== goalId) return g
        return {
          ...g,
          name: name.trim(),
          total: newTotal,
          unit: unit.trim(),
          current: Math.min(g.current, newTotal),
        }
      })
    )
  }

  function deleteGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  function clearAll() {
    setGoals([])
  }

  return { goals, addGoal, updateProgress, deleteLog, editGoal, deleteGoal, clearAll, setVisualType }
}
