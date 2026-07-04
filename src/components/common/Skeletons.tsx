// Skeleton placeholders used while async data loads.
// Purely presentational — no logic.

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card animate-pulse space-y-3 p-5" aria-hidden="true">
      <div className="h-3 w-1/3 rounded bg-slate-100" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-slate-100" style={{ width: `${80 - i * 12}%` }} />
      ))}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-3 rounded bg-slate-100" />
        <div className="h-3 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto p-6" aria-busy="true">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card flex animate-pulse items-center gap-4 p-5">
            <div className="h-10 w-10 rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-12 rounded bg-slate-100" />
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      {/* Filter bar */}
      <div className="card animate-pulse space-y-3 p-4">
        <div className="h-9 rounded bg-slate-100" />
        <div className="flex gap-3">
          <div className="h-9 w-32 rounded bg-slate-100" />
          <div className="h-9 w-44 rounded bg-slate-100" />
          <div className="h-9 w-40 rounded bg-slate-100" />
        </div>
      </div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function InlineSpinner({ label }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 text-sm text-slate-600"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
        aria-hidden="true"
      />
      {label ?? 'Loading…'}
    </div>
  )
}
