import { Link, useSearchParams } from 'react-router-dom'

export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={{ color: '#f1f5f9', fontSize: '20px', margin: '0 0 12px' }}>Invitations coming soon</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px' }}>
          The MB Dashboard invitation system is still being wired up. Once live, visiting this page with a valid token
          will create your account and grant dashboard access in one step.
        </p>
        {token && (
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 20px' }}>
            Token received: <code style={{ color: '#fb923c' }}>{token.slice(0, 8)}…</code>
          </p>
        )}
        <Link to="/login" style={{ color: '#fb923c', fontSize: '14px', textDecoration: 'none' }}>
          ← Back to sign in
        </Link>
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
