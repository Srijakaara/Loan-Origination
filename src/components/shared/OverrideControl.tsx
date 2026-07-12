import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check, X, ArrowUpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OverrideAction = 'approve' | 'reject' | 'escalate'

const REASON_CODES = [
  'ADDITIONAL_DOC_VERIFIED',
  'MANUAL_INCOME_CONFIRMED',
  'RELATIONSHIP_MANAGER_VOUCH',
  'POLICY_EXCEPTION_APPROVED',
  'DATA_QUALITY_ISSUE',
  'REQUIRES_SENIOR_REVIEW',
  'OTHER',
]

interface OverrideControlProps {
  onSubmit: (action: OverrideAction, reasonCode: string, note: string) => void
  disabled?: boolean
  hideEscalate?: boolean
}

export function OverrideControl({ onSubmit, disabled, hideEscalate }: OverrideControlProps) {
  const [pendingAction, setPendingAction] = useState<OverrideAction | null>(null)
  const [reasonCode, setReasonCode] = useState(REASON_CODES[0])
  const [note, setNote] = useState('')

  if (!pendingAction) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="success" onClick={() => setPendingAction('approve')} disabled={disabled}>
          <Check className="h-3.5 w-3.5" /> Approve
        </Button>
        <Button size="sm" variant="danger" onClick={() => setPendingAction('reject')} disabled={disabled}>
          <X className="h-3.5 w-3.5" /> Reject
        </Button>
        {!hideEscalate && (
          <Button size="sm" variant="outline" onClick={() => setPendingAction('escalate')} disabled={disabled}>
            <ArrowUpCircle className="h-3.5 w-3.5" /> Escalate
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 space-y-2.5">
      <div
        className={cn(
          'text-xs font-semibold uppercase tracking-wide',
          pendingAction === 'approve' && 'text-green-700',
          pendingAction === 'reject' && 'text-red-700',
          pendingAction === 'escalate' && 'text-amber-700',
        )}
      >
        {pendingAction} — reason code required
      </div>
      <select
        value={reasonCode}
        onChange={(e) => setReasonCode(e.target.value)}
        className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm"
      >
        {REASON_CODES.map((r) => (
          <option key={r} value={r}>
            {r.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note for the audit record (optional)"
        rows={2}
        className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            onSubmit(pendingAction, reasonCode, note)
            setPendingAction(null)
            setNote('')
          }}
        >
          Confirm {pendingAction}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setPendingAction(null)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
