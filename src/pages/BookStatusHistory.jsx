import React, { useState, useEffect } from 'react'
import { 
  History, 
  BookOpen, 
  Calendar, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  FileText 
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function BookStatusHistory() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [selectedBookId, setSelectedBookId] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Load books catalog on mount
  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await api.getBooks()
        setBooks(data)
        if (data.length > 0) {
          // Default to book 1 or first available
          setSelectedBookId(data[0].book_id)
        }
      } catch (err) {
        console.error('Failed to load books for history view:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [])

  // Load status history whenever selectedBookId changes
  useEffect(() => {
    if (!selectedBookId) return

    async function loadHistory() {
      setHistoryLoading(true)
      try {
        const records = await api.getBookStatusHistory(selectedBookId)
        setHistory(records)
      } catch (err) {
        console.error('Failed to load status history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    loadHistory()
  }, [selectedBookId])

  const selectedBook = books.find(b => Number(b.book_id) === Number(selectedBookId))

  if (loading) {
    return <LoadingSpinner text="Loading book catalog records..." />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Book Status History</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Audit Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track the entire lifecycle, intake, loan requests, approvals, and physical distribution events for academic monographs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Total Events</span>
            <span className="font-bold text-slate-900 tabular-nums">{history.length}</span>
          </div>

          {selectedBook && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Current State</span>
              <StatusBadge status={selectedBook.current_status} size="xs" />
            </div>
          )}
        </div>
      </div>

      {/* Monograph Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary-container" />
          <span>Select Academic Book Record</span>
        </label>
        <select
          value={selectedBookId || ''}
          onChange={(e) => setSelectedBookId(Number(e.target.value))}
          className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-container"
        >
          {books.map(b => (
            <option key={b.book_id} value={b.book_id}>
              #{b.book_id} - {b.book_title} ({b.author}) — Current Status: {b.current_status}
            </option>
          ))}
        </select>
      </div>

      {/* Book Metadata Overview Card */}
      {selectedBook && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{selectedBook.book_title}</h2>
                <StatusBadge status={selectedBook.current_status} size="xs" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{selectedBook.author}</p>
            </div>
            <span className="font-mono text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 self-start sm:self-auto">
              Accession ID: #{selectedBook.book_id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Category</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{selectedBook.category}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Condition</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{selectedBook.book_condition}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Date Received</span>
              <span className="font-medium text-slate-800 mt-0.5 block font-mono">
                {new Date(selectedBook.date_received).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Derived Status</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{selectedBook.current_status}</span>
            </div>
          </div>

          {selectedBook.description && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">Description: </span>
              {selectedBook.description}
            </div>
          )}
        </div>
      )}

      {/* Vertical Timeline Audit Log Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary-container" />
            <h3 className="text-sm font-bold text-slate-900">Lifecycle & Custody Audit Trail</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Order: Newest to Oldest</span>
        </div>

        {historyLoading ? (
          <LoadingSpinner text="Loading audit timeline..." />
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No status history records found for this monograph.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-3 before:w-px before:bg-slate-200 my-2">
            {history.map((entry, idx) => {
              const isLatest = idx === 0
              return (
                <div key={entry.status_id} className="relative flex flex-col items-start gap-1">
                  {/* Timeline Node Marker */}
                  <span
                    className={`absolute -left-[20px] sm:-left-[24px] top-1 w-3 h-3 rounded-full border-2 bg-white transition-all ${
                      isLatest
                        ? 'border-primary-container bg-primary-container ring-4 ring-blue-50'
                        : 'border-slate-400 bg-white'
                    }`}
                  ></span>

                  {/* Header: Status Badge + Date */}
                  <div className="w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.status_name} size="xs" />
                      {isLatest && (
                        <span className="text-[10px] font-bold text-primary-container uppercase tracking-wider bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          Current State
                        </span>
                      )}
                    </div>

                    <time className="font-mono text-[11px] text-slate-400">
                      {new Date(entry.updated_date).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>

                  {/* Remarks */}
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 w-full">
                    {entry.remarks || `Status transitioned to ${entry.status_name}`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

