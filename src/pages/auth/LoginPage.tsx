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
            <p className="mt-0.5 text-[13px] text-slate-400">Sign in to continue</p>
          </div>
        </div>

        <div className="mb-5 flex gap-1 rounded-lg bg-white/5 p-1">
          {(['password', 'magic'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setMagicSent(false) }}
              className={`flex-1 rounded-md border-0 px-2 py-2 text-[13px] font-medium cursor-pointer transition-colors ${
                mode === m
                  ? 'bg-white/10 text-slate-100'
                  : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'password' ? 'Password' : 'Magic Link'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300">
            {error}
          </div>
        )}

        {magicSent ? (
          <div className="py-4 text-center">
            <p className="m-0 mb-2 text-[15px] text-slate-100">Check your email.</p>
            <p className="m-0 text-[13px] text-slate-400">
              We sent a sign-in link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
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

            {mode === 'password' && (
              <>
                <label className="mb-1.5 mt-3 block text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-400/50"
                  placeholder="••••••••"
                />
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-lg border-0 bg-gradient-to-br from-orange-400 to-orange-600 px-3 py-3 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-3 border-t border-white/10 pt-5 text-xs">
          <Link to="/register" className="text-orange-400 no-underline hover:underline">Create an account</Link>
          <span className="text-slate-600">•</span>
          <a href="https://stonecode.ai" className="text-orange-400 no-underline hover:underline">stonecode.ai</a>
        </div>
      </div>
    </div>
  )
}
