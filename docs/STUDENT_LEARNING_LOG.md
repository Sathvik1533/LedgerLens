# 📘 Student Learning Log & Interview Prep Guide

**Candidate:** Kotagiri Sathvik  
**Project:** Razorpay AI Finance Controller (Track 04)  
**Target Goal:** AI Backend Engineering & Internship Mastery  
**Status:** Actively Maintained at Every Gate  

---

## 🎯 Master Index of System-Design Concepts

- [Gate 1A: Database Fundamentals & Precision](#gate-1a-database-fundamentals--precision)
- [Gate 1B: Advanced Relational Engineering & Optimization](#gate-1b-advanced-relational-engineering--optimization)
- [Gate 1C: Synthetic Data Generation & Data Quality](#gate-1c-synthetic-data-generation--data-quality-upcoming)
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

## 📅 Roadmap & Next Practice Milestones

| Gate | Focus Area | Hands-On Exercise |
|:---:|---|---|
| **Gate 1A** | Schema Planning & DDL Design | Design 16 tables, 14 indexes, constraints (Completed ✅) |
| **Gate 1B** | Supabase Migration Execution | Apply DDL, verify 46 indexes and schemas (Completed ✅) |
| **Gate 1C** | Synthetic Data Generator | Code Python generator script, produce 500 records with 8 anomaly types (Starting NOW!) |
| **Gate 2** | Deterministic Matcher | Build Python Decimal normaliser, 3-stage candidate matcher |
| **Gate 3** | Evaluation Harness | Run benchmark CLI, calculate precision, recall, and throughput |
| **Gate 4** | Review Queue & Audit | Build triage queue sorted by Amount-at-Risk, record append-only audit events |
| **Gate 5** | Hybrid RAG Assistant | Implement LangGraph flow: SQL facts + vector policy retrieval + citations |
