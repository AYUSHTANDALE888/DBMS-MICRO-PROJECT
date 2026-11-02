import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Plus, Search, Filter, Calendar, MapPin } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'

export function MyDonations() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function loadDonations() {
      try {
        const data = await api.getDonations(user)
        setDonations(data)
      } catch (err) {
        console.error('Failed to load member donations:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDonations()
  }, [user])

  if (loading) {
    return <LoadingSpinner text="Loading your donation history..." />
  }

  // Filter donations
  const filteredDonations = donations.filter(d => {
    const matchesSearch = 
      d.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pickup_street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(d.donation_id).includes(searchQuery)
    const matchesStatus = statusFilter === 'ALL' ? true : d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalSubmitted = donations.length
  const pendingCount = donations.filter(d => d.status === 'Pending').length
  const receivedCount = donations.filter(d => d.status === 'Received').length

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Donations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your submitted academic book donations and courier verification status.
          </p>
        </div>

        <Link
          to="/donate-a-book"
          className="h-8 px-3.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Donate a Book</span>
        </Link>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Submitted</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalSubmitted}</span>
            <span className="text-xs text-slate-400">donations logged</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-700 tabular-nums">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">awaiting pickup/intake</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed Intakes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">{receivedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">verified & on shelf</span>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Donation History</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
              {filteredDonations.length} records
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, address, ID..."
                className="w-full h-8 pl-8 pr-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          {filteredDonations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Package}
                title="No donations found"
                description={
                  donations.length === 0
                    ? "You haven't submitted any book donations yet. Share textbooks with collegiate peers!"
                    : "No donations match your search filter."
                }
                action={
                  donations.length === 0 ? (
                    <Link
                      to="/donate-a-book"
                      className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-primary-container text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Donate Your First Book</span>
                    </Link>
                  ) : null
                }
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-4 w-28">Donation ID</th>
                  <th className="py-2.5 px-4">Book Title</th>
                  <th className="py-2.5 px-4">Donation Date</th>
                  <th className="py-2.5 px-4">Pickup Address</th>
                  <th className="py-2.5 px-4">Current Status</th>
                  <th className="py-2.5 px-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonations.map((d) => (
                  <tr key={d.donation_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-primary-container whitespace-nowrap">
                      #DN-2024-{String(d.donation_id).padStart(3, '0')}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      <div>{d.book_title}</div>
                      <div className="text-[10px] text-slate-400">{d.author} • {d.category}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(d.donation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <div>{d.pickup_street}</div>
                      <div className="text-[10px] text-slate-400">Pincode: {d.pickup_pincode}</div>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <StatusBadge status={d.status} size="xs" />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-right max-w-xs truncate" title={d.description}>
                      {d.description || (d.status === 'Received' ? 'Verified & cataloged' : 'Pickup in progress')}
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

