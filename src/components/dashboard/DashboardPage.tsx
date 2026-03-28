import { useState } from 'react'
import { useOpportunities } from '../../hooks/useOpportunities'
import { StatsBar } from './StatsBar'
import { FilterBar } from './FilterBar'
import { OpportunityCard } from './OpportunityCard'
import { AnalyzerPanel } from '../analyzer/AnalyzerPanel'
import { TopBar } from '../layout/Sidebar'
import { saveOpportunity, removeSavedOpportunity } from '../../services/database'
import type { Opportunity } from '../../types'
import { RefreshCw, AlertCircle, Inbox } from 'lucide-react'

export function DashboardPage() {
  const { opportunities, filters, applyFilters, resetFilters, loading, error, stats, refresh } = useOpportunities()
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  // Apply client-side match score filter
  const visible = opportunities.filter(opp => {
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
      setSavedIds(prev => { const n = new Set(prev); n.delete(opp.id); return n })
    } else {
      await saveOpportunity(opp).catch(() => null)
      setSavedIds(prev => new Set(prev).add(opp.id))
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <TopBar
        title="Federal Opportunities"
        actions={
          <button onClick={refresh} className="btn-secondary" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPIs */}
        <StatsBar stats={stats} loading={loading} />

        {/* Filters */}
        <FilterBar filters={filters} onChange={applyFilters} onReset={resetFilters} />

        {/* Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${visible.length} opportunities`}
          </p>
          <p className="text-xs text-slate-400">
            {!import.meta.env.VITE_SAM_GOV_API_KEY?.startsWith('your-') ? 'Live SAM.gov data' : 'Demo data — add SAM.gov API key'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && visible.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No opportunities found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or refresh</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5 space-y-3 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-3 bg-slate-100 rounded" />
                    <div className="h-3 bg-slate-100 rounded" />
                  </div>
                </div>
              ))
            : visible.map(opp => (
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

      {/* Analyzer Drawer */}
      {selected && (
        <AnalyzerPanel opportunity={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
