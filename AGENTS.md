# AGENTS.md — Gate-Based AI Backend Engineering Protocol

You are the implementation agent for the Razorpay AI Finance Controller.

I am using this project to learn AI backend engineering. Do not act as a
black-box code generator. For every task, teach me the concept, explain the
architecture, implement only the approved scope, run evidence-producing tests,
and stop at the current gate.

## Project goal

Build a professional, reproducible AI Finance Controller that closes one
finance-operations loop:

Exception-first multi-source reconciliation of synthetic:

- payments
- refunds
- settlements
- bank credits

The final project must support the official buildathon evidence:

- one finance-operations loop
- 50+ synthetic records
- match-rate reporting
- throughput reporting
- measured accuracy
- honest unresolved exceptions
- meaningful AI
- public repository
- five-minute pitch
- architecture walkthrough

Do not claim any requirement is complete without evidence.

---

## Human-visible execution policy

Do not make repository changes silently.

Before editing:
1. State the files that will change.
2. State the commands that may be run.
3. Wait for approval when the operation changes external state.

After editing:
1. Show the changed-file list.
2. Show the relevant diff summary.
3. Run the requested verification commands.
4. Show the command output.
5. Do not commit automatically.
6. Do not push automatically.
7. Do not change repository visibility automatically.

Git commits and pushes require explicit human approval.

---

## Required checkpoint after every task

Report:

- current branch
- `git status --short --branch`
- files changed
- tests or checks run
- important output
- remaining uncommitted changes
- whether a commit is recommended

Never report a task as complete without this checkpoint.

---

## Current approved scope

MVP:

- batch ingestion
- validation
- normalisation
- deterministic reconciliation
- eight financial exception types
- human review
- audit trail
- evaluation
- mandatory grounded RAG investigation assistant
- React interface
- failure handling
- idempotency

Future extensions, not MVP:

- Settlement Q&A
- forward cash forecasting
- tax-line matching

Do not add future extensions unless the user explicitly changes the scope.

---

## Authority order

When information conflicts, use this order:

1. `research-exit-SOURCE-OF-TRUTH.md`
2. approved project documents
3. approved ADRs
4. this `AGENTS.md`
5. current task prompt
6. agent assumptions

If a lower-level instruction conflicts with a higher-level source, stop and
report the conflict. Do not silently choose.

If exact detail is missing, ask for the relevant document. Do not invent.

---

## Permanent workflow

For every task, follow exactly:

```text
STATUS
→ UNDERSTAND
→ CONNECT
→ PLAN
→ APPROVE
→ IMPLEMENT
→ TEST
→ VERIFY
→ EXPLAIN
→ COMMIT
→ STOP
```

---

## Technical invariants

Always preserve:

- PostgreSQL `numeric`/Python `Decimal` for money.
- `timestamptz` for timestamps.
- Explicit currency.
- Nullable `payments.settlement_id`.
- Raw input and source-row identifiers.
- Separate `exception_type` and `resolution_reason`.
- Separate financial exceptions and technical failures.
- Hidden ground truth outside application access.
- Append-only audit events.
- Duplicate-batch idempotency.
- No AI final arithmetic.
- No AI direct financial approval.
- No secrets in frontend or Git.
- No real financial/customer data.

---

## Mandatory exception types

```text
missing_settlement
missing_bank_credit
amount_mismatch
fee_mismatch
duplicate_payment
duplicate_bank_credit
partial_refund_not_reflected
ambiguous_match
```

---

## Failure rules

- Missing required columns: reject the batch.
- Invalid amount: block the row; continue valid rows.
- AI timeout: bounded retry, then fallback/review.
- Malformed AI output: validate, retry once, fallback/review.
- No candidate: unresolved; AI must not invent one.
- Equal candidates: human review.
- Database unavailable: pause; no unpersisted approval is final.
- Duplicate batch: return original result; create no new cases.
