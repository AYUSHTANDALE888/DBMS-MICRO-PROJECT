import React from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6 text-xs text-slate-700 leading-relaxed">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-primary-container">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Privacy Policy</h1>
            <span className="text-[11px] text-slate-400">College Book Donation Management System</span>
          </div>
        </div>
        <Link to="/dashboard" className="text-primary-container hover:underline flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="space-y-4">
        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-1">1. Data Storage & DBMS Context</h2>
          <p>
            This application is constructed as an academic DBMS micro-project demonstrating relational modeling,
            referential integrity, foreign key cascading, and Row-Level Security (RLS) policies. User records,
            institutional emails, and pickup addresses are stored in normalized PostgreSQL tables.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-1">2. Information Collection</h2>
          <p>
            The system records member names, collegiate email addresses, telephone contacts, and logistical
            pincodes strictly for managing monograph intake courier pickups and circulation desk physical distribution.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-1">3. Access Boundaries & Member Isolation</h2>
          <p>
            Row-Level Security rules ensure that members have query and mutation access only to their own donation
            and book request records. Institutional staff hold administrative authority to manage catalog inventory
            and issue loan approvals.
          </p>
        </section>
      </div>
    </div>
  )
}

