import { cn } from '@/lib/utils'
import { confidenceBand } from '@/types'

const bandStyle = {
  high: { bar: 'bg-green-700', text: 'text-green-700' },
  medium: { bar: 'bg-amber-700', text: 'text-amber-700' },
  low: { bar: 'bg-red-700', text: 'text-red-700' },
}

export function ConfidenceIndicator({ score, className }: { score: number; className?: string }) {
  const band = confidenceBand(score)
  const style = bandStyle[band]
  const pct = Math.round(score * 100)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-2)]" role="img" aria-label={`${pct}% confidence`}>
        <div className={cn('h-full rounded-full', style.bar)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums', style.text)}>{pct}%</span>
    </div>
  )
}
