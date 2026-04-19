import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { session, signUp, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (!authLoading && session) {
      navigate('/app', { replace: true })
    }
  }, [session, authLoading, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError(null)
    setSubmitting(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
    } else {
      setCreated(true)
    }
    setSubmitting(false)
  }

  if (created) {
    return (
      <div style={container}>
        <div style={card}>
          <h1 style={{ color: '#f1f5f9', fontSize: '20px', margin: '0 0 12px' }}>Check your email</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            We sent a verification link to <strong>{email}</strong>. Once you confirm, you&apos;ll be able to sign in.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '20px' }}>
            Note: your account needs the <code style={{ color: '#fb923c' }}>mb_dashboard</code> feature flag enabled
            by an administrator before you can view the dashboard.
          </p>
          <Link to="/login" style={{ color: '#fb923c', fontSize: '14px', marginTop: '20px', display: 'inline-block' }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={{ color: '#f1f5f9', fontSize: '20px', margin: '0 0 6px' }}>Create account</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px' }}>
          Registration requires administrator approval for dashboard access.
        </p>

        {error && (
          <div style={errorBox}>{error}</div>
        )}

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

          <label style={label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            style={input}
            placeholder="At least 8 characters"
          />

          <button type="submit" disabled={submitting} style={{ ...submitBtn, ...(submitting ? disabledBtn : {}) }}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#fb923c', fontSize: '13px', textDecoration: 'none' }}>
            Already have an account? Sign in
          </Link>
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
