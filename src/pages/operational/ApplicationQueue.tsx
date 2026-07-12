import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge, PriorityBadge, stageLabel } from '@/components/shared/StatusBadges'
import { ConfidenceBar } from '@/components/shared/ConfidenceBar'
import { Badge } from '@/components/ui/Badge'
import { useApplicationStore } from '@/store/applicationStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { isAiDecisioned, averageConfidence } from '@/lib/applicationInsights'
import { Search } from 'lucide-react'

type SortKey = 'age' | 'priority' | 'amount'

export default function ApplicationQueue() {
  const applications = useApplicationStore((s) => s.applications)
  const currentUser = useAuthStore((s) => s.currentUser)
  const isDomainLead = currentUser?.role === 'domain_lead'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(isDomainLead ? 'escalated' : searchParams.get('status') || 'all')
  const [sortKey, setSortKey] = useState<SortKey>('priority')

  useEffect(() => {
    if (isDomainLead) return
    const status = searchParams.get('status')
    if (status) {
      setStatusFilter(status)
    }
  }, [searchParams, isDomainLead])

  const filtered = useMemo(() => {
    let list = applications.filter((a) => a.status !== 'draft')

    if (isDomainLead) {
      list = list.filter((a) => a.status === 'escalated')
    } else if (statusFilter === 'approved_all') {
      list = list.filter((a) => a.status === 'approved' || a.status === 'disbursed')
    } else if (statusFilter === 'auto_approved') {
      list = list.filter((a) => (a.status === 'approved' || a.status === 'disbursed') && isAiDecisioned(a))
    } else if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => a.id.toLowerCase().includes(q) || a.applicant.name.toLowerCase().includes(q))
    }
    const priorityRank = { urgent: 0, high: 1, standard: 2 }
    return [...list].sort((a, b) => {
      if (sortKey === 'priority') return priorityRank[a.priority] - priorityRank[b.priority]
      if (sortKey === 'amount') return b.amountRequested - a.amountRequested
      return b.cycleDays - a.cycleDays
    })
  }, [applications, search, statusFilter, sortKey])

  return (
    <div>
      <PageHeader
        title={isDomainLead ? 'Escalated Cases' : 'Application Queue'}
        subtitle={
          isDomainLead
            ? 'Cases escalated for domain review — resolve here; already-decided cases live in Replay.'
            : 'Prioritized worklist — sort, filter, and open a case into the Workbench.'
        }
      />

      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or applicant"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm"
          />
        </div>
        {!isDomainLead && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm sm:w-auto">
            <option value="all">All statuses</option>
            <option value="in_review">In Review</option>
            <option value="escalated">Escalated</option>
            <option value="approved_all">Approved / Disbursed</option>
            <option value="auto_approved">Auto Approved (AI)</option>
            <option value="approved">Approved (Pending Transfer)</option>
            <option value="disbursed">Disbursed (Money in account)</option>
            <option value="declined">Declined</option>
          </select>
        )}
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm sm:w-auto">
          <option value="priority">Sort: Priority</option>
          <option value="age">Sort: Age</option>
          <option value="amount">Sort: Amount</option>
        </select>
        <span className="text-xs text-[var(--ink-muted)] sm:ml-auto">{filtered.length} cases</span>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Age</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => navigate(`/operational/workbench/${a.id}`)}
                  className="cursor-pointer border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--ink)]">{a.id}</td>
                  <td className="px-4 py-3 text-[var(--ink-2)]">{a.applicant.name}</td>
                  <td className="px-4 py-3 text-[var(--ink-2)]">{stageLabel[a.stage]}</td>
                  <td className="px-4 py-3 text-[var(--ink-2)]">{formatCurrency(a.amountRequested)}</td>
                  <td className="px-4 py-3">
                    <ConfidenceBar score={averageConfidence(a)} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={a.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {(a.status === 'approved' || a.status === 'disbursed') && isAiDecisioned(a) ? (
                      <Badge tone="info">Auto Approved</Badge>
                    ) : (
                      <StatusBadge status={a.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">{timeAgo(a.updatedAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[var(--ink-muted)]">
                    No matching applications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
