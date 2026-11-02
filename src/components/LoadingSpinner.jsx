import React from 'react'

export function LoadingSpinner({ text = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-7 h-7 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-medium text-slate-500">{text}</span>
    </div>
  )
}

