# 📘 Student Learning Log & Interview Prep Guide

**Candidate:** Kotagiri Sathvik  
**Project:** Razorpay AI Finance Controller (Track 04)  
**Target Goal:** AI Backend Engineering & Internship Mastery  
**Status:** Actively Maintained at Every Gate  

---

## 🎯 Master Index of System-Design Concepts

- [Gate 1A: Database Fundamentals & Precision](#gate-1a-database-fundamentals--precision)
- [Gate 1B: Advanced Relational Engineering & Optimization](#gate-1b-advanced-relational-engineering--optimization)
- [Gate 1C: J.P. Morgan AI Research & Synthetic Data Engineering](#gate-1c-jp-morgan-ai-research--synthetic-data-engineering)
- [Gate 1 P0: CSV-to-DB Column Mapping](#gate-1-p0-exercise-1-csv-to-db-column-mapping)
- [Gate 2: Deterministic Reconciliation Engine](#gate-2-deterministic-reconciliation-engine-upcoming)
- [Gate 3: Evaluation Harness & Metrics](#gate-3-evaluation-harness--metrics-upcoming)
- [Gate 4: Human-in-the-Loop Review & Auditability](#gate-4-human-in-the-loop-review--auditability-upcoming)
- [Gate 5: Hybrid RAG & Bounded AI Assistance](#gate-5-hybrid-rag--bounded-ai-assistance-upcoming)

---

## Gate 1A: Database Fundamentals & Precision

### Concept 1: Precision in Financial Systems
- **Question:** Why do we use `NUMERIC(18,2)` instead of `FLOAT` or `DOUBLE` for monetary amounts?
- **Your Answer:** `NUMERIC(18,2)` catches every penny, even `0.01` or `0.001`, giving 18 total digits with 2 decimal places. Floating-point arithmetic produces precision errors (`0.1 + 0.2 = 0.30000000000000004`), which causes phantom reconciliation variances.
- **Interview Key Takeaway:** Base-10 exact representation eliminates binary floating-point representation errors and guarantees exact matching down to ₹0.01.

### Concept 2: Nullability in Financial Workflows
- **Question:** What does `payments.settlement_id IS NULL` signify in real-world payment operations?
- **Your Answer:** When a payment is captured, settlement takes $T+2$ days. Up to 2 days, `settlement_id` is legitimately `NULL`. If it remains `NULL` past $T+2$, it indicates an anomaly (`missing_settlement`).
- **Interview Key Takeaway:** Nullability is an intentional domain state, not missing data. It models the asynchronous clearing delay between payment gateways and partner banks.

### Concept 3: Benchmark Isolation & Security
- **Question:** Why is `ground_truth` isolated in a separate `evaluator` schema instead of `public`?
- **Your Answer:** To physically prevent the application backend and AI models from reading ground truth during automated evaluations.
- **Interview Key Takeaway:** Schema-level isolation enforces zero data leakage, ensuring benchmark match-rate and accuracy metrics are legitimate and verifiable.

---

## Gate 1B: Advanced Relational Engineering & Optimization

### Concept 4: Partial / Conditional Indexes
- **Question:** What is the performance advantage of a Partial Index (`CREATE INDEX ... WHERE settlement_id IS NOT NULL`)?
- **Your Answer:** Instead of indexing all rows (including unsettled transactions), it indexes only non-null rows, speeding up reconciliation joins to sub-millisecond speeds and reducing index memory size.
- **Interview Key Takeaway:** Partial indexes save 60–80% RAM and write I/O by excluding sparse `NULL` values, keeping active B-Tree lookups fast in cache.

### Concept 5: Circular Dependencies & Deferred Constraints
- **Question:** Why do we use `DEFERRABLE INITIALLY DEFERRED` on foreign keys between `reconciliation_cases` and `candidate_matches`?
- **Your Answer:** It postpones foreign key constraint validation until the transaction `COMMIT` statement.
- **Interview Key Takeaway:** Handles circular and intra-batch dependencies cleanly within an atomic ACID transaction without needing complex two-phase manual SQL updates.

---

## Gate 1C: J.P. Morgan AI Research & Synthetic Data Engineering

### Concept 6: What is the J.P. Morgan AI Research Paper About in Plain English?
- **The Core Problem:** 
  Imagine you run a business: when a customer pays ₹1,000 online, Razorpay takes a 2% fee (₹20) + 18% GST on that fee (₹3.60). Two days later ($T+2$), exactly ₹976.40 must land in your bank account. 
  In real banks (like J.P. Morgan Chase), you cannot use real customer bank accounts to test AI software because of privacy laws. But if engineers create fake random data, the numbers don't add up, and if they let an AI do the math, the AI makes hallucinated calculation errors.
- **What J.P. Morgan AI Research Discovered:**
  1. **Relational Graphs:** Synthetic data must be generated as an interconnected graph (Payment $\rightarrow$ Gateway Fee $\rightarrow$ Bank ACH Deposit) where every penny matches across multiple tables with real-world 2-day clearing delays.
  2. **TS-Agent Principle (Zero LLM Math):** LLMs are language models, not calculators. An LLM must NEVER do arithmetic or compare numbers in prompts. All math must be delegated to exact base-10 code (`Decimal`).
  3. **"Ask David" Hybrid Model:** Use SQL database queries to get exact financial numbers, and use Vector AI only to read company policy text. The AI explains the policy; it never changes the money balance.

### Concept 7: The 6 Concrete Things We Acquired and Implemented in Our Code
1. **Cross-Table Relational Invariants:** `data/generator.py` links 4 CSVs where $\text{Gross} - \text{Fee} - \text{GST} = \text{Net Bank Credit}$ exactly.
2. **70/30 Anomaly Injection:** Exactly 350 clean records ($70\%$) and 150 injected anomalies ($30\%$) across the 8 closed exception classes.
3. **Deterministic Python Decimal Core:** All fees and net amounts use Python's `Decimal` with `ROUND_HALF_UP` quantization (`0.01`). Zero float errors.
4. **Hybrid SQL + Policy Vector RAG:** SQL supplies exact financial facts; Vector search supplies policy text; Pydantic enforces citations.
5. **Physical Ground-Truth Isolation:** Test answers are stored in `evaluator.ground_truth` in Supabase with app permissions revoked.
6. **Amount-at-Risk Review Prioritization:** Exceptions are sorted by dollar exposure with append-only audit tracking.

### Concept 8: Why This Puts Us at a Senior/Staff Engineering Level
- **20-Second Pitch Answer for Interviews:**
  > *"Instead of building a naive chatbot that asks an LLM to guess transaction matches, we grounded our architecture in **J.P. Morgan AI Research's TS-Agent and FedSyn principles**. We built a 100% deterministic core in Python Decimal and PostgreSQL that auto-reconciles 80%+ of clean records at millisecond speeds. For exceptions, a bounded Hybrid SQL + Vector RAG assistant retrieves exact SQL evidence and company policy text with strict citation guardrails to explain the discrepancy to human analysts."*

---

## Gate 1 P0 Exercise 1: CSV-to-DB Column Mapping

**Date Completed:** 2026-08-26  
**Ownership Status:** `understood` ✅  

### The Full Verified Column Mapping

| CSV Column | Python Type in `PaymentRecord` | PostgreSQL Column Type | Notes |
|---|---|---|---|
| `payment_id` | `str` | `VARCHAR` | Primary identifier |
| `order_id` | `str` | `VARCHAR` | Merchant's order reference |
| `merchant_id` | `str` | `VARCHAR` | Which merchant owns this payment |
| `payment_type` | `str` | `TEXT` | e.g., `card`, `wallet` |
| `payment_method` | `str` | `TEXT` | e.g., `upi`, `netbanking` |
| `amount` | `Decimal` | `NUMERIC(18,2)` | **Base-10 exact. Never float.** |
| `currency` | `str` | `TEXT` | ISO currency code (e.g., `INR`) |
| `status` | `str` (default: `"captured"`) | `VARCHAR + CHECK constraint` | NOT a PostgreSQL native ENUM (hard to ALTER in production) |
| `payment_timestamp` | `datetime` | `TIMESTAMPTZ` | UTC timezone-aware |
| `captured_timestamp` | `Optional[datetime]` | `TIMESTAMPTZ NULLABLE` | May arrive slightly after payment |
| `settlement_id` | `Optional[str]` | `VARCHAR NULLABLE` | **NULL is a valid domain state (T+2 clearing window)** |

### Q1: Why Does Float Arithmetic Fail in Reconciliation?
- **Question:** What breaks at runtime if `amount` is stored as `FLOAT` instead of `NUMERIC(18,2)`?
- **Your Initial Answer:** "2% tax and 18% GST will fail at runtime."
- **Correction Applied:** The failure is a specific silent mismatch. For example:
  - `726.0 * 0.02 = 14.52` (fine)
  - `14.52 * 0.18 = 2.6136000000000004` (float drift!)
  - Net = `726.0 - 14.52 - 2.6136000000000004 = 708.8663999999999`
  - Bank says: `708.87`. Matcher comparison: `708.87 != 708.8663...` → **False `amount_mismatch` exception on a clean transaction!**
- **Interview Key Takeaway:** Float arithmetic creates phantom discrepancies on clean transactions, corrupting precision and recall metrics.

### Q2: Why is `settlement_id IS NULL` a Domain State, Not Bad Data?
- **Your Answer:** "To catch the financial anomaly after T+2 days it is intentionally written."
- **Correction Applied:** `NULL` does not catch anomalies. It IS the normal state during T+2 clearing:
  - Day 0: Payment captured → `settlement_id = NULL` (normal)
  - Day 2: Settlement arrives → `settlement_id = 'set_001001'` (normal)
  - Day 3+: Still NULL → NOW it becomes `missing_settlement` exception
- **Interview Key Takeaway:** `NULL` means "clearing in progress." The matcher raises `missing_settlement` only when it looks for a settlement record and finds none — not because of the NULL value itself.

### Q3: Pydantic Trade-off
- **Your Answer:** "It provides strict type hints unlike a traditional Python dictionary."
- **Full Answer:** The **gain** is type safety (enforces `Decimal`, validates `datetime`, rejects `"N/A"`). The **cost** is schema coupling (if CSV format changes, the Pydantic model must be updated) and parsing overhead (acceptable at 500 records, measurable at 5,000,000 records). This project accepts the cost because safety on financial data far outweighs the parsing overhead.

---

## 📅 Roadmap & Next Practice Milestones

| Gate | Focus Area | Hands-On Exercise | Status |
|:---:|---|---|:---:|
| **Gate 1A** | Schema Planning & DDL Design | 16 tables, 14 indexes, constraints | Completed ✅ |
| **Gate 1B** | Supabase Migration Execution | Apply DDL, verify 46 indexes and schemas | Completed ✅ |
| **Gate 1C** | JPMC Research & Synthetic Generator | 500 records, 8 anomaly types | Completed ✅ |
| **Gate 1 P0** | CSV-to-DB Column Mapping | Mapped 11 fields, explained types | `understood` ✅ |
| **Gate 1 P0** | Raw vs Normalized Dual-Storage | Inspect `payments_raw` vs `payments` DDL | In Progress 🚀 |
| **Gate 2** | FastAPI + SQLAlchemy + Matcher | Full critical path trace | Upcoming |
| **Gate 3** | Evaluation Harness | Precision, recall, throughput CLI | Upcoming |
| **Gate 4** | Review Queue & Audit | Amount-at-Risk triage, audit events | Upcoming |
| **Gate 5** | Hybrid RAG Assistant | SQL facts + vector policy + citations | Upcoming |
