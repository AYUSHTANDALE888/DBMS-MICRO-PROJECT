import React from 'react'

export function StatusBadge({ status, size = 'sm' }) {
  const s = String(status || '').trim()

  const sizeClasses = size === 'xs' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2 py-0.5 text-[11px]'

  switch (s) {
    case 'Available':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-[#15803D] text-[#15803D] bg-green-50/50 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          Available
        </span>
      )
    case 'Requested':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-purple-300 text-purple-700 bg-purple-50/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          Requested
        </span>
      )
    case 'Approved':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-blue-400 text-blue-700 bg-blue-50/70 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Approved
        </span>
      )
    case 'Distributed':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-slate-300 text-slate-700 bg-slate-100 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Distributed
        </span>
      )
    case 'Pending':
    case 'Pending Donation':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-amber-300 text-amber-800 bg-amber-50 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {s}
        </span>
      )
    case 'Received':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-emerald-600 text-emerald-800 bg-emerald-50 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Received
        </span>
      )
    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-rose-300 text-rose-700 bg-rose-50 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          Rejected
        </span>
      )
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide border border-slate-200 text-slate-600 bg-slate-50 ${sizeClasses}`}>
          {s}
        </span>
      )
  }
}

