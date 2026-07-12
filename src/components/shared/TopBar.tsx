import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, RefreshCw, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useApplicationStore } from '@/store/applicationStore'
import { StatusBadge } from '@/components/shared/StatusBadges'
import type { Role } from '@/types'

const MAX_RESULTS = 8

const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  loan_officer: 'Loan Officer',
  domain_lead: 'Domain Lead',
  executive: 'Business Executive',
  administrator: 'Administrator',
  internal_auditor: 'Internal Auditor',
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const applications = useApplicationStore((s) => s.applications)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return applications.filter((a) => a.id.toLowerCase().includes(q) || a.applicant.name.toLowerCase().includes(q)).slice(0, MAX_RESULTS)
  }, [applications, query])

  useEffect(() => setActiveIndex(0), [query])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function goToApplication(id: string) {
    if (!currentUser) return
    const target = currentUser.role === 'customer' ? '/customer/applications' : `/operational/workbench/${id}`
    navigate(target)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      goToApplication(results[activeIndex].id)
    }
  }

  if (!currentUser) return null
  const initials = currentUser.avatarInitials

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-white/80 px-5 backdrop-blur-md">
      {onMenuClick && (
        <button onClick={onMenuClick} className="grid h-9 w-9 shrink-0 place-items-center rounded text-zinc-500 hover:bg-zinc-50 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </button>
      )}

      <div ref={containerRef} className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search applications…"
          className="h-9 w-full rounded border border-[var(--border)] bg-zinc-50/70 pl-9 pr-16 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-navy-200 focus:bg-white focus:ring-4 focus:ring-navy-50"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            title="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-[3px] border border-[var(--border)] bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-400">
            ⌘K
          </kbd>
        )}

        {isOpen && query && (
          <div className="absolute top-[calc(100%+6px)] left-0 z-50 max-w-[90vw] min-w-full overflow-hidden rounded-sm border border-[var(--border)] bg-white shadow-lg">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-zinc-400">No applications match "{query}"</p>
            ) : (
              <ul>
                {results.map((a, i) => (
                  <li key={a.id}>
                    <button
                      onClick={() => goToApplication(a.id)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        i === activeIndex ? 'bg-navy-50' : 'hover:bg-zinc-50',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-zinc-800">{a.id}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="truncate text-[11px] text-zinc-400">{a.applicant.name}</span>
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => window.location.reload()}
          title="Refresh page data"
          className="grid h-9 w-9 place-items-center rounded text-zinc-500 hover:bg-zinc-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        <button title="Notifications" className="relative grid h-9 w-9 place-items-center rounded text-zinc-500 hover:bg-zinc-50">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-700 ring-2 ring-white" />
        </button>

        <div className="mx-1 h-6 w-px bg-[var(--border)]" />

        <div className="flex items-center gap-2.5 pl-0.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy-500 to-navy-400 text-[12px] font-semibold text-white">
            {initials}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-[13px] font-semibold text-zinc-800">{currentUser.name}</div>
            <div className="-mt-0.5 text-[11px] text-zinc-400">{ROLE_LABELS[currentUser.role]}</div>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            title="Sign out of account"
            className="grid h-9 w-9 place-items-center rounded text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
