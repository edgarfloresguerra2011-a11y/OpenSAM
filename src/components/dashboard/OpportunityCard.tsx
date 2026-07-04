import type { Opportunity } from '../../types'
import { format, isPast, differenceInDays } from 'date-fns'
import { Bookmark, BookmarkCheck, ExternalLink, Zap } from 'lucide-react'

interface Props {
  opportunity: Opportunity
  saved?: boolean
  onSave?: (opp: Opportunity) => void
  onAnalyze?: (opp: Opportunity) => void
}

function MatchBadge({ score }: { score: number }) {
  const cls = score >= 70 ? 'badge-green' : score >= 40 ? 'badge-yellow' : 'badge-red'
  const label = score >= 70 ? 'High match' : score >= 40 ? 'Medium match' : 'Low match'
  return (
    <span className={cls} aria-label={`${label}: ${score} percent`}>
      ● {score}% Match
    </span>
  )
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  if (!deadline) return null
  const date = new Date(deadline)
  const past = isPast(date)
  const days = differenceInDays(date, new Date())

  if (past)
    return (
      <span className="badge-gray" aria-label="Closed">
        Closed
      </span>
    )
  if (days <= 7)
    return (
      <span className="badge-red" aria-label={`${days} days left to respond`}>
        ⚑ {days}d left
      </span>
    )
  if (days <= 14)
    return (
      <span className="badge-yellow" aria-label={`${days} days left to respond`}>
        {days}d left
      </span>
    )
  return (
    <span className="badge-gray" aria-label={`Due ${format(date, 'MMM d, yyyy')}`}>
      {format(date, 'MMM d, yyyy')}
    </span>
  )
}

export function OpportunityCard({ opportunity: opp, saved, onSave, onAnalyze }: Props) {
  const titleId = `opp-title-${opp.id}`
  return (
    <article
      className="card flex flex-col gap-4 p-5 transition-shadow duration-200 hover:shadow-md"
      aria-labelledby={titleId}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {opp.agency}
          </p>
          <h3
            id={titleId}
            className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900"
          >
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
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <div>
          <dt className="sr-only text-slate-400 sm:not-sr-only sm:inline">Sol #</dt>{' '}
          <dd className="inline">{opp.solicitationNumber}</dd>
        </div>
        <div>
          <dt className="sr-only text-slate-400 sm:not-sr-only sm:inline">NAICS</dt>{' '}
          <dd className="inline">{opp.naicsCode}</dd>
        </div>
        <div>
          <dt className="sr-only text-slate-400 sm:not-sr-only sm:inline">Type</dt>{' '}
          <dd className="inline">{opp.noticeType}</dd>
        </div>
        <div>
          <dt className="sr-only text-slate-400 sm:not-sr-only sm:inline">Place</dt>{' '}
          <dd className="inline">{opp.placeOfPerformance}</dd>
        </div>
      </dl>

      {/* Set-aside */}
      {opp.setAside && (
        <div>
          <span className="badge-blue">{opp.setAside}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        <DeadlineBadge deadline={opp.responseDeadline} />

        <div className="flex items-center gap-1">
          {onSave && (
            <button
              onClick={() => onSave(opp)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
              aria-pressed={saved}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
          {opp.pdfUrl && (
            <a
              href={opp.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              title="View on SAM.gov"
              aria-label={`View ${opp.title} on SAM.gov (opens in new tab)`}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {onAnalyze && (
            <button
              onClick={() => onAnalyze(opp)}
              className="btn-primary ml-1 px-3 py-1.5 text-xs"
              aria-label={`Analyze ${opp.title} with AI`}
            >
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Analyze
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
