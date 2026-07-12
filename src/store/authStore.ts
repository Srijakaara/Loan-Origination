import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, User } from '@/types'
import { DEMO_USERS } from '@/lib/mockData'

interface AuthState {
  currentUser: User | null
  loginAs: (role: Role) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      loginAs: (role) => {
        const user = DEMO_USERS.find((u) => u.role === role) ?? null
        set({ currentUser: user })
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: 'pinnacle-auth' },
  ),
)
