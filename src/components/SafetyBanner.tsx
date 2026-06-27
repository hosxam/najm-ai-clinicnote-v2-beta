export function SafetyBanner() {
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-300/10 p-4 text-sm text-amber-100 shadow-lg shadow-amber-950/20">
      <div className="font-semibold">Limited testing build.</div>
      <div className="mt-1">
        Not clinically approved. Do not enter patient identifiers. Najm ClinicNote is a
        documentation drafting tool, not clinical decision support. Outputs require clinician
        review.
      </div>
    </div>
  )
}
