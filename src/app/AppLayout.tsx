import { FileText, MessageSquare, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react'
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
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[88rem] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header
          className="mb-6 rounded-[1.75rem] border border-slate-800/90 bg-slate-950/90 p-4 shadow-[0_20px_60px_-34px_rgba(2,6,23,0.88)] backdrop-blur-sm sm:p-5"
          data-no-print="true"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <Link to="/" className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-sky-400/20 bg-sky-300/10 text-sky-100 shadow-[0_18px_42px_-26px_rgba(56,189,248,0.55)]">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold tracking-tight text-white sm:text-lg">Najm ClinicNote V2</div>
                    <div className="eyebrow">
                      <Sparkles className="h-3.5 w-3.5" />
                      Beta
                    </div>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Search, pick a workflow, and draft a clinician-review note.
                  </p>
                </div>
              </Link>

              <div className="flex flex-col gap-3 lg:items-end">
                <div className="flex flex-wrap gap-2">
                  <div className="workflow-meta">1,500 workflows</div>
                  <div className="workflow-meta">12 hidden pending review</div>
                </div>
                <div className="w-full max-w-xl">
                  <SafetyBanner />
                </div>
              </div>
            </div>

            <nav className="rounded-[1.2rem] border border-slate-800/85 bg-slate-900/62 p-2">
            <div className="flex gap-2 overflow-x-auto pb-1 workflow-chip-scroll">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.matches
                  ? item.matches(location.pathname)
                  : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-[1rem] border px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'border-sky-400/55 bg-sky-300/14 text-sky-100 shadow-[0_12px_30px_-20px_rgba(56,189,248,0.72)]'
                        : 'border-transparent bg-transparent text-slate-300 hover:border-slate-700/90 hover:bg-slate-950/70 hover:text-white'
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
          className="mt-8 rounded-[1.75rem] border border-slate-800/90 bg-slate-950/70 px-5 py-4 text-sm leading-6 text-slate-400 shadow-[0_20px_60px_-36px_rgba(2,6,23,0.8)]"
          data-no-print="true"
        >
          Najm ClinicNote V2 is a documentation drafting tool. It is not clinical decision support. Outputs require clinician review. No workflows in this V2 MVP are clinically approved or clinically tested.
        </footer>
      </div>
    </div>
  )
}
