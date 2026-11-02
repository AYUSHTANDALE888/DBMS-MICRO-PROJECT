// Exact 1:1 replica of supabase/seed.sql for zero-config offline demo mode
export const initialPincodeCities = [
  { pincode: '422001', city: 'Nashik' },
  { pincode: '422005', city: 'Nashik' },
  { pincode: '422009', city: 'Nashik' },
  { pincode: '422013', city: 'Nashik' },
  { pincode: '411001', city: 'Pune' },
  { pincode: '411004', city: 'Pune' },
  { pincode: '411007', city: 'Pune' },
  { pincode: '411038', city: 'Pune' },
  { pincode: '411057', city: 'Pune' }
]

export const initialStaff = [
  { staff_id: 1, staff_name: 'Alex Morgan', phone: '+91 99220 88990', email: 'alex.morgan@college.edu', designation: 'Senior Librarian' },
  { staff_id: 2, staff_name: 'Dr. Rachel Adams', phone: '+91 99231 66778', email: 'rachel.adams@college.edu', designation: 'Head of Academic Reserves' },
  { staff_id: 3, staff_name: 'Vikram Shinde', phone: '+91 99700 12345', email: 'vikram.shinde@college.edu', designation: 'Circulation Desk Manager' },
  { staff_id: 4, staff_name: 'Neha Joshi', phone: '+91 99881 23456', email: 'neha.joshi@college.edu', designation: 'Cataloging Specialist' }
]

export const initialMembers = [
  { member_id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@college.edu', phone: '+91 98230 11223' },
  { member_id: 2, name: 'Priya Patil', email: 'priya.patil@college.edu', phone: '+91 98221 44556' },
  { member_id: 3, name: 'Amit Deshmukh', email: 'amit.deshmukh@college.edu', phone: '+91 98500 77889' },
  { member_id: 4, name: 'Sneha Kulkarni', email: 'sneha.kulkarni@college.edu', phone: '+91 98902 33445' },
  { member_id: 5, name: 'Rohit Joshi', email: 'rohit.joshi@college.edu', phone: '+91 98601 55667' },
  { member_id: 6, name: 'Marcus Vance', email: 'marcus.vance@college.edu', phone: '+91 98765 43210' }
]

export const initialBooks = [
  {
    book_id: 1,
    book_title: 'Introduction to Algorithms (4th Edition)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'Computer Science',
    description: 'Comprehensive handbook on modern data structures and algorithm analysis.',
    book_condition: 'Good',
    date_received: '2024-09-10'
  },
  {
    book_id: 2,
    book_title: 'Database System Concepts (7th Edition)',
    author: 'Abraham Silberschatz, Henry F. Korth',
    category: 'Computer Science',
    description: 'Foundational textbook covering relational models, SQL, and query optimization.',
    book_condition: 'Like New',
    date_received: '2024-09-15'
  },
  {
    book_id: 3,
    book_title: 'Operating System Concepts (10th Edition)',
    author: 'Abraham Silberschatz, Peter B. Galvin',
    category: 'Computer Science',
    description: 'Covers core OS principles: virtualization, processes, scheduling, and concurrency.',
    book_condition: 'Good',
    date_received: '2024-09-20'
  },
  {
    book_id: 4,
    book_title: 'Computer Networks: A Top-Down Approach',
    author: 'James F. Kurose, Keith W. Ross',
    category: 'Computer Science',
    description: 'Application-layer focused networking book with Wireshark lab references.',
    book_condition: 'Fair',
    date_received: '2024-09-25'
  },
  {
    book_id: 5,
    book_title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    category: 'Mathematics',
    description: 'Covers logic, sets, graph theory, combinatorics, and discrete probability.',
    book_condition: 'Like New',
    date_received: '2024-10-01'
  },
  {
    book_id: 6,
    book_title: 'University Physics with Modern Physics',
    author: 'Hugh D. Young, Roger A. Freedman',
    category: 'Physics',
    description: 'Standard collegiate physics reference with mechanics, electromagnetism, and optics.',
    book_condition: 'Like New',
    date_received: '2024-10-05'
  },
  {
    book_id: 7,
    book_title: 'Microelectronic Circuits (8th Edition)',
    author: 'Adel S. Sedra, Kenneth C. Smith',
    category: 'Electrical Engineering',
    description: 'Definitive guide on analog and digital electronics, MOSFETs, and amplifier design.',
    book_condition: 'Good',
    date_received: '2024-10-08'
  },
  {
    book_id: 8,
    book_title: 'Clean Code: A Handbook of Agile Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    description: 'Best practices for professional software engineering and readable code.',
    book_condition: 'Good',
    date_received: '2024-10-12'
  }
]

export const initialBookStatus = [
  // Book 1: Available -> Requested -> Approved -> Distributed
  { status_id: 1, book_id: 1, status_name: 'Available', updated_date: '2024-09-10T10:00:00+05:30', remarks: 'Donation received and shelf assigned: CS-101' },
  { status_id: 2, book_id: 1, status_name: 'Requested', updated_date: '2024-10-05T14:30:00+05:30', remarks: 'Requested by Marcus Vance for project work' },
  { status_id: 3, book_id: 1, status_name: 'Approved', updated_date: '2024-10-08T11:15:00+05:30', remarks: 'Request approved by Alex Morgan' },
  { status_id: 4, book_id: 1, status_name: 'Distributed', updated_date: '2024-10-12T16:45:00+05:30', remarks: 'Physical monograph handed to Marcus Vance' },

  // Book 2: Available -> Requested
  { status_id: 5, book_id: 2, status_name: 'Available', updated_date: '2024-09-15T09:30:00+05:30', remarks: 'Donation verified and cataloged: Shelf CS-109' },
  { status_id: 6, book_id: 2, status_name: 'Requested', updated_date: '2024-10-14T11:00:00+05:30', remarks: 'Requested by Rahul Sharma for DBMS laboratory' },

  // Book 3: Available -> Requested -> Approved
  { status_id: 7, book_id: 3, status_name: 'Available', updated_date: '2024-09-20T12:00:00+05:30', remarks: 'Intake verified and placed on Shelf CS-201' },
  { status_id: 8, book_id: 3, status_name: 'Requested', updated_date: '2024-10-15T09:45:00+05:30', remarks: 'Requested by Priya Patil for OS exam study' },
  { status_id: 9, book_id: 3, status_name: 'Approved', updated_date: '2024-10-16T14:20:00+05:30', remarks: 'Approved by Alex Morgan. Ready for member handoff at Desk' },

  // Book 4: Available
  { status_id: 10, book_id: 4, status_name: 'Available', updated_date: '2024-09-25T15:00:00+05:30', remarks: 'Intake verified and placed on Shelf CS-305' },

  // Book 5: Available
  { status_id: 11, book_id: 5, status_name: 'Available', updated_date: '2024-10-01T10:30:00+05:30', remarks: 'Intake verified and placed on Shelf MA-112' },

  // Book 6: Available
  { status_id: 12, book_id: 6, status_name: 'Available', updated_date: '2024-10-05T11:00:00+05:30', remarks: 'Intake verified and placed on Shelf PH-101' },

  // Book 7: Available
  { status_id: 13, book_id: 7, status_name: 'Available', updated_date: '2024-10-08T16:30:00+05:30', remarks: 'Intake verified and placed on Shelf EE-210' },

  // Book 8: Pending Donation
  { status_id: 14, book_id: 8, status_name: 'Pending Donation', updated_date: '2024-10-12T18:00:00+05:30', remarks: 'Donation submitted by Marcus Vance. Pickup courier scheduled.' }
]

export const initialDonations = [
  {
    donation_id: 1,
    member_id: 1,
    book_id: 1,
    donation_date: '2024-09-08',
    pickup_street: 'College Road, Near KBT Circle',
    pickup_pincode: '422005',
    description: 'Donation of algorithms textbook after course completion',
    status: 'Received'
  },
  {
    donation_id: 2,
    member_id: 2,
    book_id: 2,
    donation_date: '2024-09-13',
    pickup_street: 'FC Road, Near Deccan Gymkhana',
    pickup_pincode: '411004',
    description: 'DBMS textbook in pristine condition',
    status: 'Received'
  },
  {
    donation_id: 3,
    member_id: 3,
    book_id: 3,
    donation_date: '2024-09-18',
    pickup_street: 'Indira Nagar, Near Jogging Track',
    pickup_pincode: '422009',
    description: 'Operating systems book with study sticky notes',
    status: 'Received'
  },
  {
    donation_id: 4,
    member_id: 4,
    book_id: 5,
    donation_date: '2024-09-28',
    pickup_street: 'Paud Road, Kothrud',
    pickup_pincode: '411038',
    description: 'Discrete math book donated to junior students',
    status: 'Received'
  },
  {
    donation_id: 5,
    member_id: 6,
    book_id: 8,
    donation_date: '2024-10-12',
    pickup_street: 'Phase 1 Tech Park, Hinjawadi',
    pickup_pincode: '411057',
    description: 'Agile software engineering handbook for college library',
    status: 'Pending'
  }
]

export const initialBookRequests = [
  {
    request_id: 1,
    member_id: 6,
    book_id: 1,
    staff_id: 1,
    request_date: '2024-10-05',
    purpose: 'Final year capstone research on algorithm complexity and optimization',
    status: 'Approved'
  },
  {
    request_id: 2,
    member_id: 1,
    book_id: 2,
    staff_id: null,
    request_date: '2024-10-14',
    purpose: 'Relational database theory and transaction management practice',
    status: 'Pending'
  },
  {
    request_id: 3,
    member_id: 2,
    book_id: 3,
    staff_id: 1,
    request_date: '2024-10-15',
    purpose: 'Operating system concurrency and process scheduling review',
    status: 'Approved'
  }
]

export const initialDistributions = [
  {
    distribution_id: 1,
    request_id: 1,
    distribution_date: '2024-10-12',
    remarks: 'Handed over at Central Circulation Counter with ID verification. Due date 30 days.'
  }
]

export const initialNotifications = [
  {
    notification_id: 1,
    distribution_id: 1,
    status_id: 4,
    notification_type: 'Distribution Completed',
    sent_date: '2024-10-12T16:46:00+05:30'
  },
  {
    notification_id: 2,
    distribution_id: null,
    status_id: 9,
    notification_type: 'Request Approved',
    sent_date: '2024-10-16T14:21:00+05:30'
  },
  {
    notification_id: 3,
    distribution_id: null,
    status_id: 8,
    notification_type: 'Request Submitted',
    sent_date: '2024-10-15T09:46:00+05:30'
  },
  {
    notification_id: 4,
    distribution_id: null,
    status_id: 6,
    notification_type: 'Request Submitted',
    sent_date: '2024-10-14T11:01:00+05:30'
  },
  {
    notification_id: 5,
    distribution_id: null,
    status_id: 13,
    notification_type: 'Donation Received',
    sent_date: '2024-10-08T16:35:00+05:30'
  }
]

