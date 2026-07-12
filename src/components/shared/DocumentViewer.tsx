import { useState } from 'react'
import type { DocumentRecord } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import { DocumentMockPreview } from './DocumentMockPreview'
import { FileText, X, ShieldCheck } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

export function DocumentViewer({ documents, applicantName = 'Applicant' }: { documents: DocumentRecord[]; applicantName?: string }) {
  const [selected, setSelected] = useState<DocumentRecord | null>(null)

  if (documents.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No documents uploaded yet.</p>
  }

  return (
    <div className="space-y-2">
      {documents.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => setSelected(d)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2.5 text-left transition-colors hover:border-navy-300 hover:bg-[var(--surface-hover,_#f8fafc)]"
        >
          <div className="flex items-center gap-3 text-left">
            <FileText className="h-4 w-4 shrink-0 text-navy-800" />
            <div>
              <div className="text-sm font-medium text-[var(--ink)]">{d.type}</div>
              <div className="text-xs text-[var(--ink-muted)]">
                {d.fileName} · uploaded {formatDate(d.uploadedAt)}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ConfidenceIndicator score={d.confidence} />
            <Badge tone={d.status === 'verified' ? 'good' : d.status === 'flagged' ? 'warning' : 'neutral'}>{d.status}</Badge>
          </div>
        </button>
      ))}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-[var(--surface,_#fff)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[var(--ink)]">{selected.type}</div>
                <div className="text-xs text-[var(--ink-muted)]">{selected.fileName}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md p-1 text-[var(--ink-muted)] hover:bg-[var(--border)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <DocumentMockPreview doc={selected} applicantName={applicantName} />
            </div>

            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Full number is masked for every user, including administrators. Only the last few digits are shown, as above.</span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
              <dt className="text-[var(--ink-muted)]">Status</dt>
              <dd className="text-right">
                <Badge tone={selected.status === 'verified' ? 'good' : selected.status === 'flagged' ? 'warning' : 'neutral'}>
                  {selected.status}
                </Badge>
              </dd>
              <dt className="text-[var(--ink-muted)]">Extraction confidence</dt>
              <dd className="text-right text-[var(--ink)]">{Math.round(selected.confidence * 100)}%</dd>
              <dt className="text-[var(--ink-muted)]">Uploaded</dt>
              <dd className="text-right text-[var(--ink)]">{formatDateTime(selected.uploadedAt)}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
