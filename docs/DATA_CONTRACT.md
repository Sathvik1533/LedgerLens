---
status: DRAFT (v3 — resolution_reason clarification; Batch 2 still awaiting APPROVE BATCH 2)
last_updated: 2026-08-25
source_of_truth: ../research-exit-SOURCE-OF-TRUTH.md
review_required: true
---

> **Scope guard:** This contract covers only the fields and relationships needed for the approved MVP — exception-first multi-source reconciliation over payments, refunds, settlements, and bank credits. It does not define any schema for Settlement Q&A, forward cash forecasting, or tax-line matching (future extensions, `docs/PRD.md` §18).

# DATA_CONTRACT.md

## 1. Identifier hierarchy

Strong identifiers (usable as reliable join keys): `payment_id`, `order_id`, `refund_id`, `settlement_id`, `bank_reference`. `bank_name` is supporting context only — never a unique transaction identifier (`research-exit-SOURCE-OF-TRUTH.md` §7). Every table also carries its own row identifier as the primary key.

**5W1H:** **Who** — the normalisation and matching services consume this hierarchy. **What** — a ranked list of which fields can be trusted for exact matching vs. which are context-only. **When** — applied at every matching stage (§9 of `docs/ARCHITECTURE.md`). **Where** — enforced in the reconciliation engine, not the UI. **Why** — using a non-unique field (like `bank_name`) as a join key would silently create false matches. **How** — schema-level typing plus engine-level rules that never join on `bank_name` alone.

## 2. Payments schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `payment_id` | string (strong identifier, PK) | Required | |
| `order_id` | string (strong identifier) | Required | |
| `merchant_id` | string | Required | |
| `payment_type` | string/enum | Required | ASSUMPTION: exact enum values (e.g. capture types) not specified in `research-exit-SOURCE-OF-TRUTH.md`; to be fixed by the synthetic generator at Gate 1, flagged here rather than invented. |
| `payment_method` | string/enum | Required | Same ASSUMPTION as above. |
| `amount` | decimal | Required | Decimal-safe (see §7). |
| `currency` | string (ISO 4217-style) | Required | Stored explicitly per record, never inferred. |
| `status` | string/enum | Required | ASSUMPTION: exact status vocabulary (e.g. captured/failed/refunded) not specified; flagged for Gate 1. |
| `payment_timestamp` | timestamptz | Required | Timezone-aware (see §8). |
| `captured_timestamp` | timestamptz | Optional | Nullable — a payment may be authorized but not yet captured. |
| `settlement_id` | string (FK → settlements.settlement_id) | Optional | Nullable. Deterministic synthetic relationship (§6): a null value represents `missing_settlement` for that payment. Not a matching-window heuristic — added by this correction to give the synthetic generator and evaluation harness a fixed, deterministic payment-to-settlement relationship. |

## 3. Refunds schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `refund_id` | string (strong identifier, PK) | Required | |
| `payment_id` | string (FK → payments.payment_id) | Required | |
| `order_id` | string (FK → payments.order_id) | Required | |
| `refund_amount` | decimal | Required | Decimal-safe. |
| `currency` | string | Required | Must match the linked payment's currency; mismatch is a hard conflict (`docs/ARCHITECTURE.md` §9). |
| `refund_status` | string/enum | Required | ASSUMPTION: vocabulary TBD at Gate 1. |
| `refund_timestamp` | timestamptz | Required | Timezone-aware. |
| `refund_type` | string/enum | Required | e.g. full vs. partial — needed to detect `partial_refund_not_reflected` (§13). ASSUMPTION: exact enum values TBD at Gate 1. |

## 4. Settlements schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `settlement_id` | string (strong identifier, PK) | Required | |
| `merchant_id` | string (FK → payments.merchant_id) | Required | |
| `settlement_type` | string/enum | Required | ASSUMPTION: vocabulary TBD at Gate 1. |
| `gross_payment_amount` | decimal | Required | Input to expected-net-settlement formula. |
| `refund_amount` | decimal | Required | Input to formula. |
| `fee_amount` | decimal | Required | Input to formula. |
| `tax_amount` | decimal | Required | Tax on fee, per this project's synthetic scenario (`research-exit-SOURCE-OF-TRUTH.md` §5 glossary). |
| `adjustment_amount` | decimal | Required | Input to formula; can be positive or negative. |
| `net_settlement_amount` | decimal | Required | Reported value, compared against the engine's computed `expected_net_settlement`. |
| `currency` | string | Required | Must match linked payment/refund currency; mismatch is a hard conflict. |
| `settlement_status` | string/enum | Required | ASSUMPTION: vocabulary TBD at Gate 1. |
| `settlement_timestamp` | timestamptz | Required | Timezone-aware. |
| `expected_settlement_timestamp` | timestamptz | Optional | Used for delayed-settlement detection (an optional/later exception type per `research-exit-SOURCE-OF-TRUTH.md` §8, not in the initial eight — see §13 below). |

## 5. Bank credits schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `bank_credit_id` | string (PK) | Required | |
| `bank_account_id` | string | Required | |
| `bank_name` | string | Required | **Supporting context only — never a join key** (§1). |
| `bank_reference` | string (strong identifier) | Required | |
| `settlement_id` | string (FK → settlements.settlement_id) | Optional | Nullable — a bank credit may arrive before it can be linked, or a settlement may have `missing_bank_credit`. |
| `credited_amount` | decimal | Required | Decimal-safe. |
| `currency` | string | Required | Must match linked settlement's currency; mismatch is a hard conflict. |
| `bank_credit_timestamp` | timestamptz | Required | Timezone-aware. |
| `bank_credit_status` | string/enum | Required | ASSUMPTION: vocabulary TBD at Gate 1. |
| `narration` | string (free text) | Optional | Messy/unstructured — the primary field where AI-assisted interpretation is appropriate (`docs/ARCHITECTURE.md` §10), never a source of exact financial fact. |

## 6. Relationships

```
payments 1 ──── * refunds        (refunds.payment_id → payments.payment_id)
payments * ──── 1 settlements    (payments.settlement_id → settlements.settlement_id, nullable; a null value represents a missing settlement)
settlements 1 ──── 0..1 bank_credits (bank_credits.settlement_id → settlements.settlement_id, nullable to allow missing_bank_credit)
```

**Resolved by this correction (supersedes the prior open question):** payment-to-settlement grouping is a direct, deterministic FK — `payments.settlement_id → settlements.settlement_id` — not a merchant + matching-window heuristic. A null `payments.settlement_id` deterministically represents a missing settlement for that payment, which is exactly what drives the `missing_settlement` exception type (§10). This gives the synthetic generator and the evaluation harness a fixed, unambiguous payment-to-settlement relationship, so it is no longer left as an open Gate 1 design question.

**Aggregates are reconciled through the payment-level relationship, not standalone.** `settlements.gross_payment_amount`, `refund_amount`, `fee_amount`, `tax_amount`, `adjustment_amount`, and `net_settlement_amount` are settlement-level aggregate fields. They are reconciled by joining each payment (and its refunds) to its settlement via `payments.settlement_id`, then comparing the engine's computed `expected_net_settlement` (§9 of `docs/ARCHITECTURE.md`) against the settlement's reported aggregates. **Aggregate settlement values alone do not identify or attribute individual payments** — the payment-level `settlement_id` relationship is what makes that attribution possible; the aggregates are the thing being checked, not the join key.

## 7. Raw versus normalised records

Every source table has two representations: **raw** (exactly as ingested, immutable, never overwritten) and **normalised** (typed, decimal-safe, timezone-aware, currency-explicit). Source-row identifiers are preserved through normalisation so any normalised record traces back to its raw input (`research-exit-SOURCE-OF-TRUTH.md` §7). ASSUMPTION: implemented as two physical tables per source (`payments_raw` / `payments_normalised`, etc.) rather than a single table with raw/normalised columns — exact implementation choice deferred to Gate 1, flagged here as a design decision still open.

## 8. Decimal-safe money and timezone rules

- All monetary fields use a decimal-safe type (e.g. `NUMERIC`/`DECIMAL` in Postgres) — never floating point.
- Currency is stored explicitly on every record that carries an amount; it is never inferred from context.
- All timestamp fields are timezone-aware (`timestamptz` in Postgres); no naive/local timestamps are permitted in normalised data.
- Raw timestamps may arrive in any format/zone; normalisation converts them to a consistent timezone-aware representation while preserving the original raw value.

## 9. Validation rules

- Missing required columns at the CSV/batch level → reject the whole batch (`research-exit-SOURCE-OF-TRUTH.md` §15).
- Invalid amount (non-numeric, negative where not allowed, wrong decimal precision) on a single row → isolate that row and create a data-quality exception; does not block the rest of the batch (`research-exit-SOURCE-OF-TRUTH.md` §15).
- Currency mismatch across linked records → hard conflict, blocks automatic approval (`docs/ARCHITECTURE.md` §9).
- Foreign-key references that don't resolve (e.g. a refund pointing at a nonexistent `payment_id`) → treated as a data-quality exception at minimum, and may additionally trigger `ambiguous_match` if a plausible alternative match exists. Exact precedence between "data-quality exception" and the eight financial exception types (§13) is an **open question for `docs/FAILURE_AND_RECOVERY.md`** (Batch 3), not resolved here — flagged rather than guessed.

## 10. Financial exception types (eight, initial)

Per the correction applied to `docs/PRD.md` FR5: **every financial case is classified as either no-exception or one of the eight defined financial exception types below. Technical and ingestion failures (schema errors, invalid amounts, malformed AI output, timeouts, database unavailability) use the separate failure classification defined in `docs/FAILURE_AND_RECOVERY.md` (Batch 3) and must never be forced into one of these eight types.**

| Exception type | Trigger (summary) | Hidden ground-truth label use |
|---|---|---|
| `missing_settlement` | A payment's `settlement_id` is null (§2, §6) — a captured payment with no linked settlement record | `expected_status = missing_settlement` |
| `missing_bank_credit` | A settlement exists but no linked bank credit is found | `expected_status = missing_bank_credit` |
| `amount_mismatch` | Expected net settlement ≠ reported settlement amount, beyond tolerance | `expected_status = amount_mismatch` |
| `fee_mismatch` | Reported fee/tax amount does not match the expected calculation | `expected_status = fee_mismatch` |
| `duplicate_payment` | Two payment records resolve to the same underlying event | `expected_status = duplicate_payment` |
| `duplicate_bank_credit` | Two bank credit records resolve to the same settlement | `expected_status = duplicate_bank_credit` |
| `partial_refund_not_reflected` | A partial refund exists but is not reflected in the settlement's refund_amount | `expected_status = partial_refund_not_reflected` |
| `ambiguous_match` | **Two or more** candidate matches (e.g. refund-to-payment linkage) remain equally plausible after the broader deterministic pass | `expected_status = ambiguous_match` |

**Corrected — `ambiguous_match` vs. no-match (these are not the same thing):** `ambiguous_match` means *multiple* plausible candidates remain after the broader deterministic pass (`docs/ARCHITECTURE.md` §9). A case where the broader pass finds **zero** candidates must **not** be silently labelled `ambiguous_match`. Under the approved MVP scope:

- For payment-to-settlement linkage specifically, "no candidate" is no longer an ambiguous outcome at all — it is represented deterministically by `payments.settlement_id = null`, which drives `missing_settlement` (§2, §6). There is no zero-candidate case left to disambiguate here.
- For relationships without a dedicated `missing_*` type (e.g. a refund that matches no payment after the broader pass), the zero-candidate outcome is represented as `exception_type = null` with `decision_status = unresolved`.
- **Superseded by this correction:** a bare `exception_type = null` was previously the only signal distinguishing "resolved cleanly" from "nothing found," which is itself ambiguous. The reconciliation-case schema (§15) now adds a `resolution_reason` field so `null` is never left to carry that distinction alone — see §15 for the closed enum and canonical examples.

Full per-type detail (synthetic-data injection pattern, financial impact, evidence requirements, retryability, batch/row scope, severity, recommended action, human-review requirement, and test case) is deferred to `docs/FAILURE_AND_RECOVERY.md` (Batch 3 — does not exist yet); this file fixes only the **enum and its meaning as a data-contract concern** (i.e., what value can legally appear in `exception_type` and what it means for ground-truth labeling).

**Optional/later exceptions** (explicitly not in the initial eight, per `research-exit-SOURCE-OF-TRUTH.md` §8): delayed settlement, currency mismatch, invalid timestamp, wrong payment-to-refund link. Not implemented in MVP; not added to the enum without a deliberate, logged scope decision.

## 11. Hidden ground-truth separation

The application receives source records only; the evaluator receives predictions and hidden labels separately. Hidden labels never enter prompts, retrieval documents, or UI data (`research-exit-SOURCE-OF-TRUTH.md` §9). Ground-truth schema:

```
case_id
expected_status
exception_type            -- one of the eight in §10, or null for no-exception
expected_resolution_reason  -- NEW: matched | no_candidate_found | multiple_candidates | ... (closed enum, mirrors §15)
true_payment_id
true_settlement_id
expected_net_amount
expected_settlement_date
requires_human_review
```

`expected_resolution_reason` is new in this correction: it lets the evaluation harness (`docs/EVALUATION_PLAN.md`, Batch 3) check not just whether the application found the right `exception_type`, but whether it correctly told apart "resolved cleanly," "no candidate found," and "multiple candidates remain" for cases where `exception_type` alone (especially `null`) would be ambiguous. See §15 for the application-facing counterpart and the closed enum.

**5W1H:** **Who** — only the evaluation harness (`docs/EVALUATION_PLAN.md`, Batch 3) reads this table. **What** — the true, deliberately-injected outcome for each synthetic case, including the expected `resolution_reason`. **When** — generated once at dataset-creation time, alongside the synthetic batch, before the application ever processes it. **Where** — a separate table/dataset, not joined into any table the application's normal query paths touch. **Why** — if the application could see this, measured accuracy would be meaningless. **How** — physically separate storage/schema and an automated check (planned, `docs/EVALUATION_PLAN.md`) that no ground-truth field ever appears in an AI prompt or API response.

## 12. Example records (illustrative, synthetic)

```json
// payments (raw → normalised pair, abbreviated)
{
  "payment_id": "pay_A1001",
  "order_id": "ord_5001",
  "merchant_id": "merch_01",
  "payment_type": "capture",
  "payment_method": "upi",
  "amount": "1000.00",
  "currency": "INR",
  "status": "captured",
  "payment_timestamp": "2026-08-01T10:15:00+05:30",
  "captured_timestamp": "2026-08-01T10:15:04+05:30",
  "settlement_id": "stl_9001"
}
```

```json
// settlements
{
  "settlement_id": "stl_9001",
  "merchant_id": "merch_01",
  "settlement_type": "regular",
  "gross_payment_amount": "1000.00",
  "refund_amount": "0.00",
  "fee_amount": "20.00",
  "tax_amount": "3.60",
  "adjustment_amount": "0.00",
  "net_settlement_amount": "976.40",
  "currency": "INR",
  "settlement_status": "settled",
  "settlement_timestamp": "2026-08-03T00:00:00+05:30",
  "expected_settlement_timestamp": "2026-08-03T00:00:00+05:30"
}
```

```json
// bank_credits — deliberately injected amount_mismatch example
{
  "bank_credit_id": "bnk_7001",
  "bank_account_id": "acct_01",
  "bank_name": "Example Bank",
  "bank_reference": "REF00099",
  "settlement_id": "stl_9001",
  "credited_amount": "970.40",
  "currency": "INR",
  "bank_credit_timestamp": "2026-08-03T14:00:00+05:30",
  "bank_credit_status": "credited",
  "narration": "NEFT SETTLEMENT STL9001"
}
```
Expected vs. reported vs. bank amounts here (976.40 vs. 976.40 vs. 970.40) illustrate an `amount_mismatch` case a synthetic generator would deliberately inject. The evaluator stores the expected label (and the expected discrepancy) separately from this record (§11) — this example does not disclose or stand in for a hidden-ground-truth value; it is illustrative only.

**Note:** these examples are illustrative only, hand-constructed for this document, and are not the actual synthetic dataset — the real generator (seeded, reproducible, targeting 500 records) is a Gate 1 deliverable, not produced here.

## 13. Data-quality rules

- Preserve raw source values; never overwrite them with normalised values.
- Preserve source-row identifiers through every transformation.
- Every field has a defined type and a missing-data rule (required vs. optional, as tabled in §2–§5).
- Relationships are defined explicitly (§6), including the payment-to-settlement FK; any remaining ambiguous/undefined relationship rules are flagged as open questions, not guessed.
- Decimal-safe handling and explicit currency on every monetary field (§8).
- Timezone-aware timestamps only in normalised data (§8).
- The `exception_type` enum is closed to the eight values in §10 for MVP; adding a value requires a logged scope decision, not a silent addition.
- Hidden ground truth is physically and access-path separated from the application (§11).

## 14. Open questions / flagged assumptions in this file

1. Exact enum vocabularies for `payment_type`, `payment_method`, `status`, `refund_status`, `refund_type`, `settlement_type`, `settlement_status`, `bank_credit_status` are not specified in `research-exit-SOURCE-OF-TRUTH.md` and are left for the Gate 1 synthetic-data generator to fix, rather than invented here.
2. ~~The exact rule for grouping payments into a settlement (§6) is not specified~~ — **RESOLVED by this correction pass:** payment-to-settlement grouping is now a direct deterministic relationship, `payments.settlement_id → settlements.settlement_id` (§2, §6), not a matching-window heuristic. No longer an open question.
3. Whether raw/normalised representations are separate tables or separate columns (§7) is an open Gate 1 implementation choice.
4. Precedence between a "data-quality exception" (malformed/invalid row) and the eight financial exception types (§9–§10) when both could apply to the same row is deferred to `docs/FAILURE_AND_RECOVERY.md` (Batch 3).
5. Idempotency-key derivation (referenced from `docs/ARCHITECTURE.md` §14) touches this schema (e.g. a `batch_id`/`idempotency_key` column) but the exact field is not fixed here — flagged for Gate 1.
6. ~~Representing a zero-candidate ("no-match") outcome as `exception_type = null` + `decision_status = unresolved` was flagged as a design decision needing PM confirmation~~ — **RESOLVED by the resolution_reason correction:** a `resolution_reason` field (§15) now disambiguates `exception_type = null` into `matched` vs. `no_candidate_found`, and separately labels `ambiguous_match` cases with `resolution_reason = multiple_candidates`. Confirmed as part of this correction pass; independent of, and not evidence of, Batch 2 approval — no longer open as a design question, but Batch 2 itself remains pending `APPROVE BATCH 2`.
7. **New, from the resolution_reason correction:** the full closed enum for `resolution_reason` beyond the three specified values (`matched`, `no_candidate_found`, `multiple_candidates`) — e.g. what value(s) apply to `rejected`, `blocked`, and `already_processed` `decision_status` outcomes — is not fixed here. Only the three cases given in the correction are locked; additional values are left for Gate 1 rather than invented.

## 15. Reconciliation case schema (resolution_reason)

**New in this correction.** This is the application-facing record of a case's outcome — distinct from §11 (hidden ground truth, evaluator-only, not visible to the application). It formalises `resolution_reason` alongside the `confidence`, `decision_status`, and `technical_status` fields already canonically defined in `docs/ARCHITECTURE.md` §11.

| Field | Type | Notes |
|---|---|---|
| `case_id` | string (PK) | |
| `exception_type` | string/enum, nullable | One of the eight closed values in §10, or `null` when there is no financial exception. **This correction does not add a ninth value** — `ambiguous_match` remains one of the existing eight. |
| `decision_status` | string/enum | `auto_reconciled \| needs_review \| unresolved \| rejected \| blocked \| already_processed` (canonical definition: `docs/ARCHITECTURE.md` §11). |
| `confidence` | string/enum | `high \| medium \| low \| unavailable \| not_applicable` (canonical definition: `docs/ARCHITECTURE.md` §11). |
| `resolution_reason` | string/enum | **New.** Disambiguates what `exception_type = null` (and `ambiguous_match`) mean on their own — a bare `null` was previously ambiguous between "resolved cleanly" and "nothing found." Three values are locked by this correction: `matched`, `no_candidate_found`, `multiple_candidates`. The enum is not yet closed beyond these three (see open question §14.7) — no additional values are invented here. |

**Canonical examples (locked by this correction):**

| Case | `exception_type` | `decision_status` | `resolution_reason` |
|---|---|---|---|
| Normal resolved match | `null` | `auto_reconciled` | `matched` |
| No candidate found after the broader pass | `null` | `unresolved` | `no_candidate_found` |
| Ambiguous candidates | `ambiguous_match` | `needs_review` | `multiple_candidates` |

`resolution_reason` is a **case-record field, not a new financial exception type** — the closed eight-value `exception_type` enum in §10 is unchanged, and the selected reconciliation workflow (`docs/ARCHITECTURE.md` §2–§5) is unchanged. This supersedes the earlier approach (§10) of relying on `exception_type = null` + `decision_status = unresolved` alone to signal "no candidate found," which by itself could not be told apart from a clean match. Its ground-truth counterpart, `expected_resolution_reason`, is defined in §11. Comparison of predicted vs. expected `resolution_reason` is a forward reference for `docs/EVALUATION_PLAN.md` (Batch 3 — does not exist yet); this file fixes only the field, its closed subset of values, and its meaning as a data-contract concern.

No contradiction between this file and `research-exit-SOURCE-OF-TRUTH.md`, `docs/PRD.md`, or `docs/PROJECT_REQUIREMENTS.md` was found during drafting. If one is found later, it will be logged in `docs/CONSISTENCY_REPORT.md` (Batch 5), not resolved silently here.
