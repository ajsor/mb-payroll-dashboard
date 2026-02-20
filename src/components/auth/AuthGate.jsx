import { useEffect, useState } from 'react'
import { supabase, hasMbDashboardAccess, STONECODE_URL } from '../../lib/supabase'
import './AuthGate.css'

const STATUS = {
  LOADING: 'loading',
  AUTHORIZED: 'authorized',
  UNAUTHORIZED: 'unauthorized',
  DENIED: 'denied',
}

/**
 * Reads access_token / refresh_token from the URL hash (set by stonecode.ai
 * when it opens this app), establishes a Supabase session, then checks the
 * mb_dashboard feature flag.
 *
 * - No session → redirects to stonecode.ai/login?redirect=<this url>
 * - Session but no feature flag → shows "Access Denied" with a link back
 * - Authorized → renders children
 */
export default function AuthGate({ children }) {
  const [status, setStatus] = useState(STATUS.LOADING)

  useEffect(() => {
    async function init() {
      // 1. Check for tokens in the URL hash (deep-link from stonecode.ai portal)
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.slice(1))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.error('Failed to set session from URL:', error)
          }
        }

        // Clean the hash from the URL so tokens aren't visible in history
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }

      // 2. Verify we have a valid session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        const redirect = encodeURIComponent(window.location.href)
        window.location.href = `${STONECODE_URL}/login?redirect=${redirect}`
        return
      }

      // 3. Check feature flag
      const hasAccess = await hasMbDashboardAccess(session.user.id)
      setStatus(hasAccess ? STATUS.AUTHORIZED : STATUS.DENIED)
    }

    init()
  }, [])

  if (status === STATUS.LOADING) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.text}>Authenticating...</p>
      </div>
    )
  }

  if (status === STATUS.DENIED) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 style={styles.heading}>Access Denied</h2>
          <p style={styles.subtext}>
            You don&apos;t have access to the MB Payroll Dashboard.
            Contact your administrator to request access.
          </p>
          <a href={STONECODE_URL + '/portal'} style={styles.link}>
            ← Return to portal
          </a>
        </div>
      </div>
    )
  }

  return children
}

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    gap: '16px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(249,115,22,0.2)',
    borderTopColor: '#f97316',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
  card: {
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
  },
  icon: {
    width: '48px',
    height: '48px',
    color: '#f97316',
    stroke: '#f97316',
  },
  heading: {
    color: '#f1f5f9',
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
  },
  subtext: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.6,
    margin: 0,
  },
  link: {
    color: '#f97316',
    fontSize: '14px',
    textDecoration: 'none',
    marginTop: '8px',
  },
}
