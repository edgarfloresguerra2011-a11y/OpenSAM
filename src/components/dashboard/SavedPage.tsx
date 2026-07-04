import { useEffect, useState } from 'react'
import { BookmarkCheck, Trash2, Inbox } from 'lucide-react'
import { getSavedOpportunities, removeSavedOpportunity } from '../../services/database'
import { OpportunityCard } from '../dashboard/OpportunityCard'
import { AnalyzerPanel } from '../analyzer/AnalyzerPanel'
import { TopBar } from '../layout/Sidebar'
import { CardSkeleton } from '../common/Skeletons'
import type { Opportunity } from '../../types'

export function SavedPage() {
  const [saved, setSaved] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Opportunity | null>(null)

  useEffect(() => {
    let cancelled = false
    getSavedOpportunities()
      .then((rows) => {
        if (!cancelled) setSaved(rows)
      })
      .catch(() => {
        if (!cancelled) setSaved([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const remove = async (id: string) => {
    await removeSavedOpportunity(id).catch(() => null)
    setSaved((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopBar title="Saved Bids" />
      <div className="flex-1 space-y-5 overflow-y-auto p-6" aria-busy={loading}>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          {loading ? 'Loading…' : `${saved.length} saved opportunities`}
        </div>

        {!loading && saved.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-600">No saved bids yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Click the bookmark icon on any opportunity to save it here
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : saved.map((opp) => (
                <div key={opp.id} className="relative">
                  <OpportunityCard
                    opportunity={opp}
                    saved
                    onSave={() => remove(opp.id)}
                    onAnalyze={setSelected}
                  />
                  <button
                    onClick={() => remove(opp.id)}
                    className="absolute right-3 top-3 rounded p-1 text-slate-300 transition-colors hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    title="Remove"
                    aria-label={`Remove ${opp.title} from saved`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
        </div>
      </div>
      {selected && <AnalyzerPanel opportunity={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
