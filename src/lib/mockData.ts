import type {
  Application,
  ApplicationStage,
  ApplicationStatus,
  DecisionPackage,
  DocumentRecord,
  KpiPoint,
  OverrideRecord,
  ReleaseGate,
  TimelineEvent,
  User,
} from '@/types'
import { uid } from './utils'

export const DEMO_USERS: User[] = [
  {
    id: 'u_customer',
    name: 'Ananya Rao',
    email: 'ananya.rao@example.com',
    role: 'customer',
    title: 'Applicant',
    avatarInitials: 'AR',
  },
  {
    id: 'u_officer',
    name: 'Rohit Malhotra',
    email: 'rohit.malhotra@pinnaclebank.in',
    role: 'loan_officer',
    title: 'Loan Officer, Retail Lending',
    avatarInitials: 'RM',
  },

  {
    id: 'u_executive',
    name: 'Vikram Seth',
    email: 'vikram.seth@pinnaclebank.in',
    role: 'executive',
    title: 'Chief Risk Officer',
    avatarInitials: 'VS',
  },

  {
    id: 'u_admin',
    name: 'Karan Bedi',
    email: 'karan.bedi@pinnaclebank.in',
    role: 'administrator',
    title: 'Platform Administrator',
    avatarInitials: 'KB',
  },
  {
    id: 'u_auditor',
    name: 'Sneha Patel',
    email: 'sneha.patel@pinnaclebank.in',
    role: 'internal_auditor',
    title: 'Internal Auditor',
    avatarInitials: 'SP',
  },
  {
    id: 'u_lead',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@pinnaclebank.in',
    role: 'domain_lead',
    title: 'Domain Lead (Retail)',
    avatarInitials: 'PS',
  },
]

const FIRST_NAMES = ['Ananya', 'Aditya', 'Kavya', 'Rahul', 'Sneha', 'Vikas', 'Divya', 'Arjun', 'Neha', 'Manish', 'Pooja', 'Sanjay', 'Ritu', 'Amit', 'Isha']
const LAST_NAMES = ['Rao', 'Sharma', 'Iyer', 'Gupta', 'Menon', 'Verma', 'Reddy', 'Kapoor', 'Joshi', 'Nair', 'Chatterjee', 'Bose', 'Pillai', 'Agarwal']
const BRANCHES = ['Mumbai BKC', 'Bengaluru MG Road', 'Delhi CP', 'Pune FC Road', 'Chennai Anna Salai', 'Hyderabad Banjara Hills']
const PURPOSES_RETAIL = ['Home Renovation', 'Vehicle Purchase', 'Wedding Expenses', 'Education', 'Debt Consolidation', 'Medical Expenses']
const PURPOSES_SME = ['Working Capital', 'Equipment Purchase', 'Inventory Financing', 'Business Expansion', 'Import Financing']

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(42)
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min
}
function randFloat(min: number, max: number) {
  return min + rand() * (max - min)
}
function daysAgoIso(days: number, hourOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(d.getHours() - hourOffset)
  return d.toISOString()
}

function buildRationale(pillar: DecisionPackage['pillar'], positive: boolean) {
  const bank: Record<string, { label: string; detail: string }[]> = {
    document: [
      { label: 'PAN verification', detail: 'PAN matches applicant name and DOB against NSDL record.' },
      { label: 'Aadhaar OCR confidence', detail: 'Extracted fields cross-checked against demographic XML.' },
      { label: 'Salary slip consistency', detail: 'Last 3 months salary slips show consistent employer and net pay.' },
      { label: 'Document tamper signal', detail: 'No font, metadata, or pixel-level tamper signal detected.' },
    ],
    financial: [
      { label: 'Average monthly inflow', detail: 'AA-derived cashflow over 12 months shows stable inflow pattern.' },
      { label: 'Existing EMI burden', detail: 'Fixed obligation-to-income ratio computed from bureau + AA data.' },
      { label: 'Bounce frequency', detail: 'Bank statement shows low cheque/ECS bounce frequency in trailing 6 months.' },
      { label: 'Bureau score band', detail: 'Bureau score falls within the approved risk band for this product.' },
    ],
    journey: [
      { label: 'Verification sequencing', detail: 'Identity and address verification cleared ahead of underwriting stage.' },
      { label: 'Legal & title check', detail: 'Property/collateral title search returned no encumbrance flags.' },
      { label: 'Sanction readiness', detail: 'All upstream decision packages are within policy tolerance for auto-routing.' },
    ],
    policy: [
      { label: 'Loan-to-value check', detail: 'Requested amount within permitted LTV for this product and segment.' },
      { label: 'Segment policy match', detail: "Applicant segment and value band map to the bank's current autonomy envelope." },
      { label: 'Regulatory exposure limit', detail: 'Aggregate exposure to applicant/group within RBI large-exposure norms.' },
    ],
  }
  const source = bank[pillar]
  const count = randInt(2, 4)
  const shuffled = [...source].sort(() => rand() - 0.5).slice(0, count)
  return shuffled.map((f) => ({
    ...f,
    weight: (positive ? (rand() > 0.15 ? 'positive' : 'neutral') : rand() > 0.4 ? 'negative' : 'neutral') as
      | 'positive'
      | 'negative'
      | 'neutral',
  }))
}

function buildDecisionPackages(stageIndex: number, confidenceSeed: number): DecisionPackage[] {
  const pillars: { key: DecisionPackage['pillar']; title: string; conclusions: string[] }[] = [
    {
      key: 'document',
      title: 'Document Decision Package',
      conclusions: [
        'All submitted documents verified with high confidence; no discrepancies found.',
        'Documents verified; minor formatting inconsistency flagged for review.',
        'Salary slip and bank statement employer name mismatch — flagged for manual check.',
      ],
    },
    {
      key: 'financial',
      title: 'Financial Decision Package',
      conclusions: [
        'Affordability confirmed; FOIR within policy limits with comfortable buffer.',
        'Affordability marginal; FOIR near policy ceiling, recommend standard tenure.',
        'Cashflow volatility detected in AA data; recommend additional income proof.',
      ],
    },
    {
      key: 'journey',
      title: 'Journey Decision Package',
      conclusions: [
        'Proposed path: fast-track verification → auto-underwriting → e-sign sanction.',
        'Proposed path: standard verification → underwriter review → legal → sanction.',
        'Proposed path: enhanced due diligence → underwriter review → committee sanction.',
      ],
    },
    {
      key: 'policy',
      title: 'Policy Outcome',
      conclusions: [
        'Proceed — case within autonomous decisioning envelope.',
        'Route to human review — value band requires officer sign-off.',
        'Route to human review — segment flagged for enhanced scrutiny this quarter.',
      ],
    },
  ]

  return pillars.slice(0, Math.min(stageIndex + 1, 4)).map((p, i) => {
    const confidence = Math.max(0.62, Math.min(0.99, confidenceSeed + randFloat(-0.08, 0.06) - i * 0.01))
    const conclusionIdx = confidence > 0.9 ? 0 : confidence > 0.78 ? 1 : 2
    return {
      id: uid('dp'),
      pillar: p.key,
      title: p.title,
      conclusion: p.conclusions[conclusionIdx],
      confidence: Number(confidence.toFixed(2)),
      modelVersion: `v${1 + (i % 3)}.${randInt(0, 9)}.${randInt(0, 9)}`,
      generatedAt: daysAgoIso(randInt(0, 8), randInt(0, 23)),
      rationale: buildRationale(p.key, confidence > 0.85),
      flags: conclusionIdx === 2 ? ['Requires human review'] : conclusionIdx === 1 ? ['Minor inconsistency'] : [],
    }
  })
}

function maskedIdFor(type: DocumentRecord['type']): string | undefined {
  switch (type) {
    case 'PAN':
      return `XXXXX${randInt(1000, 9999)}X`
    case 'Aadhaar':
      return `XXXX XXXX ${randInt(1000, 9999)}`
    case 'Bank Statement':
      return `A/C XXXXXXXX${randInt(1000, 9999)}`
    case 'Salary Slip':
      return `EMP ID XXXX${randInt(100, 999)}`
    case 'Property Doc':
      return `REG NO XXXXXX${randInt(100, 999)}`
    default:
      return undefined
  }
}

function buildDocuments(): DocumentRecord[] {
  const types: DocumentRecord['type'][] = ['PAN', 'Aadhaar', 'Salary Slip', 'Bank Statement', 'Property Doc']
  return types.map((t) => ({
    id: uid('doc'),
    type: t,
    fileName: `${t.replace(/\s/g, '_').toLowerCase()}_${randInt(1000, 9999)}.pdf`,
    status: rand() > 0.85 ? 'flagged' : 'verified',
    confidence: Number(randFloat(0.8, 0.99).toFixed(2)),
    uploadedAt: daysAgoIso(randInt(1, 9)),
    maskedId: maskedIdFor(t),
  }))
}

function buildTimeline(app: Partial<Application>, createdDaysAgo: number): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: uid('tl'),
      label: 'Application submitted',
      detail: `Application created via ${app.channel === 'customer_self' ? 'customer self-service' : 'loan officer'}.`,
      timestamp: daysAgoIso(createdDaysAgo),
      actor: app.channel === 'customer_self' ? app.applicant!.name : app.assignedOfficerName || 'Loan Officer',
      kind: app.channel === 'customer_self' ? 'customer' : 'human',
    },
    {
      id: uid('tl'),
      label: 'Intake readiness confirmed',
      detail: 'All required documents present; application entered AI pipeline.',
      timestamp: daysAgoIso(createdDaysAgo - 0.2),
      actor: 'Application Intake',
      kind: 'system',
    },
    {
      id: uid('tl'),
      label: 'Document Intelligence completed',
      detail: 'Documents extracted and verified with confidence scoring.',
      timestamp: daysAgoIso(createdDaysAgo - 0.5),
      actor: 'Document Intelligence AI',
      kind: 'ai',
    },
  ]
  if (createdDaysAgo > 1) {
    events.push({
      id: uid('tl'),
      label: 'Financial Intelligence completed',
      detail: 'Cashflow and liability position established via AA framework.',
      timestamp: daysAgoIso(createdDaysAgo - 1),
      actor: 'Financial Intelligence AI',
      kind: 'ai',
    })
  }
  if (createdDaysAgo > 2) {
    events.push({
      id: uid('tl'),
      label: 'Agentic Journey proposed',
      detail: 'Verification, underwriting, and sanction path proposed.',
      timestamp: daysAgoIso(createdDaysAgo - 2),
      actor: 'Agentic Journey AI',
      kind: 'ai',
    })
  }
  return events
}

const STAGES: ApplicationStage[] = [
  'intake',
  'document_intelligence',
  'financial_intelligence',
  'agentic_journey',
  'business_policy',
  'workflow_execution',
  'institutional_memory',
]

function buildApplication(index: number): Application {
  const loanType: Application['loanType'] = rand() > 0.55 ? 'retail' : 'sme'
  const createdDaysAgo = randInt(0, 14)
  const stageIndex = Math.min(STAGES.length - 1, Math.floor(rand() * rand() * STAGES.length * 1.3))
  const stage = STAGES[stageIndex]
  const confidenceSeed = randFloat(0.68, 0.97)
  const outcomeRoll = rand()
  const isDeclined = confidenceSeed < 0.76 && outcomeRoll > 0.7
  const isEscalated = !isDeclined && confidenceSeed < 0.78 && outcomeRoll > 0.5
  const isApproved = stageIndex >= 5 && !isEscalated && !isDeclined
  const status: ApplicationStatus = isDeclined
    ? 'declined'
    : isEscalated
      ? 'escalated'
      : stageIndex >= 6
        ? 'disbursed'
        : stageIndex >= 5
          ? 'approved'
          : stageIndex === 0
            ? 'draft'
            : 'in_review'

  const applicant = {
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    email: `applicant${index}@example.com`,
    phone: `+91 9${randInt(100000000, 999999999)}`,
    panMasked: `${['A', 'B', 'C'][randInt(0, 2)]}XXPX${randInt(1000, 9999)}X`,
  }

  const channel: Application['channel'] = rand() > 0.5 ? 'customer_self' : 'loan_officer'
  const officer = DEMO_USERS.find((u) => u.role === 'loan_officer')!
  const domainLead = DEMO_USERS.find((u) => u.role === 'domain_lead')!

  const partialApp: Partial<Application> = {
    applicant,
    channel,
    assignedOfficerId: officer.id,
    assignedOfficerName: officer.name,
  }

  const amount =
    loanType === 'retail' ? randInt(3, 45) * 100000 : randInt(15, 400) * 100000
  const autonomyEligible = confidenceSeed > 0.74 && amount < 4000000

  const decisionPackages = buildDecisionPackages(stageIndex, confidenceSeed)
  const overrides: OverrideRecord[] = []
  if (isDeclined && decisionPackages.length > 0) {
    const declineReason = pick(['DATA_QUALITY_ISSUE', 'POLICY_EXCEPTION_APPROVED', 'REQUIRES_SENIOR_REVIEW', 'OTHER'])
    decisionPackages.forEach((pkg) => {
      overrides.push({
        id: uid('ov'),
        decisionPackageId: pkg.id,
        actorId: domainLead.id,
        actorName: domainLead.name,
        action: 'reject',
        reasonCode: declineReason,
        note: 'Escalated case reviewed and rejected after domain-lead assessment.',
        timestamp: daysAgoIso(Math.max(0, createdDaysAgo - randInt(0, 2))),
        previousConclusion: pkg.conclusion,
      })
    })
  } else if (decisionPackages.some((d) => d.flags.length) && rand() > 0.4) {
    const flaggedDp = decisionPackages.find((d) => d.flags.length)!
    const action = rand() > 0.5 ? 'approve' : 'edit'
    const reasonCode = pick(['ADDITIONAL_DOC_VERIFIED', 'MANUAL_INCOME_CONFIRMED', 'RELATIONSHIP_MANAGER_VOUCH', 'POLICY_EXCEPTION_APPROVED'])
    const overrideTimestamp = daysAgoIso(randInt(0, createdDaysAgo))
    // Keep the same random draws either way (so the rest of the dataset doesn't shift);
    // only skip pushing the override when the case was autonomy-eligible with no human involved.
    if (!autonomyEligible) {
      overrides.push({
        id: uid('ov'),
        decisionPackageId: flaggedDp.id,
        actorId: officer.id,
        actorName: officer.name,
        action,
        reasonCode,
        note: 'Reviewed supporting documents manually; proceeding with AI-proposed path.',
        timestamp: overrideTimestamp,
        previousConclusion: flaggedDp.conclusion,
      })
    }
  }

  const isCompleted = ['approved', 'declined', 'disbursed'].includes(status)
  // AI-decisioned = no human ever touched a decision package; wraps up in minutes/hours.
  // Anything a human reviewed or overrode takes the usual multi-day cycle.
  const isAiDecisioned = isCompleted && autonomyEligible && overrides.length === 0
  // Auto Approved requires the AI's own confidence to clear a 95% bar — genuinely bump
  // the confidence of this small population so the demo data can actually show it happening.
  if (isAiDecisioned) {
    decisionPackages.forEach((pkg) => {
      pkg.confidence = Number(Math.min(0.99, Math.max(pkg.confidence, 0.96 + randFloat(0, 0.03))).toFixed(2))
    })
  }
  const createdAtMs = Date.now() - createdDaysAgo * 86400000
  const updatedAtMs = isAiDecisioned
    ? createdAtMs + randInt(5, 240) * 60000
    : Date.now() - Math.max(0, createdDaysAgo - randInt(0, 2)) * 86400000

  const timeline = buildTimeline(partialApp, createdDaysAgo)
  if (isDeclined) {
    timeline.push({
      id: uid('tl'),
      label: 'Application declined',
      detail: 'Domain lead rejected the case after reviewing the escalated AI decision packages.',
      timestamp: daysAgoIso(Math.max(0, createdDaysAgo - randInt(0, 2))),
      actor: domainLead.name,
      kind: 'human',
    })
  }

  return {
    id: `APP-${(2000 + index).toString()}`,
    applicant,
    loanType,
    amountRequested: amount,
    purpose: loanType === 'retail' ? pick(PURPOSES_RETAIL) : pick(PURPOSES_SME),
    channel,
    createdBy: channel === 'customer_self' ? applicant.name : officer.name,
    createdAt: new Date(createdAtMs).toISOString(),
    updatedAt: new Date(updatedAtMs).toISOString(),
    stage,
    status,
    priority: isEscalated || isDeclined ? 'urgent' : amount > 2000000 ? 'high' : 'standard',
    assignedOfficerId: officer.id,
    assignedOfficerName: officer.name,
    autonomyEligible,
    documents: buildDocuments(),
    decisionPackages,
    overrides,
    timeline,
    cycleDays: Math.max(1, createdDaysAgo),
    sanctionedAmount: isApproved ? Math.round(amount * randFloat(0.85, 1)) : undefined,
    branch: pick(BRANCHES),
  }
}

export const MOCK_APPLICATIONS: Application[] = Array.from({ length: 42 }, (_, i) => buildApplication(i))

export const MOCK_KPI_TREND: KpiPoint[] = Array.from({ length: 10 }, (_, i) => {
  const week = i + 1
  const progress = i / 9
  return {
    date: `W${week}`,
    retailCycleDays: Number((10 - progress * 7).toFixed(1)),
    smeCycleDays: Number((18 - progress * 11).toFixed(1)),
    docProcessingMins: Number((45 - progress * 40).toFixed(0)),
    stpRate: Number((12 + progress * 26).toFixed(0)),
    nps: Number((progress * 12).toFixed(0)),
    volumeProcessed: Math.round(120 + progress * 340 + randInt(-15, 15)),
  }
})

export const MOCK_RELEASE_GATES: ReleaseGate[] = [
  {
    id: uid('rg'),
    modelName: 'Document Intelligence Model',
    version: 'v2.3.1',
    status: 'production_band',
    expertAgreement: 0.93,
    biasReportUrl: '#',
    rollbackPlan: 'Auto-rollback to v2.2.0 on 2% error-rate burn in 1h window.',
    approvedBy: 'Priya Nair',
  },
  {
    id: uid('rg'),
    modelName: 'Account Aggregator Integration Model',
    version: 'v1.8.0',
    status: 'production_band',
    expertAgreement: 0.92,
    biasReportUrl: '#',
    rollbackPlan: 'Auto-rollback to v1.7.2 on drift signal breach.',
    approvedBy: 'Priya Nair',
  },
  {
    id: uid('rg'),
    modelName: 'Agentic Journey Model',
    version: 'v1.4.0',
    status: 'shadow',
    expertAgreement: 0.89,
    biasReportUrl: '#',
    rollbackPlan: 'Remain in shadow until ≥92% agreement sustained 2 weeks.',
  },
  {
    id: uid('rg'),
    modelName: 'Institutional Memory Model',
    version: 'v1.1.0',
    status: 'pending_review',
    expertAgreement: 0.88,
    biasReportUrl: '#',
    rollbackPlan: 'Pending governance board review.',
  },
]
