import { useState, useEffect } from 'react'

let _showToast = null

export const toast = {
  success: (msg) => _showToast?.({ type: 'success', message: msg }),
  error:   (msg) => _showToast?.({ type: 'error',   message: msg }),
  info:    (msg) => _showToast?.({ type: 'info',    message: msg }),
}

const icons  = { success: '✅', error: '❌', info: 'ℹ️' }
const colors = {
  success: 'bg-green-50 border-green-200 text-green-700',
  error:   'bg-rose-50 border-rose-200 text-rose-700',
  info:    'bg-blue-50 border-blue-200 text-blue-700',
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _showToast = ({ type, message }) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
    }
    return () => { _showToast = null }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-fade-in ${colors[t.type]}`}
        >
          <span className="text-lg flex-shrink-0">{icons[t.type]}</span>
          <p className="text-sm leading-relaxed flex-1">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="opacity-50 hover:opacity-100 flex-shrink-0 text-sm"
          >✕</button>
        </div>
      ))}
    </div>
  )
}