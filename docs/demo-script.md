# LedgerLens 5-Minute Technical Pitch & Walkthrough Script

This script provides a structured, evidence-led walkthrough of **LedgerLens** for technical presentations, code walkthroughs, or live demos.

---

## Scene 1: The Problem & The Trust Boundary (0:00 - 1:00)

- **Opening**: "In high-volume payment operations, reconciliation breaks down across asynchronous gateways, bank statement delays, and fee discrepancies. Most modern AI tools attempt to solve this by asking LLMs to perform arithmetic—a dangerous failure mode because generative models hallucinate numbers."
- **Core Stance**: "LedgerLens takes the opposite approach: **Deterministic first, AI second**. All financial matching is computed in pure Python using scale-2 Decimal precision. Generative AI is restricted to a strictly read-only advisory copilot."

---

## Scene 2: Four-Source Ingestion & Dual Storage (1:00 - 2:00)

- **Action**: Ingest 4 CSV feeds (Payments, Settlements, Refunds, Bank Credits) via `/api/v1/ingestion`.
- **Key Talking Points**:
  - Idempotent batch processing prevents duplicate submissions.
  - Dual storage preserves raw source JSONB payloads in `*_raw` tables alongside typed, normalized records in domain tables.
  - Boundary validation blocks invalid currency scales while processing valid rows.

---

## Scene 3: Deterministic Reconciliation Run (2:00 - 3:00)

- **Action**: Trigger `/api/v1/reconciliation/run` and inspect the Review Queue dashboard.
- **Key Talking Points**:
  - Show the 70.0% clean match rate and 18 isolated exceptions across active categories.
  - Highlight ₹0.00 balance matches auto-reconciled with zero manual overhead.
  - Drill into a flagged `amount_mismatch` case showing the exact difference between expected settlement and bank credit UTR.

---

## Scene 4: Grounded AI Copilot & Policy Grounding (3:00 - 4:00)

- **Action**: Switch to the **AI Copilot** tab on the Case Detail page.
- **Key Talking Points**:
  - Show how the assistant synthesizes database facts with local policy markdown files (`exception_policy.md`).
  - Demonstrate the $\ge 0.35$ cosine similarity grounding floor and expandable policy citations.
  - Reiterate: The assistant provides actionable recommendations, but ledger status changes strictly require human sign-off.

---

## Scene 5: Human Review & Optimistic Concurrency (4:00 - 5:00)

- **Action**: Submit an approval decision and simulate a concurrent update (HTTP 409).
- **Key Talking Points**:
  - Optimistic locking (`expected_version`) prevents reviewer race conditions.
  - Review actions atomically transition status and record immutable entries in `audit_events`.
  - Conclude with the full 40-test automated suite passing in CI.
