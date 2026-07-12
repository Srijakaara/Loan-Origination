import type { DecisionPackage, OverrideRecord } from '@/types'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { OverrideControl, type OverrideAction } from './OverrideControl'
import { AlertTriangle, Minus, Plus } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'

const pillarLabel: Record<DecisionPackage['pillar'], string> = {
  document: 'Document Intelligence',
  financial: 'Financial Intelligence',
  journey: 'Agentic Journey',
  policy: 'Business Policy Engine',
}

function WeightIcon({ weight }: { weight: 'positive' | 'negative' | 'neutral' }) {
  if (weight === 'positive') return <Plus className="h-3.5 w-3.5 text-green-700" />
  if (weight === 'negative') return <Minus className="h-3.5 w-3.5 text-red-700" />
  return <span className="h-3.5 w-3.5" />
}

interface DecisionPackageViewerProps {
  pkg: DecisionPackage
  overrides?: OverrideRecord[]
  interactive?: boolean
  onOverride?: (action: OverrideAction, reasonCode: string, note: string) => void
}

export function DecisionPackageViewer({ pkg, overrides = [], interactive = false, onOverride }: DecisionPackageViewerProps) {
  const pkgOverrides = overrides.filter((o) => o.decisionPackageId === pkg.id)
  return (
    <Card className={cn(pkg.flags.length > 0 && 'border-amber-700/40')}>
      <CardHeader>
        <div>
          <Badge tone="orange">{pillarLabel[pkg.pillar]}</Badge>
          <CardTitle className="mt-1.5">{pkg.title}</CardTitle>
        </div>
        <ConfidenceIndicator score={pkg.confidence} />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-left text-sm text-[var(--ink)]">{pkg.conclusion}</p>

        {pkg.flags.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-100 px-3 py-2 text-left text-xs text-amber-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{pkg.flags.join('; ')}</span>
          </div>
        )}

        <div className="text-left">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">Rationale</div>
          <ul className="space-y-1.5">
            {pkg.rationale.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[var(--ink-2)]">
                <WeightIcon weight={r.weight} />
                <span>
                  <span className="font-medium text-[var(--ink)]">{r.label}:</span> {r.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-left text-[11px] text-[var(--ink-muted)]">
          <span>Model version {pkg.modelVersion}</span>
          <span>{formatDateTime(pkg.generatedAt)}</span>
        </div>

        {pkgOverrides.length > 0 && (
          <div className="space-y-2 border-t border-[var(--border)] pt-3 text-left">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">Override history</div>
            {pkgOverrides.map((o) => (
              <div key={o.id} className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {o.action} by {o.actorName}
                  </span>
                  <span className="text-[var(--ink-muted)]">{formatDateTime(o.timestamp)}</span>
                </div>
                <div className="mt-1 text-[var(--ink-2)]">
                  Reason: {o.reasonCode.replaceAll('_', ' ')}
                  {o.note && ` — ${o.note}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {interactive && onOverride && (
          <div className="border-t border-[var(--border)] pt-3">
            <OverrideControl onSubmit={onOverride} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
