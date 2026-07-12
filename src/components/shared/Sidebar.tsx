import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'
import {
  Cpu,
  Home,
  LayoutDashboard,
  ListChecks,
  FileSearch,
  Settings,
  PlusCircle,
  ClipboardList,
  History,
  Landmark,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

const HOME_ITEM: NavItem = { to: '/', label: 'Home', icon: Home, end: true }

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  customer: [
    HOME_ITEM,
    { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/customer/new', label: 'New Application', icon: PlusCircle },
    { to: '/customer/applications', label: 'My Applications', icon: ClipboardList },
  ],
  loan_officer: [
    HOME_ITEM,
    { to: '/operational', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/operational/queue', label: 'Application Queue', icon: ListChecks },
  ],
  domain_lead: [
    HOME_ITEM,
    { to: '/operational', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/governance/replay', label: 'Replay', icon: History },
  ],
  executive: [HOME_ITEM, { to: '/executive', label: 'Business Executive', icon: Landmark }],
  administrator: [HOME_ITEM, { to: '/admin', label: 'Admin Console', icon: Settings }],
  internal_auditor: [
    HOME_ITEM,
    { to: '/governance/auditor', label: 'Auditor Console', icon: FileSearch },
    { to: '/governance/replay', label: 'Replay', icon: History },
  ],
}

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onToggle, onNavigate }: SidebarProps) {
  const currentUser = useAuthStore((s) => s.currentUser)
  if (!currentUser) return null

  const items = NAV_BY_ROLE[currentUser.role]

  return (
    <div
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-[var(--border)] bg-white transition-[width] duration-200 ease-out',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      {/* Brand header */}
      <div className={cn('flex h-14 items-center gap-2.5 border-b border-[var(--border)] px-4', collapsed && 'justify-center px-0')}>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded bg-navy-500 text-white shadow-sm">
          <Cpu size={17} />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-zinc-900">Pinnacle AI</div>
            <div className="-mt-0.5 text-[11px] text-zinc-400">Loan Origination Platform</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {!collapsed && <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">Workspace</p>}
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive ? 'bg-navy-50 text-navy-600' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-navy-500' : 'text-zinc-400 group-hover:text-zinc-600')} size={18} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      {onToggle && (
        <div className="border-t border-[var(--border)] p-3">
          <button
            onClick={onToggle}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </div>
  )
}
