import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { SavedPage } from './components/dashboard/SavedPage'

// Placeholder pages
const ProfilePage = () => (
  <div className="flex-1 flex flex-col min-h-0">
    <div className="h-14 border-b border-slate-200 bg-white flex items-center px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-900">Company Profile</h1>
    </div>
    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
      Company profile configuration — coming soon
    </div>
  </div>
)

const SettingsPage = () => (
  <div className="flex-1 flex flex-col min-h-0">
    <div className="h-14 border-b border-slate-200 bg-white flex items-center px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-900">Settings</h1>
    </div>
    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
      API key management — coming soon
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-surf">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
