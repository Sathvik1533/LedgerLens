# LedgerLens — User Stories & Operator Personas

```text
scope: Operational Personas and Workflow Journeys
last_updated: 2026-08-31
```

---

## 1. Primary Persona: Finance Operations Analyst (Operator)

### Profile & Role
- **Identity**: `finance_ops_reviewer` (Finance Operations Team)
- **Daily Mission**: Rapidly triage daily unreconciled transaction exceptions between merchant checkout captures, payment gateway settlement batches, customer refunds, and bank statement credits.
- **Key Pain Points**:
  - Unexplained fee overcharges and GST discrepancies buried in 50,000-row CSV settlement files.
  - Missing settlement line items that leave merchant payouts unfulfilled.
  - Partial refunds that are deducted from bank balances but not credited in settlement files.
  - Cluttered consumer payment dashboards that force manual spreadsheet cross-referencing.
- **Goals & Acceptance Criteria**:
  - High-density exception queue that sorts anomalies by monetary exposure at risk.
  - Side-by-side comparative evidence cards without hidden tabs.
  - Plain-language root-cause explanations grounded in contractual policy documents.
  - One-click resolution with atomic CAS protection against concurrent teammate overwrite.

### User Story 1: Triage Fee Overcharge
> *As a Finance Operations Analyst, I want to filter the exception queue by "Fee Mismatch" and inspect the discrepancy between the contractual 2% rate and the reported settlement fee, so that I can dispute the overbilled amount with Razorpay.*

---

## 2. Secondary Persona: Compliance & Financial Controller (Auditor)

### Profile & Role
- **Identity**: `finance_controller` / `internal_auditor`
- **Mission**: Verify financial statement integrity, validate reconciliation accuracy metrics, and review immutable audit trails for statutory compliance.
- **Key Pain Points**:
  - Black-box AI tools that silently alter ledgers or hallucinate financial approvals.
  - Lack of actor attribution on transaction write-offs and dispute resolutions.
  - Inability to verify concurrency safety under multi-reviewer shifts.
- **Goals & Acceptance Criteria**:
  - Complete append-only audit trail recording every state transition, actor ID, and timestamp.
  - Grounded AI guidance that cites specific SOP markdown files with cosine similarity scores ($\ge 0.35$).
  - Measured benchmark reports proving >1,000 rps throughput, 100% precision on auto-reconcile, and 0 false approvals.

### User Story 2: Audit Historical Resolution
> *As a Financial Controller, I want to inspect the audit ledger for Case UUID `cf8a177b`, view the operator's mandatory rationale, and verify the cryptographic CAS version transition from `v1` to `v2`, so that I can certify compliance with internal financial control policies.*
