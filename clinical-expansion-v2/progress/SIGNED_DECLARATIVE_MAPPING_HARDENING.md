# Signed Declarative Mapping Hardening

Date: 2026-07-15
Branch: `source-first-guideline-expansion-1500-v2`
Starting HEAD: `69ddd0534e44c988dbae587e5a2931538f8da89c`
Status: technical hardening complete; independent review required
Clinical research queue: stopped

## Scope and frozen baseline

This change hardens the declarative canonical-mapping architecture only. It does not restore, create, or approve a real clinical mapping and it does not conduct clinical research.

The frozen baseline remained:

| Measure | Result |
| --- | ---: |
| Workflows | 1,500 |
| Terminal workflows 0001–0675 | 675 |
| `research_interrupted` workflows 0676–1500 | 825 |
| Exact-source workflows | 0 |
| Partial-source workflows | 576 |
| No-authoritative-source workflows | 99 |
| Canonical mappings | 0 |
| Signed-manifest mappings | 0 |
| Persisted active mappings | 0 |
| Runtime mappings | 0 |
| Accounting mappings | 0 |
| Supported mappings | 0 |
| Unsupported legacy items | 83,303 |
| Registered sources | 224 |
| Registered exact sections | 709 |
| Reviewed exact sections | 685 |
| UAE findings | 601 across 576 workflows |
| Active exclusions | 12 |
| Next workflow | `gp-home-glucose-log-review` |

`public/data/` and `public/config/limited_testing_exclusions.json` remain byte-for-byte unchanged relative to stable main. The stable `main` ref remains `95758951d46510f34548b5520510c5d9d59f017f`, and the protected forensic branch remains `9b4cddb0fb226543ce621cb14a672a4edf789261`.

## Independent audit findings addressed

The committed independent review found that the prior architecture could not prove serializer provenance. Its five reported views were clones of one loader result; a valid-looking file copied into the canonical directory could activate; hard links and root substitutions were insufficiently checked; unresolved imports could fail open; candidate and support shapes were insufficiently separated; and the serializer was object-based, order-preserving, unbounded, accessor-executing, and non-idempotent.

The hardened activation boundary is now:

1. valid strict canonical JSON;
2. a valid detached Ed25519 signature over deterministic manifest bytes;
3. exact signed path, byte length, SHA-256, workflow, count, and mapping-key matches; and
4. strict loader validation against the repository research/source/item context.

Schema validity and filesystem placement alone are explicitly insufficient.

## Threat model

Repository JavaScript and TypeScript are not trusted to approve mappings. A repository writer without the external signing key may write, copy, append, rename, stream, link, or otherwise place bytes, but those bytes do not become active support unless the complete signed state validates.

The architecture is designed to prevent accidental activation and activation through unauthorized repository code paths. The AST/data-flow guards are defence in depth, not the security boundary. This does not claim to protect against an actor who controls both the repository and the external private signing key, against a compromised Node runtime, or against a compromised operating system account that can replace both trust roots.

## Ed25519 approval and key handling

- Public verification key: `clinical-expansion-v2/config/CANONICAL_MAPPING_APPROVAL_PUBLIC_KEY.pem`
- External private-key contract: absolute path in `NAJM_MAPPING_SIGNING_KEY_PATH`
- Optional external rollback checkpoint: absolute path in `NAJM_MAPPING_APPROVAL_STATE_PATH`
- Private keys are rejected when their lexical path or resolved real path is inside the repository.
- Private keys must be normal, non-symbolic, single-link regular files and must decode as Ed25519 PKCS#8 keys.
- There is no embedded development key and no unsigned production fallback.
- Tests generate ephemeral Ed25519 key pairs under isolated operating-system temporary directories and remove those directories afterward.

The production empty state is explicit rather than implicit:

- Manifest: `clinical-expansion-v2/canonical-mappings/APPROVED_MANIFEST.json`
- Detached signature: `clinical-expansion-v2/canonical-mappings/APPROVED_MANIFEST.sig`
- Approval sequence: 1
- Approved files: 0
- Approved mapping keys: 0

## Signed approval manifest

The strict manifest schema is `clinical-expansion-v2/schema/CANONICAL_MAPPING_APPROVAL_MANIFEST_SCHEMA.json`.

The deterministic manifest contains, in fixed field order:

- manifest and canonical schema versions;
- repository namespace;
- canonical UTC creation timestamp;
- safe-integer approval sequence;
- previous-manifest SHA-256 linkage;
- sorted exact canonical file entries;
- sorted exact mapping-key entries; and
- aggregate SHA-256.

Each file entry binds exact relative path, workflow ID, SHA-256, byte length, mapping count, and sorted keys (`workflowId`, `itemId`, `sourceId`, `sectionId`). Ed25519 signs the complete deterministic manifest bytes. The timestamp is signed for auditability but is not relied upon as the security boundary.

The loader rejects missing or invalid signatures, wrong keys, namespaces or versions, unsafe/duplicate/case-colliding paths, unsafe sequences, broken checkpoint linkage, modified or missing files, unlisted files, incorrect byte counts or hashes, workflow/filename mismatches, count/key mismatches, duplicate keys, and aggregate mismatches.

Rollback protection is enforced when prior state is available through the external checkpoint. Without an external checkpoint, a standalone signed historical state cannot be distinguished from a current signed state; deployments that require rollback protection must configure `NAJM_MAPPING_APPROVAL_STATE_PATH` outside the repository.

## Canonical mapping schema

The active file schema remains `clinical-expansion-v2/schema/CANONICAL_MAPPING_FILE_SCHEMA.json`, now with explicit bounds. Files use fixed document and mapping field orders and contain only strict schema-owned JSON data. Every mapping must pass exact workflow/item ownership, source/section registration, reviewed-source and reviewed-section checks, exact source and section hashes, substantive mapping-specific applicability checks, permitted support/origin values, and canonical version checks.

One workflow item may have only one active mapping. A conflicting exact key or another mapping for the same workflow/item fails closed.

## Raw-JSON-only serializer

`scripts/source-first/writeCanonicalMapping.mjs` is a CLI-only entry point. It has no exports and accepts only `--input <path>` or `--initialize-empty`. Approval input must be a normal, single-link regular file outside the active canonical directory, including after real-path resolution. The approval transaction itself accepts only `Buffer` or `Uint8Array` bytes.

The parser:

- limits raw bytes before decoding;
- requires strict UTF-8 and rejects a BOM;
- rejects comments, trailing commas, malformed JSON, malformed nesting, and invalid UTF-8;
- detects duplicate raw properties before `JSON.parse`;
- detects Unicode-escaped and NFC-equivalent property collisions;
- rejects `__proto__`, `constructor`, and `prototype` properties;
- enforces depth, array, string, identifier, applicability, and rationale limits; and
- validates the complete clinical mapping contract before staging any active file.

Because the boundary receives raw bytes rather than a caller-created JavaScript object, accessors and inherited properties cannot execute. A direct import of the CLI exposes no mapping factory.

## Determinism and idempotence

Canonical document, mapping, manifest, file-entry, and mapping-key field orders are fixed by contract. Mapping arrays, manifest file entries, and key arrays are sorted by exact keys/paths. JSON is formatted deterministically with LF endings and one final newline.

An identical request—including semantically equivalent raw input with reordered fields, mapping order, whitespace, or final-newline differences—is a true no-op:

- canonical bytes unchanged;
- manifest bytes unchanged;
- signature unchanged;
- approval sequence unchanged; and
- no timestamp-only update.

Conflicting replay fails closed. Removal requires the separate raw-key CLI `scripts/source-first/removeCanonicalMapping.mjs`, creates a new signed transaction, and removes the workflow file when its last mapping is withdrawn.

## Resource limits

| Resource | Limit |
| --- | ---: |
| Approval input | 64 KiB |
| Canonical file | 32 MiB |
| Approval manifest | 64 MiB |
| Detached signature file | 1 KiB |
| Canonical files | 1,500 |
| Mappings per workflow | 5,000 |
| Total mappings | 100,000 |
| Identifier | 256 characters |
| General string | 8,192 characters |
| Evidence/applicability/rationale fields | 4,096 characters |
| JSON nesting depth | 20 |
| JSON array length | 100,000 |

Tests exercise below-limit, exact-limit, and over-limit boundaries for important string, array, depth, and rationale limits, plus over-limit raw input.

## Filesystem integrity

The production root is fixed; path overrides are accepted only when `NAJM_MAPPING_TEST_MODE=1`. The loader:

- uses `lstat` and real-path checks for the canonical root;
- rejects symbolic links, junction/root substitutions where detectable, non-directories, and unexpected real roots;
- permits only the two envelope files, `.gitkeep`, and strict workflow JSON filenames;
- rejects hidden, temporary, backup, unsupported, nested, case-colliding, and unexpected entries;
- rejects absolute paths, traversal, mixed separators, encoded paths, colons/alternate-stream syntax, and filename/workflow mismatches;
- opens every manifest, signature, public key, checkpoint, and canonical file by descriptor;
- requires regular files with one hard link;
- compares `fstat` identity, size, link count, modification time, and change time before and after reading; and
- hashes the exact descriptor bytes that were validated.

On this Windows environment, junction/symlink fixture creation was denied with `EPERM`; the operation was therefore denied by the platform and remained fail-closed. On platforms where creation succeeds, the loader rejection is asserted.

Unsigned copies never activate. A copied complete state with the exact already-valid signature, namespace, paths, hashes, and sequence represents the same already-approved content; copying itself is not claimed to invalidate cryptographic approval. A stale signed copy is rejected when the external rollback checkpoint is available.

## Transaction model

The writer acquires an exclusive sibling lock with `wx`. Existing or ambiguous locks fail closed. It loads the current signed state, builds a complete sibling staging directory, writes files with `wx`, fsyncs files, signs the deterministic manifest with the external key, verifies the staged state through the production loader, swaps directories, verifies the active state again, updates the optional external checkpoint, and removes the backup and lock.

An interrupted active root with a lock, temporary entry, missing envelope, mismatching envelope, or unlisted file is unavailable rather than partially active. Directory fsync is attempted; unsupported Windows directory fsync is tolerated only after all individual files have been synced and the subsequent active-state re-open succeeds.

## Defence-in-depth write authority

Active signing/writing is limited to:

- `scripts/source-first/writeCanonicalMapping.mjs` — raw approval CLI;
- `scripts/source-first/removeCanonicalMapping.mjs` — exact signed removal CLI; and
- `scripts/source-first/canonicalMappingTransaction.mjs` — the shared signed transaction implementation.

The architectural guard allowlists only the signed infrastructure, validators, inspectors, and isolated test harness. Outside that boundary it rejects serializer imports, unauthorized active readers, mapping literals/factories, alternate support stores, and synchronous/asynchronous write, append, stream, copy, cp, rename, link, symlink, open/write, pipe, and statically visible external copy/move paths. It resolves constants, aliases, joins, concatenation, templates, imported path constants, and split path fragments. Query/hash imports are prohibited.

Non-infrastructure production readers are limited to `scripts/source-first/applyResearchBatch.mjs` and `scripts/source-first/runCheck.mjs`; all other consumers are named signed infrastructure modules. The manifest signature remains decisive even if the static guard misses an operation.

## Independent reconciliation

`scripts/source-first/canonicalMappingReconciliation.mjs` spawns five separate Node processes and never passes one loaded mapping array between them:

| View | Implementation | Source read independently |
| --- | --- | --- |
| Canonical files | `inspectCanonicalFiles.mjs` | signed canonical documents |
| Approval manifest | `inspectApprovalManifest.mjs` | signed manifest mapping keys |
| Persisted support | `inspectPersistedSupport.mjs` | canonical persistence documents |
| Runtime emission | `inspectRuntimeMappings.mjs` | runtime ledger/emitter |
| Support accounting | `inspectSupportAccounting.mjs` | derived accounting keys and supported items |

Each emits its own process ID, sorted exact key list, count, and key-set hash. Reconciliation compares counts, exact key arrays, and hashes and names the differing view on failure. Shared low-level schema/crypto utilities are used, but no loaded state or in-memory mapping array is shared across processes.

The positive synthetic path reconciled `1 / 1 / 1 / 1 / 1`; signed removal returned to `0 / 0 / 0 / 0 / 0`. Equal-count/different-key and equal-count/different-hash probes failed.

## Support accounting and stored summaries

Signed canonical mappings are the only active support source. Supported item keys and mapping keys are derived from that state. Unsupported legacy rows are computed by subtracting signed workflow/item keys from the immutable unsupported ledger. Activation and removal therefore change accounting once, without a manual dual-write path.

Workflow and research support-summary fields are not authoritative and candidate batches do not update them as active support. Research processing derives programme-level support totals from the signed store and continues to write zero embedded active mappings.

## Candidate/support separation

Candidate proposals live only under `clinical-expansion-v2/candidate-mapping-proposals/` and use `clinical-expansion-v2/schema/CANDIDATE_MAPPING_PROPOSAL_SCHEMA.json`.

Allowed proposal fields are workflow/item/source/section IDs, proposal rationale, population/setting/UAE assessments, and one of four proposal-only statuses. Active fields such as support status, origin, mapping version, approval sequence, manifest hash, or signature are prohibited. A canonical-shaped record disguised with candidate status fails. Candidate files are not read by the canonical loader, runtime emitter, accounting, provenance ledger, or application overlay generation.

## Import-resolution policy

Mapping-infrastructure local imports must resolve exactly. Local query/hash suffixes and backslash/malformed specifiers are rejected. Unresolved default, named, namespace, side-effect, dynamic, named re-export, export-star member, and local imports fail closed. Export/import cycles terminate deterministically.

The exact external allowlist is:

- `node:child_process`
- `node:crypto`
- `node:fs`
- `node:path`
- `node:url`
- `typescript`

Unknown packages and invented `node:` modules fail closed.

## Positive and adversarial results

The synthetic approval tests used only generated workflow, item, source, section, and Ed25519 fixtures. They verified exact source/section hashes, canonical ordering, signed manifest creation, detached signature verification, five-process reconciliation, accounting subtraction once, no-op replay, conflict rejection, exact signed removal, restoration of unsupported accounting, and fixture/key cleanup.

Adversarial tests rejected unsigned canonical files, missing/modified/wrong-key signatures, wrong namespace, modified files/manifests, appended files, copied/renamed/stream-written files, hard links, symbolic links, unexpected roots, locks, hidden/backup/temp entries, missing/extra files, unsafe/duplicate paths, duplicate/case-equivalent keys, equal-count key mismatch, byte mismatch, aggregate mismatch, sequence rollback, broken previous linkage, conflict replay, accessor/object input, direct serializer import, over-limit data, canonical-shaped candidates, alternate support stores, and unresolved imports.

## Internal clean-context review

| Review question | Result |
| --- | --- |
| Unsigned or copied unsigned file activates | No; exact envelope/file reconciliation fails |
| Signed file without exact manifest activates | No |
| Wrong key or namespace activates | No |
| Serializer receives arbitrary JavaScript objects | No; bytes only |
| Accessor getters execute | No |
| Duplicate raw keys are accepted | No |
| Identical replay changes state | No |
| Field and mapping order is caller-controlled | No |
| Unbounded strings/files are accepted | No |
| Symlinks or hard links are accepted | No |
| Junction substitution is silently accepted | No; detected or platform-denied fail-closed |
| Unresolved imports fail open | No |
| Canonical shape can hide as candidate | No |
| Five views share one in-memory array | No; five subprocesses |
| Positive signed mapping works | Yes, synthetic only |
| Conflicting replay fails | Yes |
| Signed removal works | Yes |
| Final state returns to zero | Yes |
| Fixture/private key remains in repository or temp | No |
| Real clinical record changed | No |

## Acceptance command matrix

| # | Command | Result |
| ---: | --- | --- |
| 1 | `npm run test:signed-mapping-manifest` | PASS — 8/8 |
| 2 | `npm run test:raw-canonical-json` | PASS — 5/5 |
| 3 | `npm run test:canonical-serializer-idempotence` | PASS — 9/9 |
| 4 | `npm run test:canonical-filesystem-integrity` | PASS — 6/6 |
| 5 | `npm run test:candidate-support-separation` | PASS — 3/3 |
| 6 | `npm run test:independent-mapping-consumers` | PASS — 2/2 |
| 7 | `npm run audit:canonical-write-authority` | PASS — 11/11; 133 production files |
| 8 | `npm run verify:signed-canonical-reconciliation` | PASS — `0/0/0/0/0` |
| 9 | `npm run test:canonical-mapping-schema` | PASS — 6/6 |
| 10 | `npm run test:canonical-mapping-serializer` | PASS — 9/9 |
| 11 | `npm run test:declarative-mapping-architecture` | PASS — 12/12 |
| 12 | `npm run audit:no-code-generated-mappings` | PASS — zero generated support |
| 13 | `npm run verify:canonical-mapping-reconciliation` | PASS — `0/0/0/0/0` |
| 14 | `npm run test:gp-batch-support-contract` | PASS — 47/47 |
| 15 | `npm run audit:explicit-mapping-contract` | PASS — 63/63; zero mappings |
| 16 | `npm run validate:data` | PASS — 1,500 workflows, 12 exclusions |
| 17 | `npm run validate:source-evidence` | PASS — 1,500 records, 224 sources |
| 18 | `npm run validate:item-provenance` | PASS — 83,303 items, zero source-derived |
| 19 | `npm run audit:no-generic-templates` | PASS — zero generic items |
| 20 | `npm run audit:exact-source-coverage` | EXPECTED CLINICAL BLOCKER — 0 exact, 576 partial, 99 no-authority, 825 interrupted |
| 21 | `npm run audit:source-recency` | PASS — 224 sources |
| 22 | `npm run audit:uae-applicability` | EXPECTED CLINICAL BLOCKER — 601 findings across 576 workflows |
| 23 | `npm run audit:unsupported-legacy-content` | EXPECTED CLINICAL BLOCKER — 83,303 items |
| 24 | `npm run audit:research-claims` | PASS — 1,500 records |
| 25 | `npm run test:safety` | PASS — 16 checks, 12 exclusions |
| 26 | `npm run test:all-workflows` | PASS — 1,500/1,500/1,500 |
| 27 | `npm run test:output-safety` | PASS — 10 builders |
| 28 | `npm run test:exclusions` | PASS — 12 active, 0 proposed |
| 29 | `npm run verify:source-evidence-hashes` | PASS — 1,500 workflow, 1,500 evidence, 33 index hashes |
| 30 | `npm run verify:clinical-data-reproducibility` | PASS — public data unchanged |
| 31 | `npm run test:research-queue` | PASS — 13/13; queue not run |
| 32 | `npm run lint` | PASS with pre-existing Impeccable/repository warnings only |
| 33 | `npm run build` | PASS |

Only the three permitted clinical blocker audits remain blocked. Every signing, raw-JSON, serializer, filesystem, candidate-separation, independent-consumer, architecture, safety, queue, hash, lint, and build check passes.

## Final confirmation and residual limitations

- No clinical mapping was restored, created, or signed.
- No clinical research occurred.
- The research queue remained stopped.
- Workflows 0676 onward remained unchanged.
- `public/data/` remained unchanged.
- Active exclusions remained 12.
- No private key or synthetic fixture remains in the repository or operating-system temporary directories.
- No push, deployment, merge, rebase, or queue continuation occurred.

Residual limitations are deliberate and explicit: cryptographic approval cannot protect against joint compromise of the repository and external signing key; rollback detection requires the external approval checkpoint; operating-system and Node-runtime compromise are out of scope; and Windows junction creation was platform-denied rather than exercised on this host. Independent forensic review is required before relying on this architecture for real clinical mapping approvals.
