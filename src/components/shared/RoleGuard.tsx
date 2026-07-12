import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'
import { NavShell } from './NavShell'
import type { ReactNode } from 'react'

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (!currentUser) return <Navigate to="/login" replace />
  if (!allow.includes(currentUser.role)) return <Navigate to="/login" replace />

  return <NavShell>{children}</NavShell>
}
