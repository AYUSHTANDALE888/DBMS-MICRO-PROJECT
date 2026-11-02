import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ShieldCheck, User, Shield, Mail, Phone, Lock, ArrowRight, Info, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export function LoginRegister() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [role, setRole] = useState('member') // 'member' | 'staff'

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [designation, setDesignation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, register, quickLogin } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (mode === 'register') {
      if (!name.trim()) {
        toast.error('Please enter your full name.')
        return
      }
      if (!phone.trim()) {
        toast.error('Please enter your phone number.')
        return
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        toast.success(`Welcome back! Logged in as ${role === 'staff' ? 'Staff' : 'Member'}.`)
        navigate('/dashboard')
      } else {
        const selectedRole = role === 'staff' ? 'Staff' : 'Member'
        await register({
          email,
          password,
          name,
          phone,
          role: selectedRole,
          designation: role === 'staff' ? (designation || 'Librarian') : null
        })
        toast.success(`Registration successful! Logged in as ${selectedRole}.`)
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickDemo = (demoEmail, demoRole) => {
    quickLogin(demoEmail)
    toast.success(`Demo mode: Signed in as ${demoRole} (${demoEmail})`)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col justify-between antialiased">
      {/* Top Brand Bar */}
      <header className="w-full border-b border-slate-200 bg-white py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-primary-container">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 tracking-tight">Book Donation Management System</span>
              <span className="text-xs text-slate-400 block -mt-0.5">College Database Project</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            System Online
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-[460px]">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8">
            {/* Header Icon & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-blue-50 text-primary-container mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Account Access</h1>
              <p className="text-xs text-slate-500 mt-1">Select your access mode and role to continue</p>
            </div>

            {/* Mode Switcher: Log In / Register */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-lg mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 text-center rounded-md transition-all ${
                  mode === 'login'
                    ? 'text-primary-container bg-white border border-slate-200/80 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 text-center rounded-md transition-all ${
                  mode === 'register'
                    ? 'text-primary-container bg-white border border-slate-200/80 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  User Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label
                    onClick={() => setRole('member')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs font-medium ${
                      role === 'member'
                        ? 'border-primary-container bg-blue-50/60 text-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={role === 'member'}
                      onChange={() => setRole('member')}
                      className="w-3.5 h-3.5 text-primary-container border-slate-300 focus:ring-primary-container"
                    />
                    <div className="flex items-center gap-1.5">
                      <User className={`w-3.5 h-3.5 ${role === 'member' ? 'text-primary-container' : 'text-slate-400'}`} />
                      <span>Member</span>
                    </div>
                  </label>

                  <label
                    onClick={() => setRole('staff')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs font-medium ${
                      role === 'staff'
                        ? 'border-primary-container bg-blue-50/60 text-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={role === 'staff'}
                      onChange={() => setRole('staff')}
                      className="w-3.5 h-3.5 text-primary-container border-slate-300 focus:ring-primary-container"
                    />
                    <div className="flex items-center gap-1.5">
                      <Shield className={`w-3.5 h-3.5 ${role === 'staff' ? 'text-primary-container' : 'text-slate-400'}`} />
                      <span>Staff</span>
                    </div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {role === 'member'
                    ? 'Members can donate books and request available monographs from the catalog.'
                    : 'Staff can verify intake, mark donations as received, approve requests, and distribute books.'}
                </p>
              </div>

              {/* Name Field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Collegiate Email *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'staff' ? 'alex.morgan@college.edu' : 'rahul.sharma@college.edu'}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              {/* Phone Field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98230 11223"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                  </div>
                </div>
              )}

              {/* Staff Designation (Register & Staff only) */}
              {mode === 'register' && role === 'staff' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Staff Designation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Shield className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Senior Librarian / Reserves In-charge"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-primary-container hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-1 disabled:opacity-50"
                >
                  <span>{submitting ? 'Authenticating...' : mode === 'login' ? 'Log in' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Quick Demo Pre-fill Links */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                One-Click Demo Credentials:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('alex.morgan@college.edu', 'Staff')}
                  className="p-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left rounded-lg transition-colors flex flex-col"
                >
                  <span className="font-semibold text-primary-container flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Alex Morgan
                  </span>
                  <span className="text-[10px] text-slate-500">Staff (Senior Librarian)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('rahul.sharma@college.edu', 'Member')}
                  className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left rounded-lg transition-colors flex flex-col"
                >
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3" /> Rahul Sharma
                  </span>
                  <span className="text-[10px] text-slate-500">Member (Student)</span>
                </button>
              </div>
            </div>

            {/* College notice */}
            <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p>Demo accounts match pre-seeded catalog and request records in the database.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-500">
        © 2024 College Book Donation Management System. All records verified.
      </footer>
    </div>
  )
}

