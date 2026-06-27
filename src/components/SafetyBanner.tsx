export function SafetyBanner() {
  return (
    <div className="rounded-[1.5rem] border border-amber-300/25 bg-linear-to-r from-amber-300/10 via-amber-200/8 to-transparent p-4 text-sm text-amber-50 shadow-[0_18px_40px_-28px_rgba(245,158,11,0.75)]">
      <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-amber-200/90">
        Limited internal testing
      </div>
      <div className="mt-2 leading-6 text-amber-50/95">
        Not clinically approved. Do not enter patient identifiers. Najm ClinicNote is a
        documentation drafting tool, not clinical decision support. Outputs require clinician
        review.
      </div>
    </div>
  )
}
