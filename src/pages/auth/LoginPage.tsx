import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { session, signIn, signInWithMagicLink, isLoading: authLoading } = useAuth()
  const redirectParam = params.get('redirect')

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (session) {
      void routeAfterAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, authLoading])

  async function routeAfterAuth() {
    if (redirectParam) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const url = `${redirectParam}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=portal`
        window.location.href = url
        return
      }
    }
    navigate('/app', { replace: true })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    if (mode === 'password') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else await routeAfterAuth()
    } else {
      const { error } = await signInWithMagicLink(email)
      if (error) setError(error.message)
      else setMagicSent(true)
    }
    setSubmitting(false)
  }

  return (
    <div style={container}>
      <div style={card}>
        <div style={logoRow}>
          <div style={logoBadge}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <p style={logoTitle}>MB Payroll Dashboard</p>
            <p style={logoSubtitle}>Sign in to continue</p>
          </div>
        </div>

        <div style={tabRow}>
          {(['password', 'magic'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setMagicSent(false) }}
              style={{ ...tabButton, ...(mode === m ? tabActive : {}) }}
            >
              {m === 'password' ? 'Password' : 'Magic Link'}
            </button>
          ))}
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {magicSent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: '#f1f5f9', fontSize: 15, margin: '0 0 8px' }}>Check your email.</p>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
              We sent a sign-in link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={input}
              placeholder="you@example.com"
            />

            {mode === 'password' && (
              <>
                <label style={label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={input}
                  placeholder="••••••••"
                />
              </>
            )}

            <button type="submit" disabled={submitting} style={{ ...submitBtn, ...(submitting ? disabledBtn : {}) }}>
              {submitting ? 'Signing in…' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <div style={footerRow}>
          <Link to="/register" style={footerLink}>Create an account</Link>
          <span style={{ color: '#475569' }}>•</span>
          <a href="https://stonecode.ai" style={footerLink}>stonecode.ai</a>
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(15,23,42,0.6)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '32px',
  backdropFilter: 'blur(20px)',
}

const logoRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '24px',
}

const logoBadge: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #fb923c, #ea580c)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
}

const logoTitle: React.CSSProperties = { color: '#f1f5f9', fontSize: '15px', fontWeight: 600, margin: 0 }
const logoSubtitle: React.CSSProperties = { color: '#94a3b8', fontSize: '13px', margin: '2px 0 0' }

const tabRow: React.CSSProperties = {
  display: 'flex',
  background: 'rgba(255,255,255,0.04)',
  borderRadius: '10px',
  padding: '4px',
  marginBottom: '20px',
}

const tabButton: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '6px',
}

const tabActive: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  color: '#f1f5f9',
}

const errorBox: React.CSSProperties = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#fca5a5',
  fontSize: '13px',
  padding: '10px 12px',
  borderRadius: '8px',
  marginBottom: '16px',
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#cbd5e1',
  marginBottom: '6px',
  marginTop: '12px',
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const submitBtn: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  marginTop: '20px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg, #fb923c, #ea580c)',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
}

const disabledBtn: React.CSSProperties = { opacity: 0.6, cursor: 'not-allowed' }

const footerRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  fontSize: '12px',
}

const footerLink: React.CSSProperties = {
  color: '#fb923c',
  textDecoration: 'none',
}
