import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser, AutonomyConfig, Role } from '@/types'
import { DEMO_USERS, MOCK_RELEASE_GATES } from '@/lib/mockData'

interface ConfigState {
  autonomyConfigs: AutonomyConfig[]
  adminUsers: AdminUser[]
  releaseGates: typeof MOCK_RELEASE_GATES
  updateAutonomy: (valueBand: string, patch: Partial<AutonomyConfig>) => void
  toggleUserStatus: (userId: string) => void
  updateUserRole: (userId: string, role: Role) => void
  addUser: (user: { name: string; email: string; role: Role }) => void
  approveReleaseGate: (gateId: string, approver: string) => void
}

const initialAutonomy: AutonomyConfig[] = [
  { segment: 'retail', valueBand: '< ₹15L', autonomyEnabled: true, confidenceThreshold: 0.9, maxAutoAmount: 1500000 },
  { segment: 'retail', valueBand: '₹15L - ₹45L', autonomyEnabled: false, confidenceThreshold: 0.95, maxAutoAmount: 4500000 },
  { segment: 'sme', valueBand: '< ₹50L', autonomyEnabled: true, confidenceThreshold: 0.92, maxAutoAmount: 5000000 },
  { segment: 'sme', valueBand: '> ₹50L', autonomyEnabled: false, confidenceThreshold: 0.97, maxAutoAmount: 40000000 },
]

const initialAdminUsers: AdminUser[] = DEMO_USERS.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: 'active',
  lastLogin: new Date().toISOString(),
}))

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      autonomyConfigs: initialAutonomy,
      adminUsers: initialAdminUsers,
      releaseGates: MOCK_RELEASE_GATES,
      updateAutonomy: (valueBand, patch) =>
        set((s) => ({
          autonomyConfigs: s.autonomyConfigs.map((c) => (c.valueBand === valueBand ? { ...c, ...patch } : c)),
        })),
      toggleUserStatus: (userId) =>
        set((s) => ({
          adminUsers: s.adminUsers.map((u) =>
            u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u,
          ),
        })),
      updateUserRole: (userId, role) =>
        set((s) => ({
          adminUsers: s.adminUsers.map((u) => (u.id === userId ? { ...u, role } : u)),
        })),
      addUser: (user) =>
        set((s) => ({
          adminUsers: [
            ...s.adminUsers,
            {
              id: `usr-${Date.now()}`,
              name: user.name,
              email: user.email,
              role: user.role,
              status: 'active',
              lastLogin: new Date().toISOString(),
            },
          ],
        })),
      approveReleaseGate: (gateId, approver) =>
        set((s) => ({
          releaseGates: s.releaseGates.map((g) =>
            g.id === gateId ? { ...g, status: 'production_band', approvedBy: approver } : g,
          ),
        })),
    }),
    { name: 'pinnacle-config' },
  ),
)
