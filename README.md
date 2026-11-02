# Book Donation Management System
> **College DBMS Micro Project**  
> Built with **Vite + React + Tailwind CSS + Supabase (@supabase/supabase-js) + React Router**.

A web application designed for collegiate academic monograph intake, triage, donation verification, loan requests, approval, physical counter distribution, and status lifecycle tracking with Row-Level Security (RLS).

---

## 📚 Key Features & System Capabilities

- **Strict Database Schema**: 9 tables with exact foreign keys and constraints (`member`, `staff`, `book`, `pincode_city`, `donation`, `book_request`, `book_status`, `distribution`, `notification`).
- **Dynamic Status Derivation**: A book's current status (*Available*, *Requested*, *Distributed*) is never a static column; it is dynamically computed from its latest `book_status` row.
- **Strict Data Isolation (RLS)**: Members query only their own donations, requests, and notifications (`member.email = auth.jwt()->>'email'`), while Staff can administer all records.
- **Auto City Lookup**: Entering registered Nashik (`422001`, `422005`, `422009`, `422013`) or Pune (`411001`, `411004`, `411007`, `411038`, `411057`) pincodes auto-populates and validates the city.
- **Dual Mode (Supabase + Local Demo Fallback)**: Runs with Supabase when configured, and falls back to pre-seeded local storage for offline presentations and evaluation.

---

## 👥 Demo Logins

The database is pre-seeded with verified demo accounts for testing both roles:

| Role | Name | Email | Password | Access & Responsibilities |
|---|---|---|---|---|
| **Staff** | Alex Morgan | `alex.morgan@college.edu` | `Password@123` | Senior Librarian: Verify intake, approve/reject requests, record distributions |
| **Staff** | Dr. Rachel Adams | `rachel.adams@college.edu` | `Password@123` | Head of Academic Reserves |
| **Staff** | Vikram Shinde | `vikram.shinde@college.edu` | `Password@123` | Circulation Desk Manager |
| **Member** | Rahul Sharma | `rahul.sharma@college.edu` | `Password@123` | Collegiate Student: Donates books, views own history, receives notifications |
| **Member** | Marcus Vance | `marcus.vance@college.edu` | `Password@123` | Collegiate Student: Requests monographs, tracks allocations |
| **Member** | Priya Patil | `priya.patil@college.edu` | `Password@123` | Collegiate Student |

> [!TIP]
> **One-Click Demo Switcher**: Use the **"Demo Switch"** button in the top navigation bar to switch between any Member and Staff account during live college presentations without retyping passwords.

---

## 🛠️ Setup & Installation Instructions

Follow these step-by-step instructions to run the application with your own Supabase project:

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/) and create a new project.
2. Note down your **Project URL** and **anon public key** from `Project Settings > API`.
3. Note down your **service_role secret key** (needed only for running the auth seeding script).

### Step 2: Run Database Schema & Seed Data
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open and run [`supabase/schema.sql`](supabase/schema.sql) to create the 9 tables, indexes, and Row-Level Security policies.
3. Open and run [`supabase/seed.sql`](supabase/seed.sql) to populate realistic academic monographs, Nashik/Pune pincodes, members, staff, and status history.

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your public keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   *(Never put your service-role secret key in `.env`)*

### Step 4: Seed Auth Users (Optional for Supabase Auth)
1. Create a local, git-ignored `.env.local` file:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here
   ```
2. Run the admin auth seeder:
   ```bash
   npm run seed:auth
   ```

### Step 5: Install & Start Development Server
```bash
# 1. Install dependencies
npm install

# 2. Launch Vite dev server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🗄️ Database Table Structure

```
+-----------------------------------------------------------------------------------------+
|                                        DATABASE SCHEMA                                  |
+-----------------------------------------------------------------------------------------+
| member          (member_id PK, name, email UNIQUE, phone)                               |
| staff           (staff_id PK, staff_name, phone, email UNIQUE, designation)             |
| book            (book_id PK, book_title, author, category, description, book_condition, |
|                  date_received)                                                         |
| pincode_city    (pincode PK, city)                                                      |
| donation        (donation_id PK, member_id FK->member, book_id FK->book,                |
|                  donation_date, pickup_street, pickup_pincode FK->pincode_city,         |
|                  description, status)                                                   |
| book_request    (request_id PK, member_id FK->member, book_id FK->book,                 |
|                  staff_id FK->staff, request_date, purpose, status)                     |
| book_status     (status_id PK, book_id FK->book, status_name, updated_date, remarks)   |
| distribution    (distribution_id PK, request_id FK->book_request, distribution_date,    |
|                  remarks)                                                               |
| notification    (notification_id PK, distribution_id FK->distribution,                  |
|                  status_id FK->book_status, notification_type, sent_date)               |
+-----------------------------------------------------------------------------------------+
```

---

## 🔄 End-to-End Operational Lifecycle

1. **Intake / Donation (`/donate-a-book`)**:
   A member fills out the book intake form. The city is auto-validated from the entered pincode. Submitting inserts into `book`, creates a `donation` with status `Pending`, logs `book_status` as `Pending Donation`, and dispatches an intake notification.
2. **Staff Verification (`/books`)**:
   Staff views the **Pending Donations** queue. Clicking **"Mark as Received"** updates donation status to `Received`, sets `book_status` to `Available`, and notifies the donor.
3. **Monograph Request (`/request-a-book`)**:
   Another member browses available books, enters an academic purpose, and submits. This creates a `book_request` with status `Pending` and changes `book_status` to `Requested`.
4. **Staff Approval (`/manage-requests`)**:
   Staff reviews the pending request. Clicking **"Approve"** records the staff ID, sets request status to `Approved`, and updates `book_status` to `Approved`. (Clicking **"Reject"** reverts the book to `Available`).
5. **Desk Distribution (`/distribution`)**:
   At the physical circulation desk, staff confirms student photo ID and clicks **"Mark as Distributed"**. This creates a `distribution` row, logs `book_status` as `Distributed`, and alerts the member.
6. **Audit Trail (`/book-status-history`)**:
   Staff and members can inspect the full chronological lifecycle and custody audit trail for any monograph.

