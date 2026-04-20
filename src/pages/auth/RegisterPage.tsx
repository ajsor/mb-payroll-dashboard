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
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <p className="m-0 text-[15px] font-semibold text-slate-100">MB Payroll Dashboard</p>
              <p className="mt-0.5 text-[13px] text-slate-400">Check your email</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            We sent a verification link to <strong>{email}</strong>. Once you confirm, you&apos;ll be able to sign in.
          </p>
          <p className="mt-5 text-[13px] text-slate-400">
            Note: your account needs the <code className="text-orange-400">mb_dashboard</code> feature flag enabled
            by an administrator before you can view the dashboard.
          </p>
          <Link to="/login" className="mt-5 inline-block text-sm text-orange-400 no-underline hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <p className="m-0 text-[15px] font-semibold text-slate-100">MB Payroll Dashboard</p>
            <p className="mt-0.5 text-[13px] text-slate-400">Create an account</p>
          </div>
        </div>

        <p className="m-0 mb-6 text-[13px] text-slate-400">
          Registration requires administrator approval for dashboard access.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mb-1.5 mt-3 block text-xs font-medium text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-400/50"
            placeholder="you@example.com"
          />

          <label className="mb-1.5 mt-3 block text-xs font-medium text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-400/50"
            placeholder="At least 8 characters"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg border-0 bg-gradient-to-br from-orange-400 to-orange-600 px-3 py-3 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5 text-center">
          <Link to="/login" className="text-[13px] text-orange-400 no-underline hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
