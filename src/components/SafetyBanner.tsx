import { ShieldAlert } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
      <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-800">
        <ShieldAlert className="h-3.5 w-3.5" />
        Limited internal testing
      </div>
      <div className="mt-1 leading-5 text-amber-900/85">
        Limited testing only. Use mock or anonymized cases. Clinician review is required.
      </div>
    </div>
  )
}
