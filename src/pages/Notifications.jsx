import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  CheckCheck, 
  Check, 
  Inbox, 
  Filter, 
  Clock, 
  BookOpen, 
  Truck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'

export function Notifications() {
  const { user } = useAuth()
  const toast = useToast()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('bdms_read_notifs')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'REQUEST' | 'DONATION' | 'DISTRIBUTION'

  useEffect(() => {
    async function loadNotifs() {
      try {
        const data = await api.getNotifications(user)
        setNotifications(data)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        setLoading(false)
      }
    }
    loadNotifs()
  }, [user])

  const markRowRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('bdms_read_notifs', JSON.stringify([...next]))
      return next
    })
  }

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.notification_id))
    setReadIds(allIds)
    localStorage.setItem('bdms_read_notifs', JSON.stringify([...allIds]))
    toast.success('All notifications marked as read.')
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.notification_id)).length

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'ALL') return true
    if (filterType === 'REQUEST') return n.notification_type.toLowerCase().includes('request')
    if (filterType === 'DONATION') return n.notification_type.toLowerCase().includes('donat')
    if (filterType === 'DISTRIBUTION') return n.notification_type.toLowerCase().includes('distribut')
    return true
  })

  if (loading) {
    return <LoadingSpinner text="Loading your notification dispatch ledger..." />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
              Collegiate Dispatch Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500">
            System notices regarding monograph requests, donation intake verification, and desk pickup readiness.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 border-r border-slate-200">
            <span className={`w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-primary-container animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="font-semibold text-slate-800">{unreadCount} unread</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 text-slate-500">
            <span>Status:</span>
            <span className="text-emerald-700 font-semibold">Synchronized</span>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-container w-full sm:w-auto"
          >
            <option value="ALL">All Types</option>
            <option value="REQUEST">Request Updates</option>
            <option value="DONATION">Donation Intakes</option>
            <option value="DISTRIBUTION">Distribution Events</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={markAllAsRead}
          className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 self-end sm:self-auto"
        >
          <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-2.5">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-xl">
            <EmptyState
              icon={Bell}
              title="No notifications in this view"
              description="You are fully caught up! New events regarding donations or requests will appear here."
            />
          </div>
        ) : (
          filteredNotifs.map(n => {
            const isRead = readIds.has(n.notification_id)
            return (
              <div
                key={n.notification_id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isRead
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-white border-slate-200 border-l-4 border-l-primary-container shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    n.notification_type.includes('Distribution')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : n.notification_type.includes('Approved')
                      ? 'bg-blue-50 border-blue-200 text-primary-container'
                      : n.notification_type.includes('Donation')
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-purple-50 border-purple-200 text-purple-700'
                  }`}>
                    {n.notification_type.includes('Distribution') ? (
                      <Truck className="w-4 h-4" />
                    ) : n.notification_type.includes('Approved') ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700">
                        {n.notification_type}
                      </span>
                      {!isRead && (
                        <span className="px-1.5 py-0.2 rounded bg-primary-container text-white text-[9px] font-bold uppercase tracking-wider">
                          Unread
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-slate-400">
                        {new Date(n.sent_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed">
                      {n.remarks ? (
                        <>
                          <strong className="font-semibold">{n.book_title}: </strong>
                          {n.remarks}
                        </>
                      ) : (
                        `Update regarding ${n.book_title}`
                      )}
                    </p>
                  </div>
                </div>

                {!isRead && (
                  <button
                    type="button"
                    onClick={() => markRowRead(n.notification_id)}
                    className="h-7 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1 self-end sm:self-center shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

