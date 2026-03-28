import type { DashboardStats } from '../../types'
import { TrendingUp, Target, Clock, Bookmark } from 'lucide-react'

interface Props { stats: DashboardStats; loading?: boolean }

interface StatCardProps {
  label: string
  value: number | string
  icon: typeof TrendingUp
  color: string
  loading?: boolean
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">
          {loading ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" /> : value}
        </p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

export function StatsBar({ stats, loading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Opportunities"
        value={stats.totalOpportunities}
        icon={TrendingUp}
        color="bg-brand-50 text-brand-600"
        loading={loading}
      />
      <StatCard
        label="High Match (≥ 70%)"
        value={stats.highMatch}
        icon={Target}
        color="bg-emerald-50 text-emerald-600"
        loading={loading}
      />
      <StatCard
        label="Closing This Week"
        value={stats.deadlinesSoon}
        icon={Clock}
        color="bg-amber-50 text-amber-600"
        loading={loading}
      />
      <StatCard
        label="Saved Bids"
        value={stats.savedOpportunities}
        icon={Bookmark}
        color="bg-violet-50 text-violet-600"
        loading={loading}
      />
    </div>
  )
}
