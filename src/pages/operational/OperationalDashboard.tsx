import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useApplicationStore } from '@/store/applicationStore'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ListChecks } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function OperationalDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const allApplications = useApplicationStore((s) => s.applications)
  const isDomainLead = currentUser?.role === 'domain_lead'

  // Exclude drafts so portfolio metrics match the queue and top-level cards
  const applications = allApplications.filter((a) => a.status !== 'draft')

  const inReview = applications.filter((a) => a.status === 'in_review')
  const escalated = applications.filter((a) => a.status === 'escalated')
  const approvedToday = applications.filter((a) => a.status === 'approved' || a.status === 'disbursed')
  const totalRequested = applications.reduce((sum, a) => sum + a.amountRequested, 0)

  const escalatedRequested = escalated.reduce((sum, a) => sum + a.amountRequested, 0)
  const escalatedUrgent = escalated.filter((a) => a.priority === 'urgent').length
  const escalatedAvgAge = escalated.length ? (escalated.reduce((s, a) => s + a.cycleDays, 0) / escalated.length).toFixed(1) : '0'

  const domainLeadStats = [
    { label: 'Escalated cases', value: escalated.length, icon: AlertTriangle, tone: 'text-red-700', link: '/operational/queue?status=escalated' },
    { label: 'Urgent priority', value: escalatedUrgent, icon: Clock, tone: 'text-orange-600', link: '/operational/queue?status=escalated' },
    { label: 'Value under review', value: formatCurrency(escalatedRequested), icon: ListChecks, tone: 'text-navy-800', link: '/operational/queue?status=escalated' },
    { label: 'Avg. age (days)', value: escalatedAvgAge, icon: CheckCircle2, tone: 'text-green-700', link: '/operational/queue?status=escalated' },
  ]

  const stats = [
    { label: 'Open in queue', value: inReview.length, icon: ListChecks, tone: 'text-navy-800', link: '/operational/queue?status=in_review' },
    { label: 'Escalated / urgent', value: escalated.length, icon: AlertTriangle, tone: 'text-red-700', link: '/operational/queue?status=escalated' },
    { label: 'Approved this cycle', value: approvedToday.length, icon: CheckCircle2, tone: 'text-green-700', link: '/operational/queue?status=approved_all' },
    { label: 'Avg. cycle time', value: `${(applications.reduce((s, a) => s + a.cycleDays, 0) / applications.length).toFixed(1)}d`, icon: Clock, tone: 'text-orange-600', link: '/operational/queue' },
  ]

  return (
    <div>
      <PageHeader
        title={`Good day, ${currentUser?.name.split(' ')[0]}`}
        subtitle={
          isDomainLead
            ? 'Escalated cases needing domain review. Already-decided cases are in Replay.'
            : "Here's what needs your attention today."
        }
        actions={
          <Link to={isDomainLead ? '/operational/queue?status=escalated' : '/operational/queue'}>
            <Button variant="accent">
              {isDomainLead ? 'Review Escalations' : 'Open Queue'} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:p-8 sm:grid-cols-2 lg:grid-cols-4">
        {(isDomainLead ? domainLeadStats : stats).map((s) => (
          <Link key={s.label} to={s.link} className="block transition-transform hover:-translate-y-1">
            <Card className="h-full p-5 text-left hover:border-orange-500/50 hover:shadow-md transition-all">
              <s.icon className={`mb-3 h-5 w-5 ${s.tone}`} />
              <div className="text-2xl font-semibold text-[var(--ink)]">{s.value}</div>
              <div className="mt-1 text-xs text-[var(--ink-muted)]">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className={isDomainLead ? 'px-4 sm:px-6 lg:px-8 pb-8' : 'grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 pb-8 lg:grid-cols-2'}>
        <Card>
          <CardHeader>
            <CardTitle>Escalations requiring review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {escalated.slice(0, 5).map((a) => (
              <Link key={a.id} to={`/operational/workbench/${a.id}`} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5 hover:bg-[var(--surface-2)]">
                <div className="text-left">
                  <div className="text-sm font-medium text-[var(--ink)]">{a.id} · {a.applicant.name}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{formatCurrency(a.amountRequested)} · {a.loanType.toUpperCase()}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--ink-muted)]" />
              </Link>
            ))}
            {escalated.length === 0 && <p className="text-sm text-[var(--ink-muted)]">No escalations right now.</p>}
          </CardContent>
        </Card>

        {!isDomainLead && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-left text-sm">
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--ink-2)]">Total applications</span>
                <span className="font-medium">{applications.length}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--ink-2)]">Total requested value</span>
                <span className="font-medium">{formatCurrency(totalRequested)}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--ink-2)]">Autonomy-eligible</span>
                <span className="font-medium">{applications.filter((a) => a.autonomyEligible).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-2)]">Retail vs SME split</span>
                <span className="font-medium">
                  {applications.filter((a) => a.loanType === 'retail').length} / {applications.filter((a) => a.loanType === 'sme').length}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  )
}
