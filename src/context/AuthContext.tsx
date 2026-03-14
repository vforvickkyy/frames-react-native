import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({}),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user?.email) {
        checkAdmin(data.session.user.email)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        checkAdmin(session.user.email)
      } else {
        setIsAdmin(false)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkAdmin(email: string) {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', email)
        .single()
      setIsAdmin(data?.role === 'admin')
    } catch {
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('role')
      .eq('email', email)
      .single()

    if (!adminRow || adminRow.role !== 'admin') {
      await supabase.auth.signOut()
      return { error: 'You do not have admin access.' }
    }

    setIsAdmin(true)
    return {}
  }

  async function signOut() {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
