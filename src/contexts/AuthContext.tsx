import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { bootstrapSessionFromHash } from '@stonecode/portal-sdk'
import { supabase, hasMbDashboardAccess } from '../lib/supabase'

type AuthState = {
  session: Session | null
  user: User | null
  isLoading: boolean
  hasAccess: boolean | null
}

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshAccess: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    hasAccess: null,
  })

  async function refreshAccessFor(userId: string | undefined) {
    if (!userId) {
      setState((s) => ({ ...s, hasAccess: null }))
      return
    }
    try {
      const ok = await hasMbDashboardAccess(userId)
      setState((s) => ({ ...s, hasAccess: ok }))
    } catch (err) {
      console.error('Feature flag check failed:', err)
      setState((s) => ({ ...s, hasAccess: false }))
    }
  }

  useEffect(() => {
    let mounted = true

    async function init() {
      // Consume hash tokens if present (portal handoff)
      await bootstrapSessionFromHash(supabase)

      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        hasAccess: null,
      })

      if (session?.user) {
        await refreshAccessFor(session.user.id)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      setState((s) => ({ ...s, session, user: session?.user ?? null, isLoading: false }))
      if (session?.user) {
        await refreshAccessFor(session.user.id)
      } else {
        setState((s) => ({ ...s, hasAccess: null }))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ session: null, user: null, isLoading: false, hasAccess: null })
  }

  const refreshAccess = async () => {
    await refreshAccessFor(state.user?.id)
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signInWithMagicLink, signOut, refreshAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
