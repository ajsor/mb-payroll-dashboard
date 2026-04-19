import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

type InviteRow = {
  id: string
  email: string
  app: string
  expires_at: string
  accepted_at: string | null
  message: string | null
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'invalid'; reason: string }
  | { kind: 'ready'; invite: InviteRow }
  | { kind: 'accepting' }
  | { kind: 'accepted' }
  | { kind: 'signup'; invite: InviteRow }
  | { kind: 'awaiting_confirmation' }

export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { session, user, refreshAccess } = useAuth()
  const token = params.get('token')

  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setPhase({ kind: 'invalid', reason: 'Missing invitation token.' })
      return
    }
    void loadInvite(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function loadInvite(t: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('id, email, app, expires_at, accepted_at, message')
      .eq('token', t)
      .maybeSingle()

    if (error || !data) {
      setPhase({ kind: 'invalid', reason: 'Invitation not found.' })
      return
    }
    if (data.accepted_at) {
      setPhase({ kind: 'invalid', reason: 'This invitation has already been accepted.' })
      return
    }
    if (new Date(data.expires_at) < new Date()) {
      setPhase({ kind: 'invalid', reason: 'This invitation has expired.' })
      return
    }

    // If the visitor is already signed in, decide whether to auto-accept or warn about mismatch.
    if (session && user) {
      const callerEmail = (user.email ?? '').toLowerCase()
      if (callerEmail !== data.email.toLowerCase()) {
        setPhase({
          kind: 'invalid',
          reason: `This invitation is for ${data.email}. You're signed in as ${user.email}. Sign out and sign back in with the invited email to accept.`,
        })
        return
      }
      // Email matches — accept immediately
      setPhase({ kind: 'accepting' })
      await callAccept(t)
      return
    }

    // Otherwise, invite them to create an account
    setPhase({ kind: 'signup', invite: data })
  }

  async function callAccept(t: string) {
    const { data, error } = await supabase.functions.invoke('app-accept-invitation', {
      body: { token: t },
    })
    if (error || data?.error) {
      setPhase({ kind: 'invalid', reason: data?.error || error?.message || 'Failed to accept invitation.' })
      return
    }
    await refreshAccess()
    setPhase({ kind: 'accepted' })
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    if (phase.kind !== 'signup') return
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: signUpErr } = await supabase.auth.signUp({
      email: phase.invite.email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/accept-invite?token=${token}`,
      },
    })
    setSubmitting(false)
    if (signUpErr) {
      setError(signUpErr.message)
      return
    }

    // If email confirmation is enabled, user won't have a session yet.
    const { data: { session: postSession } } = await supabase.auth.getSession()
    if (postSession) {
      // Immediate session — accept now
      setPhase({ kind: 'accepting' })
      await callAccept(token!)
    } else {
      setPhase({ kind: 'awaiting_confirmation' })
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={heading}>
          {phase.kind === 'accepted' ? "You're in" : 'MB Dashboard Invitation'}
        </h1>

        {phase.kind === 'loading' && (
          <p style={bodyText}>Loading invitation…</p>
        )}

        {phase.kind === 'invalid' && (
          <>
            <p style={bodyText}>{phase.reason}</p>
            <Link to="/login" style={backLink}>← Back to sign in</Link>
          </>
        )}

        {phase.kind === 'accepting' && (
          <p style={bodyText}>Granting access…</p>
        )}

        {phase.kind === 'accepted' && (
          <>
            <p style={bodyText}>Access granted. Redirecting to the dashboard…</p>
            <button type="button" onClick={() => navigate('/app', { replace: true })} style={primaryBtn}>
              Open dashboard
            </button>
          </>
        )}

        {phase.kind === 'awaiting_confirmation' && (
          <>
            <p style={bodyText}>
              Check your inbox — we sent a confirmation link. After you click it, you'll land back here and be granted dashboard access.
            </p>
          </>
        )}

        {phase.kind === 'signup' && (
          <>
            <p style={bodyText}>
              You've been invited to MB Dashboard as <strong style={{ color: '#fb923c' }}>{phase.invite.email}</strong>.
              Set a password to create your account.
            </p>
            {phase.invite.message && (
              <blockquote style={noteBox}>{phase.invite.message}</blockquote>
            )}
            <form onSubmit={handleSignup}>
              <label style={labelStyle}>
                Password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={input}
                  disabled={submitting}
                />
              </label>
              {error && <div style={errorBox}>{error}</div>}
              <button type="submit" style={primaryBtn} disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account & accept'}
              </button>
              <p style={smallText}>
                Already have a stonecode.ai account with this email? <Link to={`/login?redirect=${encodeURIComponent(window.location.href)}`} style={linkStyle}>Sign in instead</Link>.
              </p>
            </form>
          </>
        )}
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
  padding: 24,
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 16,
  padding: 32,
  backdropFilter: 'blur(20px)',
}

const heading: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: 20,
  fontWeight: 600,
  margin: '0 0 16px',
}

const bodyText: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: 14,
  lineHeight: 1.6,
  margin: '0 0 16px',
}

const smallText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: 12,
  margin: '16px 0 0',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#cbd5e1',
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 14,
}

const input: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: 14,
  boxSizing: 'border-box',
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '11px 18px',
  background: 'linear-gradient(135deg, #f97316, #f59e0b)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 4,
}

const errorBox: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#fca5a5',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  marginBottom: 12,
  lineHeight: 1.5,
}

const noteBox: React.CSSProperties = {
  margin: '0 0 16px',
  padding: '10px 14px',
  borderLeft: '3px solid #fb923c',
  background: 'rgba(251, 146, 60, 0.06)',
  color: '#cbd5e1',
  fontSize: 13,
  lineHeight: 1.6,
  fontStyle: 'italic',
}

const backLink: React.CSSProperties = {
  color: '#fb923c',
  fontSize: 14,
  textDecoration: 'none',
}

const linkStyle: React.CSSProperties = {
  color: '#fb923c',
  textDecoration: 'none',
}
