# Authoritative Source Research Method

## Purpose

This method governs `authoritative_source_registry.json`, a conservative source-discovery registry for mapping approximately 1,500 clinical documentation workflows.

The snapshot date is **2026-07-11**. The registry is a provenance control, not a claim that all workflows are covered. A catalog page, standard, guideline, or regulation is relevant only within its verified scope.

**Workflow-specific source gaps remain gaps.** Do not fill a missing requirement by analogy, common practice, model knowledge, a neighboring specialty's guidance, or an uncited template.

## Operating context

- The primary operating context is the United States.
- International sources are labeled and may be used only when the workflow jurisdiction matches or when a documented evidence-comparison step is appropriate.
- A source's presence does not mean it is controlling, current for every date, or sufficient on its own.
- A source hub is normally a discovery source. The specific child document, section, version, and effective date must be captured before a workflow requirement is mapped.
- Clinical recommendations, billing rules, accreditation requirements, data standards, and legal duties are different authority classes and must not be collapsed into one.

## Allowed source classes

Include only a source issued or maintained by one of these primary authorities:

1. Government legislature, regulator, public-health body, payer, or official code-set maintainer.
2. Official standards, terminology, interoperability, registry, or accreditation owner.
3. Guideline developer or national guideline body publishing its own guidance.
4. Medical specialty society or a clearly identified multisociety collaboration publishing its own guidance.
5. Official publisher page for a named society guideline when the society uses that platform as the primary publication channel.

Exclude:

- Search-result pages, AI answers, blogs, news summaries, coding vendors, consultants, payer summaries from noncontrolling parties, textbooks, review articles, and guideline aggregators.
- A mirror when an official canonical URL is available.
- Drafts represented as final guidance.
- Sources whose issuer, exact title, canonical URL, or status cannot be verified.
- A source merely because another document cites it.
- A document whose only accessible copy has uncertain provenance.

## Live verification procedure

For every registry entry:

1. Open the exact official URL on the access date.
2. Confirm the visible title and issuing organisation.
3. Confirm that the page is the issuer's own page or primary publishing platform.
4. Record a publication date, effective date, update date, version, or edition only when explicitly displayed in the source.
5. If precision is only a year or month, retain that precision; do not invent a day.
6. Review current, archived, retired, inactive, withdrawn, replaced, superseded, draft, and in-development labels.
7. Review the page for jurisdiction, population, setting, program, payer, and document-type limits.
8. Review copyright, license, permissions, account, and AI-use restrictions.
9. Add source-specific recency, supersession, conflict, and reuse notes.
10. Omit the candidate when a required fact cannot be verified conservatively.

Search snippets may locate a candidate but are not evidence for inclusion. The official page or official publication must supply the recorded facts.

## Source selection for a workflow

A workflow mapping begins with a structured applicability statement:

- workflow identifier and name;
- service date or policy date;
- country, state or territory, and care location;
- setting and facility type;
- profession, credential, and scope of practice;
- patient population and clinical condition;
- payer, program, network, and coverage context;
- accreditation or registry program;
- workflow purpose: care, billing, quality reporting, registry abstraction, exchange, legal consent, or another purpose;
- data-exchange profile and terminology release, when relevant.

Then select sources in separate authority lanes.

### 1. Controlling legal and regulatory lane

Identify applicable statutes, regulations, state professional rules, privacy and confidentiality regimes, mandatory reporting, consent rules, and facility conditions.

The eCFR is authoritative but unofficial. Preserve section citations and point-in-time dates; use the official CFR or Federal Register publication when formal legal proof is required.

### 2. Payer and program lane

Identify the payer manual, coverage determination, fee-schedule year, quality-program year, code-set year, and contractor or plan instruction that applies.

Do not infer coverage from a clinical guideline. Do not infer clinical necessity from a billing code.

### 3. Accreditation and registry lane

Identify the exact accreditation program, registry year, measure specification, data dictionary, and verification cycle.

A registry field definition does not automatically require clinicians to document a new fact. Map only what is necessary to support accurate abstraction and only when another controlling requirement permits it.

### 4. Specialty clinical lane

Select the current guideline or practice document for the exact specialty, population, condition, and intervention.

Distinguish document types. A standard, clinical practice guideline, consensus statement, position statement, white paper, technical standard, and educational toolkit do not carry identical authority.

### 5. Data and interoperability lane

Identify the exact USCDI, FHIR implementation guide, C-CDA, terminology, and value-set releases required by the receiving system, contract, certification program, or interface.

Data standards define exchange or representation. They do not, by themselves, define complete clinical-note content.

## Requirement extraction

For each proposed workflow requirement, record at minimum:

- source registry ID;
- exact child-document title;
- exact URL;
- issuer;
- version or edition, if displayed;
- publication, effective, or update date, if displayed;
- access date;
- exact section, table, recommendation, or data element;
- authority lane and source type;
- jurisdiction, setting, population, profession, payer, and date applicability;
- whether the language is mandatory, recommended, optional, conditional, or descriptive;
- conflict and supersession review result;
- reuse or licensing status;
- reviewer and verification date.

Paraphrase conservatively. Never convert “may,” “consider,” “should,” or descriptive text into “must.” Never infer a documentation element solely because it would be clinically useful.

## Recency and supersession

Use service-date applicability, not “newest visible file,” as the deciding rule.

- Annual code sets, fee schedules, quality measures, and registry dictionaries must match the applicable year and effective date.
- Living guideline hubs require a fresh child-document status check.
- A draft does not replace a final release.
- A posted future code set is not current before its effective date.
- A replacement may apply to one program but not another. For example, Joint Commission National Performance Goals replace hospital and critical-access-hospital National Patient Safety Goals from 2026-01-01, while other programs continue to use program-specific NPSGs.
- Preserve historical sources for historical workflows; label them historical rather than current.
- When active status cannot be established, the mapping remains unresolved.

## Conflict handling

Do not silently merge or rank conflicting sources.

1. Confirm that the apparent conflict concerns the same jurisdiction, date, population, setting, profession, payer, and question.
2. Separate legal duties, payer conditions, accreditation standards, clinical recommendations, and technical data constraints.
3. Record both positions with exact provenance.
4. Determine controlling authority only with an explicit legal, contractual, program, or governance basis.
5. Escalate unresolved clinical conflicts to the designated specialty reviewer.
6. Escalate unresolved legal, regulatory, licensing, privacy, or reimbursement conflicts to the appropriate qualified reviewer.
7. Keep the workflow blocked or marked as a source gap until resolved.

No universal ordering can safely decide every conflict. Law, contract, payer program, accreditation enrollment, state scope-of-practice rules, local governance, and clinical judgment interact differently by workflow.

## Reuse and licensing

Registry metadata does not grant permission to copy source content.

- Default to storing links, bibliographic metadata, applicability notes, and original paraphrases.
- Do not ingest or reproduce proprietary code descriptors, standards, guideline tables, algorithms, templates, or substantial text without the required license or permission.
- Treat AMA CPT, CAP protocols, NCCN guidelines, SNOMED CT, LOINC, Joint Commission standards, AABB standards, and other restricted sources according to their current licenses.
- CAP's published terms specifically restrict incorporation of protocol content into AI systems, mappings, and databases without written permission.
- Several societies publish AI- or machine-use restrictions. When terms are restrictive or unclear, use link-and-metadata-only handling.
- Government pages may contain third-party material with separate rights.
- Preserve attribution, copyright notices, and required license text where reuse is permitted.
- Legal access to view a source is not the same as permission to transform or redistribute it.

## Gap policy

The registry is intentionally finite and conservative. It cannot establish source coverage for all 1,500 workflows.

Create a workflow source gap when any of the following remains unresolved:

- no authoritative source was found;
- the source exists but the exact workflow, population, setting, profession, payer, or jurisdiction is not addressed;
- only an outdated, archived, withdrawn, or superseded source is available;
- active status cannot be verified;
- controlling state or local requirements have not been researched;
- payer or contractor instructions are missing;
- a source conflict is unresolved;
- the needed content is inaccessible or reuse is not licensed;
- a technical standard defines exchange structure but not clinical content;
- evidence supports clinical practice but not the proposed documentation mandate.

A gap record should contain the workflow ID, the exact unanswered question, jurisdictions and settings searched, sources checked, search date, reason unresolved, owner, and next review date.

Do not generate a placeholder requirement. Do not cite a broad hub as though it answers the missing question. Do not mark a workflow “covered” because its specialty appears in the registry.

## Maintenance

Review the registry:

- before each major workflow-mapping release;
- when annual CMS, CPT, ICD-10-CM/PCS, quality-measure, registry, or specialty-guideline releases occur;
- when a source page announces replacement, retirement, correction, or new effective dates;
- when a law, regulation, accreditation program, payer policy, or interoperability requirement changes;
- when a workflow reviewer identifies a missing specialty, setting, profession, state, payer, or data standard.

On update:

1. Reopen the official URL.
2. Update only verified fields.
3. Preserve history in version control.
4. Add or remove entries based on the same inclusion rules.
5. Recalculate `registry_metadata.source_count`.
6. Re-run structural validation.
7. Reassess affected workflows; a registry update does not automatically update mappings.

## Validation checks

Before accepting a registry revision, verify:

- valid JSON;
- unique source IDs;
- unique exact URLs unless duplication is intentionally documented;
- HTTPS URLs;
- access date on every source;
- required scope and all four note fields on every source;
- optional dates and versions only where verified;
- no draft represented as current;
- no source-count mismatch;
- no unsupported claim of complete workflow coverage;
- explicit statement that workflow-specific source gaps remain gaps.
