import { supabase, isSupabaseConfigured } from './supabase'
import {
  initialBooks,
  initialBookStatus,
  initialDonations,
  initialBookRequests,
  initialDistributions,
  initialNotifications,
  initialMembers,
  initialStaff,
  initialPincodeCities
} from './mockData'

const STORAGE_KEY = 'bdms_db_v1'

// Initialize or get local storage store
function getStore() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) {
    try {
      return JSON.parse(existing)
    } catch {
      // fallback
    }
  }

  const fresh = {
    books: [...initialBooks],
    bookStatus: [...initialBookStatus],
    donations: [...initialDonations],
    bookRequests: [...initialBookRequests],
    distributions: [...initialDistributions],
    notifications: [...initialNotifications],
    members: [...initialMembers],
    staff: [...initialStaff],
    pincodeCities: [...initialPincodeCities]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  return fresh
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// Reset store to initial state if needed
export function resetLocalStore() {
  localStorage.removeItem(STORAGE_KEY)
  return getStore()
}

// Helper: derive latest status for books
export function enrichBookWithLatestStatus(book, allStatuses) {
  const bookStatuses = allStatuses
    .filter(s => Number(s.book_id) === Number(book.book_id))
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date) || b.status_id - a.status_id)

  const latest = bookStatuses[0]
  return {
    ...book,
    current_status: latest ? latest.status_name : 'Available',
    status_remarks: latest ? latest.remarks : '',
    last_status_date: latest ? latest.updated_date : book.date_received
  }
}

// ============================================================================
// API METHODS
// ============================================================================

export const api = {
  // 1. PINCODES
  async getPincodes() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('pincode_city').select('*').order('pincode')
        if (!error && data?.length) return data
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err)
      }
    }
    const store = getStore()
    return store.pincodeCities
  },

  async getCityForPincode(pincode) {
    const list = await this.getPincodes()
    const match = list.find(p => p.pincode === String(pincode).trim())
    return match ? match.city : null
  },

  // 2. BOOKS
  async getBooks() {
    if (isSupabaseConfigured) {
      try {
        const [booksRes, statusRes] = await Promise.all([
          supabase.from('book').select('*').order('book_id', { ascending: true }),
          supabase.from('book_status').select('*').order('updated_date', { ascending: false })
        ])

        if (!booksRes.error && booksRes.data && !statusRes.error && statusRes.data) {
          return booksRes.data.map(b => enrichBookWithLatestStatus(b, statusRes.data))
        }
      } catch (err) {
        console.warn('Supabase fetch books failed, falling back to local store:', err)
      }
    }

    const store = getStore()
    return store.books.map(b => enrichBookWithLatestStatus(b, store.bookStatus))
  },

  async getBookById(bookId) {
    const books = await this.getBooks()
    return books.find(b => Number(b.book_id) === Number(bookId)) || null
  },

  async createBook(bookData) {
    if (isSupabaseConfigured) {
      try {
        const { data: newBook, error: bErr } = await supabase
          .from('book')
          .insert({
            book_title: bookData.book_title,
            author: bookData.author,
            category: bookData.category,
            description: bookData.description || null,
            book_condition: bookData.book_condition,
            date_received: bookData.date_received || new Date().toISOString().split('T')[0]
          })
          .select()
          .single()

        if (!bErr && newBook) {
          await supabase.from('book_status').insert({
            book_id: newBook.book_id,
            status_name: 'Available',
            remarks: 'Direct staff entry into catalog'
          })
          return newBook
        }
      } catch (err) {
        console.warn('Supabase create book failed, using local fallback:', err)
      }
    }

    const store = getStore()
    const newId = store.books.length ? Math.max(...store.books.map(b => b.book_id)) + 1 : 1
    const newBook = {
      book_id: newId,
      book_title: bookData.book_title,
      author: bookData.author,
      category: bookData.category,
      description: bookData.description || '',
      book_condition: bookData.book_condition,
      date_received: bookData.date_received || new Date().toISOString().split('T')[0]
    }
    store.books.push(newBook)

    const statusId = store.bookStatus.length ? Math.max(...store.bookStatus.map(s => s.status_id)) + 1 : 1
    store.bookStatus.push({
      status_id: statusId,
      book_id: newId,
      status_name: 'Available',
      updated_date: new Date().toISOString(),
      remarks: 'Direct staff entry into catalog'
    })

    saveStore(store)
    return newBook
  },

  async updateBook(bookId, updates) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('book')
          .update(updates)
          .eq('book_id', bookId)
          .select()
          .single()
        if (!error && data) return data
      } catch (err) {
        console.warn('Supabase update book failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    const idx = store.books.findIndex(b => Number(b.book_id) === Number(bookId))
    if (idx !== -1) {
      store.books[idx] = { ...store.books[idx], ...updates }
      saveStore(store)
      return store.books[idx]
    }
    return null
  },

  // 3. BOOK STATUS HISTORY
  async getBookStatusHistory(bookId) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('book_status')
          .select('*')
          .eq('book_id', bookId)
          .order('updated_date', { ascending: false })
        if (!error && data) return data
      } catch (err) {
        console.warn('Supabase status history failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    return store.bookStatus
      .filter(s => Number(s.book_id) === Number(bookId))
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date) || b.status_id - a.status_id)
  },

  // 4. DONATIONS
  async getDonations(currentUser) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('donation').select(`
          donation_id,
          member_id,
          book_id,
          donation_date,
          pickup_street,
          pickup_pincode,
          description,
          status,
          book:book_id (book_title, author, category, book_condition),
          member:member_id (name, email, phone)
        `).order('donation_date', { ascending: false })

        if (currentUser && currentUser.role === 'Member' && currentUser.member_id) {
          query = query.eq('member_id', currentUser.member_id)
        }

        const { data, error } = await query
        if (!error && data) {
          return data.map(d => ({
            ...d,
            book_title: d.book?.book_title || 'Unknown Title',
            author: d.book?.author || '',
            category: d.book?.category || '',
            donor_name: d.member?.name || 'Anonymous Member',
            donor_email: d.member?.email || ''
          }))
        }
      } catch (err) {
        console.warn('Supabase get donations failed, using fallback:', err)
      }
    }

    const store = getStore()
    let list = store.donations
    if (currentUser && currentUser.role === 'Member' && currentUser.member_id) {
      list = list.filter(d => Number(d.member_id) === Number(currentUser.member_id))
    }

    return list.map(d => {
      const b = store.books.find(book => Number(book.book_id) === Number(d.book_id))
      const m = store.members.find(member => Number(member.member_id) === Number(d.member_id))
      return {
        ...d,
        book_title: b?.book_title || 'Unknown Title',
        author: b?.author || '',
        category: b?.category || '',
        book_condition: b?.book_condition || '',
        donor_name: m?.name || 'Anonymous Member',
        donor_email: m?.email || ''
      }
    }).sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date))
  },

  async createDonation({ memberId, bookTitle, author, category, condition, description, pickupStreet, pickupPincode, pickupDate }) {
    const formattedDate = pickupDate || new Date().toISOString().split('T')[0]

    if (isSupabaseConfigured) {
      try {
        // Step A: Create Book
        const { data: newBook, error: bErr } = await supabase
          .from('book')
          .insert({
            book_title: bookTitle,
            author,
            category,
            description: description || null,
            book_condition: condition,
            date_received: formattedDate
          })
          .select()
          .single()

        if (!bErr && newBook) {
          // Step B: Create Donation
          const { data: newDonation, error: dErr } = await supabase
            .from('donation')
            .insert({
              member_id: memberId,
              book_id: newBook.book_id,
              donation_date: formattedDate,
              pickup_street: pickupStreet,
              pickup_pincode: pickupPincode,
              description: description || null,
              status: 'Pending'
            })
            .select()
            .single()

          // Step C: Create Book Status
          const { data: newStatus } = await supabase
            .from('book_status')
            .insert({
              book_id: newBook.book_id,
              status_name: 'Pending Donation',
              remarks: `Donation submitted by Member #${memberId}. Pickup scheduled.`
            })
            .select()
            .single()

          // Step D: Create Notification
          if (newStatus) {
            await supabase.from('notification').insert({
              distribution_id: null,
              status_id: newStatus.status_id,
              notification_type: 'Donation Submitted'
            })
          }

          return newDonation
        }
      } catch (err) {
        console.warn('Supabase create donation failed, falling back:', err)
      }
    }

    // Local Store Implementation
    const store = getStore()
    const newBookId = store.books.length ? Math.max(...store.books.map(b => b.book_id)) + 1 : 1
    const newBook = {
      book_id: newBookId,
      book_title: bookTitle,
      author,
      category,
      description: description || '',
      book_condition: condition,
      date_received: formattedDate
    }
    store.books.push(newBook)

    const newDonationId = store.donations.length ? Math.max(...store.donations.map(d => d.donation_id)) + 1 : 1
    const newDonation = {
      donation_id: newDonationId,
      member_id: memberId,
      book_id: newBookId,
      donation_date: formattedDate,
      pickup_street: pickupStreet,
      pickup_pincode: pickupPincode,
      description: description || '',
      status: 'Pending'
    }
    store.donations.push(newDonation)

    const newStatusId = store.bookStatus.length ? Math.max(...store.bookStatus.map(s => s.status_id)) + 1 : 1
    const newStatus = {
      status_id: newStatusId,
      book_id: newBookId,
      status_name: 'Pending Donation',
      updated_date: new Date().toISOString(),
      remarks: `Donation submitted by Member #${memberId}. Pickup scheduled at ${pickupStreet}, Pincode: ${pickupPincode}.`
    }
    store.bookStatus.push(newStatus)

    const newNotifId = store.notifications.length ? Math.max(...store.notifications.map(n => n.notification_id)) + 1 : 1
    store.notifications.push({
      notification_id: newNotifId,
      distribution_id: null,
      status_id: newStatusId,
      notification_type: 'Donation Submitted',
      sent_date: new Date().toISOString()
    })

    saveStore(store)
    return newDonation
  },

  async markDonationReceived(donationId, staffUser) {
    if (isSupabaseConfigured) {
      try {
        // Step A: Update donation status
        const { data: dData, error: dErr } = await supabase
          .from('donation')
          .update({ status: 'Received' })
          .eq('donation_id', donationId)
          .select()
          .single()

        if (!dErr && dData) {
          // Step B: Insert book_status "Available"
          const { data: sData } = await supabase
            .from('book_status')
            .insert({
              book_id: dData.book_id,
              status_name: 'Available',
              remarks: `Donation verified and marked received by ${staffUser?.staff_name || 'Staff'}`
            })
            .select()
            .single()

          // Step C: Insert Notification for the donor
          if (sData) {
            await supabase.from('notification').insert({
              distribution_id: null,
              status_id: sData.status_id,
              notification_type: 'Donation Received'
            })
          }
          return dData
        }
      } catch (err) {
        console.warn('Supabase mark donation received failed, fallback to local:', err)
      }
    }

    const store = getStore()
    const donation = store.donations.find(d => Number(d.donation_id) === Number(donationId))
    if (!donation) throw new Error('Donation not found')

    donation.status = 'Received'

    const newStatusId = store.bookStatus.length ? Math.max(...store.bookStatus.map(s => s.status_id)) + 1 : 1
    const newStatus = {
      status_id: newStatusId,
      book_id: donation.book_id,
      status_name: 'Available',
      updated_date: new Date().toISOString(),
      remarks: `Donation verified and marked received by ${staffUser?.staff_name || 'Staff'}. Monograph placed in circulation.`
    }
    store.bookStatus.push(newStatus)

    const newNotifId = store.notifications.length ? Math.max(...store.notifications.map(n => n.notification_id)) + 1 : 1
    store.notifications.push({
      notification_id: newNotifId,
      distribution_id: null,
      status_id: newStatusId,
      notification_type: 'Donation Received',
      sent_date: new Date().toISOString()
    })

    saveStore(store)
    return donation
  },

  // 5. BOOK REQUESTS
  async getBookRequests(currentUser) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('book_request').select(`
          request_id,
          member_id,
          book_id,
          staff_id,
          request_date,
          purpose,
          status,
          book:book_id (book_title, author, category, book_condition),
          member:member_id (name, email, phone),
          staff:staff_id (staff_name, designation)
        `).order('request_date', { ascending: false })

        if (currentUser && currentUser.role === 'Member' && currentUser.member_id) {
          query = query.eq('member_id', currentUser.member_id)
        }

        const { data, error } = await query
        if (!error && data) {
          return data.map(r => ({
            ...r,
            book_title: r.book?.book_title || 'Unknown Title',
            author: r.book?.author || '',
            category: r.book?.category || '',
            member_name: r.member?.name || 'Member',
            member_email: r.member?.email || '',
            staff_name: r.staff?.staff_name || null
          }))
        }
      } catch (err) {
        console.warn('Supabase get requests failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    let list = store.bookRequests
    if (currentUser && currentUser.role === 'Member' && currentUser.member_id) {
      list = list.filter(r => Number(r.member_id) === Number(currentUser.member_id))
    }

    return list.map(r => {
      const b = store.books.find(book => Number(book.book_id) === Number(r.book_id))
      const m = store.members.find(member => Number(member.member_id) === Number(r.member_id))
      const s = store.staff.find(staff => Number(staff.staff_id) === Number(r.staff_id))
      return {
        ...r,
        book_title: b?.book_title || 'Unknown Title',
        author: b?.author || '',
        category: b?.category || '',
        member_name: m?.name || 'Member',
        member_email: m?.email || '',
        staff_name: s?.staff_name || null
      }
    }).sort((a, b) => new Date(b.request_date) - new Date(a.request_date))
  },

  async createBookRequest({ memberId, bookId, purpose }) {
    const today = new Date().toISOString().split('T')[0]

    if (isSupabaseConfigured) {
      try {
        // Step A: Insert request
        const { data: newReq, error: rErr } = await supabase
          .from('book_request')
          .insert({
            member_id: memberId,
            book_id: bookId,
            staff_id: null,
            request_date: today,
            purpose,
            status: 'Pending'
          })
          .select()
          .single()

        if (!rErr && newReq) {
          // Step B: Insert book_status "Requested"
          const { data: newStatus } = await supabase
            .from('book_status')
            .insert({
              book_id: bookId,
              status_name: 'Requested',
              remarks: `Requested for: ${purpose}`
            })
            .select()
            .single()

          // Step C: Notification
          if (newStatus) {
            await supabase.from('notification').insert({
              distribution_id: null,
              status_id: newStatus.status_id,
              notification_type: 'Request Submitted'
            })
          }

          return newReq
        }
      } catch (err) {
        console.warn('Supabase create request failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    const newReqId = store.bookRequests.length ? Math.max(...store.bookRequests.map(r => r.request_id)) + 1 : 1
    const newReq = {
      request_id: newReqId,
      member_id: memberId,
      book_id: bookId,
      staff_id: null,
      request_date: today,
      purpose,
      status: 'Pending'
    }
    store.bookRequests.push(newReq)

    const newStatusId = store.bookStatus.length ? Math.max(...store.bookStatus.map(s => s.status_id)) + 1 : 1
    const newStatus = {
      status_id: newStatusId,
      book_id: bookId,
      status_name: 'Requested',
      updated_date: new Date().toISOString(),
      remarks: `Member #${memberId} requested copy. Purpose: ${purpose}`
    }
    store.bookStatus.push(newStatus)

    const newNotifId = store.notifications.length ? Math.max(...store.notifications.map(n => n.notification_id)) + 1 : 1
    store.notifications.push({
      notification_id: newNotifId,
      distribution_id: null,
      status_id: newStatusId,
      notification_type: 'Request Submitted',
      sent_date: new Date().toISOString()
    })

    saveStore(store)
    return newReq
  },

  async approveBookRequest(requestId, staffUser) {
    const staffId = staffUser?.staff_id || 1

    if (isSupabaseConfigured) {
      try {
        const { data: req, error } = await supabase
          .from('book_request')
          .update({ status: 'Approved', staff_id: staffId })
          .eq('request_id', requestId)
          .select()
          .single()

        if (!error && req) {
          const { data: statusRow } = await supabase
            .from('book_status')
            .insert({
              book_id: req.book_id,
              status_name: 'Approved',
              remarks: `Request #${requestId} approved by ${staffUser?.staff_name || 'Staff'}. Ready for distribution.`
            })
            .select()
            .single()

          if (statusRow) {
            await supabase.from('notification').insert({
              distribution_id: null,
              status_id: statusRow.status_id,
              notification_type: 'Request Approved'
            })
          }

          return req
        }
      } catch (err) {
        console.warn('Supabase approve request failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    const req = store.bookRequests.find(r => Number(r.request_id) === Number(requestId))
    if (!req) throw new Error('Request not found')

    req.status = 'Approved'
    req.staff_id = staffId

    const newStatusId = store.bookStatus.length ? Math.max(...store.bookStatus.map(s => s.status_id)) + 1 : 1
    const newStatus = {
      status_id: newStatusId,
      book_id: req.book_id,
      status_name: 'Approved',
      updated_date: new Date().toISOString(),
      remarks: `Request #${requestId} approved by ${staffUser?.staff_name || 'Staff'}. Ready for distribution at Circulation Desk.`
    }
    store.bookStatus.push(newStatus)

    const newNotifId = store.notifications.length ? Math.max(...store.notifications.map(n => n.notification_id)) + 1 : 1
    store.notifications.push({
      notification_id: newNotifId,
      distribution_id: null,
      status_id: newStatusId,
      notification_type: 'Request Approved',
      sent_date: new Date().toISOString()
    })

    saveStore(store)
    return req
  },

  async rejectBookRequest(requestId, staffUser, remarks = 'Request rejected by staff.') {
    const staffId = staffUser?.staff_id || 1

    if (isSupabaseConfigured) {
      try {
        const { data: req, error } = await supabase
          .from('book_request')
          .update({ status: 'Rejected', staff_id: staffId })
          .eq('request_id', requestId)
          .select()
          .single()

        if (!error && req) {
          // Returning book to Available
          const { data: statusRow } = await supabase
            .from('book_status')
            .insert({
              book_id: req.book_id,
              status_name: 'Available',
              remarks: `Request rejected. Monograph returned to Available inventory: ${remarks}`
            })
            .select()
            .single()

          if (statusRow) {
            await supabase.from('notification').insert({
              distribution_id: null,
              status_id: statusRow.status_id,
              notification_type: 'Request Rejected'
            })
          }

          return req
        }
      } catch (err) {
        console.warn('Supabase reject request failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    const req = store.bookRequests.find(r => Number(r.request_id) === Number(requestId))
    if (!req) throw new Error('Request not found')

    req.status = 'Rejected'
    req.staff_id = staffId

    // Returning book to Available
    const newStatusId = store.bookStatus.length ? Math.max(...store.bookStatus.map(s => s.status_id)) + 1 : 1
    const newStatus = {
      status_id: newStatusId,
      book_id: req.book_id,
      status_name: 'Available',
      updated_date: new Date().toISOString(),
      remarks: `Request rejected by ${staffUser?.staff_name || 'Staff'}. Book restored to Available shelf.`
    }
    store.bookStatus.push(newStatus)

    const newNotifId = store.notifications.length ? Math.max(...store.notifications.map(n => n.notification_id)) + 1 : 1
    store.notifications.push({
      notification_id: newNotifId,
      distribution_id: null,
      status_id: newStatusId,
      notification_type: 'Request Rejected',
      sent_date: new Date().toISOString()
    })

    saveStore(store)
    return req
  },

  // 6. DISTRIBUTION
  async getDistributions(currentUser) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('distribution')
          .select(`
            distribution_id,
            request_id,
            distribution_date,
            remarks,
            book_request:request_id (
              member_id,
              book_id,
              purpose,
              status,
              book:book_id (book_title, author),
              member:member_id (name, email)
            )
          `)
          .order('distribution_date', { ascending: false })

        if (!error && data) {
          let list = data
          if (currentUser && currentUser.role === 'Member' && currentUser.member_id) {
            list = list.filter(d => Number(d.book_request?.member_id) === Number(currentUser.member_id))
          }
          return list.map(d => ({
            ...d,
            book_title: d.book_request?.book?.book_title || 'Unknown Title',
            member_name: d.book_request?.member?.name || 'Member',
            member_email: d.book_request?.member?.email || ''
          }))
        }
      } catch (err) {
        console.warn('Supabase get distributions failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    return store.distributions.map(dist => {
      const req = store.bookRequests.find(r => Number(r.request_id) === Number(dist.request_id))
      const book = req ? store.books.find(b => Number(b.book_id) === Number(req.book_id)) : null
      const member = req ? store.members.find(m => Number(m.member_id) === Number(req.member_id)) : null

      return {
        ...dist,
        member_id: req?.member_id,
        book_id: req?.book_id,
        book_title: book?.book_title || 'Unknown Title',
        member_name: member?.name || 'Member',
        member_email: member?.email || ''
      }
    }).filter(d => {
      if (currentUser && currentUser.role === 'Member' && currentUser.member_id) {
        return Number(d.member_id) === Number(currentUser.member_id)
      }
      return true
    }).sort((a, b) => new Date(b.distribution_date) - new Date(a.distribution_date))
  },

  async distributeBook(requestId, remarks = 'Physical book handed over to member upon student ID verification.') {
    const today = new Date().toISOString().split('T')[0]

    if (isSupabaseConfigured) {
      try {
        // Step A: Insert distribution
        const { data: newDist, error: distErr } = await supabase
          .from('distribution')
          .insert({
            request_id: requestId,
            distribution_date: today,
            remarks
          })
          .select()
          .single()

        if (!distErr && newDist) {
          // Step B: Fetch book_id from request
          const { data: req } = await supabase
            .from('book_request')
            .select('book_id')
            .eq('request_id', requestId)
            .single()

          if (req) {
            // Step C: Insert book_status "Distributed"
            const { data: newStatus } = await supabase
              .from('book_status')
              .insert({
                book_id: req.book_id,
                status_name: 'Distributed',
                remarks
              })
              .select()
              .single()

            // Step D: Insert notification
            if (newStatus) {
              await supabase.from('notification').insert({
                distribution_id: newDist.distribution_id,
                status_id: newStatus.status_id,
                notification_type: 'Distribution Completed'
              })
            }
          }

          return newDist
        }
      } catch (err) {
        console.warn('Supabase distribute book failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    const req = store.bookRequests.find(r => Number(r.request_id) === Number(requestId))
    if (!req) throw new Error('Request record not found')

    const newDistId = store.distributions.length ? Math.max(...store.distributions.map(d => d.distribution_id)) + 1 : 1
    const newDist = {
      distribution_id: newDistId,
      request_id: requestId,
      distribution_date: today,
      remarks
    }
    store.distributions.push(newDist)

    const newStatusId = store.bookStatus.length ? Math.max(...store.bookStatus.map(s => s.status_id)) + 1 : 1
    const newStatus = {
      status_id: newStatusId,
      book_id: req.book_id,
      status_name: 'Distributed',
      updated_date: new Date().toISOString(),
      remarks
    }
    store.bookStatus.push(newStatus)

    const newNotifId = store.notifications.length ? Math.max(...store.notifications.map(n => n.notification_id)) + 1 : 1
    store.notifications.push({
      notification_id: newNotifId,
      distribution_id: newDistId,
      status_id: newStatusId,
      notification_type: 'Distribution Completed',
      sent_date: new Date().toISOString()
    })

    saveStore(store)
    return newDist
  },

  // 7. NOTIFICATIONS
  async getNotifications(currentUser) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('notification')
          .select(`
            notification_id,
            distribution_id,
            status_id,
            notification_type,
            sent_date,
            book_status:status_id (
              book_id,
              status_name,
              remarks,
              book:book_id (book_title, author)
            ),
            distribution:distribution_id (
              request_id,
              distribution_date,
              remarks
            )
          `)
          .order('sent_date', { ascending: false })

        if (!error && data) {
          return data.map(n => ({
            ...n,
            book_title: n.book_status?.book?.book_title || 'Academic Record',
            remarks: n.book_status?.remarks || n.distribution?.remarks || '',
            status_name: n.book_status?.status_name || ''
          }))
        }
      } catch (err) {
        console.warn('Supabase get notifications failed, fallback to local store:', err)
      }
    }

    const store = getStore()
    return store.notifications.map(n => {
      const status = store.bookStatus.find(s => Number(s.status_id) === Number(n.status_id))
      const book = status ? store.books.find(b => Number(b.book_id) === Number(status.book_id)) : null
      const dist = n.distribution_id ? store.distributions.find(d => Number(d.distribution_id) === Number(n.distribution_id)) : null

      // Check if related to member
      let isForMember = true
      if (currentUser && currentUser.role === 'Member' && currentUser.member_id) {
        const memberId = Number(currentUser.member_id)
        // Check if member donated this book
        const isDonor = store.donations.some(d => Number(d.member_id) === memberId && Number(d.book_id) === Number(status?.book_id))
        // Check if member requested this book
        const isRequester = store.bookRequests.some(r => Number(r.member_id) === memberId && Number(r.book_id) === Number(status?.book_id))
        isForMember = isDonor || isRequester
      }

      return {
        ...n,
        isForMember,
        book_title: book?.book_title || 'Academic Monograph Record',
        remarks: status?.remarks || dist?.remarks || '',
        status_name: status?.status_name || ''
      }
    })
    .filter(n => (currentUser?.role === 'Staff' ? true : n.isForMember))
    .sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))
  },

  // 8. DASHBOARD STATS & RECENT ACTIVITY
  async getDashboardStats(currentUser) {
    const books = await this.getBooks()
    const donations = await this.getDonations(currentUser)
    const requests = await this.getBookRequests(currentUser)
    const distributions = await this.getDistributions(currentUser)

    const totalBooks = books.length
    const pendingDonations = donations.filter(d => d.status === 'Pending').length
    const pendingRequests = requests.filter(r => r.status === 'Pending').length
    const booksDistributed = distributions.length

    // Compile recent activity from statuses
    const store = getStore()
    const recentActivity = store.bookStatus
      .map(s => {
        const book = store.books.find(b => Number(b.book_id) === Number(s.book_id))
        return {
          id: s.status_id,
          date: s.updated_date,
          book_title: book?.book_title || 'Monograph Record',
          action: s.remarks || s.status_name,
          status: s.status_name,
          recorded_by: s.status_name === 'Available' ? 'Staff Intake Desk' :
                       s.status_name === 'Distributed' ? 'Circulation Desk' :
                       s.status_name === 'Approved' ? 'Senior Librarian' : 'Collegiate Portal'
        }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)

    return {
      totalBooks,
      pendingDonations,
      pendingRequests,
      booksDistributed,
      recentActivity
    }
  }
}

