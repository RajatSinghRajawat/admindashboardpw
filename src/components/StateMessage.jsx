import React from 'react'
import { AlertTriangle, Info, RefreshCcw } from 'lucide-react'

const variants = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-700',
    Icon: Info,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-700',
    Icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-700',
    Icon: AlertTriangle,
  },
}

const StateMessage = ({ title, message, variant = 'info', actionLabel, onAction, compact }) => {
  const { container, Icon } = variants[variant] || variants.info

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${container} ${compact ? 'text-sm' : ''}`}>
      <Icon size={compact ? 18 : 20} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {message && <p className="mt-0.5">{message}</p>}
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-current rounded-md hover:bg-white/40 transition-colors"
        >
          <RefreshCcw size={14} />
          {actionLabel || 'Retry'}
        </button>
      )}
    </div>
  )
}

export default StateMessage

