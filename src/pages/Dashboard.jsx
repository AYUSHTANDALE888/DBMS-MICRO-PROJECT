import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Filter, 
  Library, 
  History,
  TrendingUp,
  Download
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'Donations' | 'Requests' | 'Handover'

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getDashboardStats(user)
        setStats(data)
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (loading) {
    return <LoadingSpinner text="Loading dashboard metrics and recent catalog activity..." />
  }

  const isStaff = user?.role === 'Staff'

  // Filter recent activity
  const filteredActivity = (stats?.recentActivity || []).filter(item => {
    if (filterType === 'ALL') return true
    if (filterType === 'Donations') return item.action.toLowerCase().includes('donat') || item.status.includes('Donation')
    if (filterType === 'Requests') return item.action.toLowerCase().includes('request') || item.status === 'Requested'
    if (filterType === 'Handover') return item.action.toLowerCase().includes('distribut') || item.status === 'Distributed'
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              College Central Desk
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Overview of book inventory, pending queues, and recent transactional records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isStaff ? (
            <Link
              to="/books"
              className="h-8 px-3.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register Intake</span>
            </Link>
          ) : (
            <Link
              to="/donate-a-book"
              className="h-8 px-3.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Donate a Book</span>
            </Link>
          )}

          <Link
            to="/book-status-history"
            className="h-8 px-3 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Books */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Books</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-primary-container">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.totalBooks ?? 0}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">Catalog records</span>
          </div>
        </div>

        {/* Card 2: Pending Donations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Donations</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.pendingDonations ?? 0}
            </span>
            <span className="text-[11px] text-amber-600 mt-0.5 font-medium">Awaiting intake review</span>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Requests</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.pendingRequests ?? 0}
            </span>
            <span className="text-[11px] text-purple-600 mt-0.5 font-medium">Monograph queue</span>
          </div>
        </div>

        {/* Card 4: Books Distributed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Books Distributed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.booksDistributed ?? 0}
            </span>
            <span className="text-[11px] text-emerald-700 mt-0.5 font-medium">Completed handoffs</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Section Header & Tabs */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-500">Latest recorded transactions across the monograph catalog</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {['ALL', 'Donations', 'Requests', 'Handover'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterType === tab
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? `All (${stats?.recentActivity?.length || 0})` : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-4 w-32">Date</th>
                <th className="py-2.5 px-4">Book Title</th>
                <th className="py-2.5 px-4">Action / Remarks</th>
                <th className="py-2.5 px-4 w-28">Status</th>
                <th className="py-2.5 px-4 text-right w-36">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No transactions recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {row.book_title}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-xs truncate" title={row.action}>
                      {row.action}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <StatusBadge status={row.status} size="xs" />
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-right whitespace-nowrap">
                      {row.recorded_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">
            Showing {filteredActivity.length} recent audit entries
          </span>
          <Link
            to="/book-status-history"
            className="text-primary-container hover:underline font-medium flex items-center gap-1"
          >
            <span>View complete status history</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

