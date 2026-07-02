import { Activity, FileText, HeartPulse, Home, MessageSquare, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { SafetyBanner } from '../components/SafetyBanner'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/quick-note', label: 'Quick Note', icon: Stethoscope },
  { to: '/encounter', label: 'Detailed Encounter', icon: HeartPulse },
  { to: '/report', label: 'Medical Report / Letter', icon: FileText },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/safety', label: 'Safety / About', icon: ShieldAlert },
]

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[96rem] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header
          className="mb-6 rounded-[2rem] border border-slate-800/90 bg-slate-950/84 p-4 shadow-[0_24px_80px_-32px_rgba(2,6,23,0.85)] backdrop-blur-sm sm:p-5"
          data-no-print="true"
        >
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] xl:items-center">
              <div className="rounded-[1.6rem] border border-slate-800/90 bg-slate-950/88 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border border-sky-400/20 bg-sky-300/10 text-sky-100 shadow-[0_18px_42px_-26px_rgba(56,189,248,0.55)]">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold tracking-tight text-white sm:text-lg">Najm ClinicNote V2</div>
                        <div className="eyebrow">
                          <Sparkles className="h-3.5 w-3.5" />
                          Internal beta
                        </div>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Clinical documentation productivity workspace with review-first drafting.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="workflow-meta">
                      <Activity className="h-3.5 w-3.5" />
                      1,500 workflows
                    </div>
                    <div className="workflow-meta">12 hidden for review</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-slate-800/90 bg-slate-950/88 p-3 sm:p-4">
                <SafetyBanner />
              </div>
            </div>
          </div>

          <nav className="rounded-[1.45rem] border border-slate-800/85 bg-slate-900/62 p-2">
            <div className="flex gap-2 overflow-x-auto pb-1 workflow-chip-scroll">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-2 rounded-[1rem] border px-4 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'border-sky-400/55 bg-sky-300/14 text-sky-100 shadow-[0_12px_30px_-20px_rgba(56,189,248,0.72)]'
                          : 'border-transparent bg-transparent text-slate-300 hover:border-slate-700/90 hover:bg-slate-950/70 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </nav>
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
