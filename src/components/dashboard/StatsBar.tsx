import type { DashboardStats } from '../../types'
import { TrendingUp, Target, Clock, Bookmark } from 'lucide-react'

interface Props {
  stats: DashboardStats
  loading?: boolean
}

interface StatCardProps {
  label: string
  value: number | string
  icon: typeof TrendingUp
  color: string
  loading?: boolean
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${color}`}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">
          {loading ? (
            <span
              className="inline-block h-6 w-8 animate-pulse rounded bg-slate-100"
              aria-label="Loading"
            />
          ) : (
            value
          )}
        </p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export function StatsBar({ stats, loading }: Props) {
  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="region"
      aria-label="Dashboard statistics"
    >
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
