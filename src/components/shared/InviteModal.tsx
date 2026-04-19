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
    <div style={backdrop} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={header}>
          <div>
            <h2 style={title}>Invite to MB Dashboard</h2>
            <p style={subtitle}>They'll get dashboard access only — not the full portal.</p>
          </div>
          <button type="button" onClick={onClose} style={closeBtn} aria-label="Close">×</button>
        </div>

        {status.kind === 'success' ? (
          <div style={successBox}>
            <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 8 }}>
              {status.mode === 'granted_direct' ? 'Access granted' : 'Invitation sent'}
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
              {status.message}
            </p>
            <button type="button" onClick={onClose} style={primaryBtn}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={label}>
              Email
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                style={input}
                disabled={submitting}
              />
            </label>

            <label style={label}>
              Personal note <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey — I set this up for us to track instructor earnings. Link below."
                style={{ ...input, minHeight: 72, resize: 'vertical', fontFamily: 'inherit' }}
                disabled={submitting}
                maxLength={500}
              />
            </label>

            {status.kind === 'error' && (
              <div style={errorBox}>{status.message}</div>
            )}

            <div style={actions}>
              <button type="button" onClick={onClose} style={secondaryBtn} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" style={primaryBtn} disabled={submitting || !email}>
                {submitting ? 'Sending…' : 'Send invitation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(2, 6, 23, 0.72)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  background: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 24px 72px rgba(0, 0, 0, 0.5)',
  color: '#e2e8f0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 20,
  gap: 16,
}

const title: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: 18,
  fontWeight: 600,
  margin: 0,
}

const subtitle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: 13,
  margin: '4px 0 0',
}

const closeBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: 24,
  lineHeight: 1,
  cursor: 'pointer',
  padding: '0 4px',
}

const label: React.CSSProperties = {
  display: 'block',
  color: '#cbd5e1',
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 16,
}

const input: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: 14,
  boxSizing: 'border-box',
}

const errorBox: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#fca5a5',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  marginBottom: 16,
  lineHeight: 1.5,
}

const successBox: React.CSSProperties = {
  background: 'rgba(34, 197, 94, 0.08)',
  border: '1px solid rgba(34, 197, 94, 0.25)',
  borderRadius: 10,
  padding: 16,
}

const actions: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  marginTop: 8,
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #f97316, #f59e0b)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: 'transparent',
  color: '#cbd5e1',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
}
