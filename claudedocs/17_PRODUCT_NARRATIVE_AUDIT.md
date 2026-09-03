# Product Narrative Audit

This document traces the public story flow for LedgerLens, ensuring it communicates value to a Finance Operations Manager in plain language, stripped of backend implementation jargon.

## The Required 7-Step Narration
1. **The Problem:** Finance teams lose money when records do not agree.
2. **The Aggregation:** LedgerLens brings payment, settlement, refund, and bank records together.
3. **The Discrepancy:** It shows exactly what does not match.
4. **The Evidence:** The operator inspects the supporting evidence side-by-side.
5. **The Advisory:** Policy guidance is available to explain context, but it cannot make the decision.
6. **The Decision:** A human records the final decision.
7. **The Audit:** The audit trail preserves the outcome immutably for future review.

## Page-by-Page Narrative Verification

### 1. Landing Page (`/`)
- **Primary Message:** Stop losing money to invisible reconciliation errors.
- **Story Step:** 1 & 2 (Problem & Aggregation).
- **Audit Result:** Removed "ACID Audit Logs" and "Deterministic 3-Way Parity". Replaced with "Automated Financial Matching" and "Permanent Audit Logs". The hero clearly states the problem.

### 2. How it Works (`/how-it-works`)
- **Primary Message:** The Operator Journey from exception to resolution.
- **Story Step:** 3 & 4 (Discrepancy & Evidence).
- **Audit Result:** Plain language explains the workflow. No mention of "Pydantic" or "FastAPI".

### 3. Evidence (`/evidence`)
- **Primary Message:** Side-by-side comparison of 4 data sources.
- **Story Step:** 4 (Evidence).
- **Audit Result:** Emphasizes that operators see the raw data, not a black box AI output. 

### 4. Evaluation (`/evaluation`)
- **Primary Message:** LedgerLens is tested against rigorous, measured benchmarks.
- **Story Step:** Trust building.
- **Audit Result:** Scheduled for rewrite (per `24_EVALUATION_METRIC_PROVENANCE.md`) to remove slogans ("O(N) Complexity") and replace them with actual data throughput and accuracy metrics.

### 5. Exception Control Room (`/app/queue`)
- **Primary Message:** A prioritized list of financial discrepancies requiring your attention.
- **Story Step:** 3 (Discrepancy).
- **Audit Result:** Clean severity labels ("Critical", "High") with plain-language tooltips explaining the financial risk thresholds. 

### 6. Case Workspace (`/app/case/:id`)
- **Primary Message:** Review evidence, consult policy, make a final decision.
- **Story Step:** 4, 5 & 6 (Evidence, Advisory, Decision).
- **Audit Result:** Jargon purged ("RAG" -> "Policy-based explanation", "CAS" -> "Safe update protection"). The interface explicitly states: "You remain in control."

### 7. Ledger Audit (`/app/audit`)
- **Primary Message:** A permanent history of every action taken.
- **Story Step:** 7 (Audit).
- **Audit Result:** Uses chronological, timestamped storytelling rather than "cryptographic event stream" terminology.

## Conclusion
The public site now correctly leads a non-engineer through the operational value of the product, while technical documentation handles backend architectural capabilities.
