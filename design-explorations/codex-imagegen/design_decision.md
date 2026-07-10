# Design decision

## Selected direction

**Concept B — Premium medical productivity workspace**

Concept B best satisfies the review criteria:

- A doctor can identify workflow search and Quick Note within ten seconds.
- Workflow search remains the central start action.
- Suggested chips look intentionally selected rather than automatically asserted.
- The note output is presented as a professional review surface with explicit clinician-review status.
- The two-column Quick Note layout can collapse cleanly on mobile.
- It feels more complete than Concept A without the EHR-like density and unsupported product cues in Concept C.

## Implementation interpretation

The React implementation will use Concept B as the primary direction while borrowing Concept A's restraint for navigation and mobile layouts. It will not reproduce generated mockup features that the current product does not support, such as patient management, visit metadata, or signing workflows.

The implementation remains limited to presentation and layout. Workflow data, note-building behavior, suggested-default behavior, local draft persistence, safety rules, and exclusion handling remain unchanged.
