import type { DocumentRecord } from '@/types'
import { ShieldCheck, Landmark, User2, QrCode } from 'lucide-react'

/**
 * Renders a stand-in visual for the uploaded document — styled to look like the
 * real document layout so reviewers have something concrete to look at, while every
 * sensitive number on it is pre-masked (never the real value, for any viewer/role).
 */
export function DocumentMockPreview({ doc, applicantName }: { doc: DocumentRecord; applicantName: string }) {
  const masked = doc.maskedId ?? 'XXXXXXXXXX'

  switch (doc.type) {
    case 'PAN':
      return (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-white">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide">INCOME TAX DEPARTMENT · GOVT. OF INDIA</span>
          </div>
          <div className="flex gap-4 bg-white px-4 py-4">
            <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded bg-slate-100">
              <User2 className="h-7 w-7 text-slate-400" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Name</div>
              <div className="text-sm font-medium text-slate-800">{applicantName}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Permanent Account Number</div>
              <div className="font-mono text-sm font-semibold tracking-wider text-slate-800">{masked}</div>
            </div>
          </div>
        </div>
      )

    case 'Aadhaar':
      return (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 px-4 py-2 text-white">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide">GOVERNMENT OF INDIA · AADHAAR</span>
          </div>
          <div className="flex gap-4 bg-white px-4 py-4">
            <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded bg-slate-100">
              <User2 className="h-7 w-7 text-slate-400" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Name</div>
              <div className="text-sm font-medium text-slate-800">{applicantName}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Aadhaar Number</div>
              <div className="font-mono text-sm font-semibold tracking-wider text-slate-800">{masked}</div>
            </div>
            <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded bg-slate-100">
              <QrCode className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        </div>
      )

    case 'Bank Statement':
      return (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 bg-navy-800 px-4 py-2 text-white">
            <Landmark className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide">ACCOUNT STATEMENT</span>
          </div>
          <div className="space-y-2 bg-white px-4 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Holder</span>
              <span className="font-medium text-slate-800">{applicantName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Number</span>
              <span className="font-mono font-semibold text-slate-800">{masked}</span>
            </div>
            <div className="mt-2 space-y-1.5 border-t border-dashed border-slate-200 pt-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-2 w-28 rounded-full bg-slate-200" />
                  <div className="h-2 w-12 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'Salary Slip':
      return (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] shadow-sm">
          <div className="bg-slate-700 px-4 py-2 text-white">
            <span className="text-xs font-semibold tracking-wide">PAYSLIP</span>
          </div>
          <div className="space-y-2 bg-white px-4 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Employee Name</span>
              <span className="font-medium text-slate-800">{applicantName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Employee ID</span>
              <span className="font-mono font-semibold text-slate-800">{masked}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Net Pay</span>
              <div className="h-2.5 w-16 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      )

    case 'Property Doc':
    default:
      return (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] shadow-sm">
          <div className="bg-emerald-700 px-4 py-2 text-white">
            <span className="text-xs font-semibold tracking-wide">PROPERTY REGISTRATION DOCUMENT</span>
          </div>
          <div className="space-y-2 bg-white px-4 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Owner Name</span>
              <span className="font-medium text-slate-800">{applicantName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Registration No.</span>
              <span className="font-mono font-semibold text-slate-800">{masked}</span>
            </div>
          </div>
        </div>
      )
  }
}
