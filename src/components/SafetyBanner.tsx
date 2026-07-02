import { ShieldAlert } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div className="rounded-[1.1rem] border border-amber-400/18 bg-amber-300/7 px-4 py-3 text-sm text-amber-50 shadow-[0_16px_36px_-30px_rgba(2,6,23,0.8)]">
      <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-200/90">
        <ShieldAlert className="h-3.5 w-3.5" />
        Limited internal testing
      </div>
      <div className="mt-1.5 leading-6 text-amber-50/90">
        Not clinically approved. Use mock or anonymized cases only. Drafts require clinician review.
      </div>
    </div>
  )
}
