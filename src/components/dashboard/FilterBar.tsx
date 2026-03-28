import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { FilterState, NoticeType } from '../../types'

interface Props {
  filters: FilterState
  onChange: (f: Partial<FilterState>) => void
  onReset: () => void
}

const NOTICE_TYPES: NoticeType[] = ['Solicitation', 'Award', 'Presolicitation', 'Sources Sought', 'Other']
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
  const hasActive = filters.query || filters.naicsCode || filters.agency || filters.noticeType || filters.setAside || filters.deadlineDays || filters.matchScore

  return (
    <div className="card p-4 space-y-3">
      {/* Search + Reset */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.query}
            onChange={e => onChange({ query: e.target.value })}
            placeholder="Search by keyword, agency, or description..."
            className="input pl-9"
          />
        </div>
        {hasActive && (
          <button onClick={onReset} className="btn-secondary text-xs gap-1">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

        {/* NAICS */}
        <input
          type="text"
          value={filters.naicsCode}
          onChange={e => onChange({ naicsCode: e.target.value })}
          placeholder="NAICS Code"
          className="input w-32"
        />

        {/* Notice type */}
        <select
          value={filters.noticeType}
          onChange={e => onChange({ noticeType: e.target.value as NoticeType | '' })}
          className="input w-44"
        >
          <option value="">All Notice Types</option>
          {NOTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Deadline */}
        <select
          value={filters.deadlineDays ?? ''}
          onChange={e => onChange({ deadlineDays: e.target.value ? Number(e.target.value) : null })}
          className="input w-40"
        >
          {DEADLINES.map(d => (
            <option key={String(d.value)} value={d.value ?? ''}>{d.label}</option>
          ))}
        </select>

        {/* Match score */}
        <select
          value={filters.matchScore}
          onChange={e => onChange({ matchScore: e.target.value as any })}
          className="input w-40"
        >
          {MATCH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
    </div>
  )
}
