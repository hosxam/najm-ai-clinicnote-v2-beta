# Signed Declarative Mapping Independent Defensive Review

Date: 2026-07-15
Branch: `source-first-guideline-expansion-1500-v2`
Reviewed starting HEAD: `72f7eec7670685b57588dc018323930ddfae1fe5`
Review type: independent, read-only defensive architecture review
Clinical research queue: not resumed

## Verdict

`PASS_SIGNED_DECLARATIVE_MAPPING_BOUNDARY_VERIFIED_QUEUE_MAY_RESUME`

The signed declarative mapping boundary passes this review. A canonical mapping cannot become active through the reviewed production path unless strict canonical JSON, an exact signed approval manifest, the detached Ed25519 signature, the repository clinical context, and all reconciliation checks agree. The current production state remains the signed empty state.

Routine research may resume after this review, subject to the existing clinical governance and blocker rules. This review did not resume the queue, conduct clinical research, create or approve a mapping, or change production implementation or tests.

## Review scope and method

The review inspected the committed implementation, schemas, signed empty-state envelope, architecture documentation, candidate boundary, five reconciliation consumers, repository state, and every command specified in the review request. No new tests, probes, mappings, production code, or test code were created. Synthetic behavior was evaluated only through the existing committed tests.

Primary files reviewed:

- `clinical-expansion-v2/config/CANONICAL_MAPPING_APPROVAL_PUBLIC_KEY.pem`
- `clinical-expansion-v2/canonical-mappings/APPROVED_MANIFEST.json`
- `clinical-expansion-v2/canonical-mappings/APPROVED_MANIFEST.sig`
- `clinical-expansion-v2/schema/CANONICAL_MAPPING_FILE_SCHEMA.json`
- `clinical-expansion-v2/schema/CANONICAL_MAPPING_APPROVAL_MANIFEST_SCHEMA.json`
- `clinical-expansion-v2/schema/CANDIDATE_MAPPING_PROPOSAL_SCHEMA.json`
- `scripts/source-first/writeCanonicalMapping.mjs`
- `scripts/source-first/removeCanonicalMapping.mjs`
- `scripts/source-first/canonicalMappingTransaction.mjs`
- `scripts/source-first/canonicalMappingStore.mjs`
- `scripts/source-first/canonicalMappingManifest.mjs`
- `scripts/source-first/canonicalJson.mjs`
- `scripts/source-first/canonicalMappingContract.mjs`
- `scripts/source-first/canonicalMappingEnvironment.mjs`
- `scripts/source-first/canonicalMappingLedger.mjs`
- `scripts/source-first/canonicalSupportAccounting.mjs`
- `scripts/source-first/candidateMappingProposalStore.mjs`
- `scripts/source-first/canonicalMappingReconciliation.mjs`
- the five `inspect*.mjs` reconciliation consumers
- `scripts/source-first/auditNoCodeGeneratedMappings.mjs`
- `scripts/source-first/auditExplicitMappingContract.mjs`
- `scripts/source-first/computedMappingDataFlow.mjs`
- `scripts/source-first/applyResearchBatch.mjs`
- `scripts/source-first/batches/gpExplicitMappingContract.mjs`
- `clinical-expansion-v2/progress/SIGNED_DECLARATIVE_MAPPING_HARDENING.md`
- the committed signed-mapping, serializer, filesystem, separation, architecture, authority, and reconciliation tests

## Repository state

| Check | Result |
| --- | --- |
| Required branch | `source-first-guideline-expansion-1500-v2` |
| Starting HEAD | `72f7eec7670685b57588dc018323930ddfae1fe5` |
| Starting working tree | Clean |
| Workflows | 1,500 |
| Workflows 0001-0675 | 675/675 terminal; no non-terminal entries |
| Workflows 0676-1500 | 825/825 `research_interrupted`; no other source status |
| Next workflow | `gp-home-glucose-log-review` |
| Canonical supported mappings | 0 |
| Runtime-emitted mappings | 0 |
| Unsupported legacy items | 83,303 |
| Active exclusions | 12; 0 proposed |
| `public/data/` versus `main` | No changed paths; reproducibility validation passed |
| Exclusion file versus `main` | No change |
| Stable `main` ref | `95758951d46510f34548b5520510c5d9d59f017f` |
| Protected forensic branch | `9b4cddb0fb226543ce621cb14a672a4edf789261` |

The required refs match the frozen values recorded by the hardening work. The validation and build commands did not leave tracked changes. No interrupted-attempt files were present at the initial stop gate.

## Key handling findings

- The committed trust key parses as a public Ed25519 key. The review did not print key material.
- A repository scan found zero private-key PEM blocks outside ignored dependency and Git metadata directories.
- Production signing requires the absolute path in `NAJM_MAPPING_SIGNING_KEY_PATH`.
- `canonicalMappingSigningEnvironment()` resolves both the repository root and signing-key real path and rejects a signing key whose lexical or resolved location is inside the repository.
- The signing key must be a normal, non-symbolic, single-link regular file and must parse as an Ed25519 private key.
- There is no embedded development private key and no unsigned production fallback. Existing tests create ephemeral private keys only in isolated operating-system temporary directories and register cleanup.
- Production trust-path overrides for the canonical directory, context, and public key are rejected unless `NAJM_MAPPING_TEST_MODE=1`.

Finding: key separation meets the requested boundary. Compromise of both the external private key and repository/host remains outside the stated threat model.

## Signature and manifest findings

- Detached signature verification uses Node's Ed25519 API correctly: the public key is required to have `asymmetricKeyType === 'ed25519'`, the decoded detached signature must be exactly 64 bytes, and `verify(null, manifestBytes, publicKey, signature)` must succeed.
- Verification covers the exact canonical manifest bytes. Non-canonical manifest bytes are rejected before activation.
- The manifest validates exact fixed fields, manifest schema version, canonical schema version, repository namespace, canonical UTC timestamp, positive safe approval sequence, and previous-manifest linkage.
- Every approved file entry binds the exact safe relative path, workflow ID, SHA-256, byte length, mapping count, and sorted exact mapping keys.
- Top-level mapping keys must exactly equal the union of per-file keys. Duplicate, unsafe, case-colliding, unsorted, or cross-workflow entries fail.
- The aggregate hash is independently recomputed over namespace, versions, sequence/linkage, files, and mapping keys.
- Modified manifests, wrong keys, missing/modified/extra files, byte-length changes, hash changes, aggregate changes, exact-key mismatches, unsafe paths, rollback, and broken linkage are rejected by existing committed tests.
- The production envelope is explicit: approval sequence 1, zero approved files, zero approved keys, and a valid detached signature.

Finding: unsigned canonical files and signed files not exactly represented by the verified manifest cannot become active.

## Raw JSON and serializer findings

- `writeCanonicalMapping.mjs` is a CLI-only module with no exports. Its documented modes are `--input <raw-mapping.json>` and `--initialize-empty`.
- The approval transaction accepts only `Buffer` or `Uint8Array` bytes. Arbitrary JavaScript objects, inherited properties, and accessor execution are excluded at the approval boundary.
- Input must resolve outside the active canonical directory and be a normal, non-symbolic, single-link regular file.
- Strict decoding rejects a UTF-8 BOM, invalid UTF-8, malformed syntax, comments, trailing commas, malformed nesting, duplicate raw fields, Unicode-escaped duplicate fields, NFC-equivalent fields, and prototype-related property names.
- Exact schema-owned fields are required. Missing and unexpected document/mapping fields fail closed.
- Limits are enforced for raw input bytes, canonical file bytes, manifest/signature bytes, total mappings, workflow mappings, canonical files, identifiers, general strings, evidence/applicability/rationale strings, nesting depth, and array length.
- Serialization fixes document field order, mapping field order, mapping sort order, file-entry order, mapping-key order, UTF-8 formatting, LF line endings, and the final newline.
- Equivalent input with reordered fields, mappings, or whitespace produces the same canonical semantic state. Identical replay is a true no-op: no new signature, timestamp, approval sequence, or file bytes.
- Conflicting exact-key or workflow/item replay fails before active state changes.
- A completed transaction is validated first in staging and again after the active-directory swap.
- Existing tests confirm successful approval/removal cleanup and failure cleanup of lock, stage, backup, and temporary entries.

Finding: the serializer is a controlled raw-JSON approval entry point and produces deterministic canonical bytes.

## Loader and file-integrity findings

- The loader verifies the signed envelope before loading an active mapping document.
- The canonical root is fixed in production. Test root/context/key overrides are available only in explicit test mode.
- The loader checks root type and real path and rejects a present transaction lock.
- Directory enumeration permits only `.gitkeep`, the two envelope files, and strict workflow JSON filenames. Hidden, backup, temporary, nested, unsupported, case-colliding, missing, and unlisted entries fail closed.
- Manifest paths reject absolute paths, separators, traversal-capable forms, colons/alternate-stream syntax, percent-encoded forms, dot prefixes, and filename/workflow mismatches.
- Envelope, public-key, checkpoint, and canonical files are opened and read through descriptor-based stable-file checks. Normal regular-file type, one link, size, real path, and before/after file identity are checked.
- Canonical bytes must match the signed byte length and SHA-256, then parse to deterministic bytes and match the manifest's workflow, mapping count, and exact ordered key list.
- Every mapping is validated against the exact workflow and item, registered source and section, opened source and reviewed section, exact source/section hashes, applicability contract, support/origin values, and mapping version.
- The returned state, documents, mapping records, and accounting records are deeply immutable.
- Active support is read only from the signed canonical store. Historical batches, progress ledgers, research summaries, candidate proposals, and runtime caches are not alternative active sources.
- The computed-data-flow validation treats unresolved local imports, default/named/namespace/side-effect/dynamic imports, re-exports, query/hash suffixes, malformed specifiers, and non-allowlisted external modules as failures. Export/import cycles terminate deterministically; the existing reverse-order cycle test produces identical errors.

Finding: the loader fails closed on an invalid envelope, invalid file set, invalid clinical context, or unresolved mapping-infrastructure import.

## Write-authority review

The architectural audit's exact allowlist contains 23 infrastructure files. Classification is by effective role; a file may have more than one role.

| Allowlisted file | Classification |
| --- | --- |
| `auditExplicitMappingContract.mjs` | read-only; validation |
| `auditNoCodeGeneratedMappings.mjs` | read-only; validation |
| `canonicalMappingContract.mjs` | read-only |
| `canonicalMappingEnvironment.mjs` | read-only; validation |
| `canonicalMappingManifest.mjs` | validation; signature verification; manifest construction without filesystem write |
| `canonicalMappingTransaction.mjs` | transaction staging; canonical write; manifest/signature write; rollback-state write |
| `canonicalJson.mjs` | validation; deterministic serialization helpers |
| `candidateMappingProposalStore.mjs` | validation; non-active candidate-only transactional write |
| `canonicalMappingLedger.mjs` | read-only |
| `canonicalMappingReconciliation.mjs` | read-only; validation |
| `canonicalMappingStore.mjs` | read-only; validation; signature verification |
| `canonicalSupportAccounting.mjs` | read-only; validation |
| `canonicalMappingTestHarness.mjs` | test-only |
| `computedMappingDataFlow.mjs` | read-only; validation |
| `inspectApprovalManifest.mjs` | read-only; signature verification |
| `inspectCanonicalFiles.mjs` | read-only; validation; signature verification |
| `inspectPersistedSupport.mjs` | read-only; validation; signature verification |
| `inspectRuntimeMappings.mjs` | read-only; validation; signature verification |
| `inspectSupportAccounting.mjs` | read-only; validation; signature verification |
| `mappingConsumerOutput.mjs` | read-only; validation |
| `removeCanonicalMapping.mjs` | controlled canonical-write CLI entry point |
| `writeCanonicalMapping.mjs` | controlled canonical-write CLI entry point |
| `batches/gpExplicitMappingContract.mjs` | read-only; validation |

Only `canonicalMappingTransaction.mjs` performs active canonical, manifest/signature, staging, swap, lock, backup, cleanup, and optional rollback-checkpoint filesystem writes. The two CLIs are narrow entry points into that transaction. `candidateMappingProposalStore.mjs` writes only the separate non-active candidate directory and cannot write the active canonical location.

The active-write set is minimal:

- Queue batches cannot import the serializer/transaction as mapping factories and write zero embedded active mappings.
- Application code is neither an approved active reader nor an active writer.
- Candidate-proposal code writes a distinct schema/location and has no activation operation.
- No general-purpose filesystem utility or broad application/batch directory is allowlisted.
- The static authority audit covers direct, promise-based, stream, copy, move, rename, link, symlink, handle, pipe, and statically visible external-process mutations, including split and imported canonical paths.
- Cryptographic verification, rather than the static audit alone, remains the decisive activation boundary.

The committed audit passed 11/11 authority tests, inspected 133 production files, found 23 allowlisted infrastructure files, and found zero code-generated supported mappings.

## Candidate/support separation

- Candidate proposals use `CANDIDATE_MAPPING_PROPOSAL_SCHEMA.json` and the separate `clinical-expansion-v2/candidate-mapping-proposals/` directory.
- Proposal records have exact candidate-only fields and one of four proposal statuses. Active support, origin, mapping-version, approval-sequence, manifest-hash, and signature fields are prohibited.
- A canonical-shaped record disguised as a candidate fails validation.
- Candidate files are not read by the canonical loader, runtime emitter, support accounting, or application overlay path.
- Candidate creation does not reduce the unsupported ledger or change signed support counts.
- Candidate code has no import or call path to signing or active transaction authority.
- `applyResearchBatch.mjs` rejects active mapping input, writes `legacy_item_support_mappings: []`, and can at most persist candidate proposals.

Finding: workflow-level research completion remains separate from item-level evidence approval. Research status cannot activate mapping support.

## Independent consumer findings

The reconciliation controller spawns five separate Node processes:

| Consumer | Independent source/path |
| --- | --- |
| Canonical-file inspector | Loads and validates signed canonical documents |
| Signed-manifest inspector | Verifies the envelope and reads signed manifest keys |
| Persisted-support inspector | Reloads canonical persistence documents in its own process |
| Runtime-emission inspector | Invokes the runtime ledger/emitter in its own process |
| Support-accounting inspector | Reloads canonical mappings and independently derives accounting keys |

Each process reports its own process ID, sorted exact mapping-key list, count, and independently computed key-set hash. The controller passes environment only, not a loaded mapping array. Reconciliation compares counts, hashes, and exact arrays and names each differing consumer. Existing tests prove five distinct process IDs, `0/0/0/0/0`, synthetic `1/1/1/1/1`, signed removal back to zero, and rejection of equal-count/different-key or different-hash views.

Finding: no single loaded mapping array is copied among the five views. Shared schema/crypto code remains common implementation, but state is independently reread per process.

## Test results

All commands were run from the required branch at the reviewed starting HEAD. The three permitted clinical blocker audits were the only non-zero exits.

| # | Command | Result |
| ---: | --- | --- |
| 1 | `npm run test:signed-mapping-manifest` | PASS - 8/8 |
| 2 | `npm run test:raw-canonical-json` | PASS - 5/5 |
| 3 | `npm run test:canonical-serializer-idempotence` | PASS - 9/9 |
| 4 | `npm run test:canonical-filesystem-integrity` | PASS - 6/6; symlink fixture platform-denied as noted below |
| 5 | `npm run test:candidate-support-separation` | PASS - 3/3 |
| 6 | `npm run test:independent-mapping-consumers` | PASS - 2/2 |
| 7 | `npm run audit:canonical-write-authority` | PASS - 11/11; 133 production files; 23 allowlisted files; zero generated support |
| 8 | `npm run verify:signed-canonical-reconciliation` | PASS - `0/0/0/0/0`; 83,303 unsupported |
| 9 | `npm run test:canonical-mapping-schema` | PASS - 6/6 |
| 10 | `npm run test:canonical-mapping-serializer` | PASS - 9/9 |
| 11 | `npm run test:declarative-mapping-architecture` | PASS - 12/12 |
| 12 | `npm run audit:no-code-generated-mappings` | PASS - 133 production files; zero generated support |
| 13 | `npm run verify:canonical-mapping-reconciliation` | PASS - `0/0/0/0/0`; 83,303 unsupported |
| 14 | `npm run test:gp-batch-support-contract` | PASS - 47/47 |
| 15 | `npm run audit:explicit-mapping-contract` | PASS - 63/63; zero active mappings |
| 16 | `npm run validate:data` | PASS - 1,500 workflows; 12 exclusions |
| 17 | `npm run validate:source-evidence` | PASS - 1,500 records; 224 sources |
| 18 | `npm run validate:item-provenance` | PASS - 83,303 items; zero source-derived |
| 19 | `npm run audit:no-generic-templates` | PASS - zero generic items |
| 20 | `npm run audit:exact-source-coverage` | EXPECTED CLINICAL BLOCKER - 0 exact, 576 partial, 99 no authority, 825 interrupted |
| 21 | `npm run audit:source-recency` | PASS - 224 sources |
| 22 | `npm run audit:uae-applicability` | EXPECTED CLINICAL BLOCKER - 601 findings across 576 workflows |
| 23 | `npm run audit:unsupported-legacy-content` | EXPECTED CLINICAL BLOCKER - 83,303 items |
| 24 | `npm run audit:research-claims` | PASS - 1,500 records |
| 25 | `npm run test:safety` | PASS - 16 checks; 12 exclusions |
| 26 | `npm run test:all-workflows` | PASS - 1,500/1,500/1,500 |
| 27 | `npm run test:output-safety` | PASS - 10 builders |
| 28 | `npm run test:exclusions` | PASS - 12 active; 0 proposed |
| 29 | `npm run verify:source-evidence-hashes` | PASS - 1,500 workflow, 1,500 evidence, 33 index hashes |
| 30 | `npm run verify:clinical-data-reproducibility` | PASS - public data unchanged |
| 31 | `npm run test:research-queue` | PASS - 13/13; queue itself was not run |
| 32 | `npm run lint` | PASS with pre-existing repository/Impeccable warnings only |
| 33 | `npm run build` | PASS |

## Platform-dependent and simulated limitations

- On this Windows host, creation of the approved-file symbolic-link fixture was denied with `EPERM`. That attempted substitution remained fail-closed, but the loader's post-creation symbolic-link rejection was not exercised for that fixture on this platform. The root junction/symlink test is likewise conditional on platform permission.
- Windows directory `fsync` may be unsupported. The transaction deliberately tolerates that platform error after syncing individual files and requires a full staged-state and post-swap active-state reopen/validation. Directory durability across abrupt power loss therefore remains platform/filesystem dependent.
- Rollback detection is complete only when `NAJM_MAPPING_APPROVAL_STATE_PATH` supplies an external trusted checkpoint. Without that external state, a cryptographically valid historical signed state cannot be distinguished from the current signed state.
- Static no-code-generation and import/data-flow analysis is defence in depth and necessarily models statically visible program behavior. It is not the cryptographic trust boundary.
- Positive mapping approval, removal, rollback, conflict, cleanup, and consumer tests use synthetic clinical context and ephemeral signing keys. No real clinical mapping was approved during this review.
- Operating-system, Node-runtime, and joint repository/private-key compromise are outside the declared threat model.

These limitations are documented, fail closed where exercised, and do not invalidate the reviewed signed activation boundary. Deployments requiring rollback resistance must configure and protect the external checkpoint.

## Final mapping reconciliation

| View | Mapping count |
| --- | ---: |
| Canonical files | 0 |
| Signed approval manifest | 0 |
| Persisted support | 0 |
| Runtime emission | 0 |
| Support accounting | 0 |

Exact key-set hash: `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`
Supported mappings: 0
Unsupported legacy items: 83,303
Reconciliation: equal across all five consumers

## Final authorization conclusion

The signed declarative mapping boundary is verified for the reviewed commit. Routine source-first research may resume from `gp-home-glucose-log-review`; research completion must continue to remain separate from item-level approval, and no real mapping may activate without the external Ed25519 signing path and complete signed reconciliation.

The queue was not resumed by this review. No push, deployment, merge, rebase, production-code modification, test modification, clinical research, or real mapping approval occurred.
