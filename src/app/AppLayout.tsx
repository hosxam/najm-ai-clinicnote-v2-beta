import { FileText, HeartPulse, Home, MessageSquare, ShieldAlert, Stethoscope } from 'lucide-react'
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
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Najm ClinicNote V2 MVP
              </div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                What are you documenting today?
              </h1>
              <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
                Choose a workflow, enter clinician-confirmed findings, and generate a clinician-review draft without exposing the old technical modes.
              </p>
            </div>
            <div className="max-w-lg">
              <SafetyBanner />
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100'
                        : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:text-white'
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

        <footer className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 px-5 py-4 text-sm text-slate-400">
          Najm ClinicNote V2 is a documentation drafting tool. It is not clinical decision support. Outputs require clinician review. No workflows in this V2 MVP are clinically approved or clinically tested.
        </footer>
      </div>
    </div>
  )
}
