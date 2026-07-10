import { FileText, MessageSquare, ShieldAlert, Stethoscope } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { SafetyBanner } from '../components/SafetyBanner'

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
  { to: '/safety', label: 'Safety', icon: ShieldAlert },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[92rem] flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
        <header
          className="mb-6 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.3)] sm:px-5"
          data-no-print="true"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Link to="/" className="flex min-w-0 items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-800 text-white shadow-[0_12px_28px_-18px_rgba(14,116,144,0.75)]">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Najm ClinicNote</div>
                    <div className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-800">V2 beta</div>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                    Workflow-guided clinical documentation drafts.
                  </p>
                </div>
              </Link>

              <div className="flex flex-col gap-2 lg:items-end">
                <div className="hidden flex-wrap gap-2 sm:flex">
                  <div className="workflow-meta">1,500 workflows</div>
                  <div className="workflow-meta">12 excluded</div>
                </div>
                <div className="w-full max-w-2xl"><SafetyBanner /></div>
              </div>
            </div>

            <nav className="border-t border-slate-200 pt-3">
            <div className="grid grid-cols-4 gap-1 sm:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.matches
                  ? item.matches(location.pathname)
                  : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition sm:shrink-0 sm:gap-2 sm:px-3.5 sm:text-sm ${
                      isActive
                        ? 'border-cyan-200 bg-cyan-50 text-cyan-900'
                        : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer
          className="mt-8 border-t border-slate-200 px-2 py-5 text-xs leading-5 text-slate-500 sm:text-sm"
          data-no-print="true"
        >
          Najm ClinicNote is a documentation drafting tool, not clinical decision support. Outputs require clinician review. No workflows are clinically approved or clinically tested.
        </footer>
      </div>
    </div>
  )
}
