import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'good' | 'warning' | 'critical' | 'info' | 'orange'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--border)]',
  good: 'bg-green-100 text-green-700 border-transparent',
  warning: 'bg-amber-100 text-amber-700 border-transparent',
  critical: 'bg-red-100 text-red-700 border-transparent',
  info: 'bg-navy-100 text-navy-800 border-transparent',
  orange: 'bg-orange-100 text-orange-600 border-transparent',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
