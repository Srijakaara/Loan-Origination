import { Sparkles, ArrowRightCircle, XCircle, CheckCircle2 } from 'lucide-react'

export function TransformationBanner() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6 text-center">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700">
          <ArrowRightCircle className="h-3.5 w-3.5" /> THE TRANSFORMATION
        </span>
        <h2 className="text-2xl font-bold text-[var(--ink)]">From manual queues to intelligent workflows</h2>
        <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">
          See exactly how Pinnacle AI reshapes the economics and speed of lending.
        </p>

        <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {/* Before AI */}
          <div className="flex flex-col rounded-2xl border border-red-200 bg-red-50 p-6 text-left transition-transform hover:-translate-y-1">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-red-900">Before AI (Legacy)</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Manual data entry and stare-and-compare document review.',
                'Average cycle time of 14–21 days.',
                'Opaque decisions trapped in PDFs and email threads.',
                'Loan Officers spend 70% of their day doing administrative tasks.',
                'Every new application is processed from scratch.'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-red-800">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After AI */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-green-200 bg-green-50 p-6 text-left transition-transform hover:-translate-y-1">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-200/50 blur-3xl" />
            <div className="relative z-10 mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-green-900">After Pinnacle AI</h3>
            </div>
            <ul className="relative z-10 space-y-4">
              {[
                'Instant extraction of KYC and financials with visible confidence scores.',
                'Average cycle time reduced to 6.3 days.',
                '100% explainable decisions, permanently replayable for audit.',
                'Loan Officers spend 90% of their day on complex judgment calls.',
                'Institutional Memory compounds — the platform learns from every case.'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-green-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
