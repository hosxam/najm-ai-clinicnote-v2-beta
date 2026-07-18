# Full-Source Guideline Reconstruction Status

- Branch: `full-source-guideline-reconstruction-v1`
- Starting HEAD: `e904194410517e3fade430a3b8dd1f56f55ebee6`
- Current state: completion milestone reopened; repair required
- Terminal outputs: 1,500 / 1,500 (not equivalent to clinical completion)
- Reconstructed complete: 0
- Reconstructed with noncritical documented limitations: 0
- Clinically incomplete: 1,048
- Source gaps after full search: 401
- Blocked source access: 51
- Repair queue: 1,500
- Full guideline documents inspected: 211
- Completed workflows with documented limitations: 1,024
- Fully reconstructed workflows: 0
- Source gaps after full search: 401
- Blocked-source workflows: 75
- Guideline families indexed: 825
- Sources newly registered: 0
- Legacy items retained: 624
- Legacy items rewritten: 2,585
- Legacy items removed from provisional outputs: 80,094
- Item-level comparisons: 83,303
- Full-source evidence items added: 2,942
- Final reconstructed items emitted: 6,151
- Production `public/data` changed: no
- Canonical or signed state changed: no
- Mappings: 0

The required access test passed for a UAE DoH webpage, UAE DoH PDF, and WHO/ICRC PDF. The pipeline archives full source bytes and extracted text, records SHA-256 fingerprints, and writes deterministic batch manifests and checkpoints. Batch 001 now performs an explicit full-text comparison for every legacy item, with deterministic retain, rewrite, or remove outcomes. It does not use the owner as a review queue and does not expose the summary-derived beta data as completed reconstruction.

The aggregate output fingerprint is `314871aef6d4c7a9f86586691eceae80cfb9f0e9cc18b9a4c0de2331b323bc32`; the strict status fingerprint is `a0ebb0899215a21a2b64cbb0c2917b299c78d3d755af1eebdedcbd7d6bbcc898`. No workflow is presented as usable beta content until its core sections are complete. Production `public/data`, canonical and signed state, mappings, candidates, and exclusions remain unchanged.
