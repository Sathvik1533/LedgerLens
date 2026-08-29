\---

status: DRAFT

last\_updated: 2026-08-24

source\_of\_truth: ../research-exit-SOURCE-OF-TRUTH.md

review\_required: true

\---

\# FAILURE\_AND\_RECOVERY.md

\> \*\*Scope guard:\*\* This file defines failure handling only for the approved MVP workflow — exception-first multi-source reconciliation. It does not add new financial exception types; the eight values in \`docs/DATA\_CONTRACT.md\` remain closed. It does not define controls for Settlement Q\&A, forward cash forecasting, or tax-line matching. It does not generate application code.

\#\# 1\. Relationship to the financial exception catalogue

Technical and ingestion failures never become one of the eight financial exception types. They are tracked through \`failure\_type\` and \`failure\_reason\`, together with the appropriate batch or case status. A row that fails validation never reaches the matching engine and therefore cannot be assigned \`amount\_mismatch\` or another financial exception. If the row is corrected and resubmitted, it is evaluated afresh; the earlier failure remains only in the audit or operational history.

Financial exceptions describe business or reconciliation conditions. Technical and data-quality failures describe whether the system could safely process the input or complete a service operation. This document treats that precedence question as settled for the MVP; any future update to the financial exception catalogue documentation should reference this section rather than reopening the question.

\#\# 2\. Status fields and ownership

These fields are independent and must not be conflated.

| Field | Scope | Meaning |

|---|---|---|

| \`batch\_status\` | Whole batch | \`received\`, \`validating\`, \`processing\`, \`completed\`, \`completed\_with\_errors\`, \`rejected\`, \`paused\`, \`failed\`, \`already\_processed\` |

| \`decision\_status\` | One reconciliation case | \`auto\_reconciled\`, \`needs\_review\`, \`unresolved\`, \`rejected\`, \`blocked\`, \`already\_processed\` |

| \`technical\_status\` | One case or processing operation | \`success\`, \`retrying\`, \`degraded\`, \`failed\`, \`paused\` |

| \`confidence\` | One financial case | \`high\`, \`medium\`, \`low\`, \`unavailable\`, \`not\_applicable\` |

| \`failure\_type\` | Technical/data-quality failure | Controlled vocabulary; current values are listed in Section 12 |

| \`failure\_reason\` | Technical/data-quality failure | Specific human-readable detail |

\`decision\_status \= blocked\` may be used for an invalid row or case only. It must never be used as the primary status of a whole batch.

For a batch where no case exists, \`decision\_status\` is \`not\_applicable\`, not \`blocked\`.

\#\#\# Status ownership rule

\- Use \`batch\_status\` for the whole batch.

\- Use \`decision\_status\` for a reconciliation case.

\- Use \`technical\_status\` for the technical condition of a case or operation.

\- Use \`confidence\` for certainty about the financial result.

\- Use \`failure\_type\` and \`failure\_reason\` for technical or data-quality failures.

Severity (\`Critical\`, \`High\`, \`Medium\`, \`Low\`) and scope (\`Batch\`, \`Row\`, \`Batch-system\`) are triage attributes used for readability in this document. They are not additional canonical status enums unless later added deliberately.

\#\# 3\. Batch-blocking versus row-level failures

\#\#\# Batch-blocking failures

\- Unparseable file.

\- Missing required columns.

\- Database unavailable when persistence is required.

\- Migration or schema failure.

For a batch-blocking failure before case creation:

\`\`\`text

batch\_status \= rejected | paused | failed

case\_status \= not\_applicable

\`\`\`

\#\#\# Row-level failures

\- Invalid amount.

\- Missing row identifier.

\- One unmatched record.

\- One ambiguous match.

\- One model timeout.

\- One malformed model response.

When valid rows finish and some rows are excluded:

\`\`\`text

batch\_status \= completed\_with\_errors

\`\`\`

\#\# 4\. Missing required CSV columns

\#\#\# 5W1H

\- \*\*Who:\*\* Ingestion and validation service.

\- \*\*What:\*\* One or more required columns are absent.

\- \*\*When:\*\* Before row storage, normalisation, or matching.

\- \*\*Where:\*\* FastAPI ingestion endpoint and validation service.

\- \*\*Why:\*\* A structurally invalid batch cannot be safely processed.

\- \*\*How:\*\* Reject the batch and name every missing column and source table.

| Attribute | Policy |

|---|---|

| Retry limit | \`0\`; a human must correct and resubmit the file |

| Backoff | Not applicable |

| Fallback | None; no partial batch is accepted |

| Scope | Batch |

| Severity | Critical |

| \`batch\_status\` | \`rejected\` |

| \`decision\_status\` | \`not\_applicable\`; no case was created |

| \`technical\_status\` | Not applicable at case level |

| \`confidence\` | \`not\_applicable\` |

| \`failure\_type\` | \`missing\_required\_columns\` |

| \`failure\_reason\` | Missing-column list and source-table name |

| Audit event | \`batch\_rejected\` with actor, timestamp, source table, and missing columns |

\#\#\# Test case

Submit a payments CSV without \`payment\_id\`. Assert that:

\- The batch is rejected; \`batch\_status \= rejected\`.

\- No case-level \`decision\_status\` is created.

\- Zero raw or normalised rows are persisted.

\- Exactly one \`batch\_rejected\` event is recorded if durable persistence is available.

\#\# 5\. Invalid amount

\#\#\# 5W1H

\- \*\*Who:\*\* Row-level normalisation and validation service.

\- \*\*What:\*\* Amount is non-numeric, invalidly negative, or has invalid precision.

\- \*\*When:\*\* After batch-level structure validation and before matching.

\- \*\*Where:\*\* Normalisation service.

\- \*\*Why:\*\* One invalid row should not prevent valid rows from being processed.

\- \*\*How:\*\* Preserve the raw value, exclude the row, record the failure, and continue.

| Attribute | Policy |

|---|---|

| Retry limit | \`0\`; correction is required |

| Backoff | Not applicable |

| Fallback | Exclude the row from matching; continue valid rows |

| Scope | Row |

| Severity | Medium |

| \`batch\_status\` | \`completed\_with\_errors\` if the remaining valid rows finish |

| \`decision\_status\` | \`blocked\` for this row only |

| \`technical\_status\` | \`failed\` for this row |

| \`confidence\` | \`not\_applicable\` |

| \`failure\_type\` | \`invalid\_amount\` |

| \`failure\_reason\` | Validation rule and preserved raw value |

| Audit event | \`row\_excluded\_data\_quality\` |

\#\#\# Test case

Inject a non-numeric amount. Assert the invalid row is excluded, the raw value is preserved, valid rows continue, the batch reports \`completed\_with\_errors\`, and the excluded-row count is included in the result.

\#\# 6\. Model timeout

\#\#\# 5W1H

\- \*\*Who:\*\* AI/RAG call wrapper.

\- \*\*What:\*\* A bounded model request does not respond in time.

\- \*\*When:\*\* During optional candidate assistance, classification assistance, explanation, or recommendation.

\- \*\*Where:\*\* AI/RAG service.

\- \*\*Why:\*\* A slow model must not block the batch, and deterministic evidence already exists for the case.

\- \*\*How:\*\* Retry once (bounded), then use the deterministic evidence summary and route the case to review if AI assistance was required.

| Attribute | Policy |

|---|---|

| Retry limit | \`1\` — proposed prototype default; source states only "bounded," not a number |

| Backoff | Immediate single retry; exact timeout/backoff remain a Gate 5 configuration item |

| Fallback | Deterministic evidence summary and calculated reason |

| Scope | Row/case |

| Severity | Low–Medium |

| \`batch\_status\` | Continues normally unless another failure occurs |

| \`decision\_status\` | \`needs\_review\` if AI assistance was required |

| \`technical\_status\` | \`retrying\`, then \`degraded\` once fallback engages |

| \`confidence\` | \`unavailable\` for the AI result |

| \`failure\_type\` | \`ai\_timeout\` |

| \`failure\_reason\` | Call type, timeout, retry count, timestamp |

| Audit event | \`ai\_call\_timeout\` |

\#\#\# Test case

Mock every model call to time out. Assert exactly one retry, deterministic fallback is used, \`confidence \= unavailable\`, \`decision\_status \= needs\_review\`, and an audit/structured-log event is recorded. Timeout never produces \`auto\_reconciled\` or high confidence.

\#\# 7\. Malformed model JSON

\#\#\# 5W1H

\- \*\*Who:\*\* Pydantic response validator.

\- \*\*What:\*\* The model response is invalid JSON or fails the required schema.

\- \*\*When:\*\* Immediately after the model responds, before its output is used anywhere.

\- \*\*Where:\*\* AI/RAG response-parsing layer.

\- \*\*Why:\*\* Unvalidated model output must never be trusted as fact or influence a financial workflow.

\- \*\*How:\*\* Retry once; if still malformed, discard the output entirely, use deterministic evidence, and route to review.

| Attribute | Policy |

|---|---|

| Retry limit | \`1\`, explicit |

| Backoff | None; same-call retry, not delayed |

| Fallback | Ignore invalid output; deterministic evidence remains authoritative |

| Scope | Row/case |

| Severity | Low–Medium |

| \`decision\_status\` | \`needs\_review\` if AI assistance was required |

| \`technical\_status\` | \`retrying\`, then \`degraded\` |

| \`confidence\` | \`unavailable\` for the AI result |

| \`failure\_type\` | \`ai\_malformed\_json\` |

| \`failure\_reason\` | Schema-validation error and call type |

| Audit event | \`ai\_output\_rejected\`; redact anything resembling hidden ground truth |

\#\#\# Test case

Return schema-invalid model output. Assert one retry, deterministic fallback, \`decision\_status \= needs\_review\`, and confirm the invalid payload never reaches the case record or the UI.

\#\# 8\. No match found

\#\#\# 5W1H

\- \*\*Who:\*\* Deterministic reconciliation engine.

\- \*\*What:\*\* No plausible candidate remains after the broader deterministic pass.

\- \*\*When:\*\* End of matching stage 3, before any AI candidate-suggestion step would otherwise run.

\- \*\*Where:\*\* Reconciliation engine.

\- \*\*Why:\*\* AI must never be asked to invent a candidate from nothing; honestly reporting "nothing found" is safer than forcing a low-confidence match.

\- \*\*How:\*\* Create an unresolved case with a clear reason; no financial exception type is forced when no dedicated exception applies.

| Attribute | Policy |

|---|---|

| Retry limit | None further; the broader pass itself is the one extra attempt beyond exact matching |

| Backoff | Not applicable |

| Fallback | None; unresolved is the honest outcome |

| Scope | Row/case |

| Severity | Medium |

| \`exception\_type\` | \`null\` where no dedicated financial exception applies |

| \`resolution\_reason\` | \`no\_candidate\_found\` |

| \`decision\_status\` | \`unresolved\` |

| \`technical\_status\` | \`success\`; the engine ran correctly — "no match" is a business outcome, not a technical failure |

| \`confidence\` | \`low\` |

| \`failure\_type\` | Not applicable; this is a business outcome, not a technical failure |

| Audit event | \`case\_unresolved\_no\_candidate\` |

\#\#\# Test case

Construct a refund row with no plausible matching payment. Assert \`resolution\_reason \= no\_candidate\_found\`, \`decision\_status \= unresolved\`, \`confidence \= low\`, \`technical\_status \= success\`.

\#\# 9\. Equal candidate scores (\`ambiguous\_match\`)

\#\#\# 5W1H

\- \*\*Who:\*\* Reconciliation engine / policy engine, after the broader deterministic pass and any optional advisory AI scoring.

\- \*\*What:\*\* Two or more candidates score equally; no single best match.

\- \*\*When:\*\* After the broader pass, when a tie remains among plausible candidates.

\- \*\*Where:\*\* Reconciliation engine / policy engine.

\- \*\*Why:\*\* Picking one tied candidate at random, or letting AI break the tie, risks a false financial match.

\- \*\*How:\*\* No blind pick and no blind retry; surface all tied candidates and their evidence to human review.

| Attribute | Policy |

|---|---|

| Retry limit | \`0\` blind retries |

| Backoff | Not applicable |

| Fallback | Show all candidates and evidence in the review UI |

| Scope | Row/case |

| Severity | Medium |

| \`exception\_type\` | \`ambiguous\_match\` |

| \`resolution\_reason\` | \`multiple\_candidates\` |

| \`decision\_status\` | \`needs\_review\` |

| \`technical\_status\` | \`success\` |

| \`confidence\` | \`low\` |

| Audit event | \`ambiguous\_match\_flagged\` with all tied candidate IDs and scores |

\#\#\# Test case

Construct two refund candidates that score identically. Assert \`exception\_type \= ambiguous\_match\`, \`resolution\_reason \= multiple\_candidates\`, \`decision\_status \= needs\_review\`, and both candidates are present in the case's evidence.

\#\# 10\. Supabase/database unavailable

\#\#\# 5W1H

\- \*\*Who:\*\* SQLAlchemy persistence layer.

\- \*\*What:\*\* Database connection or query fails.

\- \*\*When:\*\* Any operation requiring durable reads or writes during batch processing.

\- \*\*Where:\*\* FastAPI backend / SQLAlchemy layer.

\- \*\*Why:\*\* A decision must never be implied or acted on without confirmed durable storage.

\- \*\*How:\*\* Bounded retry with backoff; if still unavailable, persist nothing and pause batch processing.

| Attribute | Policy |

|---|---|

| Retry limit | \`3\` — proposed prototype default, not numerically fixed elsewhere |

| Backoff | Exponential, e.g. 1s, 2s, 4s — proposed default, tune during implementation |

| Fallback | No decisions persisted; batch/system processing paused |

| Scope | Batch/system |

| Severity | Critical |

| \`batch\_status\` | \`paused\` after bounded retries are exhausted |

| \`decision\_status\` | \`not\_applicable\` for any case with no durable final decision — never \`blocked\` at batch level |

| \`technical\_status\` | \`retrying\` during attempts, then \`paused\` at batch/system level once fallback engages |

| \`confidence\` | \`not\_applicable\` where no case decision exists |

| \`failure\_type\` | \`db\_unavailable\` |

| \`failure\_reason\` | Connection/timeout details, retry count, timestamp |

| Audit event | No durable database audit event is claimed during the outage; write a redacted structured fallback log instead |

\#\#\# Fallback logging rule

The fallback log may contain only:

\- Event type.

\- Batch ID, if known.

\- Request ID, if known.

\- Timestamp.

\- Retry count.

\- Error category.

\- Pause action.

It must never contain secrets, hidden ground truth, or unnecessary financial/customer data. Reconciling fallback-log entries into durable audit records is a future production-hardening task — the fallback log is not itself claimed to be a durable audit record.

\#\#\# Test case

Mock the database client to fail on every call. Assert the bounded retry/backoff sequence runs, no partial financial decision is committed, no unpersisted approval is treated as final, \`batch\_status \= paused\`, and the redacted structured fallback log captures the event.

\#\# 11\. Duplicate batch upload

\#\#\# 5W1H

\- \*\*Who:\*\* Idempotency guard at the ingestion boundary.

\- \*\*What:\*\* A submission's idempotency key matches a previously processed batch.

\- \*\*When:\*\* Immediately at ingestion, before validation/normalisation runs again.

\- \*\*Where:\*\* FastAPI batch-ingestion endpoint.

\- \*\*Why:\*\* Reprocessing an identical batch must never create duplicate financial actions or double-counted metrics.

\- \*\*How:\*\* Short-circuit; return the original batch's result rather than reprocessing anything.

| Attribute | Policy |

|---|---|

| Retry limit | Not applicable; no duplicate processing occurs |

| Backoff | Not applicable |

| Fallback | Return the original result set |

| Scope | Batch |

| Severity | Low when the idempotency guard is correct; High if it is not — its correctness depends on the (unresolved) idempotency-key derivation mechanism |

| \`batch\_status\` | \`already\_processed\` |

| \`decision\_status\` | Not applicable for the duplicate request itself; original cases retain their statuses |

| \`technical\_status\` | \`success\` |

| \`confidence\` | \`not\_applicable\` |

| \`failure\_type\` | Not applicable — this is an idempotency outcome, not a \`failure\_type\` |

| Audit event | \`duplicate\_batch\_detected\`: original batch ID, idempotency key, timestamp of duplicate attempt |

\#\#\# Test case

Submit an identical batch twice. Assert the second submission returns the same batch ID/result set, no new rows are created, \`batch\_status \= already\_processed\` for the second attempt, and exactly one \`duplicate\_batch\_detected\` audit event is written.

\#\# 12\. Failure-type controlled vocabulary

Current prototype vocabulary:

\`\`\`text

missing\_required\_columns

invalid\_amount

ai\_timeout

ai\_malformed\_json

db\_unavailable

\`\`\`

Additional values may be added during implementation only when a new failure mode is genuinely implemented, and only if:

\- The value is documented.

\- The value's scope and status behaviour are defined.

\- A test case exists for it.

\- The value does not change or extend the closed eight-value financial \`exception\_type\` enum.

\`duplicate\_batch\` is \*\*not\*\* a \`failure\_type\`. It is an idempotency outcome represented by \`batch\_status \= already\_processed\`.

\#\# 13\. Batch-status transitions

\`\`\`text

received → validating → processing

validating → rejected

processing → completed

processing → completed\_with\_errors

processing → paused

paused → processing

processing → failed

\`\`\`

\- \`rejected\` is terminal for that submitted batch.

\- \`already\_processed\` is returned for a duplicate submission and does not create a new batch.

\- \`completed\` means all eligible rows finished without row-level exclusions or processing errors.

\- \`completed\_with\_errors\` means the batch completed but one or more rows were excluded or degraded.

\- \`paused\` means processing stopped safely and may resume after recovery.

\- \`failed\` is reserved for an explicit unrecoverable error or operator termination — \*\*not\*\* merely because retries were exhausted.

\- A paused batch must not report final case decisions that were not durably persisted.

Exact implementation of resume/retry mechanics remains a Gate 1/Gate 7 concern, but these semantics are fixed for the MVP.

\#\# 14\. Production-oriented requirements (not in MVP scope)

This document does not expand MVP scope. It records, for future hardening, what would be needed before live financial data: authentication/authorisation, tenant isolation, secret management, encryption in transit and at rest, append-only audit-storage permissions, backups/restore drills, rate limits, background processing for large batches, strong idempotency under concurrent requests, model-provider fallback, prompt/model versioning, monitoring and alerting, incident response, data-retention policy, security/compliance review, load testing, formal human-approval controls, and reconciliation of outage fallback logs into durable audit records.

\#\# 15\. Open questions

\- Exact model-timeout and database-retry values, to be confirmed after implementation testing (Gate 1/5/7).

\- Exact idempotency-key derivation and concurrent-request behaviour.

\- Whether raw and normalised records use separate tables or separate columns.

\- Final \`resolution\_reason\` values for \`rejected\`, \`blocked\`, and \`already\_processed\` outcomes.

\- Exact persistence/recovery mechanism for paused batches.

\- Whether fallback logs are retained locally or sent to an external log service in the production design.

\- Whether a null settlement-linkage field should map to a dedicated reason (e.g. \`missing\_settlement\`) rather than the generic \`no\_candidate\_found\` — flagged as an assumption from one candidate draft, not confirmed here.

No open question changes the approved MVP scope. New decisions must be recorded in the source of truth (or an ADR) before implementation scope changes.

\#\# 16\. Acceptance checklist

\- \[ \] Every listed failure has a 5W1H explanation.

\- \[ \] Every failure has a bounded retry or an explicit no-retry policy.

\- \[ \] Every failure has a fallback or a clear reason none exists.

\- \[ \] Batch-level and row-level failures are separated.

\- \[ \] \`batch\_status\` is never confused with \`decision\_status\`.

\- \[ \] \`decision\_status \= blocked\` is never used as the primary status of a whole batch.

\- \[ \] \`failure\_type\`/\`failure\_reason\` are kept separate from the eight financial exception types.

\- \[ \] Supabase/database outage pauses the batch safely and claims no durable audit write during the outage.

\- \[ \] No unpersisted approval is treated as final.

\- \[ \] Duplicate batches are idempotent and \`duplicate\_batch\` is not a \`failure\_type\`.

\- \[ \] Failure tests are included in the evaluation suite.

