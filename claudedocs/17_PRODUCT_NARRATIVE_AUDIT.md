# Product Narrative Audit

## Plain-Language Narrative Review

This evaluation simulates a non-technical Finance Operations Manager traversing the public routes.

### `/` (Landing Page)
- **Exact Headline:** Stop losing money to invisible reconciliation errors.
- **Exact Subheading:** A financial control room that automatically reconciles payments, gateway settlements, refunds, and bank credits—surfacing exceptions directly to your human operators with full audit visibility.
- **Section Order:** Hero -> "Engineering over Aesthetics" (Value Props)
- **Exact CTA Text:** Open Control Room, See How It Works, Launch Control Room
- **Intended Visitor:** Finance Ops / Risk Manager.
- **Visitor Takeaway:** The system finds exactly where financial records mismatch so I don't lose money.
- **Technical terms rewritten:** "Deterministic 3-Way Parity" -> "Automated Financial Matching"; "ACID Audit Logs" -> "Permanent Audit Logs"; "cryptographic receipts" -> "permanent, time-stamped records". (Rewrites applied & verified).

### `/how-it-works` (Mechanism)
- **Exact Headline:** The Operator Journey
- **Exact Subheading:** How LedgerLens processes millions of events to give your team exactly what they need.
- **Section Order:** Data -> Rules Engine -> AI RAG -> Audit
- **Exact CTA Text:** Enter the Control Room
- **Intended Visitor:** Process Auditor / Operations Lead.
- **Visitor Takeaway:** The system trusts database rules first; AI is only used to suggest policy actions, not to perform math.

### `/evidence` (Proof)
- **Exact Headline:** Multi-Source Evidence
- **Exact Subheading:** 4-way parity without the hallucination risk.
- **Section Order:** Explanation -> Screenshots / Diagrams
- **Exact CTA Text:** View Evaluation
- **Intended Visitor:** Technical Assessor.
- **Visitor Takeaway:** Gateway, Settlement, and Bank records are all verified simultaneously.

### `/evaluation` (Metrics)
- **Exact Headline:** Evaluation Metrics
- **Exact Subheading:** System guarantees and mathematical boundaries.
- **Section Order:** Speed/Throughput -> Accuracy Guarantees
- **Exact CTA Text:** Read Documentation
- **Intended Visitor:** System Architect / Security Reviewer.
- **Visitor Takeaway:** The application guarantees penny-exact math using Decimal processing.

### Product-Story Test Answers
1. **What problem LedgerLens solves:** Missing money from unmatched financial events.
2. **What money or risk can be missed:** Missing bank credits, duplicate refunds, MDR fee mismatches.
3. **Which records LedgerLens compares:** Gateway Capture, Gateway Settlement, Customer Refunds, Bank Statements.
4. **Why the result is trustworthy:** Exact float-free math; AI never touches the final calculated amount.
5. **What the human operator does:** Reviews explicit mismatches, consults RAG-policy drawer, and clicks Approve/Reject with a mandated rationale.
6. **What remains in the audit trail:** The user ID, the exact decision, the rationale, and the lock version.
7. **Where to inspect the product:** `/app` (Control Room dashboard) and `/app/queue`.

**Verdict:** PASS. Jargon actively stripped. Flow logically progresses from Risk (Landing) -> Mechanism -> Evidence -> Action (Queue).
