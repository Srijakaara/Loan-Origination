import { confidenceBand, type ConfidenceBand } from '@/types'

const bandColor: Record<ConfidenceBand, string> = {
  high: '#1baf7a',
  medium: '#eda100',
  low: '#e34948',
}

export function ConfidenceBar({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-xs text-[var(--ink-muted)]">—</span>
  }
  const band = confidenceBand(score)
  const pct = Math.round(score * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: bandColor[band] }} />
      </div>
      <span className="whitespace-nowrap text-xs font-medium" style={{ color: bandColor[band] }}>
        {pct}%
      </span>
    </div>
  )
}
