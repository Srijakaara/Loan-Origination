import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Application, OverrideRecord, TimelineEvent } from '@/types'
import { MOCK_APPLICATIONS } from '@/lib/mockData'
import { uid } from '@/lib/utils'

interface NewApplicationInput {
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  loanType: Application['loanType']
  amountRequested: number
  purpose: string
  channel: Application['channel']
  createdBy: string
  branch: string
}

interface ApplicationState {
  applications: Application[]
  createApplication: (input: NewApplicationInput) => Application
  recordOverride: (
    applicationId: string,
    decisionPackageId: string,
    override: Omit<OverrideRecord, 'id' | 'timestamp' | 'decisionPackageId'>,
  ) => void
  addTimelineEvent: (applicationId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void
  advanceStage: (applicationId: string) => void
  setStatus: (applicationId: string, status: Application['status']) => void
  getById: (id: string) => Application | undefined
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: MOCK_APPLICATIONS,
      createApplication: (input) => {
        const app: Application = {
          id: `APP-${Math.floor(3000 + Math.random() * 900)}`,
          applicant: {
            name: input.applicantName,
            email: input.applicantEmail,
            phone: input.applicantPhone,
            panMasked: 'AXXPX0000X',
          },
          loanType: input.loanType,
          amountRequested: input.amountRequested,
          purpose: input.purpose,
          channel: input.channel,
          createdBy: input.createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stage: 'intake',
          status: 'in_review',
          priority: input.amountRequested > 2000000 ? 'high' : 'standard',
          documents: [],
          decisionPackages: [],
          overrides: [],
          timeline: [
            {
              id: uid('tl'),
              label: 'Application submitted',
              detail: `Application created via ${input.channel === 'customer_self' ? 'customer self-service' : 'loan officer'}.`,
              timestamp: new Date().toISOString(),
              actor: input.createdBy,
              kind: input.channel === 'customer_self' ? 'customer' : 'human',
            },
          ],
          cycleDays: 0,
          branch: input.branch,
          autonomyEligible: false,
        }
        set((s) => ({ applications: [app, ...s.applications] }))
        return app
      },
      recordOverride: (applicationId, decisionPackageId, override) => {
        set((s) => ({
          applications: s.applications.map((a) => {
            if (a.id !== applicationId) return a
            const record: OverrideRecord = {
              ...override,
              id: uid('ov'),
              decisionPackageId,
              timestamp: new Date().toISOString(),
            }
            return {
              ...a,
              overrides: [record, ...a.overrides],
              updatedAt: new Date().toISOString(),
              timeline: [
                {
                  id: uid('tl'),
                  label: `Decision ${override.action}d`,
                  detail: override.note || `${override.action} recorded with reason ${override.reasonCode}.`,
                  timestamp: new Date().toISOString(),
                  actor: override.actorName,
                  kind: 'human' as const,
                },
                ...a.timeline,
              ],
            }
          }),
        }))
      },
      addTimelineEvent: (applicationId, event) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  timeline: [{ ...event, id: uid('tl'), timestamp: new Date().toISOString() }, ...a.timeline],
                }
              : a,
          ),
        }))
      },
      advanceStage: (applicationId) => {
        const stages: Application['stage'][] = [
          'intake',
          'document_intelligence',
          'financial_intelligence',
          'agentic_journey',
          'business_policy',
          'workflow_execution',
          'institutional_memory',
        ]
        set((s) => ({
          applications: s.applications.map((a) => {
            if (a.id !== applicationId) return a
            const idx = stages.indexOf(a.stage)
            const next = stages[Math.min(idx + 1, stages.length - 1)]
            return { ...a, stage: next, updatedAt: new Date().toISOString() }
          }),
        }))
      },
      setStatus: (applicationId, status) => {
        set((s) => ({
          applications: s.applications.map((a) => (a.id === applicationId ? { ...a, status, updatedAt: new Date().toISOString() } : a)),
        }))
      },
      getById: (id) => get().applications.find((a) => a.id === id),
    }),
    // version bumped: Auto Approved now requires >=95% AI confidence
    { name: 'pinnacle-applications', version: 4, migrate: () => ({ applications: MOCK_APPLICATIONS }) },
  ),
)
