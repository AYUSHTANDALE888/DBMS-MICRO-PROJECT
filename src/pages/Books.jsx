import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  Edit3, 
  X, 
  Inbox, 
  BookOpen, 
  Filter, 
  ArrowUpDown 
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'

export function Books() {
  const { user } = useAuth()
  const isStaff = user?.role === 'Staff'
  const toast = useToast()

  const [books, setBooks] = useState([])
  const [pendingDonations, setPendingDonations] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Add Book Form state
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newCategory, setNewCategory] = useState('Computer Science')
  const [newCondition, setNewCondition] = useState('Good')
  const [newDescription, setNewDescription] = useState('')

  const loadData = async () => {
    try {
      const [allBooks, allDonations] = await Promise.all([
        api.getBooks(),
        api.getDonations(user)
      ])
      setBooks(allBooks)
      setPendingDonations(allDonations.filter(d => d.status === 'Pending'))
    } catch (err) {
      console.error('Failed to load books catalog:', err)
      toast.error('Failed to load books catalog.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // Mark as Received handler for Staff
  const handleMarkReceived = async (donationId, bookTitle) => {
    setActionLoading(true)
    try {
      await api.markDonationReceived(donationId, user)
      toast.success(`Donation received! "${bookTitle}" is now cataloged as Available.`)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to mark donation as received.')
    } finally {
      setActionLoading(false)
    }
  }

  // Add new book handler (Staff only)
  const handleAddBook = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newAuthor.trim()) {
      toast.error('Title and author are required.')
      return
    }

    setActionLoading(true)
    try {
      await api.createBook({
        book_title: newTitle.trim(),
        author: newAuthor.trim(),
        category: newCategory,
        book_condition: newCondition,
        description: newDescription.trim()
      })
      toast.success(`Book "${newTitle}" added to catalog as Available.`)
      setShowAddModal(false)
      // Reset form
      setNewTitle('')
      setNewAuthor('')
      setNewDescription('')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add book.')
    } finally {
      setActionLoading(false)
    }
  }

  // Edit book handler (Staff only)
  const handleEditBook = async (e) => {
    e.preventDefault()
    if (!editingBook) return

    setActionLoading(true)
    try {
      await api.updateBook(editingBook.book_id, {
        book_title: editingBook.book_title,
        author: editingBook.author,
        category: editingBook.category,
        book_condition: editingBook.book_condition,
        description: editingBook.description
      })
      toast.success(`Book "${editingBook.book_title}" updated successfully.`)
      setEditingBook(null)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update book.')
    } finally {
      setActionLoading(false)
    }
  }

  // Filter books
  const filteredBooks = books.filter(b => {
    const matchesSearch = 
      b.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = categoryFilter ? b.category === categoryFilter : true
    const matchesCond = conditionFilter ? b.book_condition.toLowerCase() === conditionFilter.toLowerCase() : true
    return matchesSearch && matchesCat && matchesCond
  })

  // Calculate metrics
  const totalCataloged = books.length
  const availableCount = books.filter(b => b.current_status === 'Available').length
  const requestedCount = books.filter(b => b.current_status === 'Requested' || b.current_status === 'Approved').length
  const pendingIntakes = pendingDonations.length

  if (loading) {
    return <LoadingSpinner text="Loading catalog records and intake queue..." />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Cataloged</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalCataloged}</span>
            <span className="text-xs text-slate-400">Total books</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available on Shelf</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">{availableCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Ready for request</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Loans / Queued</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-purple-700 tabular-nums">{requestedCount}</span>
            <span className="text-xs text-purple-600 font-medium">Requested/Approved</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Intakes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-primary-container tabular-nums">{pendingIntakes}</span>
            <span className="text-xs text-blue-600 font-medium">{isStaff ? 'Action required' : 'In review'}</span>
          </div>
        </div>
      </div>

      {/* Control Strip & Search Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Books Catalog</h1>
            <p className="text-xs text-slate-500">Inventory records and collegiate catalog reserve.</p>
          </div>

          <div className="flex items-center gap-2">
            {isStaff && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="h-8 px-3.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Book</span>
                <span className="ml-1 text-[10px] bg-white/20 px-1 py-0.2 rounded">Staff</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or category..."
              className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-container"
            >
              <option value="">All Categories</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Literature">Literature</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-container"
            >
              <option value="">All Conditions</option>
              <option value="like new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
      </div>

      {/* STAFF ONLY: PENDING DONATIONS QUEUE */}
      {isStaff && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Pending Donations Queue
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Staff Queue ({pendingDonations.length})
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Verify incoming books and mark as received to catalog into "Available" inventory.
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            {pendingDonations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No pending donations in queue. All donations have been received and cataloged!
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-4">Donor Member</th>
                    <th className="py-2.5 px-4">Book Title & Author</th>
                    <th className="py-2.5 px-4">Pickup Address & Date</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDonations.map(dn => (
                    <tr key={dn.donation_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{dn.donor_name}</div>
                        <div className="text-[10px] text-slate-400">{dn.donor_email}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-900">{dn.book_title}</div>
                        <div className="text-[11px] text-slate-500">{dn.author} • {dn.category}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div>{dn.pickup_street}, {dn.pickup_pincode}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(dn.donation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleMarkReceived(dn.donation_id, dn.book_title)}
                          className="h-7 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Received</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Main Books Catalog Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Catalog Inventory</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
              {filteredBooks.length} items shown
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          {filteredBooks.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={BookOpen}
                title="No books match your search"
                description="Try clearing your search query or adjusting your category/condition filters."
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Author</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Condition</th>
                  <th className="py-2.5 px-4">Date Received</th>
                  <th className="py-2.5 px-4">Derived Status</th>
                  {isStaff && <th className="py-2.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((b) => (
                  <tr key={b.book_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      <div>{b.book_title}</div>
                      {b.description && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{b.description}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{b.author}</td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{b.category}</td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{b.book_condition}</td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(b.date_received).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <StatusBadge status={b.current_status} size="xs" />
                    </td>
                    {isStaff && (
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingBook(b)}
                          className="text-primary-container hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD BOOK MODAL (Staff only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add Book to Catalog</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="p-5 flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Introduction to Algorithms"
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Author *</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Thomas H. Cormen"
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Literature">Literature</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Condition *</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Edition, accession marks, shelf remarks..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-blue-700 text-white font-medium shadow-xs transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOOK MODAL (Staff only) */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Edit Book Record #{editingBook.book_id}</h3>
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditBook} className="p-5 flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={editingBook.book_title}
                  onChange={(e) => setEditingBook({ ...editingBook, book_title: e.target.value })}
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Author *</label>
                <input
                  type="text"
                  required
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category *</label>
                  <select
                    value={editingBook.category}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Literature">Literature</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Condition *</label>
                  <select
                    value={editingBook.book_condition}
                    onChange={(e) => setEditingBook({ ...editingBook, book_condition: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingBook.description || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-blue-700 text-white font-medium shadow-xs transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

