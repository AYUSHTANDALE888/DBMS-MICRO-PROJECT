import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookmarkPlus, 
  Search, 
  CheckCircle2, 
  Info, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  HelpCircle
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'

export function RequestBook() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [availableBooks, setAvailableBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState(null)
  const [purpose, setPurpose] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadAvailableBooks = async () => {
    try {
      const allBooks = await api.getBooks()
      // Only books whose derived current status is 'Available'
      const avail = allBooks.filter(b => b.current_status === 'Available')
      setAvailableBooks(avail)
      if (avail.length > 0 && !selectedBook) {
        setSelectedBook(avail[0])
      }
    } catch (err) {
      console.error('Failed to load available books:', err)
      toast.error('Failed to load available catalog.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAvailableBooks()
  }, [])

  const handleSubmitRequest = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error('You must be logged in as a Member to submit a request.')
      return
    }

    if (!selectedBook) {
      toast.error('Please select an available book from the reserve catalog.')
      return
    }

    if (!purpose.trim()) {
      toast.error('Please specify your academic purpose.')
      return
    }

    setSubmitting(true)
    try {
      await api.createBookRequest({
        memberId: user.member_id || 1,
        bookId: selectedBook.book_id,
        purpose: purpose.trim()
      })

      toast.success(`Request submitted for "${selectedBook.book_title}"! Staff will review for distribution.`)
      setPurpose('')
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter books
  const filteredBooks = availableBooks.filter(b => {
    const matchesSearch = 
      b.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = categoryFilter ? b.category === categoryFilter : true
    return matchesSearch && matchesCat
  })

  if (loading) {
    return <LoadingSpinner text="Loading available monographs from catalog..." />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Request a Book</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              Available Reserve
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Browse verified available monographs and request allocation for course study or project research.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-emerald-800 tabular-nums">
            {availableBooks.length} Available for Request
          </span>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-container"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-container w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Literature">Literature</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Book Selection + Purpose Submission Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Available Books Grid (8 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Available Monographs
            </span>
            <span className="text-xs text-slate-400">
              Showing {filteredBooks.length} of {availableBooks.length} books
            </span>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-xl">
              <EmptyState
                icon={BookOpen}
                title="No available books match your filter"
                description="Check back later or view current loans in the catalog."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredBooks.map((b) => {
                const isSelected = selectedBook?.book_id === b.book_id
                return (
                  <div
                    key={b.book_id}
                    onClick={() => setSelectedBook(b)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-container bg-blue-50/40 shadow-xs ring-1 ring-primary-container'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {b.category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {b.book_condition}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                        {b.book_title}
                      </h3>
                      <p className="text-[11px] text-slate-500">{b.author}</p>

                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready for Issue
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">ID #{b.book_id}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedBook(b)
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary-container text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selected for Request</span>
                          </>
                        ) : (
                          <span>Select this Book</span>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Purpose Submission Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Request Summary & Academic Purpose
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">Submit Book Request</h2>
            </div>

            {selectedBook ? (
              <form onSubmit={handleSubmitRequest} className="p-5 flex flex-col gap-4 text-xs">
                {/* Selected Book Summary */}
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-container">
                    Target Book Record
                  </span>
                  <div className="font-bold text-slate-900 text-xs">{selectedBook.book_title}</div>
                  <div className="text-[11px] text-slate-600">{selectedBook.author}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span>Category: {selectedBook.category}</span>
                    <span>•</span>
                    <span>Condition: {selectedBook.book_condition}</span>
                  </div>
                </div>

                {/* Purpose Field */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Academic Purpose / Research Justification <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Relational database coursework preparation, semester project implementation, or competitive exam preparation..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container resize-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Staff review will verify availability and approve for desk distribution.
                  </span>
                </div>

                {/* Notice */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-primary-container shrink-0 mt-0.5" />
                  <span>Submitting changes the book's status to <strong>"Requested"</strong> until reviewed by staff.</span>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-primary-container hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Submitting Request...' : 'Submit Monograph Request'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Please select a book from the catalog on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

