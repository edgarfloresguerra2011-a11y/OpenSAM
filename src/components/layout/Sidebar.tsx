import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookmarkCheck, Building2, Settings, Radio, ChevronDown,
} from 'lucide-react'

interface SidebarProps { collapsed?: boolean }

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/saved', icon: BookmarkCheck, label: 'Saved Bids' },
  { to: '/profile', icon: Building2, label: 'Company Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof LayoutDashboard; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">Alice</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">SAM Agent</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(l => <NavItem key={l.to} {...l} />)}
      </nav>

      {/* Demo badge */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">Demo Mode — Add API keys</p>
        </div>
      </div>
    </aside>
  )
}

export function TopBar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
