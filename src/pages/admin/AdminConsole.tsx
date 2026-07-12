import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useConfigStore } from '@/store/configStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import type { Role } from '@/types'
import { Users, SlidersHorizontal, ShieldCheck, UserPlus, Info, CheckCircle2, AlertTriangle } from 'lucide-react'

type Tab = 'users' | 'roles' | 'autonomy' | 'gates'

const ALL_ROLES: Role[] = ['customer', 'loan_officer', 'domain_lead', 'executive', 'administrator', 'internal_auditor']

export default function AdminConsole() {
  const [tab, setTab] = useState<Tab>('users')
  const { adminUsers, autonomyConfigs, releaseGates, toggleUserStatus, updateUserRole, addUser, updateAutonomy, approveReleaseGate } =
    useConfigStore()
  const currentUser = useAuthStore((s) => s.currentUser)

  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<Role>('loan_officer')

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return
    addUser({ name: newUserName.trim(), email: newUserEmail.trim(), role: newUserRole })
    setNewUserName('')
    setNewUserEmail('')
    setNewUserRole('loan_officer')
  }

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'users', label: 'Users & Roles', icon: Users },
    { key: 'roles', label: 'Add Roles', icon: UserPlus },
    { key: 'autonomy', label: 'Autonomy Thresholds', icon: SlidersHorizontal },
    { key: 'gates', label: 'Release Gates', icon: ShieldCheck },
  ]

  return (
    <div>
      <PageHeader title="Admin Console" subtitle="Manage roles, autonomy thresholds, and model release gates. No case-level content is accessible here." />

      <div className="flex gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 lg:px-8 pt-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
              tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]',
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {tab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Last Login</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-[var(--ink-muted)]">{u.email}</div>
                        </td>
                        <td className="px-4 py-3 capitalize text-[var(--ink-2)]">{u.role.replaceAll('_', ' ')}</td>
                        <td className="px-4 py-3 text-[var(--ink-muted)]">{formatDateTime(u.lastLogin)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={u.status === 'active' ? 'good' : 'critical'}>{u.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id)}>
                            {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'roles' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add User & Assign Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                  <input
                    className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                    placeholder="Full name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                    placeholder="Email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                  <select
                    className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm capitalize"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r} className="capitalize">
                        {r.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAddUser} className="w-full sm:w-auto">
                    Add user
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Existing Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Current Role</th>
                        <th className="px-4 py-3">Change Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((u) => (
                        <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="px-4 py-3">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-[var(--ink-muted)]">{u.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone="info">{u.role.replaceAll('_', ' ')}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm capitalize"
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                            >
                              {ALL_ROLES.map((r) => (
                                <option key={r} value={r} className="capitalize">
                                  {r.replaceAll('_', ' ')}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'autonomy' && (
          <Card>
            <CardHeader>
              <CardTitle>Autonomy Envelope Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {autonomyConfigs.map((c) => (
                <div key={c.valueBand} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--border)] px-4 py-3">
                  <div className="text-left">
                    <div className="text-sm font-medium capitalize">
                      {c.segment} · {c.valueBand}
                    </div>
                    <div className="text-xs text-[var(--ink-muted)]">
                      Confidence threshold {Math.round(c.confidenceThreshold * 100)}% · Max auto amount {formatCurrency(c.maxAutoAmount)}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={c.autonomyEnabled}
                      onChange={(e) => updateAutonomy(c.valueBand, { autonomyEnabled: e.target.checked })}
                    />
                    Autonomy enabled
                  </label>
                </div>
              ))}
              <p className="pt-2 text-xs text-[var(--ink-muted)]">
                All configuration changes are recorded to the immutable audit stream and visible to the Auditor Console.
              </p>
            </CardContent>
          </Card>
        )}

        {tab === 'gates' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <CardTitle>Model Release Gates</CardTitle>
                <Info
                  className="h-3.5 w-3.5 text-[var(--ink-muted)]"
                >
                  <title>Before a model can make real underwriting decisions, its outputs are checked against cases already decided by senior human underwriters. Model card, bias report, and rollback plan must all be in place before approval.</title>
                </Info>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3 text-center">Model Card</th>
                      <th className="px-4 py-3 text-center">Bias Report</th>
                      <th className="px-4 py-3 text-center">Rollback Plan</th>
                      <th className="px-4 py-3">Gate Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {releaseGates.map((g) => {
                      const biasReportOk = g.status !== 'pending_review'
                      return (
                        <tr key={g.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="px-4 py-3 font-medium">{g.modelName}</td>
                          <td className="px-4 py-3 text-[var(--ink-muted)]">{g.version}</td>
                          <td className="px-4 py-3 text-center">
                            <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {biasReportOk ? (
                              <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="mx-auto h-4 w-4 text-amber-500" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={g.status === 'pending_review' ? 'warning' : 'good'}>
                              {g.status === 'pending_review' ? 'Pending Review' : 'Approved'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {g.status === 'pending_review' && (
                              <Button size="sm" variant="success" onClick={() => approveReleaseGate(g.id, currentUser?.name ?? 'Administrator')}>
                                Approve
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
