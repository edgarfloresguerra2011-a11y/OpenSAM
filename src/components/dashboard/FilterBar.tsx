import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { FilterState, NoticeType } from '../../types'

interface Props {
  filters: FilterState
  onChange: (f: Partial<FilterState>) => void
  onReset: () => void
}

const NOTICE_TYPES: NoticeType[] = [
  'Solicitation',
  'Award',
  'Presolicitation',
  'Sources Sought',
  'Other',
]
const DEADLINES = [
  { label: 'All', value: null },
  { label: 'Next 7 days', value: 7 },
  { label: 'Next 14 days', value: 14 },
  { label: 'Next 30 days', value: 30 },
]
const MATCH_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'High (70%+)', value: 'high' },
  { label: 'Medium (40–70%)', value: 'medium' },
  { label: 'Low (< 40%)', value: 'low' },
]

export function FilterBar({ filters, onChange, onReset }: Props) {
  const hasActive =
    filters.query ||
    filters.naicsCode ||
    filters.agency ||
    filters.noticeType ||
    filters.setAside ||
    filters.deadlineDays ||
    filters.matchScore

  return (
    <div className="card space-y-3 p-4">
      {/* Search + Reset */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <label htmlFor="opp-search" className="sr-only">
            Search by keyword, agency, or description
          </label>
          <input
            id="opp-search"
            type="text"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Search by keyword, agency, or description…"
            className="input pl-9"
          />
        </div>
        {hasActive && (
          <button onClick={onReset} className="btn-secondary gap-1 text-xs">
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal
          className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
          aria-hidden="true"
        />

        <label className="block">
          <span className="sr-only">NAICS code</span>
          <input
            type="text"
            value={filters.naicsCode}
            onChange={(e) => onChange({ naicsCode: e.target.value })}
            placeholder="NAICS Code"
            className="input w-32"
            aria-label="Filter by NAICS code"
          />
        </label>

        <label className="block">
          <span className="sr-only">Notice type</span>
          <select
            value={filters.noticeType}
            onChange={(e) => onChange({ noticeType: e.target.value as NoticeType | '' })}
            className="input w-44"
            aria-label="Filter by notice type"
          >
            <option value="">All Notice Types</option>
            {NOTICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Deadline range</span>
          <select
            value={filters.deadlineDays ?? ''}
            onChange={(e) =>
              onChange({ deadlineDays: e.target.value ? Number(e.target.value) : null })
            }
            className="input w-40"
            aria-label="Filter by response deadline"
          >
            {DEADLINES.map((d) => (
              <option key={String(d.value)} value={d.value ?? ''}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Match score</span>
          <select
            value={filters.matchScore}
            onChange={(e) => onChange({ matchScore: e.target.value as FilterState['matchScore'] })}
            className="input w-40"
            aria-label="Filter by match score"
          >
            {MATCH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
