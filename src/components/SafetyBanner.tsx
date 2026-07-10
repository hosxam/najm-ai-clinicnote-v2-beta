import { ShieldAlert } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div>
          <div className="font-semibold">Limited internal testing</div>
          <div className="mt-1 text-xs leading-5 text-amber-900/75">
            Mock or anonymized cases only. Outputs require clinician review.
          </div>
        </div>
      </div>
    </div>
  )
}
