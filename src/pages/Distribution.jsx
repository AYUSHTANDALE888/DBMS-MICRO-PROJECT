import React, { useState, useEffect } from 'react'
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  PackageCheck, 
  X, 
  Clock, 
  ShieldCheck, 
  User, 
  BookOpen, 
  Calendar 
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'

export function Distribution() {
  const { user } = useAuth()
  const toast = useToast()

  const [approvedRequests, setApprovedRequests] = useState([])
  const [completedDistributions, setCompletedDistributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('')

  // Confirmation Modal
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [distributionRemarks, setDistributionRemarks] = useState('Physical monograph handed over at Circulation Desk upon collegiate photo ID verification.')
  const [verifiedId, setVerifiedId] = useState(true)

  const loadData = async () => {
    try {
      const [allRequests, allDist] = await Promise.all([
        api.getBookRequests(user),
        api.getDistributions(user)
      ])

      // Only requests that are Approved and not yet distributed
      const distributedRequestIds = new Set(allDist.map(d => Number(d.request_id)))
      const pendingHandoff = allRequests.filter(r => r.status === 'Approved' && !distributedRequestIds.has(Number(r.request_id)))

      setApprovedRequests(pendingHandoff)
      setCompletedDistributions(allDist)
    } catch (err) {
      console.error('Failed to load distribution data:', err)
      toast.error('Failed to load distribution desk.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleConfirmDistribution = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      await api.distributeBook(selectedRequest.request_id, distributionRemarks)
      toast.success(`Distribution logged! "${selectedRequest.book_title}" has been issued to ${selectedRequest.member_name}.`)
      setSelectedRequest(null)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to record distribution.')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredApproved = approvedRequests.filter(r => {
    return (
      r.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.request_id).includes(searchQuery)
    )
  })

  const filteredCompleted = completedDistributions.filter(d => {
    return (
      d.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(d.distribution_id).includes(searchQuery)
    )
  })

  if (loading) {
    return <LoadingSpinner text="Loading circulation & distribution records..." />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Distribution Desk</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              Circulation Counter
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Process physical monograph handoffs and record distribution to collegiate members.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 self-start sm:self-auto">
          <Truck className="w-4 h-4 text-primary-container" />
          <span className="text-xs font-semibold text-blue-900 tabular-nums">
            {approvedRequests.length} Awaiting Physical Handoff
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Awaiting Pickup</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-blue-700 tabular-nums">{approvedRequests.length}</span>
            <span className="text-xs text-blue-600 font-medium">approved monographs</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Distributed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">{completedDistributions.length}</span>
            <span className="text-xs text-emerald-600 font-medium">volumes handed over</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Desk SLA Target</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">30 Days</span>
            <span className="text-xs text-slate-400">standard loan period</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Awaiting Handoff ({approvedRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed Distributions ({completedDistributions.length})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, book, ID..."
              className="w-full h-8 pl-8 pr-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
            />
          </div>
        </div>

        {/* Data Table: Pending Handoff */}
        {activeTab === 'pending' && (
          <div className="w-full overflow-x-auto">
            {filteredApproved.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={PackageCheck}
                  title="No approved requests pending distribution"
                  description="When member requests are approved by staff, they appear here ready for physical counter handoff."
                />
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-4 w-28">Request ID</th>
                    <th className="py-2.5 px-4">Member Name</th>
                    <th className="py-2.5 px-4">Book Title & Author</th>
                    <th className="py-2.5 px-4">Approval Date</th>
                    <th className="py-2.5 px-4">Staff Reviewer</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApproved.map((r) => (
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
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(r.request_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                        {r.staff_name || 'Staff Member'}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(r)}
                          className="h-7 px-3 bg-primary-container hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Mark as Distributed</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Data Table: Completed Distributions */}
        {activeTab === 'completed' && (
          <div className="w-full overflow-x-auto">
            {filteredCompleted.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Truck}
                  title="No completed distributions yet"
                  description="Distributed books will appear here once handed over to members."
                />
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-4 w-28">Dist. ID</th>
                    <th className="py-2.5 px-4">Recipient Member</th>
                    <th className="py-2.5 px-4">Book Title</th>
                    <th className="py-2.5 px-4">Distribution Date</th>
                    <th className="py-2.5 px-4">Current Status</th>
                    <th className="py-2.5 px-4 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompleted.map((d) => (
                    <tr key={d.distribution_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-emerald-700 whitespace-nowrap">
                        #DST-2024-{String(d.distribution_id).padStart(3, '0')}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{d.member_name}</div>
                        <div className="text-[10px] text-slate-400">{d.member_email}</div>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {d.book_title}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(d.distribution_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <StatusBadge status="Distributed" size="xs" />
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 text-right max-w-xs truncate" title={d.remarks}>
                        {d.remarks || 'Standard handoff completed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* CONFIRM DISTRIBUTION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-container" />
                <h3 className="text-sm font-bold text-slate-900">Confirm Physical Distribution</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Are you ready to record physical book handoff for Request{' '}
                <span className="font-mono font-bold text-primary-container">
                  #REQ-2024-{String(selectedRequest.request_id).padStart(3, '0')}
                </span>{' '}
                to <span className="font-semibold text-slate-900">{selectedRequest.member_name}</span>?
              </p>

              {/* Book Details Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1">
                <div className="font-bold text-slate-900">{selectedRequest.book_title}</div>
                <div className="text-[11px] text-slate-500">{selectedRequest.author} • {selectedRequest.category}</div>
              </div>

              {/* Verification Checklist */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex flex-col gap-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedId}
                    onChange={(e) => setVerifiedId(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 text-primary-container border-slate-300 rounded focus:ring-0"
                  />
                  <span className="text-slate-700">
                    Physical book inspected and handed to member upon verification of collegiate photo ID.
                  </span>
                </label>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Distribution Remarks / Shelf Log
                </label>
                <textarea
                  rows={2}
                  value={distributionRemarks}
                  onChange={(e) => setDistributionRemarks(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container resize-none"
                />
              </div>

              {/* Notice */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Action creates a <strong>distribution</strong> row, updates <strong>book_status</strong> to "Distributed", and sends a notification.
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !verifiedId}
                  onClick={handleConfirmDistribution}
                  className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-blue-700 text-white font-medium shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'Recording...' : 'Confirm Distribution'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

