import type { TimelineEvent } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import { Bot, Cpu, Pin, User } from 'lucide-react'

const kindStyle: Record<TimelineEvent['kind'], { icon: typeof Bot; bg: string; color: string }> = {
  system: { icon: Cpu, bg: 'bg-navy-100', color: 'text-navy-800' },
  ai: { icon: Bot, bg: 'bg-orange-100', color: 'text-orange-600' },
  human: { icon: User, bg: 'bg-green-100', color: 'text-green-700' },
  customer: { icon: Pin, bg: 'bg-amber-100', color: 'text-amber-700' },
}

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-0">
      {events.map((e, i) => {
        const style = kindStyle[e.kind]
        const Icon = style.icon
        return (
          <li key={e.id} className="relative flex gap-3 pb-5 text-left last:pb-0">
            {i < events.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-20px)] w-px bg-[var(--border)]" />}
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', style.bg)}>
              <Icon className={cn('h-4 w-4', style.color)} />
            </span>
            <div className="pt-1">
              <div className="text-sm font-medium text-[var(--ink)]">{e.label}</div>
              <div className="text-xs text-[var(--ink-2)]">{e.detail}</div>
              <div className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                {e.actor} · {formatDateTime(e.timestamp)}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
