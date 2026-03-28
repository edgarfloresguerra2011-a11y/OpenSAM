import type { Opportunity } from '../../types'
import { formatDistanceToNow, format, isPast, differenceInDays } from 'date-fns'
import { Bookmark, BookmarkCheck, ExternalLink, Zap } from 'lucide-react'

interface Props {
  opportunity: Opportunity
  saved?: boolean
  onSave?: (opp: Opportunity) => void
  onAnalyze?: (opp: Opportunity) => void
}

function MatchBadge({ score }: { score: number }) {
  if (score >= 70) return <span className="badge-green">● {score}% Match</span>
  if (score >= 40) return <span className="badge-yellow">● {score}% Match</span>
  return <span className="badge-red">● {score}% Match</span>
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  if (!deadline) return null
  const date = new Date(deadline)
  const past = isPast(date)
  const days = differenceInDays(date, new Date())

  if (past) return <span className="badge-gray">Closed</span>
  if (days <= 7) return <span className="badge-red">⚑ {days}d left</span>
  if (days <= 14) return <span className="badge-yellow">{days}d left</span>
  return <span className="badge-gray">{format(date, 'MMM d, yyyy')}</span>
}

export function OpportunityCard({ opportunity: opp, saved, onSave, onAnalyze }: Props) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            {opp.agency}
          </p>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
            {opp.title}
          </h3>
        </div>
        {opp.matchScore !== undefined && (
          <div className="flex-shrink-0">
            <MatchBadge score={opp.matchScore} />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <div><span className="text-slate-400">Sol #</span> {opp.solicitationNumber}</div>
        <div><span className="text-slate-400">NAICS</span> {opp.naicsCode}</div>
        <div><span className="text-slate-400">Type</span> {opp.noticeType}</div>
        <div><span className="text-slate-400">Place</span> {opp.placeOfPerformance}</div>
      </div>

      {/* Set-aside */}
      {opp.setAside && (
        <div>
          <span className="badge-blue">{opp.setAside}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <DeadlineBadge deadline={opp.responseDeadline} />

        <div className="flex items-center gap-1">
          {onSave && (
            <button
              onClick={() => onSave(opp)}
              className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              title={saved ? 'Remove from saved' : 'Save opportunity'}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <a
            href={opp.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="View on SAM.gov"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {onAnalyze && (
            <button
              onClick={() => onAnalyze(opp)}
              className="btn-primary py-1.5 px-3 text-xs ml-1"
            >
              <Zap className="w-3.5 h-3.5" />
              Analyze
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
