import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookmarkCheck, Building2, Settings, Radio } from 'lucide-react'
import { useAuth, isAuthEnabled } from '../../lib/auth'
import { isDemoMode } from '../../lib/env'

interface SidebarProps {
  collapsed?: boolean
}

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/saved', icon: BookmarkCheck, label: 'Saved Bids' },
  { to: '/profile', icon: Building2, label: 'Company Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: typeof LayoutDashboard
  label: string
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      aria-label={label}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{label}</span>
          {isActive && <span className="sr-only"> (current page)</span>}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar(_props: SidebarProps) {
  const { user } = useAuth()
  void _props

  return (
    <aside
      className="sticky top-0 flex h-screen w-56 flex-shrink-0 flex-col border-r border-slate-200 bg-white"
      aria-label="Primary navigation"
    >
      {/* Logo */}
      <div className="border-b border-slate-200 px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Radio className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-slate-900">OpenSAM</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Federal AI Agent
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Main sections">
        {links.map((l) => (
          <NavItem key={l.to} {...l} />
        ))}
      </nav>

      {/* Status / account */}
      <div className="space-y-3 border-t border-slate-200 px-4 py-4">
        {isAuthEnabled() && user && (
          <div className="truncate text-xs text-slate-500" title={user.email ?? undefined}>
            {user.email}
          </div>
        )}
        {isDemoMode ? (
          <div
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
            role="status"
          >
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
            <p className="text-xs font-medium text-amber-700">
              Demo mode — configure Supabase to enable live data
            </p>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2"
            role="status"
          >
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400"
              aria-hidden="true"
            />
            <p className="text-xs font-medium text-emerald-700">Live data</p>
          </div>
        )}
      </div>
    </aside>
  )
}

export function TopBar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
