import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth, isAuthEnabled } from './lib/auth'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { DashboardSkeleton } from './components/common/Skeletons'
import { Sidebar, TopBar } from './components/layout/Sidebar'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { SavedPage } from './components/dashboard/SavedPage'
import { ProfilePage } from './components/profile/ProfilePage'
import { LogOut, Settings as SettingsIcon } from 'lucide-react'

function SettingsPage() {
  const { signOut, user } = useAuth()
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopBar title="Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl space-y-4">
          <div className="card p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Account</h2>
            <p className="mb-3 text-xs text-slate-500">{user?.email ?? 'Signed out'}</p>
            {isAuthEnabled() && (
              <button onClick={() => signOut()} className="btn-secondary">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
              </button>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <SettingsIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
              API keys
            </h2>
            <p className="text-xs text-slate-500">
              API keys for Gemini and SAM.gov are configured on the server via
              <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-[10px]">
                supabase secrets set
              </code>
              and never reach the browser. No client-side configuration required.
            </p>
          </div>

          <div className="card p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Compliance</h2>
            <p className="text-xs text-slate-500">
              OpenSAM is an independent open-source project and is not affiliated with, endorsed by,
              or sponsored by the U.S. General Services Administration (GSA) or SAM.gov. Use of the
              SAM.gov Public API is subject to the
              <a
                href="https://open.gsa.gov/api/api-terms-of-use/"
                target="_blank"
                rel="noreferrer"
                className="ml-1 text-brand-600 hover:underline"
              >
                GSA API Terms of Use
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-surf">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default function App() {
  // Show a dashboard skeleton during the very first auth bootstrap.
  const Bootstrapper = () => {
    const { loading } = useAuth()
    if (loading && isAuthEnabled()) {
      return (
        <div className="flex h-screen">
          <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-white" />
          <DashboardSkeleton />
        </div>
      )
    }
    return <AppShell />
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Bootstrapper />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
