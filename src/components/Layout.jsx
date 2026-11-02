import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="pt-14 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between">
          <div className="w-full max-w-[1500px] mx-auto p-6 flex-1">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="w-full border-t border-slate-200 bg-white py-3.5 px-6">
            <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>© 2024 College Book Donation Management System. All records verified.</span>
              <div className="flex items-center gap-4">
                <Link to="/privacy-policy" className="hover:text-primary-container transition-colors">Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms-and-conditions" className="hover:text-primary-container transition-colors">Terms and Conditions</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

