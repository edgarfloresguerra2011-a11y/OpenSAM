import { Navigate, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth, isAuthEnabled } from '../../lib/auth'
import { AuthPage } from '../auth/AuthPage'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!isAuthEnabled()) {
    // Demo mode — let anyone in so the UI is explorable.
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-pulse text-sm text-slate-400">Loading session…</div>
      </div>
    )
  }

  if (!user) {
    // Preserve where they were trying to go so we can return them after login.
    return <AuthPage />
  }

  // Tiny hack to make TypeScript understand we returned everything
  void location
  return <>{children}</>
}

// Convenience: redirect to /auth pathologically (kept for completeness)
export function RedirectToAuth() {
  return <Navigate to="/auth" replace />
}
