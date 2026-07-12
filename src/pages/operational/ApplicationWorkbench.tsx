import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge, PriorityBadge, stageLabel } from '@/components/shared/StatusBadges'
import { DecisionPackageViewer } from '@/components/shared/DecisionPackageViewer'
import { DocumentViewer } from '@/components/shared/DocumentViewer'
import { CaseTimeline } from '@/components/shared/CaseTimeline'
import { ConfidenceIndicator } from '@/components/shared/ConfidenceIndicator'
import { OverrideControl, type OverrideAction } from '@/components/shared/OverrideControl'
import { Button } from '@/components/ui/Button'
import { useApplicationStore } from '@/store/applicationStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function ApplicationWorkbench() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const isDomainLead = currentUser?.role === 'domain_lead'
  const application = useApplicationStore((s) => s.applications.find((a) => a.id === id))
  const recordOverride = useApplicationStore((s) => s.recordOverride)
  const advanceStage = useApplicationStore((s) => s.advanceStage)
  const setStatus = useApplicationStore((s) => s.setStatus)

  if (!application) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-[var(--ink-muted)]">Application not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/operational/queue')}>
          Back to Queue
        </Button>
      </div>
    )
  }

  const isFinalized = application.status === 'approved' || application.status === 'disbursed' || application.status === 'declined'

  const overallConfidence =
    application.decisionPackages.length > 0
      ? application.decisionPackages.reduce((sum, d) => sum + d.confidence, 0) / application.decisionPackages.length
      : 0

  function handleOverallOverride(action: OverrideAction, reasonCode: string, note: string) {
    if (!currentUser || !application || isFinalized) return
    application.decisionPackages.forEach((pkg) => {
      recordOverride(application.id, pkg.id, {
        actorId: currentUser.id,
        actorName: currentUser.name,
        action,
        reasonCode,
        note,
        previousConclusion: pkg.conclusion,
      })
    })
    if (action === 'reject') {
      setStatus(application.id, 'declined')
    } else if (action === 'escalate') {
      setStatus(application.id, 'escalated')
    } else if (action === 'approve') {
      if (application.stage === 'institutional_memory') {
        setStatus(application.id, 'approved')
      } else {
        advanceStage(application.id)
      }
    }
  }

  return (
    <div>
      <PageHeader
        title={`${application.id} — ${application.applicant.name}`}
        subtitle={`${application.loanType === 'retail' ? 'Retail' : 'SME'} · ${application.purpose} · ${formatCurrency(application.amountRequested)} requested`}
        actions={
          <>
            <StatusBadge status={application.status} />
            <PriorityBadge priority={application.priority} />
            <Button variant="outline" size="sm" onClick={() => navigate('/operational/queue')}>
              <ArrowLeft className="h-3.5 w-3.5" /> Queue
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Applicant summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-left text-sm sm:grid-cols-3">
              <div>
                <div className="text-xs text-[var(--ink-muted)]">Applicant</div>
                <div className="font-medium">{application.applicant.name}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--ink-muted)]">PAN</div>
                <div className="font-medium">{application.applicant.panMasked}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--ink-muted)]">Branch</div>
                <div className="font-medium">{application.branch}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--ink-muted)]">Stage</div>
                <div className="font-medium">{stageLabel[application.stage]}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--ink-muted)]">Submitted</div>
                <div className="font-medium">{formatDate(application.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--ink-muted)]">Channel</div>
                <div className="font-medium">{application.channel === 'customer_self' ? 'Customer self-service' : 'Loan Officer'}</div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-left text-sm font-semibold text-[var(--ink)]">AI Decision Packages</h2>
            {isFinalized && (
              <p className="mb-3 text-left text-xs text-[var(--ink-muted)]">
                This application has reached a final status ({application.status}) — decisions are locked. Use Replay to review how each
                package was decided.
              </p>
            )}
            <div className="space-y-4">
              {application.decisionPackages.length === 0 && (
                <p className="text-sm text-[var(--ink-muted)]">No decision packages generated yet — application is still in Intake.</p>
              )}
              {application.decisionPackages.map((pkg) => (
                <DecisionPackageViewer key={pkg.id} pkg={pkg} overrides={application.overrides} />
              ))}
            </div>
          </div>

          {application.decisionPackages.length > 0 && (application.status === 'in_review' || isDomainLead) && (
            <Card>
              <CardHeader>
                <CardTitle>Decision Card</CardTitle>
                <ConfidenceIndicator score={overallConfidence} />
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-left text-xs text-[var(--ink-muted)]">
                  Confidence averaged across all {application.decisionPackages.length} decision packages for this case. Approving, rejecting,
                  or escalating here applies to every pillar at once.
                </p>
                {isFinalized ? (
                  <p className="text-left text-sm text-[var(--ink-2)]">This case is finalized — no further action is possible.</p>
                ) : (
                  <OverrideControl onSubmit={handleOverallOverride} hideEscalate={isDomainLead} />
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentViewer documents={application.documents} applicantName={application.applicantName} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseTimeline events={application.timeline} />
            </CardContent>
          </Card>

          {application.stage !== 'institutional_memory' && !isFinalized && (
            <Button variant="primary" className="w-full" onClick={() => advanceStage(application.id)}>
              Advance to next stage <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
