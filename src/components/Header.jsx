import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, User, Search, ChevronDown, Check, Shield, ArrowRightLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Header() {
  const { user, quickLogin } = useAuth()
  const [showSwitchMenu, setShowSwitchMenu] = useState(false)
  const navigate = useNavigate()

  const demoAccounts = [
    { name: 'Alex Morgan', role: 'Staff', email: 'alex.morgan@college.edu' },
    { name: 'Dr. Rachel Adams', role: 'Staff', email: 'rachel.adams@college.edu' },
    { name: 'Rahul Sharma', role: 'Member', email: 'rahul.sharma@college.edu' },
    { name: 'Priya Patil', role: 'Member', email: 'priya.patil@college.edu' },
    { name: 'Marcus Vance', role: 'Member', email: 'marcus.vance@college.edu' },
  ]

  const handleSwitch = (email) => {
    quickLogin(email)
    setShowSwitchMenu(false)
    navigate('/dashboard')
  }

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-6">
      {/* Left items */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 h-8 w-72 text-slate-400">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 truncate">Search catalog, ISBN, or donor records...</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Operational</span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-4">
        {/* Quick Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            title="Switch demo account for presentation"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary-container" />
            <span className="hidden md:inline">Demo Switch</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showSwitchMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Demo User
              </div>
              {demoAccounts.map(acc => {
                const isCurrent = user?.email === acc.email
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleSwitch(acc.email)}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 text-xs transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className={`font-medium ${isCurrent ? 'text-primary-container font-semibold' : 'text-slate-800'}`}>
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{acc.email}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded border ${
                      acc.role === 'Staff' 
                        ? 'border-blue-200 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}>
                      {acc.role}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <Link
          to="/notifications"
          className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container"></span>
        </Link>

        <div className="h-5 w-px bg-slate-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="text-right flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.name || 'Guest User'}
            </span>
            <div className="flex justify-end mt-0.5">
              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                user?.role === 'Staff' 
                  ? 'border-blue-200 bg-blue-50 text-blue-700' 
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}>
                {user?.role || 'Member'}
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-medium text-xs shadow-xs">
            {user?.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  )
}

