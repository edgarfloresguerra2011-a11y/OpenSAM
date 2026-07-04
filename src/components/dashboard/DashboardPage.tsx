import { useState } from 'react'
import { useOpportunities } from '../../hooks/useOpportunities'
import { StatsBar } from './StatsBar'
import { FilterBar } from './FilterBar'
import { OpportunityCard } from './OpportunityCard'
import { AnalyzerPanel } from '../analyzer/AnalyzerPanel'
import { TopBar } from '../layout/Sidebar'
import { saveOpportunity, removeSavedOpportunity } from '../../services/database'
import { isDemoMode } from '../../lib/env'
import { DashboardSkeleton } from '../common/Skeletons'
import type { Opportunity } from '../../types'
import { RefreshCw, AlertCircle, Inbox } from 'lucide-react'

export function DashboardPage() {
  const { opportunities, filters, applyFilters, resetFilters, loading, error, stats, refresh } =
    useOpportunities()
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  // Apply client-side match score filter
  const visible = opportunities.filter((opp) => {
    if (!filters.matchScore) return true
    const s = opp.matchScore ?? 0
    if (filters.matchScore === 'high') return s >= 70
    if (filters.matchScore === 'medium') return s >= 40 && s < 70
    if (filters.matchScore === 'low') return s < 40
    return true
  })

  const handleSave = async (opp: Opportunity) => {
    if (savedIds.has(opp.id)) {
      await removeSavedOpportunity(opp.id).catch(() => null)
      setSavedIds((prev) => {
        const n = new Set(prev)
        n.delete(opp.id)
        return n
      })
    } else {
      await saveOpportunity(opp).catch(() => null)
      setSavedIds((prev) => new Set(prev).add(opp.id))
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopBar
        title="Federal Opportunities"
        actions={
          <button
            onClick={refresh}
            className="btn-secondary"
            disabled={loading}
            aria-label="Refresh opportunities"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      {loading && opportunities.length === 0 ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto p-6" aria-busy={loading}>
          {/* KPIs */}
          <StatsBar stats={stats} loading={loading} />

          {/* Filters */}
          <FilterBar filters={filters} onChange={applyFilters} onReset={resetFilters} />

          {/* Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500" aria-live="polite">
              {loading ? 'Loading…' : `${visible.length} opportunities`}
            </p>
            <p className="text-xs text-slate-400">
              {isDemoMode
                ? 'Demo data — configure Supabase to enable live SAM.gov data'
                : 'Live SAM.gov data'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Grid */}
          {!loading && visible.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-600">No opportunities found</p>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or refresh</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                saved={savedIds.has(opp.id)}
                onSave={handleSave}
                onAnalyze={setSelected}
              />
            ))}
          </div>
        </div>
      )}

      {/* Analyzer Drawer */}
      {selected && <AnalyzerPanel opportunity={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
