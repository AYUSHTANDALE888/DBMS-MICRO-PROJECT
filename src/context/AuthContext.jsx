import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { initialMembers, initialStaff } from '../lib/mockData'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'bdms_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    // Default to Alex Morgan (Staff) for immediate demo if no one logged in yet, or null
    return null
  })
  const [loading, setLoading] = useState(true)

  // Save user changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [user])

  // On mount: check active Supabase session if configured
  useEffect(() => {
    async function initSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            await resolveUserRole(session.user.email)
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err)
        }
      }
      setLoading(false)
    }
    initSession()
  }, [])

  // Helper to determine role by checking staff vs member table
  async function resolveUserRole(email) {
    if (isSupabaseConfigured && supabase) {
      try {
        // Check staff table first
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('email', email)
          .maybeSingle()

        if (staffData) {
          const authUser = {
            email: staffData.email,
            name: staffData.staff_name,
            role: 'Staff',
            staff_id: staffData.staff_id,
            phone: staffData.phone,
            designation: staffData.designation
          }
          setUser(authUser)
          return authUser
        }

        // Check member table
        const { data: memberData } = await supabase
          .from('member')
          .select('*')
          .eq('email', email)
          .maybeSingle()

        if (memberData) {
          const authUser = {
            email: memberData.email,
            name: memberData.name,
            role: 'Member',
            member_id: memberData.member_id,
            phone: memberData.phone
          }
          setUser(authUser)
          return authUser
        }
      } catch (err) {
        console.warn('Role lookup via Supabase failed:', err)
      }
    }

    // Local fallback lookup
    const dbStore = localStorage.getItem('bdms_db_v1')
    const store = dbStore ? JSON.parse(dbStore) : { staff: initialStaff, members: initialMembers }

    const staffMatch = store.staff?.find(s => s.email.toLowerCase() === email.toLowerCase())
    if (staffMatch) {
      const authUser = {
        email: staffMatch.email,
        name: staffMatch.staff_name,
        role: 'Staff',
        staff_id: staffMatch.staff_id,
        phone: staffMatch.phone,
        designation: staffMatch.designation
      }
      setUser(authUser)
      return authUser
    }

    const memberMatch = store.members?.find(m => m.email.toLowerCase() === email.toLowerCase())
    if (memberMatch) {
      const authUser = {
        email: memberMatch.email,
        name: memberMatch.name,
        role: 'Member',
        member_id: memberMatch.member_id,
        phone: memberMatch.phone
      }
      setUser(authUser)
      return authUser
    }

    return null
  }

  // Login handler
  async function login(email, password) {
    const cleanEmail = email.trim()

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        })

        if (!error && data?.user) {
          const authUser = await resolveUserRole(data.user.email)
          if (authUser) return authUser
        }
      } catch (err) {
        console.warn('Supabase login failed, trying local fallback:', err)
      }
    }

    // Local fallback check
    const authUser = await resolveUserRole(cleanEmail)
    if (authUser) {
      return authUser
    }

    throw new Error('Invalid email or password. Please check your credentials or register.')
  }

  // Register handler
  async function register({ email, password, name, phone, role, designation }) {
    const cleanEmail = email.trim()

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name, role }
          }
        })

        if (error) throw error

        if (role === 'Staff') {
          await supabase.from('staff').insert({
            staff_name: name,
            phone: phone || '+91 99000 00000',
            email: cleanEmail,
            designation: designation || 'Librarian'
          })
        } else {
          await supabase.from('member').insert({
            name,
            email: cleanEmail,
            phone: phone || '+91 98000 00000'
          })
        }

        const authUser = await resolveUserRole(cleanEmail)
        return authUser
      } catch (err) {
        console.warn('Supabase register error, using local fallback:', err)
      }
    }

    // Local Store Registration
    const dbStore = localStorage.getItem('bdms_db_v1')
    const store = dbStore ? JSON.parse(dbStore) : { staff: [...initialStaff], members: [...initialMembers] }

    if (role === 'Staff') {
      const staffId = (store.staff?.length || 0) + 1
      const newStaff = {
        staff_id: staffId,
        staff_name: name,
        phone: phone || '+91 99000 00000',
        email: cleanEmail,
        designation: designation || 'Staff Member'
      }
      store.staff = store.staff || []
      store.staff.push(newStaff)
      localStorage.setItem('bdms_db_v1', JSON.stringify(store))
      const authUser = {
        email: cleanEmail,
        name,
        role: 'Staff',
        staff_id: staffId,
        phone: newStaff.phone,
        designation: newStaff.designation
      }
      setUser(authUser)
      return authUser
    } else {
      const memberId = (store.members?.length || 0) + 1
      const newMember = {
        member_id: memberId,
        name,
        email: cleanEmail,
        phone: phone || '+91 98000 00000'
      }
      store.members = store.members || []
      store.members.push(newMember)
      localStorage.setItem('bdms_db_v1', JSON.stringify(store))
      const authUser = {
        email: cleanEmail,
        name,
        role: 'Member',
        member_id: memberId,
        phone: newMember.phone
      }
      setUser(authUser)
      return authUser
    }
  }

  // Logout handler
  async function logout() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase sign out error:', err)
      }
    }
    setUser(null)
  }

  // Quick Switchers for interactive demo
  function quickLogin(email) {
    return resolveUserRole(email)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      quickLogin,
      isConfigured: isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

