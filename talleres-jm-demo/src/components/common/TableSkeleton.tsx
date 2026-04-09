interface TableSkeletonProps {
  rows?: number
  cols?: number
}

function SkeletonCell({ wide }: { wide?: boolean }) {
  return (
    <div
      className={`h-3.5 rounded-full bg-border animate-pulse ${wide ? 'w-32' : 'w-20'}`}
    />
  )
}

export function TableSkeleton({ rows = 6, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="bg-surface px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 w-16 rounded-full bg-border/70 animate-pulse" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-4">
            <div className="flex-1 space-y-1.5">
              <SkeletonCell wide />
              <SkeletonCell />
            </div>
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <SkeletonCell key={j} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-border animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-2.5 w-16 rounded-full bg-border animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-border animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
