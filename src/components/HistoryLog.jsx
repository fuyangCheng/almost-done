import React from 'react'
import { X, Clock } from 'lucide-react'

export default function HistoryLog({ logs, unit, onDeleteLog }) {
  if (!logs.length) return null

  const sorted = [...logs].reverse()

  return (
    <div className="mt-3 pt-3 border-t border-gray-100/60 dark:border-gray-700/40">
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500
        uppercase tracking-widest mb-2 px-1"
      >
        历史记录
      </p>

      <ul className="space-y-0.5 max-h-44 overflow-y-auto">
        {sorted.map((log, i) => (
          <li
            key={log.id ?? i}
            className="group/log flex items-center justify-between gap-2
              px-2 py-1.5 rounded-xl
              hover:bg-gray-50 dark:hover:bg-gray-700/30
              transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={10} className="shrink-0 text-gray-300 dark:text-gray-600" />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
                {log.date}
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                +{log.amount.toLocaleString()}
                <span className="font-normal text-gray-400 dark:text-gray-500 ml-0.5">{unit}</span>
              </span>
            </div>

            {log.id ? (
              <button
                onClick={() => onDeleteLog(log.id)}
                title="删除此记录（回滚进度）"
                className="opacity-0 group-hover/log:opacity-100
                  p-1 rounded-lg
                  text-gray-300 dark:text-gray-600
                  hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30
                  transition-all shrink-0"
              >
                <X size={10} />
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
