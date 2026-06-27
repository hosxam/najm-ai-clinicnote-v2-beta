import { SectionCard } from '../components/SectionCard'

export function FeedbackPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard
        title="Testing feedback"
        description="Use this branch for controlled limited internal testing only."
      >
        <div className="space-y-3 text-sm text-slate-300">
          <p>Record one feedback entry per workflow and mode tested.</p>
          <ul className="list-disc space-y-2 pl-5 text-slate-400">
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
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>Use mock or anonymized cases only.</li>
          <li>Do not rely on generated text without clinician review.</li>
          <li>Do not test excluded workflows even if linked directly.</li>
          <li>Flag any diagnosis, treatment, medication dose, referral, or follow-up that appears invented.</li>
        </ul>
      </SectionCard>
    </div>
  )
}
