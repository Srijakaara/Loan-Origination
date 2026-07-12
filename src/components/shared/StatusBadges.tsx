import type { Application } from '@/types'
import { Badge } from '@/components/ui/Badge'

const statusTone: Record<Application['status'], 'neutral' | 'good' | 'warning' | 'critical' | 'info'> = {
  draft: 'neutral',
  in_review: 'info',
  pending_customer: 'warning',
  escalated: 'critical',
  approved: 'good',
  declined: 'critical',
  disbursed: 'good',
}

const statusLabel: Record<Application['status'], string> = {
  draft: 'Draft',
  in_review: 'In Review',
  pending_customer: 'Pending Customer',
  escalated: 'Escalated',
  approved: 'Approved',
  declined: 'Declined',
  disbursed: 'Disbursed',
}

export function StatusBadge({ status }: { status: Application['status'] }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
}

const priorityTone: Record<Application['priority'], 'neutral' | 'warning' | 'critical'> = {
  standard: 'neutral',
  high: 'warning',
  urgent: 'critical',
}

export function PriorityBadge({ priority }: { priority: Application['priority'] }) {
  return <Badge tone={priorityTone[priority]}>{priority}</Badge>
}

const stageLabel: Record<Application['stage'], string> = {
  intake: 'Intake',
  document_intelligence: 'Document Intelligence',
  financial_intelligence: 'Financial Intelligence',
  agentic_journey: 'Agentic Journey',
  business_policy: 'Business Policy',
  workflow_execution: 'Workflow Execution',
  institutional_memory: 'Institutional Memory',
}

export function StageBadge({ stage }: { stage: Application['stage'] }) {
  return <Badge tone="info">{stageLabel[stage]}</Badge>
}

export { stageLabel }
