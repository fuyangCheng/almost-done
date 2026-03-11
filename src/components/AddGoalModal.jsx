import React, { useState, useEffect, useRef } from 'react'
import { X, Target } from 'lucide-react'

const EMPTY = { name: '', total: '', unit: '' }

export default function AddGoalModal({ onAdd, onClose }) {
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  function validate() {
    const errs = {}
    if (!form.name.trim())              errs.name  = '请输入目标名称'
    if (!form.total || +form.total <= 0) errs.total = '请输入有效的目标总量'
    if (!form.unit.trim())              errs.unit  = '请输入单位'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onAdd(form)
    onClose()
  }

  function field(key, label, placeholder, type = 'text') {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400
          uppercase tracking-wide mb-1.5"
        >
          {label}
        </label>
        <input
          ref={key === 'name' ? nameRef : undefined}
          type={type}
          value={form[key]}
          placeholder={placeholder}
          onChange={e => {
            setForm(f => ({ ...f, [key]: e.target.value }))
            setErrors(err => ({ ...err, [key]: undefined }))
          }}
          className={`input-field ${errors[key] ? 'error' : ''}`}
        />
        {errors[key] && (
          <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
        )}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-modal-in w-full sm:max-w-md mx-0 sm:mx-4
        glass-panel rounded-t-3xl sm:rounded-2xl overflow-hidden"
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
          border-b border-gray-100/80 dark:border-gray-700/50"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500
              flex items-center justify-center shadow-brand-sm"
            >
              <Target size={14} className="text-white" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">新建目标</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {field('name', '目标名称', '例如：读完《原则》')}
          <div className="grid grid-cols-2 gap-3">
            {field('total', '目标总量', '例如：500', 'number')}
            {field('unit',  '单位',     '例如：页')}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1 text-center">
              创建目标
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
