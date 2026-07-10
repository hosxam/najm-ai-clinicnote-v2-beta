import { Outlet } from 'react-router-dom'
import { ProductHeader } from '../components/ProductHeader'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <ProductHeader />

      <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-[92rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white" data-no-print="true">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-2 px-4 py-5 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            Documentation drafting only. Not clinical decision support. Review every output before use.
          </span>
          <span className="shrink-0 font-mono text-[10px] text-slate-400">Beta build: 19218a6-concept-b</span>
        </div>
      </footer>
    </div>
  )
}
