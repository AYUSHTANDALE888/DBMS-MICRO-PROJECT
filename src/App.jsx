import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'

// Pages
import { LoginRegister } from './pages/LoginRegister'
import { Dashboard } from './pages/Dashboard'
import { Books } from './pages/Books'
import { DonateBook } from './pages/DonateBook'
import { MyDonations } from './pages/MyDonations'
import { RequestBook } from './pages/RequestBook'
import { ManageRequests } from './pages/ManageRequests'
import { Distribution } from './pages/Distribution'
import { BookStatusHistory } from './pages/BookStatusHistory'
import { Notifications } from './pages/Notifications'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsAndConditions } from './pages/TermsAndConditions'

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific role, navigate to dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Auth Route */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginRegister />}
      />

      {/* Protected App Routes inside Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        
        {/* Member only */}
        <Route
          path="/donate-a-book"
          element={
            <ProtectedRoute allowedRoles={['Member']}>
              <DonateBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-donations"
          element={
            <ProtectedRoute allowedRoles={['Member']}>
              <MyDonations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-a-book"
          element={
            <ProtectedRoute allowedRoles={['Member']}>
              <RequestBook />
            </ProtectedRoute>
          }
        />

        {/* Staff only */}
        <Route
          path="/manage-requests"
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <ManageRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distribution"
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <Distribution />
            </ProtectedRoute>
          }
        />

        {/* Common to all authenticated */}
        <Route path="/book-status-history" element={<BookStatusHistory />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

