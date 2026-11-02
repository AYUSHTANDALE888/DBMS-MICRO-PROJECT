import React, { useState, useEffect } from 'react'
import { 
  ClipboardCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  User, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'

export function ManageRequests() {
  const { user } = useAuth()
  const toast = useToast()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState('Pending')
  const [searchQuery, setSearchQuery] = useState('')

  const loadRequests = async () => {
    try {
      const data = await api.getBookRequests(user)
      setRequests(data)
    } catch (err) {
      console.error('Failed to load book requests:', err)
      toast.error('Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [user])

  // Approve Request
  const handleApprove = async (requestId, bookTitle) => {
    setActionLoading(true)
    try {
      await api.approveBookRequest(requestId, user)
      toast.success(`Request #${requestId} for "${bookTitle}" approved! Book is queued for distribution.`)
      await loadRequests()
    } catch (err) {
      console.error(err)
      toast.error('Failed to approve request.')
    } finally {
      setActionLoading(false)
    }
  }

  // Reject Request
  const handleReject = async (requestId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to reject request #${requestId} for "${bookTitle}"? The book will be returned to the Available catalog.`)) {
      return
    }

    setActionLoading(true)
    try {
      await api.rejectBookRequest(requestId, user, 'Rejected by staff during intake triage')
      toast.info(`Request #${requestId} rejected. Book "${bookTitle}" returned to Available.`)
      await loadRequests()
    } catch (err) {
      console.error(err)
      toast.error('Failed to reject request.')
    } finally {
      setActionLoading(false)
    }
  }

  // Metrics
  const pendingCount = requests.filter(r => r.status === 'Pending').length
  const approvedCount = requests.filter(r => r.status === 'Approved').length
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length

  // Filtered list
  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'ALL' ? true : r.status === statusFilter
    const matchesSearch = 
      r.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.request_id).includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return <LoadingSpinner text="Loading member allocation requests..." />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Requests</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
              Staff Administration
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Review and triage collegiate book loan requests. Approved items are queued for physical distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-xs font-semibold text-amber-800 tabular-nums">
            {pendingCount} Pending Review
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-700 tabular-nums">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">requires action</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Approved Requests</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-blue-700 tabular-nums">{approvedCount}</span>
            <span className="text-xs text-blue-600 font-medium">queued for handoff</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rejected Requests</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-600 tabular-nums">{rejectedCount}</span>
            <span className="text-xs text-slate-400">returned to shelf</span>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
              {['Pending', 'Approved', 'Rejected', 'ALL'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === tab
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? `All (${requests.length})` : `${tab} (${requests.filter(r => r.status === tab).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, book, purpose..."
              className="w-full h-8 pl-8 pr-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ClipboardCheck}
                title="No requests in this queue"
                description={`There are currently no monograph requests matching the "${statusFilter}" filter.`}
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-4 w-28">Request ID</th>
                  <th className="py-2.5 px-4">Member Name</th>
                  <th className="py-2.5 px-4">Book Title & Author</th>
                  <th className="py-2.5 px-4">Academic Purpose</th>
                  <th className="py-2.5 px-4">Request Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => (
                  <tr key={r.request_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-primary-container whitespace-nowrap">
                      #REQ-2024-{String(r.request_id).padStart(3, '0')}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{r.member_name}</div>
                      <div className="text-[10px] text-slate-400">{r.member_email}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-slate-900">{r.book_title}</div>
                      <div className="text-[10px] text-slate-500">{r.author} • {r.category}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={r.purpose}>
                      {r.purpose}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(r.request_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <StatusBadge status={r.status} size="xs" />
                      {r.staff_name && (
                        <div className="text-[10px] text-slate-400 mt-0.5">By {r.staff_name}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {r.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleApprove(r.request_id, r.book_title)}
                            className="h-7 px-2.5 rounded-lg bg-primary-container hover:bg-blue-700 text-white font-medium inline-flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleReject(r.request_id, r.book_title)}
                            className="h-7 px-2.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

