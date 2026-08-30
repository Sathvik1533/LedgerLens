# LedgerLens Architecture Reference

This document provides a technical breakdown of the **LedgerLens** reconciliation architecture, data persistence layers, concurrency models, and grounding boundaries.

---

## 1. System Overview & Core Invariants

LedgerLens closes one complete finance-operations loop: **exception-first multi-source reconciliation of synthetic payments, refunds, gateway settlements, and bank credit feeds.**

### Core Technical Invariants
1. **Deterministic Mathematical Parity**: All financial calculations (gross amounts, 2% fees, 18% GST, net deductions) are executed in pure Python using `Decimal` arithmetic rounded to 2 decimal places (`scale=2`). Generative AI is prohibited from performing arithmetic.
2. **Dual-Layer Persistence**: Raw CSV inputs are ingested and stored verbatim in `*_raw` tables as JSONB records before being validated and normalized into relational domain tables.
3. **Optimistic Concurrency Control**: Reconciliation cases use integer versioning (`version`) to prevent concurrent reviewer overwrites (HTTP 409 Conflict).
4. **Persisted Audit Events**: All status transitions, human approvals, rejections, and review comments are recorded in a dedicated `audit_events` table with actor timestamps.
5. **Read-Only Advisory RAG**: The policy investigation assistant performs read-only database queries (`SQLEvidenceTool`) and semantic similarity retrieval against a local policy corpus (`PolicyRetriever`). The tested investigation workflow does not mutate database records.

---

## 2. Relational Schema Architecture (13 Tables)

The PostgreSQL 15 schema is organized into five functional layers:

```text
[Ingestion Batch Metadata]
       │
       ├──► [Raw Storage Layer] (Retained raw source records)
       │      ├── payments_raw
       │      ├── settlements_raw
       │      ├── refunds_raw
       │      └── bank_credits_raw
       │
       ├──► [Normalized Domain Entities] (Typed, scale-2 Decimal columns)
       │      ├── payments
       │      ├── settlements
       │      ├── refunds
       │      └── bank_credits
       │
       └──► [Reconciliation & Review Layer]
              ├── reconciliation_cases (Status, exception type, discrepancy, version)
              ├── candidate_matches (Alternative candidate references)
              ├── human_review_actions (Reviewer decision, rationale, actor)
              └── audit_events (Timestamped state transition trail)
```

*(Note: `alembic_version` is maintained internally by Alembic for schema migrations).*

---

## 3. Four-Source Deterministic Matching Engine

The matching engine (`backend/app/domain/matcher.py`) processes normalized records in three sequential stages:

```text
Stage 1: Primary Key Direct Settlement Match
  payments.settlement_id == settlements.settlement_id
  Assert: payment.amount == settlement.gross_payment_amount

Stage 2: Bank Credit UTR Linkage
  Match bank_credits by settlement_id or payment reference
  Assert: net_settlement_amount == bank_credit.credited_amount

Stage 3: Refund & Fee Parity Check
  Sum captured refunds for payment_id
  Assert: net_settlement == (gross - fees - taxes - sum(refunds))
```

### Supported Exception Types
The engine detects and isolates 8 financial exception categories:
1. `amount_mismatch`: Net settlement or gross payment does not match bank credit or settlement line.
2. `missing_settlement`: Payment is captured but no settlement file exists after cutoff.
3. `missing_bank_credit`: Settlement is reported by gateway switch but no matching bank statement UTR credit exists.
4. `fee_mismatch`: Reported gateway fee or GST differs from agreed pricing schedule.
5. `duplicate_payment`: Multiple payment records share the same order or transaction reference.
6. `duplicate_bank_credit`: Multiple credit line items cite the same UTR or bank reference.
7. `partial_refund_not_reflected`: Customer refund processed but not deducted from net gateway payout.
8. `ambiguous_match`: Multiple candidate settlements match a single payment line.

---

## 4. Read-Only Policy RAG Assistant

When an operator investigates a flagged case:
1. **Database Fact Extraction**: `SQLEvidenceTool` queries PostgreSQL for the exact payment, settlement, and bank credit facts.
2. **Policy Retrieval**: `PolicyRetriever` generates dense embeddings for the discrepancy context and performs cosine similarity search over `backend/app/rag/corpus/` (`exception_policy.md`, `sla_and_escalation.md`).
3. **Grounding Floor ($\ge 0.35$)**: Chunks below 0.35 cosine similarity are rejected. If no chunk meets the threshold, `is_confident` is flagged as `false`.
4. **Structured Advisory Synthesis**: The assistant returns an executive summary, root cause breakdown, recommended operational action, and exact policy citations.

---

## 5. Architectural Boundaries & Scope

| Feature Area | Verified in Current Implementation | Out of Scope / Post-MVP |
|---|---|---|
| **Data Ingestion** | Batch CSV ingestion with duplicate idempotency | Streaming Kafka/RabbitMQ feeds |
| **Reconciliation** | Deterministic 4-source multi-stage matcher | Machine-learning probabilistic matching |
| **Concurrency** | Optimistic locking (`version` $\rightarrow$ HTTP 409) | Distributed multi-region distributed locking |
| **AI Integration** | Read-only structured RAG investigation with citations | Autonomous direct financial disbursement |
| **Audit Log** | Persisted audit event logging on review actions | Cryptographic hash-chained blockchain ledger |

---

## 6. Brand Architecture & Mark Metaphor

The LedgerLens mark represents four financial data sources converging through an inspection point into a traceable reconciliation outcome. It is a visual metaphor for the system’s role; it does not represent an automated approval.

| Mark Element | Product Meaning |
|---|---|
| Four incoming streams | Payments, settlements, refunds, and bank credits |
| Central diamond aperture | Deterministic comparison and evidence inspection |
| Single outgoing line | An aligned, traceable reconciliation outcome |
| Blue/cyan source colors | Independent evidence streams |
| Emerald output | Reconciliation progress or resolution; not an automatic financial approval |
| Central negative space | A deliberate review/inspection point before resolution |
