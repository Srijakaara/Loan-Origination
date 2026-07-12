import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge, stageLabel } from '@/components/shared/StatusBadges'
import { CaseTimeline } from '@/components/shared/CaseTimeline'
import { DocumentViewer } from '@/components/shared/DocumentViewer'
import { useApplicationStore } from '@/store/applicationStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export default function MyApplications() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const [params] = useSearchParams()
  const highlight = params.get('highlight')
  const applications = useApplicationStore((s) => s.applications).filter(
    (a) => a.applicant.name === currentUser?.name || a.applicant.email === currentUser?.email,
  )
  const [expanded, setExpanded] = useState<string | null>(highlight)

  return (
    <div>
      <PageHeader title="My Applications" subtitle="Full history of your loan applications with Pinnacle National Bank." />
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {applications.length === 0 && <p className="text-sm text-[var(--ink-muted)]">No applications found.</p>}
        {applications.map((app) => {
          const isOpen = expanded === app.id
          return (
            <Card key={app.id} className={cn(app.id === highlight && 'ring-2 ring-orange-500')}>
              <button className="w-full" onClick={() => setExpanded(isOpen ? null : app.id)}>
                <CardHeader className="cursor-pointer">
                  <div className="text-left">
                    <CardTitle>
                      {app.id} · {app.purpose}
                    </CardTitle>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      {formatCurrency(app.amountRequested)} · {stageLabel[app.stage]} · Submitted {formatDate(app.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <ChevronDown className={cn('h-4 w-4 text-[var(--ink-muted)] transition-transform', isOpen && 'rotate-180')} />
                  </div>
                </CardHeader>
              </button>
              {isOpen && (
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">Documents</div>
                    <DocumentViewer documents={app.documents} applicantName={app.applicantName} />
                  </div>
                  <div>
                    <div className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">Status History</div>
                    <CaseTimeline events={app.timeline} />
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
