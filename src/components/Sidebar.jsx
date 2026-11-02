import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  BookOpen, 
  LayoutDashboard, 
  Library, 
  HeartHandshake, 
  Package, 
  BookmarkPlus, 
  ClipboardCheck, 
  Truck, 
  History, 
  Bell, 
  LogOut 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Sidebar() {
  const { user, logout } = useAuth()
  const isStaff = user?.role === 'Staff'

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Member', 'Staff'] },
    { label: 'Books', path: '/books', icon: Library, roles: ['Member', 'Staff'] },
    { label: 'Donate a Book', path: '/donate-a-book', icon: HeartHandshake, roles: ['Member'] },
    { label: 'My Donations', path: '/my-donations', icon: Package, roles: ['Member'] },
    { label: 'Request a Book', path: '/request-a-book', icon: BookmarkPlus, roles: ['Member'] },
    { label: 'Manage Requests', path: '/manage-requests', icon: ClipboardCheck, roles: ['Staff'] },
    { label: 'Distribution', path: '/distribution', icon: Truck, roles: ['Staff'] },
    { label: 'Book Status History', path: '/book-status-history', icon: History, roles: ['Member', 'Staff'] },
    { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['Member', 'Staff'] },
  ]

  // Filter based on user role
  const visibleNav = navItems.filter(item => {
    if (!user) return true // Show all if guest/preview
    return item.roles.includes(user.role)
  })

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-200 bg-white">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-primary-container">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 leading-tight">Book Donation</span>
            <span className="text-[11px] text-slate-500 font-medium">Management System</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 p-3">
          {visibleNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}

