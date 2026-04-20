import { Navigate, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { STONECODE_URL } from '../../lib/supabase'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading, hasAccess } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-orange-500/20 border-t-orange-500" />
        <p className="m-0 text-sm text-slate-400">Authenticating…</p>
      </div>
    )
  }

  if (!session) {
    const redirect = encodeURIComponent(window.location.href)
    return <Navigate to={`/login?redirect=${redirect}`} replace state={{ from: location.pathname }} />
  }

  if (hasAccess === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-orange-500/20 border-t-orange-500" />
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <svg className="h-12 w-12 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="m-0 text-xl font-semibold text-slate-100">Access Denied</h2>
          <p className="m-0 text-sm leading-relaxed text-slate-400">
            You don&apos;t have access to the MB Payroll Dashboard. Contact your administrator to request access.
          </p>
          <a href={STONECODE_URL} className="mt-2 text-sm text-orange-500 no-underline hover:underline">
            ← Return to stonecode.ai
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
