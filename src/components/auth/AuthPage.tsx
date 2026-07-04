import { useState, type FormEvent } from 'react'
import { Radio, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { isDemoMode } from '../../lib/env'
import { useNavigate } from 'react-router-dom'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surf p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600">
            <Radio className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-bold leading-none text-slate-900">OpenSAM</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Federal AI Agent
            </p>
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Email</span>
              <div className="relative mt-1">
                <Mail
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@company.com"
                  aria-label="Email"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">Password</span>
              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                  aria-label="Password"
                />
              </div>
            </label>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {isDemoMode && (
            <p className="text-center text-[11px] text-slate-400">
              Demo mode — sign-up is local-only and no real Supabase project is configured.
            </p>
          )}
        </div>

        <p className="mx-auto mt-4 max-w-xs text-center text-[10px] leading-relaxed text-slate-400">
          OpenSAM is an independent open-source project and is not affiliated with, endorsed by, or
          sponsored by the U.S. General Services Administration (GSA) or SAM.gov.
        </p>
      </div>
    </div>
  )
}
