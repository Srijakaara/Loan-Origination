export type Role =
  | 'customer'
  | 'loan_officer'
  | 'domain_lead'
  | 'executive'
  | 'administrator'
  | 'internal_auditor'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  title: string
  avatarInitials: string
}

export type LoanType = 'retail' | 'sme'

export type ApplicationStage =
  | 'intake'
  | 'document_intelligence'
  | 'financial_intelligence'
  | 'agentic_journey'
  | 'business_policy'
  | 'workflow_execution'
  | 'institutional_memory'

export type ApplicationStatus =
  | 'draft'
  | 'in_review'
  | 'pending_customer'
  | 'escalated'
  | 'approved'
  | 'declined'
  | 'disbursed'

export type ConfidenceBand = 'high' | 'medium' | 'low'

export function confidenceBand(score: number): ConfidenceBand {
  if (score >= 0.9) return 'high'
  if (score >= 0.75) return 'medium'
  return 'low'
}

export interface RationaleFactor {
  label: string
  detail: string
  weight: 'positive' | 'negative' | 'neutral'
}

export interface DecisionPackage {
  id: string
  pillar: 'document' | 'financial' | 'journey' | 'policy'
  title: string
  conclusion: string
  confidence: number
  modelVersion: string
  generatedAt: string
  rationale: RationaleFactor[]
  flags: string[]
}

export interface OverrideRecord {
  id: string
  decisionPackageId: string
  actorId: string
  actorName: string
  action: 'approve' | 'edit' | 'reject' | 'escalate'
  reasonCode: string
  note: string
  timestamp: string
  previousConclusion: string
  newConclusion?: string
}

export interface DocumentRecord {
  id: string
  type: 'PAN' | 'Aadhaar' | 'Salary Slip' | 'Bank Statement' | 'Property Doc'
  fileName: string
  status: 'verified' | 'flagged' | 'pending'
  confidence: number
  uploadedAt: string
  /** Masked/tokenized identifier shown in place of the real sensitive number, e.g. "XXXX XXXX 1234". Same for every viewer regardless of role. */
  maskedId?: string
}

export interface TimelineEvent {
  id: string
  label: string
  detail: string
  timestamp: string
  actor: string
  kind: 'system' | 'ai' | 'human' | 'customer'
}

export interface Applicant {
  name: string
  email: string
  phone: string
  panMasked: string
}

export interface Application {
  id: string
  applicant: Applicant
  loanType: LoanType
  amountRequested: number
  purpose: string
  channel: 'customer_self' | 'loan_officer'
  createdBy: string
  createdAt: string
  updatedAt: string
  stage: ApplicationStage
  status: ApplicationStatus
  priority: 'standard' | 'high' | 'urgent'
  assignedOfficerId?: string
  assignedOfficerName?: string
  autonomyEligible: boolean
  documents: DocumentRecord[]
  decisionPackages: DecisionPackage[]
  overrides: OverrideRecord[]
  timeline: TimelineEvent[]
  cycleDays: number
  sanctionedAmount?: number
  branch: string
}

export interface KpiPoint {
  date: string
  retailCycleDays: number
  smeCycleDays: number
  docProcessingMins: number
  stpRate: number
  nps: number
  volumeProcessed: number
}

export interface AutonomyConfig {
  segment: LoanType
  valueBand: string
  autonomyEnabled: boolean
  confidenceThreshold: number
  maxAutoAmount: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'suspended'
  lastLogin: string
}

export interface ReleaseGate {
  id: string
  modelName: string
  version: string
  status: 'shadow' | 'production_band' | 'pending_review'
  expertAgreement: number
  biasReportUrl: string
  rollbackPlan: string
  approvedBy?: string
}
