import { useRef, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MOCK_KPI_TREND } from '@/lib/mockData'
import { useApplicationStore } from '@/store/applicationStore'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn, formatCurrency, formatDateTime, formatMinutes } from '@/lib/utils'
import { isAiDecisioned } from '@/lib/applicationInsights'
import { TrendingDown, TrendingUp, Timer, Bot, UserCheck } from 'lucide-react'

const CHART_INK = '#898781'
const GRID = '#e1e0d9'

type PillarChart = 'cycle' | 'stp' | 'nps'

function StatTile({
  label,
  value,
  delta,
  good,
  onClick,
}: {
  label: string
  value: string
  delta: string
  good: boolean
  onClick?: () => void
}) {
  return (
    <Card
      onClick={onClick}
      className={cn('p-5 text-left', onClick && 'cursor-pointer transition-all hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-md')}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[var(--ink)] tabular-nums">{value}</div>
      <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${good ? 'text-green-700' : 'text-red-700'}`}>
        {good ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {delta}
      </div>
    </Card>
  )
}

export default function ExecutiveDashboard() {
  const allApplications = useApplicationStore((s) => s.applications)

  // Exclude drafts so metrics match the active project (queue and operational dashboard)
  const applications = allApplications.filter((a) => a.status !== 'draft')
  const latest = MOCK_KPI_TREND[MOCK_KPI_TREND.length - 1]
  const first = MOCK_KPI_TREND[0]

  const totalDisbursed = applications
    .filter((a) => a.status === 'disbursed' || a.status === 'approved')
    .reduce((sum, a) => sum + (a.sanctionedAmount ?? 0), 0)

  const funnelData = [
    { stage: 'Submitted', count: applications.length },
    { stage: 'Doc Intelligence', count: applications.filter((a) => a.stage !== 'intake').length },
    { stage: 'Financial Intel.', count: applications.filter((a) => !['intake', 'document_intelligence'].includes(a.stage)).length },
    { stage: 'Agentic Journey', count: applications.filter((a) => ['agentic_journey', 'business_policy', 'workflow_execution', 'institutional_memory'].includes(a.stage)).length },
    { stage: 'Sanctioned', count: applications.filter((a) => ['approved', 'disbursed'].includes(a.status)).length },
  ]

  // Status breakdown includes drafts — this is the one view where incomplete/abandoned applications are surfaced
  const statusData = [
    { status: 'Draft', count: allApplications.filter((a) => a.status === 'draft').length },
    { status: 'In Review', count: allApplications.filter((a) => a.status === 'in_review').length },
    { status: 'Escalated', count: allApplications.filter((a) => a.status === 'escalated').length },
    { status: 'Approved (Pending Transfer)', count: allApplications.filter((a) => a.status === 'approved').length },
    { status: 'Disbursed (Money in account)', count: allApplications.filter((a) => a.status === 'disbursed').length },
    { status: 'Declined', count: allApplications.filter((a) => a.status === 'declined').length },
  ]
  const draftCount = statusData[0].count

  // Completed = a final decision has been reached (approved, declined, disbursed).
  // A case is AI-decisioned only if it was autonomy-eligible and no human ever overrode a decision package.
  // AI_SPEED_FACTOR is the assumed ratio of AI-handling time to manual-handling time, used to
  // estimate the "other" side of the comparison (the side that didn't actually happen).
  const AI_SPEED_FACTOR = 0.03
  const completedApplications = applications
    .filter((a) => ['approved', 'declined', 'disbursed'].includes(a.status))
    .map((a) => {
      const aiDecisioned = isAiDecisioned(a)
      const actualMinutes = Math.max(1, (new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime()) / 60000)
      const withAiMinutes = aiDecisioned ? actualMinutes : actualMinutes * AI_SPEED_FACTOR
      const withoutAiMinutes = aiDecisioned ? actualMinutes / AI_SPEED_FACTOR : actualMinutes
      const statusLabel: 'Approved' | 'Rejected' | 'Auto Approved' =
        a.status === 'declined' ? 'Rejected' : aiDecisioned ? 'Auto Approved' : 'Approved'
      return {
        ...a,
        isAiDecisioned: aiDecisioned,
        statusLabel,
        withAiMinutes,
        withoutAiMinutes,
        savedMinutes: withoutAiMinutes - withAiMinutes,
      }
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const autoResolvedCases = completedApplications.filter((a) => a.isAiDecisioned)
  const assistedReviewCases = completedApplications.filter((a) => !a.isAiDecisioned)
  const autoResolvedHours = autoResolvedCases.reduce((sum, a) => sum + a.savedMinutes, 0) / 60
  const assistedReviewHours = assistedReviewCases.reduce((sum, a) => sum + a.savedMinutes, 0) / 60
  const totalSavedHours = autoResolvedHours + assistedReviewHours
  const workingDaysFreed = totalSavedHours / 8

  // Each pillar KPI card can be jumped to and briefly highlighted from its stat tile above
  const chartRefs = {
    cycle: useRef<HTMLDivElement>(null),
    stp: useRef<HTMLDivElement>(null),
    nps: useRef<HTMLDivElement>(null),
  }
  const [highlighted, setHighlighted] = useState<PillarChart | null>(null)

  function goToChart(chart: PillarChart) {
    chartRefs[chart].current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlighted(chart)
    window.setTimeout(() => setHighlighted((h) => (h === chart ? null : h)), 1600)
  }

  const highlightClass = 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20'

  return (
    <div>
      <PageHeader title="Business Executive Dashboard" subtitle="Portfolio-level business outcomes — refreshed hourly. No individual application data is shown here." />

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:p-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Retail disbursement cycle"
          value={`${latest.retailCycleDays}d`}
          delta={`from ${first.retailCycleDays}d baseline`}
          good
          onClick={() => goToChart('cycle')}
        />
        <StatTile
          label="SME disbursement cycle"
          value={`${latest.smeCycleDays}d`}
          delta={`from ${first.smeCycleDays}d baseline`}
          good
          onClick={() => goToChart('cycle')}
        />
        <StatTile
          label="Straight-through processing"
          value={`${latest.stpRate}%`}
          delta={`+${latest.stpRate - first.stpRate}pts vs W1`}
          good
          onClick={() => goToChart('stp')}
        />
        <StatTile label="Customer NPS" value={`+${latest.nps}`} delta="Target: +12 pts by W10" good onClick={() => goToChart('nps')} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-navy-600" />
              <h3 className="text-base font-semibold text-[var(--ink)]">Operator Hours Saved by AI</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" /> Accumulating daily
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <div className="text-4xl font-bold text-[var(--ink)]">
              {totalSavedHours.toFixed(1)}
              <span className="ml-0.5 text-xl font-semibold text-[var(--ink-muted)]">h</span>
            </div>
            <div className="text-sm text-[var(--ink-muted)]">
              saved this period
              <div className="text-sm font-medium text-navy-700">&asymp; {Math.round(workingDaysFreed)} working days freed from manual ops</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-navy-50 p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700">
                <Bot className="h-4 w-4" /> AI Auto-Resolved
              </div>
              <div className="mt-2 text-2xl font-bold text-[var(--ink)]">
                {autoResolvedHours.toFixed(1)}
                <span className="ml-0.5 text-base font-semibold text-[var(--ink-muted)]">h</span>
              </div>
              <p className="mt-1 text-sm text-[var(--ink-2)]">{autoResolvedCases.length} cases &mdash; zero ops involvement</p>
              <p className="mt-1 text-xs font-medium text-navy-700">AI handled end-to-end, no human touch needed</p>
            </div>

            <div className="rounded-xl bg-green-50 p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
                <UserCheck className="h-4 w-4" /> AI-Assisted Review
              </div>
              <div className="mt-2 text-2xl font-bold text-[var(--ink)]">
                {assistedReviewHours.toFixed(1)}
                <span className="ml-0.5 text-base font-semibold text-[var(--ink-muted)]">h</span>
              </div>
              <p className="mt-1 text-sm text-[var(--ink-2)]">{assistedReviewCases.length} cases &mdash; AI prepped, ops signed off</p>
              <p className="mt-1 text-xs font-medium text-green-700">Research &amp; checks done by AI, human gave final call</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed Cases</CardTitle>
            <p className="mt-0.5 text-xs text-[var(--ink-muted)]">Approved, Auto Approved &amp; Rejected — tagged by AI vs. manual completion and time to complete.</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium">Intent</th>
                  <th className="pb-2 pr-4 font-medium">Completed</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">AI / Manual &middot; Time</th>
                </tr>
              </thead>
              <tbody>
                {completedApplications.map((a) => (
                  <tr key={a.id} className="border-t border-[var(--border)]">
                    <td className="py-2.5 pr-4 whitespace-nowrap font-medium text-[var(--ink)]">{a.applicant.name}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-[var(--ink-muted)]">{a.purpose.toLowerCase()}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-[var(--ink-muted)]">{formatDateTime(a.updatedAt)}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <Badge tone={a.statusLabel === 'Rejected' ? 'critical' : a.statusLabel === 'Auto Approved' ? 'info' : 'good'}>
                        {a.statusLabel}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-4">
                      {a.statusLabel === 'Auto Approved' ? (
                        <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-800 whitespace-nowrap">
                          AI &middot; {formatMinutes(a.withAiMinutes)}
                        </span>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-800 whitespace-nowrap">
                              With AI &middot; {formatMinutes(a.withAiMinutes)}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-[var(--ink)] px-2.5 py-0.5 text-xs font-medium text-white whitespace-nowrap">
                              Without AI &middot; {formatMinutes(a.withoutAiMinutes)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-medium text-green-700">Saved {formatMinutes(a.savedMinutes)}</div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {completedApplications.length === 0 && (
                  <tr>
                    <td className="py-4 text-[var(--ink-muted)]" colSpan={5}>No completed cases yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 pb-6 lg:grid-cols-2">
        <Card ref={chartRefs.cycle} className={cn('scroll-mt-6 transition-shadow', highlighted === 'cycle' && highlightClass)}>
          <CardHeader>
            <div>
              <CardTitle>Disbursement cycle trend (days)</CardTitle>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">Pillar: Agentic Workflow — orchestrates the end-to-end journey</p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MOCK_KPI_TREND} margin={{ left: -20 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${GRID}` }} />
                <Line type="monotone" dataKey="retailCycleDays" name="Retail" stroke="#2a78d6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="smeCycleDays" name="SME" stroke="#eda100" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card ref={chartRefs.stp} className={cn('scroll-mt-6 transition-shadow', highlighted === 'stp' && highlightClass)}>
          <CardHeader>
            <div>
              <CardTitle>Straight-through-processing rate</CardTitle>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">Pillar: Institutional Memory — compounding automation over time</p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={MOCK_KPI_TREND} margin={{ left: -20 }}>
                <defs>
                  <linearGradient id="stpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1baf7a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1baf7a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${GRID}` }} />
                <Area type="monotone" dataKey="stpRate" name="STP Rate" stroke="#1baf7a" fill="url(#stpFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 pb-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Processing funnel (current portfolio)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${GRID}` }} />
                <Bar dataKey="count" fill="#2a78d6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card ref={chartRefs.nps} className={cn('scroll-mt-6 transition-shadow', highlighted === 'nps' && highlightClass)}>
          <CardHeader>
            <div>
              <CardTitle>Customer NPS trend</CardTitle>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">Pillar: Document Intelligence + Account Aggregator — faster, friction-free experience</p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MOCK_KPI_TREND} margin={{ left: -20 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${GRID}` }} />
                <Line type="monotone" dataKey="nps" name="NPS" stroke="#4a3aa7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 pb-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document processing time (minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MOCK_KPI_TREND} margin={{ left: -20 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${GRID}` }} />
                <Line type="monotone" dataKey="docProcessingMins" name="Minutes" stroke="#e34948" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 12, fill: CHART_INK }} axisLine={false} tickLine={false} width={170} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${GRID}` }} />
                <Bar dataKey="count" fill="#4a3aa7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 pb-10 lg:grid-cols-2">
        <Card className="p-5 text-left">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Draft applications (not yet submitted)</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{draftCount}</div>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            Started by a customer or officer but not yet entered the AI pipeline. Excluded from every other metric on this page.
          </p>
        </Card>

        <Card className="p-5 text-left">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Total sanctioned value (current portfolio)</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--ink)]">{formatCurrency(totalDisbursed)}</div>
        </Card>
      </div>
    </div>
  )
}
