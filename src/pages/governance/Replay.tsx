import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge, stageLabel } from '@/components/shared/StatusBadges'
import { DecisionPackageViewer } from '@/components/shared/DecisionPackageViewer'
import { CaseTimeline } from '@/components/shared/CaseTimeline'
import { DocumentViewer } from '@/components/shared/DocumentViewer'
import { useApplicationStore } from '@/store/applicationStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, ShieldCheck } from 'lucide-react'

export default function Replay() {
  const [params] = useSearchParams()
  const allApplications = useApplicationStore((s) => s.applications)
  const [query, setQuery] = useState(params.get('id') ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(params.get('id'))

  // In-review cases are still live/undecided — Replay only reconstructs cases with a settled outcome
  const applications = allApplications.filter((a) => a.status !== 'in_review')

  const matches = query
    ? applications.filter((a) => a.id.toLowerCase().includes(query.toLowerCase()) || a.applicant.name.toLowerCase().includes(query.toLowerCase()))
    : applications.slice(0, 8)

  const selected = applications.find((a) => a.id === selectedId)

  return (
    <div>
      <PageHeader title="Replay" subtitle="Reconstruct exactly what happened on any application — inputs, AI rationale, model version, and every human override." />

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID or applicant"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            {matches.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedId === a.id ? 'border-orange-500 bg-orange-50' : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <div className="font-medium text-[var(--ink)]">{a.id}</div>
                <div className="text-xs text-[var(--ink-muted)]">{a.applicant.name} · {stageLabel[a.stage]}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          {!selected && (
            <Card className="p-10 text-center">
              <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-navy-800" />
              <p className="text-sm text-[var(--ink-muted)]">Select a case from the list to replay its full history.</p>
            </Card>
          )}
          {selected && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selected.id} — {selected.applicant.name}
                  </CardTitle>
                  <StatusBadge status={selected.status} />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-left text-sm sm:grid-cols-4">
                  <div>
                    <div className="text-xs text-[var(--ink-muted)]">Amount</div>
                    <div className="font-medium">{formatCurrency(selected.amountRequested)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--ink-muted)]">Loan Type</div>
                    <div className="font-medium capitalize">{selected.loanType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--ink-muted)]">Submitted</div>
                    <div className="font-medium">{formatDate(selected.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--ink-muted)]">Officer</div>
                    <div className="font-medium">{selected.assignedOfficerName ?? '—'}</div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="mb-3 text-left text-sm font-semibold text-[var(--ink)]">Decision Packages (as decided)</h3>
                <div className="space-y-4">
                  {selected.decisionPackages.map((pkg) => (
                    <DecisionPackageViewer key={pkg.id} pkg={pkg} overrides={selected.overrides} />
                  ))}
                  {selected.decisionPackages.length === 0 && <p className="text-sm text-[var(--ink-muted)]">No AI decisions recorded yet for this case.</p>}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Documents at time of decision</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentViewer documents={selected.documents} applicantName={selected.applicant.name} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Full Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <CaseTimeline events={selected.timeline} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
