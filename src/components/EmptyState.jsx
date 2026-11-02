import React from 'react'
import { FolderOpen } from 'lucide-react'

export function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = "No records found", 
  description = "There are no records matching your criteria at this time.", 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg border border-dashed border-slate-200">
      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

