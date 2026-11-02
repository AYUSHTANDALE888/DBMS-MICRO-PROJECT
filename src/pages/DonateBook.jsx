import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, MapPin, Calendar, Info, CheckCircle2, Lock, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export function DonateBook() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Form Fields
  const [bookTitle, setBookTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [pickupStreet, setPickupStreet] = useState('')
  const [pincode, setPincode] = useState('422005')
  const [city, setCity] = useState('Nashik')
  const [pincodeValid, setPincodeValid] = useState(true)
  const [pickupDate, setPickupDate] = useState(() => {
    // Tomorrow by default
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const [submitting, setSubmitting] = useState(false)
  const [pincodeList, setPincodeList] = useState([])

  useEffect(() => {
    async function loadPincodes() {
      try {
        const list = await api.getPincodes()
        setPincodeList(list)
        // Check initial pincode
        const match = list.find(p => p.pincode === pincode)
        if (match) {
          setCity(match.city)
          setPincodeValid(true)
        }
      } catch (err) {
        console.error('Failed to load pincodes:', err)
      }
    }
    loadPincodes()
  }, [])

  // Auto-fill city when pincode changes
  const handlePincodeChange = async (val) => {
    const cleanPin = val.trim()
    setPincode(cleanPin)

    if (cleanPin.length >= 6) {
      const matchCity = await api.getCityForPincode(cleanPin)
      if (matchCity) {
        setCity(matchCity)
        setPincodeValid(true)
      } else {
        setCity('Unrecognized Pincode')
        setPincodeValid(false)
      }
    } else {
      setCity('')
      setPincodeValid(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error('You must be logged in as a Member to donate a book.')
      return
    }

    if (!bookTitle.trim() || !author.trim() || !category || !condition || !pickupStreet.trim() || !pincode.trim() || !pickupDate) {
      toast.error('Please fill in all required fields.')
      return
    }

    if (!pincodeValid || !city || city === 'Unrecognized Pincode') {
      toast.error('Please enter a valid Nashik or Pune pincode (e.g. 422005, 411004).')
      return
    }

    setSubmitting(true)
    try {
      await api.createDonation({
        memberId: user.member_id || 1,
        bookTitle: bookTitle.trim(),
        author: author.trim(),
        category,
        condition,
        description: description.trim(),
        pickupStreet: pickupStreet.trim(),
        pickupPincode: pincode.trim(),
        pickupDate
      })

      toast.success(`Thank you! "${bookTitle}" donation submitted. Pickup courier scheduled.`)
      navigate('/my-donations')
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit book donation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Catalog Management</span>
          <span>/</span>
          <span className="text-primary-container">Inbound Intake</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Donate a Book</h1>
        <p className="text-xs text-slate-500">
          Submit an academic book or course textbook donation for collegiate catalog intake and student distribution.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary-container shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Standard Intake Verification Notice</span>
          All monographs and academic course texts undergo physical intake verification by staff upon arrival.
          Courier collection is scheduled at your specified street address and pincode.
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900">Book Donation Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Please provide publication metadata and physical pickup address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 text-xs">
          {/* Section 1: Publication Data */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                1. Publication Metadata
              </span>
              <span className="text-[11px] text-slate-400">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. Introduction to Algorithms (4th Edition)"
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>

              {/* Author */}
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Author(s) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Subject Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                >
                  <option value="">Select Category</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Literature">Literature</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Physical Condition <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container"
                >
                  <option value="">Select Condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Description / Edition Remarks
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes regarding edition year, highlighting, or companion discs..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Logistics & Collection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                2. Collection & Logistics
              </span>
              <span className="text-[11px] text-slate-400">Campus Courier Pickup</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pickup Street */}
              <div className="md:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">
                  Pickup Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupStreet}
                  onChange={(e) => setPickupStreet(e.target.value)}
                  placeholder="e.g. 402 College Road, Near KBT Circle"
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="e.g. 422005"
                  className={`w-full h-8 px-3 border rounded-lg bg-white font-mono focus:outline-none focus:ring-1 ${
                    pincodeValid 
                      ? 'border-slate-200 focus:border-primary-container focus:ring-primary-container' 
                      : 'border-rose-300 focus:border-rose-400 focus:ring-rose-400 text-rose-700'
                  }`}
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Nashik: 422001, 422005, 422009 | Pune: 411004, 411038
                </span>
              </div>

              {/* City (Auto-populated & Verified) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  City (Auto-filled)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={city}
                    className="w-full h-8 pl-3 pr-8 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium select-none cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <span className={`text-[10px] block mt-1 font-medium ${pincodeValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {pincodeValid ? `✓ Validated: ${city} District` : 'Please enter valid registered pincode'}
                </span>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Pickup Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full h-8 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Standard collection window: 09:00 AM - 05:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">
              Submitting registers a donation with initial status "Pending".
            </span>

            <button
              type="submit"
              disabled={submitting || !pincodeValid}
              className="h-9 px-5 bg-primary-container hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-1 disabled:opacity-50"
            >
              <span>{submitting ? 'Submitting Donation...' : 'Submit Book Donation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

