import { FileText, MessageSquare, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/cn'

const navItems = [
  {
    to: '/',
    label: 'Document',
    icon: Stethoscope,
    matches: (pathname: string) =>
      pathname === '/' || pathname.startsWith('/quick-note') || pathname.startsWith('/encounter'),
  },
  { to: '/report', label: 'Reports', icon: FileText, matches: (pathname: string) => pathname.startsWith('/report') },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/safety', label: 'Safety', icon: ShieldCheck },
]

export function ProductHeader() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur" data-no-print="true">
      <div className="mx-auto flex max-w-[92rem] flex-col items-stretch justify-between gap-2 px-4 py-2 sm:min-h-16 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-0 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-800">
            <Sparkles className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.1} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-[-0.015em] text-slate-950 sm:text-base">
              Najm ClinicNote
            </span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">Clinical documentation workspace</span>
          </span>
          <span className="hidden rounded-md bg-cyan-800 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:inline-flex">
            V2 beta
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 lg:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Limited testing
          </div>
          <nav className="grid w-full grid-cols-4 items-center gap-1 sm:flex sm:w-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.matches
                ? item.matches(location.pathname)
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'group inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-1.5 text-xs font-medium transition sm:min-h-10 sm:gap-2 sm:px-3 sm:text-sm',
                    isActive
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-cyan-800' : 'text-slate-400 group-hover:text-slate-700')} />
                  <span className={cn(item.to === '/feedback' || item.to === '/safety' ? 'hidden md:inline' : '')}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
