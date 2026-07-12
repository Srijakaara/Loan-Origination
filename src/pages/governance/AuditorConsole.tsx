import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge, stageLabel } from '@/components/shared/StatusBadges'
import { useApplicationStore } from '@/store/applicationStore'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Search, FileSearch } from 'lucide-react'

type CardFilter = 'all' | 'overrides'

export default function AuditorConsole() {
  const allApplications = useApplicationStore((s) => s.applications)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [cardFilter, setCardFilter] = useState<CardFilter>('all')
  const overrideOnly = cardFilter === 'overrides'

  // Drafts were never submitted and in-review cases are still live/undecided —
  // audit history only covers cases that reached a settled outcome
  const applications = useMemo(() => allApplications.filter((a) => a.status !== 'in_review' && a.status !== 'draft'), [allApplications])

  const filtered = useMemo(() => {
    let list = applications
    if (overrideOnly) list = list.filter((a) => a.overrides.length > 0)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((a) => a.id.toLowerCase().includes(q) || a.applicant.name.toLowerCase().includes(q))
    }
    return list
  }, [applications, query, overrideOnly])

  const scrollToTable = () => {
    document.getElementById('history-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const totalOverrides = applications.reduce((s, a) => s + a.overrides.length, 0)

  return (
    <div>
      <PageHeader title="Auditor Console" subtitle="Independent, searchable entry point into the full historical record. Open any case in Replay." />

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:p-8 sm:grid-cols-2">
        <Card
          className={cn(
            'cursor-pointer p-5 text-left transition-all hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-md',
            cardFilter === 'all' && 'border-orange-500 ring-1 ring-orange-500 bg-orange-50',
          )}
          onClick={() => {
            setCardFilter('all')
            scrollToTable()
          }}
        >
          <div className="text-2xl font-semibold text-[var(--ink)]">{applications.length}</div>
          <div className="mt-1 text-xs text-[var(--ink-muted)]">Total applications on record</div>
        </Card>
        <Card
          className={cn(
            'cursor-pointer p-5 text-left transition-all hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-md',
            cardFilter === 'overrides' && 'border-orange-500 ring-1 ring-orange-500 bg-orange-50',
          )}
          onClick={() => {
            setCardFilter('overrides')
            scrollToTable()
          }}
        >
          <div className="text-2xl font-semibold text-[var(--ink)]">{totalOverrides}</div>
          <div className="mt-1 text-xs text-[var(--ink-muted)]">Human overrides captured</div>
        </Card>
      </div>

      <div id="history-table" className="px-4 sm:px-6 lg:px-8 scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Search the historical record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID or applicant name"
                  className="w-72 rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
                <input type="checkbox" checked={overrideOnly} onChange={(e) => setCardFilter(e.target.checked ? 'overrides' : 'all')} />
                Has overrides
              </label>
              {cardFilter !== 'all' && (
                <button
                  onClick={() => setCardFilter('all')}
                  className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600 hover:bg-orange-100"
                >
                  Has overrides <X className="h-3 w-3" />
                </button>
              )}
              <span className="ml-auto text-xs text-[var(--ink-muted)]">{filtered.length} results</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                    <th className="px-4 py-3">Application</th>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Overrides</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 30).map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => navigate(`/governance/replay?id=${a.id}`)}
                      className="cursor-pointer border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
                    >
                      <td className="px-4 py-3 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <FileSearch className="h-3.5 w-3.5 text-[var(--ink-muted)]" /> {a.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-2)]">{a.applicant.name}</td>
                      <td className="px-4 py-3 text-[var(--ink-2)]">{stageLabel[a.stage]}</td>
                      <td className="px-4 py-3 text-[var(--ink-2)]">{formatCurrency(a.amountRequested)}</td>
                      <td className="px-4 py-3 text-[var(--ink-2)]">{a.overrides.length}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-muted)]">{formatDate(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
