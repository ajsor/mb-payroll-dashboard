import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; mode: 'invited' | 'granted_direct'; message: string }
  | { kind: 'error'; message: string }

export default function InviteModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    if (!open) {
      setEmail('')
      setMessage('')
      setStatus({ kind: 'idle' })
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus({ kind: 'submitting' })

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setStatus({ kind: 'error', message: 'You must be signed in to send invitations.' })
        return
      }

      const { data, error } = await supabase.functions.invoke('app-create-invitation', {
        body: {
          app: 'mb_dashboard',
          email: email.trim().toLowerCase(),
          message: message.trim() || undefined,
        },
      })

      if (error) {
        setStatus({ kind: 'error', message: error.message || 'Failed to send invitation' })
        return
      }
      if (data?.error) {
        setStatus({ kind: 'error', message: data.error })
        return
      }

      const mode = data?.mode as 'invited' | 'granted_direct'
      const successMsg = mode === 'granted_direct'
        ? `${email.trim()} already has a stonecode.ai account — access granted immediately.`
        : `Invitation sent to ${email.trim()}. They have 7 days to accept.`
      setStatus({ kind: 'success', mode, message: successMsg })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStatus({ kind: 'error', message: msg })
    }
  }

  const submitting = status.kind === 'submitting'

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 text-slate-200 shadow-[0_24px_72px_rgba(0,0,0,0.5)] font-sans"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-lg font-semibold text-slate-100">Invite to MB Dashboard</h2>
            <p className="m-0 mt-1 text-[13px] text-slate-400">
              They&apos;ll get dashboard access only — not the full portal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border-0 bg-transparent px-1 text-2xl leading-none text-slate-500 cursor-pointer hover:text-slate-300"
          >
            ×
          </button>
        </div>

        {status.kind === 'success' ? (
          <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-4">
            <div className="mb-2 font-semibold text-green-500">
              {status.mode === 'granted_direct' ? 'Access granted' : 'Invitation sent'}
            </div>
            <p className="m-0 mb-4 text-sm leading-relaxed text-slate-300">{status.message}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-0 bg-gradient-to-br from-orange-400 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="mb-4 block text-[13px] font-medium text-slate-300">
              Email
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                disabled={submitting}
                className="mt-1.5 block w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-400/50 box-border"
              />
            </label>

            <label className="mb-4 block text-[13px] font-medium text-slate-300">
              Personal note <span className="font-normal text-slate-500">(optional)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey — I set this up for us to track instructor earnings. Link below."
                disabled={submitting}
                maxLength={500}
                className="mt-1.5 block min-h-[72px] w-full resize-y rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-400/50 font-sans box-border"
              />
            </label>

            {status.kind === 'error' && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] leading-relaxed text-red-300">
                {status.message}
              </div>
            )}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-300 cursor-pointer hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !email}
                className="rounded-lg border-0 bg-gradient-to-br from-orange-400 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send invitation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
