import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApplicationStore } from '@/store/applicationStore'
import { useAuthStore } from '@/store/authStore'
import type { LoanType } from '@/types'

const PURPOSES: Record<LoanType, string[]> = {
  retail: ['Home Renovation', 'Vehicle Purchase', 'Wedding Expenses', 'Education', 'Debt Consolidation', 'Medical Expenses'],
  sme: ['Working Capital', 'Equipment Purchase', 'Inventory Financing', 'Business Expansion', 'Import Financing'],
}

const BRANCHES = ['Mumbai BKC', 'Bengaluru MG Road', 'Delhi CP', 'Pune FC Road', 'Chennai Anna Salai', 'Hyderabad Banjara Hills']

export default function ApplicationCreate() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const createApplication = useApplicationStore((s) => s.createApplication)
  const navigate = useNavigate()

  const OTHER_PURPOSE = 'Other'

  const [loanType, setLoanType] = useState<LoanType>('retail')
  const [amount, setAmount] = useState(500000)
  const [purpose, setPurpose] = useState(PURPOSES.retail[0])
  const [customPurpose, setCustomPurpose] = useState('')
  const [branch, setBranch] = useState(BRANCHES[0])
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return
    setSubmitting(true)
    setTimeout(() => {
      const app = createApplication({
        applicantName: currentUser.name,
        applicantEmail: currentUser.email,
        applicantPhone: '+91 98765 43210',
        loanType,
        amountRequested: amount,
        purpose: purpose === OTHER_PURPOSE ? customPurpose.trim() : purpose,
        channel: 'customer_self',
        createdBy: currentUser.name,
        branch,
      })
      navigate(`/customer/applications?highlight=${app.id}`)
    }, 500)
  }

  return (
    <div>
      <PageHeader title="New Loan Application" subtitle="Complete the details below. You can upload documents once your application is created." />
      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Loan Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['retail', 'sme'] as LoanType[]).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        setLoanType(t)
                        setPurpose(PURPOSES[t][0])
                        setCustomPurpose('')
                      }}
                      className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                        loanType === t ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-[var(--border)] text-[var(--ink-2)]'
                      }`}
                    >
                      {t === 'retail' ? 'Retail Loan' : 'SME Loan'}
                      {t === 'retail' ? <span className="ml-1 text-xs font-normal text-[var(--ink-muted)]">(Default)</span> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Amount Requested (₹)</label>
                <input
                  type="number"
                  value={amount}
                  min={50000}
                  step={50000}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => {
                    setPurpose(e.target.value)
                    if (e.target.value !== OTHER_PURPOSE) setCustomPurpose('')
                  }}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                >
                  {PURPOSES[loanType].map((p, i) => (
                    <option key={p} value={p}>
                      {p}
                      {i === 0 ? ' (Default)' : ''}
                    </option>
                  ))}
                  <option value={OTHER_PURPOSE}>Other (specify your own)</option>
                </select>
                {purpose === OTHER_PURPOSE && (
                  <input
                    type="text"
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    placeholder="Describe your loan purpose"
                    className="mt-2 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                    required
                  />
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Preferred Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm">
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg bg-navy-50 px-4 py-3 text-xs text-navy-800">
                Once submitted, your application enters Document Intelligence and Financial Intelligence review. You'll be
                notified if any additional documents are required.
              </div>

              <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
