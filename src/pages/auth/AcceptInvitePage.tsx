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

    if (session && user) {
      const callerEmail = (user.email ?? '').toLowerCase()
      if (callerEmail !== data.email.toLowerCase()) {
        setPhase({
          kind: 'invalid',
          reason: `This invitation is for ${data.email}. You're signed in as ${user.email}. Sign out and sign back in with the invited email to accept.`,
        })
        return
      }
      setPhase({ kind: 'accepting' })
      await callAccept(t)
      return
    }

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

    const { data: { session: postSession } } = await supabase.auth.getSession()
    if (postSession) {
      setPhase({ kind: 'accepting' })
      await callAccept(token!)
    } else {
      setPhase({ kind: 'awaiting_confirmation' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl">
        <h1 className="m-0 mb-4 text-xl font-semibold text-slate-100">
          {phase.kind === 'accepted' ? "You're in" : 'MB Dashboard Invitation'}
        </h1>

        {phase.kind === 'loading' && (
          <p className="m-0 mb-4 text-sm leading-relaxed text-slate-300">Loading invitation…</p>
        )}

        {phase.kind === 'invalid' && (
          <>
            <p className="m-0 mb-4 text-sm leading-relaxed text-slate-300">{phase.reason}</p>
            <Link to="/login" className="text-sm text-orange-400 no-underline hover:underline">← Back to sign in</Link>
          </>
        )}

        {phase.kind === 'accepting' && (
          <p className="m-0 mb-4 text-sm leading-relaxed text-slate-300">Granting access…</p>
        )}

        {phase.kind === 'accepted' && (
          <>
            <p className="m-0 mb-4 text-sm leading-relaxed text-slate-300">Access granted. Redirecting to the dashboard…</p>
            <button
              type="button"
              onClick={() => navigate('/app', { replace: true })}
              className="mt-1 w-full rounded-lg border-0 bg-gradient-to-br from-orange-400 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              Open dashboard
            </button>
          </>
        )}

        {phase.kind === 'awaiting_confirmation' && (
          <p className="m-0 mb-4 text-sm leading-relaxed text-slate-300">
            Check your inbox — we sent a confirmation link. After you click it, you&apos;ll land back here and be granted dashboard access.
          </p>
        )}

        {phase.kind === 'signup' && (
          <>
            <p className="m-0 mb-4 text-sm leading-relaxed text-slate-300">
              You&apos;ve been invited to MB Dashboard as{' '}
              <strong className="text-orange-400">{phase.invite.email}</strong>. Set a password to create your account.
            </p>
            {phase.invite.message && (
              <blockquote className="m-0 mb-4 border-l-2 border-orange-400 bg-orange-400/5 px-3.5 py-2.5 text-[13px] leading-relaxed italic text-slate-300">
                {phase.invite.message}
              </blockquote>
            )}
            <form onSubmit={handleSignup}>
              <label className="mb-3 block text-[13px] font-medium text-slate-300">
                Password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={submitting}
                  className="mt-1.5 block w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-400/50 box-border"
                />
              </label>
              {error && (
                <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] leading-relaxed text-red-300">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full rounded-lg border-0 bg-gradient-to-br from-orange-400 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating account…' : 'Create account & accept'}
              </button>
              <p className="mt-4 text-xs text-slate-400">
                Already have a stonecode.ai account with this email?{' '}
                <Link
                  to={`/login?redirect=${encodeURIComponent(window.location.href)}`}
                  className="text-orange-400 no-underline hover:underline"
                >
                  Sign in instead
                </Link>
                .
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
