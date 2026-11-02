import React from 'react'
import { FileText, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col gap-6 text-xs text-slate-700 leading-relaxed">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-primary-container">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Terms & Conditions</h1>
            <span className="text-[11px] text-slate-400">Academic Circulation Desk & Monograph Reserves</span>
          </div>
        </div>
        <Link to="/dashboard" className="text-primary-container hover:underline flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="space-y-4">
        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-1">1. Academic Monograph Allocation</h2>
          <p>
            Textbooks and reserve monographs distributed through this portal are allocated for collegiate
            study, coursework completion, and academic research. Members agree to safeguard books against
            physical damage or loss during the loan duration.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-1">2. Verification on Pickup</h2>
          <p>
            Physical collection at the Central Circulation Counter requires presentation of a valid collegiate
            photo ID card matching the member profile associated with the approved request record.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 mb-1">3. Status Auditing</h2>
          <p>
            All status transitions—intake, request, approval, and distribution—are immutably appended to the
            <code>book_status</code> ledger table for full academic compliance auditing.
          </p>
        </section>
      </div>
    </div>
  )
}

