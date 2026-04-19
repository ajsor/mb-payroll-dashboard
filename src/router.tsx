import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import App from './App'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const AcceptInvitePage = lazy(() => import('./pages/auth/AcceptInvitePage'))

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f172a' }} />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/app" replace /> },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/register', element: withSuspense(<RegisterPage />) },
  { path: '/accept-invite', element: withSuspense(<AcceptInvitePage />) },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
