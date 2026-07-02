import { ClipboardCheck, ShieldAlert } from 'lucide-react'
import { SectionCard } from '../components/SectionCard'

export function FeedbackPage() {
  return (
    <div className="grid gap-6 lg:gap-7 lg:grid-cols-2">
      <SectionCard
        title="Testing feedback"
        description="Use this branch for controlled limited internal testing only."
      >
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/90 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200">
            <ClipboardCheck className="h-3.5 w-3.5 text-sky-300" />
            One feedback entry per workflow and mode
          </div>
          <p>Record one feedback entry per workflow and mode tested.</p>
          <ul className="list-disc space-y-2.5 pl-5 text-slate-400">
            <li>Workflow tested</li>
            <li>Mode used: Quick Note, Detailed Encounter, or Medical Report</li>
            <li>Usefulness score and documentation accuracy score</li>
            <li>Any unsafe wording, invented content, or wrong assumptions</li>
            <li>Any UI difficulty or confusing workflow matching</li>
          </ul>
        </div>
      </SectionCard>

      <SectionCard
        title="What testers should remember"
        description="The feedback process should reinforce safety, not bypass it."
      >
        <ul className="list-disc space-y-2.5 pl-5 text-sm leading-6 text-slate-300">
          <li className="marker:text-amber-300">Use mock or anonymized cases only.</li>
          <li>Do not rely on generated text without clinician review.</li>
          <li>Do not test excluded workflows even if linked directly.</li>
          <li>Flag any diagnosis, treatment, medication dose, referral, or follow-up that appears invented.</li>
        </ul>
        <div className="mt-4 flex items-start gap-3 rounded-[1.2rem] border border-amber-400/20 bg-amber-300/8 px-4 py-3 text-sm leading-6 text-amber-100">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          This branch is still a documentation testing build, not a clinical release.
        </div>
      </SectionCard>
    </div>
  )
}
