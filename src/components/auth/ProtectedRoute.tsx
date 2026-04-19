import { Navigate, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { STONECODE_URL } from '../../lib/supabase'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading, hasAccess } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={spinnerContainer}>
        <div style={spinner} />
        <p style={spinnerText}>Authenticating…</p>
      </div>
    )
  }

  if (!session) {
    const redirect = encodeURIComponent(window.location.href)
    return <Navigate to={`/login?redirect=${redirect}`} replace state={{ from: location.pathname }} />
  }

  if (hasAccess === null) {
    return (
      <div style={spinnerContainer}>
        <div style={spinner} />
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div style={spinnerContainer}>
        <div style={deniedCard}>
          <svg style={deniedIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 style={deniedHeading}>Access Denied</h2>
          <p style={deniedText}>
            You don&apos;t have access to the MB Payroll Dashboard. Contact your administrator to request access.
          </p>
          <a href={STONECODE_URL} style={deniedLink}>← Return to stonecode.ai</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

const spinnerContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#0f172a',
  gap: '16px',
}

const spinner: React.CSSProperties = {
  width: '36px',
  height: '36px',
  border: '3px solid rgba(249,115,22,0.2)',
  borderTopColor: '#f97316',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}

const spinnerText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: 0,
}

const deniedCard: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  padding: '32px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  maxWidth: '360px',
  textAlign: 'center',
}

const deniedIcon: React.CSSProperties = {
  width: '48px',
  height: '48px',
  color: '#f97316',
  stroke: '#f97316',
}

const deniedHeading: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '20px',
  fontWeight: 600,
  margin: 0,
}

const deniedText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: 1.6,
  margin: 0,
}

const deniedLink: React.CSSProperties = {
  color: '#f97316',
  fontSize: '14px',
  textDecoration: 'none',
  marginTop: '8px',
}
