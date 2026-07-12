import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Eye } from 'lucide-react'
import type { Role } from '@/types'

const ROLE_HOME: Record<Role, string> = {
  customer: '/customer',
  loan_officer: '/operational',
  domain_lead: '/operational',
  executive: '/executive',
  administrator: '/admin',
  internal_auditor: '/governance/auditor',
}

const QUICK_ACCESS = [
  { label: 'Customer', role: 'customer', email: 'customer@pinnacle.com' },
  { label: 'Loan Officer', role: 'loan_officer', email: 'officer@pinnacle.com' },
  { label: 'Domain Lead', role: 'domain_lead', email: 'lead@pinnacle.com' },
  { label: 'Business Executive', role: 'executive', email: 'exec@pinnacle.com' },
  { label: 'Auditor', role: 'internal_auditor', email: 'auditor@pinnacle.com' },
  { label: 'Admin', role: 'administrator', email: 'admin@pinnacle.com' },
] as const

export default function Login() {
  const loginAs = useAuthStore((s) => s.loginAs)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email) return
    
    const match = QUICK_ACCESS.find(q => q.email === email)
    const role: Role = match ? match.role : 'customer'
    
    loginAs(role)
    navigate(ROLE_HOME[role])
  }

  const handleQuickAccess = (accessEmail: string) => {
    setEmail(accessEmail)
    setPassword('demo123')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl shadow-black/5 border border-zinc-100">
        
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 font-bold text-white shadow-md shadow-orange-500/20">
            P
          </div>
          <div>
            <div className="font-bold text-zinc-900 leading-tight">Pinnacle AI</div>
            <div className="text-sm text-zinc-400">Loan Origination Platform</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900">Sign in to your account</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Kaara — Internal Platform</p>

        <form onSubmit={handleSignIn} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pinnacle.com"
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Sign in
          </button>
        </form>

        <div className="mt-10 border-t border-zinc-100 pt-8">
          <div className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
            Quick access — Demo accounts (Password: demo123)
          </div>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACCESS.map((q) => (
              <button
                key={q.role}
                type="button"
                onClick={() => handleQuickAccess(q.email)}
                className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
              >
                {q.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-zinc-400">
            Click a role to auto-fill credentials, then press Sign in.
          </p>
        </div>
      </div>
    </div>
  )
}
