import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Sparkles, Cpu, ArrowRight, FileText, Landmark, Bot, BrainCircuit, CheckCircle2, Database, ShieldCheck, Briefcase, Radio, FileStack, TableProperties } from 'lucide-react'

const dataResources = [
  { label: 'Finacle Core Banking', icon: Database, desc: 'Core banking system of record' },
  { label: 'FIS Fraud Watch', icon: ShieldCheck, desc: 'Fraud detection signals' },
  { label: 'Oracle FCCM (AML)', icon: ShieldCheck, desc: 'Anti-money-laundering alerts' },
  { label: 'Salesforce (Wealth)', icon: Briefcase, desc: 'Customer & wealth relationship data' },
  { label: 'Custom Origination System', icon: FileStack, desc: 'Loan application lifecycle data' },
  { label: 'SAS Analytics', icon: TableProperties, desc: 'Risk & portfolio analytics' },
  { label: 'Credit Bureau Feeds', icon: Radio, desc: 'External credit history & scores' },
  { label: 'Account Aggregator (AA)', icon: Landmark, desc: 'Consent-based bank statement & cashflow data' },
  { label: 'KYC Documents', icon: FileText, desc: 'PAN, Aadhaar, salary slips, property docs' },
]

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-2)] text-[var(--ink)]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white/80 px-4 py-5 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 font-bold text-white">P</div>
          <span className="text-sm font-semibold">Pinnacle National Bank</span>
        </div>
        <Link to="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </header>

      <main className="mx-auto flex max-w-7xl flex-1 flex-col items-center px-6 pt-16 text-center">
        <div className="flex max-w-4xl flex-col items-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
            <Sparkles className="h-3.5 w-3.5" /> AI-Driven Loan Origination — POC
          </span>
          <h1 className="text-4xl font-bold tracking-tight leading-tight sm:text-5xl">
            Faster, transparent, <span className="text-navy-600">human-governed</span> lending decisions.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--ink-muted)]">
            Document Intelligence, Account Aggregator integration, an Agentic Journey, and Institutional Memory — working
            together so every application moves faster while every decision stays explainable and auditable.
          </p>
        </div>

        {/* 4 Pillars Section */}
        <div className="mt-24 flex w-full flex-col items-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700">
            <Cpu className="h-3.5 w-3.5" /> 4 CAPABILITY PILLARS
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">AI that serves every dimension of loan origination</h2>
          <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
            Four integrated AI systems, each with its own model, each compounding value over time.
          </p>

          <div className="mt-12 grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Document Intelligence',
                icon: FileText,
                desc: 'Automates KYC verification, income parsing, and financial data extraction — cutting manual entry entirely.',
                features: ['PAN & Aadhaar extraction', 'Bank statement analysis', 'Income verification', 'Fraud detection'],
              },
              {
                title: 'Account Aggregator',
                icon: Landmark,
                desc: 'Direct integration with financial institutions for secure, real-time asset and liability retrieval.',
                features: ['Consent management', 'Real-time data sync', 'Liability profiling', 'Cash flow analysis'],
              },
              {
                title: 'Agentic Workflow',
                icon: Bot,
                desc: 'Orchestrates the entire application lifecycle, routing to human experts only when necessary.',
                features: ['Conversational AI agent', 'Credit rule engine', 'Exception routing', 'Automated decisioning'],
              },
              {
                title: 'Institutional Memory',
                icon: BrainCircuit,
                desc: 'The compounding layer — captures every interaction, identifies patterns, and gets smarter each week.',
                features: ['Decision tracking', 'Pattern extraction', 'Policy calibration', 'Anomaly detection'],
              }
            ].map((pillar, i) => (
              <div key={pillar.title} className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    Pillar {i + 1}
                  </span>
                </div>
                <h3 className="mb-3 text-lg font-semibold tracking-tight">{pillar.title}</h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {pillar.desc}
                </p>
                <ul className="space-y-2.5">
                  {pillar.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[var(--ink-2)]">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Data Resources Section */}
        <div className="mt-24 flex w-full flex-col items-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700">
            <Database className="h-3.5 w-3.5" /> DATA RESOURCES
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Data Resources</h2>
          <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
            The systems and data sources we use to power this platform.
          </p>

          <div className="mt-10 w-full rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
              {dataResources.map((resource) => (
                <div key={resource.label} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                    <resource.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--ink)]">{resource.label}</h4>
                    <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{resource.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-32 flex flex-col items-center pb-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-lg shadow-navy-900/20">
            <Cpu className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to see it live?</h2>
          <p className="mt-4 max-w-2xl text-lg text-[var(--ink-muted)]">
            Sign in as any of the demo personas and explore the full platform
            <br className="hidden sm:block" /> — Customer, Loan Officer, Business Executive, or Admin. All mock data, zero setup.
          </p>
          <div className="mt-8">
            <Link to="/login">
              <Button variant="primary" size="lg" className="rounded-full px-4 sm:px-6 lg:px-8">
                Sign In to Explore <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] bg-white py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 font-bold text-white">P</div>
            <span className="text-lg font-bold">Pinnacle AI</span>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">AI-Driven Loan Origination Platform</p>
          <div className="mt-8 text-xs text-[var(--ink-muted)]">
            Kaara AI Use Case Build Factory · Hypothesis HYP-BK-005 · Confidential POC environment
          </div>
        </div>
      </footer>
    </div>
  )
}
