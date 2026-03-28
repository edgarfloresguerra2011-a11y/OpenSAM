import { useEffect, useState } from 'react'
import { BookmarkCheck, Trash2, Inbox, Zap } from 'lucide-react'
import { getSavedOpportunities, removeSavedOpportunity } from '../../services/database'
import { OpportunityCard } from '../dashboard/OpportunityCard'
import { AnalyzerPanel } from '../analyzer/AnalyzerPanel'
import { TopBar } from '../layout/Sidebar'
import type { Opportunity } from '../../types'

export function SavedPage() {
  const [saved, setSaved] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Opportunity | null>(null)

  useEffect(() => {
    getSavedOpportunities()
      .then(setSaved)
      .catch(() => setSaved([]))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id: string) => {
    await removeSavedOpportunity(id).catch(() => null)
    setSaved(prev => prev.filter(o => o.id !== id))
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <TopBar title="Saved Bids" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <BookmarkCheck className="w-4 h-4" />
          {loading ? 'Loading...' : `${saved.length} saved opportunities`}
        </div>

        {!loading && saved.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No saved bids yet</p>
            <p className="text-xs text-slate-400 mt-1">Click the bookmark icon on any opportunity to save it here</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {saved.map(opp => (
            <div key={opp.id} className="relative">
              <OpportunityCard
                opportunity={opp}
                saved
                onSave={() => remove(opp.id)}
                onAnalyze={setSelected}
              />
              <button
                onClick={() => remove(opp.id)}
                className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {selected && <AnalyzerPanel opportunity={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
