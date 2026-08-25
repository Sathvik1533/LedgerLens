# Strategic Differentiation & System Design Teaching Plan

**Document Title:** Razorpay AI Finance Controller: Differentiation Strategy & System Design Pedagogy  
**Target Submission:** Razorpay AI Buildathon (Track 04) & Production AI Backend Engineering  
**Core Strategy:** Win on **financial correctness, reproducibility, verifiable proof, safe abstention, and clear analyst value** rather than superficial feature bloat.

---

## 1. Summary of Strategic Edge Decisions

From our 26-competitor empirical analysis, we select **exactly three core differentiators** to build into our frozen MVP:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       OUR 3 CORE DIFFERENTIATORS                                        │
├─────────────────────────────────────┬─────────────────────────────────────┬─────────────────────────────┤
│ 1. REPRODUCIBLE METRIC PROVENANCE   │ 2. HYBRID SQL + GROUNDED POLICY RAG │ 3. FAILURE INJECTION &      │
│    & SCHEMA-ISOLATED GROUND TRUTH   │    WITH CITATION GUARDRAILS         │    AMOUNT-AT-RISK TRIAGE    │
├─────────────────────────────────────┼─────────────────────────────────────┼─────────────────────────────┤
│ • evaluator.ground_truth table      │ • SQL owns 100% of transaction facts│ • Automated test suite for  │
│ • Full provenance logged per run    │ • Vector RAG over versioned policies│   5 infrastructure failures │
│   (seed, commit, dataset, throughput│ • Pydantic citation regex guardrail │ • Review queue ranked by    │
│ • Zero data leakage during eval     │ • Zero LLM arithmetic; safe refusal │   discrepancy ($) exposure  │
└─────────────────────────────────────┴─────────────────────────────────────┴─────────────────────────────┘
```

---

## 2. System Design Concepts This Project Teaches

This project is structured as a real-world vertical slice of production AI backend engineering. Below is how each system design concept is applied, coded, and verified across our milestone gates:

---

### 1. Requirements & Scope Engineering
- **What it means here:** Converting broad hackathon prompts ("build an AI finance controller") into formal, frozen engineering contracts (`DATA_CONTRACT.md`, `FAILURE_AND_RECOVERY.md`), defining explicit acceptance criteria, and rejecting out-of-scope bloat (cash forecasting, tax matching).
- **Files/Code:** `docs/DATA_CONTRACT.md`, `docs/ARCHITECTURE.md`, `docs/MILESTONES.md`.
- **Hands-On Exercise:** Inspecting frozen requirements to identify why 4-source reconciliation was chosen over 2-party matching.
- **Evidence of Understanding:** Explaining how scope boundary rules prevent feature creep during hackathon sprints.
- **Connection to Next Concept:** Clear requirements dictate the entity relationships needed in the domain model.

---

### 2. Domain Modelling & Entity Invariants
- **What it means here:** Mapping real-world financial clearing cycles into typed domain entities (`payments`, `refunds`, `settlements`, `bank_credits`, `reconciliation_cases`, `candidate_matches`, `evidence_items`, `human_review_actions`, `audit_events`) and enforcing business invariants.
- **Files/Code:** `backend/app/models/entities.py`, `backend/app/domain/exceptions.py`.
- **Hands-On Exercise:** Tracing the lifecycle of a payment from initial capture to settlement and final bank credit match.
- **Evidence of Understanding:** Explaining why `reconciliation_cases` are payment-anchored and how 8 closed exception classes are defined.
- **Connection to Next Concept:** Domain entities determine the database tables and layered service boundaries.

---

### 3. Layered API Architecture & Separation of Concerns
- **What it means here:** Enforcing strict architectural layering: HTTP Controllers $\rightarrow$ Pydantic Schemas $\rightarrow$ Application Services $\rightarrow$ Pure Domain Rules $\rightarrow$ Data Repositories $\rightarrow$ Database. Business logic never touches routes; SQL never enters UI components.
- **Files/Code:** `backend/app/api/v1/`, `backend/app/services/`, `backend/app/domain/`, `backend/app/models/`.
- **Hands-On Exercise:** Tracing an HTTP POST `/api/v1/reconciliation/batches` request through the service, domain matcher, and repository layers.
- **Evidence of Understanding:** Explaining why domain matching rules can be unit-tested without spinning up a database or API server.
- **Connection to Next Concept:** Clean layers depend directly on a robust physical data model.

---

### 4. Physical Data Modelling & Relational Integrity
- **What it means here:** Designing a 16-table PostgreSQL schema in Supabase using `NUMERIC(18,2)` for penny-exact money, `TIMESTAMPTZ` for UTC timestamps, `UNIQUE` constraints for idempotency, and `DEFERRABLE INITIALLY DEFERRED` foreign keys for intra-batch ordering.
- **Files/Code:** `GATE_1_SCHEMA_PLAN.md`, `migrations/20260825000000_gate1_initial_schema.sql`.
- **Hands-On Exercise:** Writing and running schema verification queries on Supabase checking data types, nullability, and foreign key cascades.
- **Evidence of Understanding:** Explaining why `FLOAT` is prohibited in financial databases and why `payments.settlement_id` must be nullable.
- **Connection to Next Concept:** Physical schemas must be evolved safely using version-controlled migrations.

---

### 5. Database Migrations & Versioning Discipline
- **What it means here:** Managing schema changes through incremental, deterministic SQL scripts that can be applied, verified, and rolled back without manual database GUI modifications.
- **Files/Code:** `migrations/`, Supabase MCP `apply_migration` / `list_migrations`.
- **Hands-On Exercise:** Inspecting a proposed migration SQL diff, identifying safe vs. destructive DDL statements, and reviewing rollback procedures.
- **Evidence of Understanding:** Explaining why migrations must run in strict dependency order (e.g., schemas $\rightarrow$ raw tables $\rightarrow$ normalised tables $\rightarrow$ foreign keys).
- **Connection to Next Concept:** A migrated database provides the persistence layer for deterministic business logic.

---

### 6. Deterministic Business Logic vs. AI Boundaries
- **What it means here:** Financial arithmetic, fee variance calculation, and candidate filtering are 100% deterministic (Python `Decimal` and SQL queries). AI is strictly prohibited from altering balances or approving transactions.
- **Files/Code:** `backend/app/domain/matcher.py`, `backend/app/domain/settlement_calc.py`.
- **Hands-On Exercise:** Running unit tests verifying fee deductions ($2\% + \text{tax}$) across 100 edge cases with zero rounding errors.
- **Evidence of Understanding:** Explaining the failure mode of using an LLM prompt for reconciliation arithmetic.
- **Connection to Next Concept:** Deterministic logic must be hardened against duplicate requests and network retries.

---

### 7. Idempotency, Concurrency & Failure Recovery
- **What it means here:** Enforcing that re-submitting an identical batch (due to network timeout or duplicate webhook) returns the original processed result without creating duplicate records or cases (`UNIQUE (idempotency_key)`).
- **Files/Code:** `backend/app/services/ingestion_service.py`, `backend/app/models/raw.py`.
- **Hands-On Exercise:** Submitting the same synthetic batch payload twice via curl/pytest and verifying that the second request returns HTTP 200 with `batch_status = 'already_processed'`.
- **Evidence of Understanding:** Explaining how database constraints enforce idempotency even under concurrent requests.
- **Connection to Next Concept:** Reliable systems require empirical evaluation to prove accuracy under test conditions.

---

### 8. Evaluation Architecture & Ground-Truth Isolation
- **What it means here:** Building a standalone evaluation harness (`harness.py`) that benchmarks reconciliation decisions against a physically isolated `evaluator.ground_truth` table, measuring precision, recall, match rate, and throughput.
- **Files/Code:** `evaluation/harness.py`, `evaluation/metrics.py`, `evaluator.ground_truth`.
- **Hands-On Exercise:** Running the evaluation script on a 500-record dataset and manually calculating precision and recall from the confusion matrix.
- **Evidence of Understanding:** Explaining why test labels must be stored in an isolated PostgreSQL schema to prevent LLM prompt data leakage.
- **Connection to Next Concept:** Cases that fail automated reconciliation must be routed to human review.

---

### 9. Human-in-the-Loop Systems & Auditability
- **What it means here:** Low-confidence and ambiguous matches are automatically routed to a human review queue. Analysts execute 1-click actions (`approve`, `reject`, `mark_unresolved`) which are recorded in immutable, append-only audit tables (`human_review_actions`, `audit_events`).
- **Files/Code:** `backend/app/services/review_service.py`, `backend/app/models/audit.py`.
- **Hands-On Exercise:** Reviewing a flagged `amount_mismatch` case in the review queue, taking an action with a comment, and querying `audit_events` to verify the audit log entry.
- **Evidence of Understanding:** Explaining why financial audit events must be append-only with `UPDATE` and `DELETE` permissions revoked.
- **Connection to Next Concept:** Human reviewers need an AI assistant to explain complex policy discrepancies.

---

### 10. Hybrid Retrieval & Bounded RAG Architecture
- **What it means here:** Building a Finance Operations Investigation Assistant where SQL retrieves exact transaction facts (authoritative) and Vector Search retrieves versioned Markdown policies (contextual). The LLM synthesizes an explanation and recommends next steps without altering data.
- **Files/Code:** `backend/app/rag/retriever.py`, `backend/app/rag/prompts.py`, `backend/app/rag/guardrails.py`.
- **Hands-On Exercise:** Querying the assistant for an ambiguous case and inspecting the retrieved SQL facts vs. the retrieved policy chunks.
- **Evidence of Understanding:** Explaining how a mathematical cosine similarity grounding floor (0.35) prevents hallucinations on out-of-scope queries.
- **Connection to Next Concept:** Complex investigation workflows require stateful orchestration.

---

### 11. Stateful Workflow Orchestration (LangGraph)
- **What it means here:** Orchestrating multi-step investigation workflows (Load Case $\rightarrow$ SQL Query $\rightarrow$ Vector Search $\rightarrow$ Synthesize $\rightarrow$ Validate Citations $\rightarrow$ Safety Check $\rightarrow$ Output) using typed state graphs with conditional retry edges.
- **Files/Code:** `backend/app/rag/graph.py`, `backend/app/schemas/rag.py`.
- **Hands-On Exercise:** Inspecting a LangGraph state transition and triggering a simulated vector retrieval timeout to observe the graceful fallback path.
- **Evidence of Understanding:** Explaining the difference between unbounded autonomous agent loops and bounded state machines with strict stopping conditions.
- **Connection to Next Concept:** All AI and backend workflows must be secured against malicious inputs.

---

### 12. Security, Privacy & Secret Management
- **What it means here:** Protecting sensitive credentials via `.env.example`, excluding secrets from Git (`.gitignore`), validating all user inputs via Pydantic, and sanitizing LLM prompts to prevent prompt injection.
- **Files/Code:** `.env.example`, `.gitignore`, `backend/app/core/config.py`.
- **Hands-On Exercise:** Running an automated secret scan over the repository and testing prompt injection payloads against the RAG assistant.
- **Evidence of Understanding:** Explaining why client-side React apps must never hold database connection strings or secret API keys.
- **Connection to Next Concept:** Secure systems must provide end-to-end operational visibility.

---

### 13. Backend Observability & Structured Logging
- **What it means here:** Emitting machine-readable structured JSON logs with correlation IDs (`request_id`, `batch_id`, `case_id`) across all HTTP requests, reconciliation steps, and AI calls, enabling real-time debugging and trace correlation.
- **Files/Code:** `backend/app/core/logging.py`, `backend/app/api/middleware.py`.
- **Hands-On Exercise:** Inspecting a structured log file during batch processing and filtering by `case_id` to trace a single transaction from start to finish.
- **Evidence of Understanding:** Explaining why correlation IDs are critical when debugging distributed microservices and LLM gateways.
- **Connection to Next Concept:** High-quality code requires automated testing and CI/CD pipelines.

---

### 14. Git Discipline & Release Engineering
- **What it means here:** Operating under strict Manual Git Mode: developing on feature branches (`feature/gate-*`), writing atomic conventional commits (`feat:`, `test:`, `docs:`), opening pull requests with test evidence, and maintaining a release-oriented `README.md`.
- **Files/Code:** `.github/workflows/ci.yml`, `README.md`, Git commit history.
- **Hands-On Exercise:** Inspecting a feature branch diff, running the full test suite, and preparing a clean PR description with test artifacts.
- **Evidence of Understanding:** Explaining why direct commits to `main` without PR review violate professional engineering standards.
- **Connection to Next Concept:** Solid release engineering enables reproducible local and cloud deployment.

---

### 15. Deployment & Production Operations
- **What it means here:** Providing containerized deployment (`Dockerfile`, `docker-compose.yml`), automated health-check endpoints (`/healthz`, `/readyz`), database connectivity probes, and clean one-command quickstart scripts.
- **Files/Code:** `Dockerfile`, `docker-compose.yml`, `backend/app/api/v1/health.py`.
- **Hands-On Exercise:** Spinning up the full stack from a clean checkout using Docker and verifying that health endpoints report `healthy`.
- **Evidence of Understanding:** Explaining the difference between liveness (`/healthz`) and readiness (`/readyz`) probes in container orchestration.

---

## 3. Gate-to-System-Design Learning Roadmap

| Gate | Main System-Design Concepts | Human Hands-On Exercise | Verifiable Evidence |
|:---:|---|---|---|
| **Gate 1** | Physical Data Modelling, Migrations, Integrity Constraints, Idempotency, Ground-Truth Isolation | Inspect schema DDL, verify Supabase table types, test `UNIQUE` idempotency constraint | `GATE_1_SCHEMA_PLAN.md` & Supabase schema verification queries |
| **Gate 2** | Domain Modelling, Layered Architecture, Deterministic Arithmetic, Exception Taxonomy | Trace one payment through normalisation and 3-stage matching logic; verify zero float math | Unit & integration test suite passing with >85% coverage |
| **Gate 3** | Evaluation Architecture, Statistical Rigor, Metric Provenance, Confusion Matrices | Execute benchmark CLI command, manually verify precision/recall formulas from output | `evaluation_report.json` logging match rate, throughput, and accuracy |
| **Gate 4** | State Machines, Human-in-the-Loop Triage, Amount-at-Risk Prioritization, Audit Trails | Triage an `amount_mismatch` case, take review action, verify append-only `audit_events` row | API review tests and database audit event records |
| **Gate 5** | Hybrid RAG, Citation Guardrails, LangChain/LangGraph Orchestration, AI Abstention | Execute investigation query, verify exact Markdown citations, test out-of-scope refusal | RAG test suite verifying citation regex and cosine grounding floor |
| **Gate 6** | API Contracts, React State Management, Failure UI States, Operational Dashboards | Upload batch through UI, inspect network payload, trigger and observe loading/error states | React component test suite and frontend smoke test |
| **Gate 7** | Failure Injection, Resilience, Structured Logging, CI Automation, Secret Protection | Run failure test suite (simulating DB pause, AI timeout, duplicate batch); run CI pipeline | `.github/workflows/ci.yml` green; failure test reports |
| **Gate 8** | Release Engineering, Technical Communication, Demo Delivery, Portfolio Packaging | Execute clean-checkout quickstart, record 5-minute walkthrough pitch video | Public GitHub repo, pitch video link, verified README |
