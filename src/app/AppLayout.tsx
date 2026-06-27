import { FileText, HeartPulse, Home, MessageSquare, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react'
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
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header
          className="surface-grid mb-6 rounded-[2rem] border border-slate-800/90 bg-slate-950/80 p-5 shadow-[0_24px_80px_-32px_rgba(2,6,23,0.85)] backdrop-blur-sm sm:p-6 lg:p-7"
          data-no-print="true"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Najm ClinicNote V2 beta
              </div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
                Clinical documentation drafts, kept simple and review-first.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Search a workflow, capture only clinician-confirmed findings, and generate a readable draft for review. This testing build stays documentation-focused and keeps excluded workflows hidden.
              </p>
            </div>
            <div className="max-w-xl lg:pt-1">
              <SafetyBanner />
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'border-cyan-400/60 bg-cyan-300/12 text-cyan-100 shadow-[0_10px_30px_-18px_rgba(34,211,238,0.75)]'
                        : 'border-slate-700/90 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:bg-slate-900 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
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
