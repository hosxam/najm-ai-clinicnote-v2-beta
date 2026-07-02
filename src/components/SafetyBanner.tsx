import { ShieldAlert } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div className="rounded-[1.45rem] border border-amber-400/22 bg-amber-300/8 p-4 text-sm text-amber-50 shadow-[0_18px_40px_-30px_rgba(2,6,23,0.88)]">
      <div className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-amber-200/90">
        <ShieldAlert className="h-3.5 w-3.5" />
        Limited internal testing
      </div>
      <div className="mt-2 leading-6 text-amber-50/92">
        Not clinically approved. Do not enter patient identifiers. This is a documentation drafting tool, not clinical decision support. Outputs require clinician review.
      </div>
    </div>
  )
}
