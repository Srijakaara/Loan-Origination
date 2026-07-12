import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge, stageLabel } from '@/components/shared/StatusBadges'
import { useApplicationStore } from '@/store/applicationStore'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PlusCircle, ArrowRight } from 'lucide-react'

const STAGE_ORDER = [
  'intake',
  'document_intelligence',
  'financial_intelligence',
  'agentic_journey',
  'business_policy',
  'workflow_execution',
  'institutional_memory',
] as const

export default function CustomerDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const applications = useApplicationStore((s) => s.applications).filter(
    (a) => a.applicant.name === currentUser?.name || a.applicant.email === currentUser?.email,
  )

  const active = applications.filter((a) => a.status !== 'declined' && a.status !== 'disbursed')

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${currentUser?.name.split(' ')[0]}`}
        subtitle="Track your loan applications and respond to any pending requests."
        actions={
          <Link to="/customer/new">
            <Button variant="accent">
              <PlusCircle className="h-4 w-4" /> New Application
            </Button>
          </Link>
        }
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {applications.length === 0 && (
          <Card className="p-10 text-center">
            <p className="text-sm text-[var(--ink-2)]">You have no applications yet.</p>
            <Link to="/customer/new" className="mt-4 inline-block">
              <Button variant="accent">Start your first application</Button>
            </Link>
          </Card>
        )}

        {active.map((app) => {
          const stageIdx = STAGE_ORDER.indexOf(app.stage)
          const pct = Math.round(((stageIdx + 1) / STAGE_ORDER.length) * 100)
          return (
            <Card key={app.id}>
              <CardHeader>
                <div className="text-left">
                  <CardTitle>
                    {app.id} · {app.purpose}
                  </CardTitle>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    {app.loanType === 'retail' ? 'Retail Loan' : 'SME Loan'} · {formatCurrency(app.amountRequested)} requested ·
                    Submitted {formatDate(app.createdAt)}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-xs text-[var(--ink-2)]">
                  <span>Current stage: {stageLabel[app.stage]}</span>
                  <span>{pct}% through journey</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <Link to="/customer/applications" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy-800 hover:underline">
                  View details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
