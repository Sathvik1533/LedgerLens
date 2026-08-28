# 🏛️ Reusable Engineering Patterns

## How to use this file

This file records recurring, transferrable engineering patterns observed in the **Razorpay AI Finance Controller**.

For every pattern, it documents:
- **Problem:** What recurring architectural challenge does this solve?
- **General Solution:** The language/framework-agnostic software pattern.
- **This Project:** Exact files and components demonstrating it.
- **Trade-offs & Failure Modes:** Gain vs cost, and what breaks under misuse.
- **Ownership Status:** `not observed` | `observed` | `practised` | `understood` | `implemented` | `tested` | `verified`.

---

## 📋 Master Pattern Index

| # | Pattern Name | Category | Status |
|---|---|---|:---:|
| 1 | **Layered Architecture** | Architecture | `practised` |
| 2 | **Domain Logic Independent of Infrastructure** | Domain Design | `verified` |
| 3 | **Pydantic Boundary Validation** | API / Ingestion | `practised` |
| 4 | **Hash-Indexed O(1) Candidate Matching** | Algorithms | `verified` |
| 5 | **Database Constraints as Invariants** | Data Persistence | `verified` |
| 6 | **Schema-Isolated Ground Truth** | Evaluation / Security | `verified` |
| 7 | **Application Service Orchestration** | Architecture | `planned` |
| 8 | **Repository / Data-Access Separation** | Persistence | `planned` |
| 9 | **Database-Session Dependency Injection** | Framework / FastAPI | `planned` |
| 10 | **Unit-of-Work & ACID Transactions** | Persistence | `planned` |
| 11 | **Idempotent Batch Ingestion** | Data Integrity | `planned` |
| 12 | **Raw vs Normalized Dual-Storage** | Data Ingestion | `planned` |
| 13 | **Amount-at-Risk Triage Queue** | Operations | `planned` |
| 14 | **Hybrid SQL Evidence + Vector Policy RAG** | AI Systems | `planned` |
| 15 | **Deterministic Citation Guardrails** | AI Safety | `planned` |
| 16 | **Append-Only Audit Trail** | Compliance | `planned` |
| 17 | **Liveness vs Readiness Probes** | DevOps / Docker | `planned` |
| 18 | **CI Quality Gates Matrix** | CI/CD | `planned` |

---

### Pattern 1: Domain Logic Independent of Infrastructure (TS-Agent Principle)

#### Problem
If financial formulas, fee calculations, or matching algorithms are embedded directly inside web route controllers or database queries, testing business logic requires spinning up web servers and live databases. Additionally, floating-point numbers in LLMs or databases cause silent calculation drift.

#### General Solution
Keep core business arithmetic and entity transformations in **pure, side-effect-free Python functions** that depend ONLY on standard Python library types (`Decimal`) and contain zero imports from FastAPI, SQLAlchemy, or HTTP clients.

#### This Project
- `backend/app/domain/settlement_calc.py`: `calculate_expected_settlement(gross_amount)`
- `backend/app/domain/matcher.py`: `DeterministicReconciliationEngine`

#### Data / Control Flow
```text
Raw Numbers ➔ Domain Function (Pure Math) ➔ (Expected Fee, Tax, Net) ➔ Returned to Caller
```

#### Trade-off
- **Gain:** 100% testable in 0.05 seconds with standard unit tests; zero dependencies; 100% deterministic arithmetic.
- **Cost:** Requires an application service layer to fetch data from repositories and map database rows into domain entities.

#### Failure Mode
Accidentally importing database models or session objects into the domain layer, creating tight coupling and breaking unit test isolation.

#### Ownership Status
`verified` (Verified by `tests/unit/test_domain_math.py`).

---

### Pattern 2: Hash-Indexed O(1) Candidate Matching

#### Problem
Matching 50,000 incoming payments against 50,000 settlement records using nested iteration (`for p in payments: for s in settlements:`) results in $O(N^2) = 2,500,000,000$ operations, locking CPU threads and causing HTTP timeouts.

#### General Solution
Pre-index the candidate collection into an in-memory hash table (Python `dict`) keyed by the unique join identifier before iterating over the source batch.

#### This Project
- `backend/app/domain/matcher.py`: `settlement_by_id = {s.settlement_id: s for s in settlements}`

#### Data / Control Flow
```text
Settlement List ➔ Hash Map (Key = settlement_id) ➔ O(1) Instant Lookup per Payment
```

#### Trade-off
- **Gain:** Reduces algorithmic complexity from quadratic $O(N \times M)$ to linear $O(N + M)$, enabling sub-millisecond per-record throughput.
- **Cost:** Requires additional memory (RAM) proportional to batch size.

#### Failure Mode
Memory exhaustion if attempting to load millions of records into memory at once without chunking/pagination.

#### Ownership Status
`verified` (Verified by `tests/unit/test_matcher.py`).

---

### Pattern 3: Schema-Isolated Ground Truth

#### Problem
In automated evaluations and benchmark testing, if the testing harness queries the same public database tables where the application runs, data leakage or inadvertent test-answer contamination invalidates accuracy claims.

#### General Solution
Physically isolate benchmark labels ("answer keys") in a separate database schema (`evaluator`) with application database user permissions revoked.

#### This Project
- `migrations/20260825000000_gate1_initial_schema.sql`: `CREATE SCHEMA IF NOT EXISTS evaluator;`
- `data/synthetic/ground_truth.csv`

#### Trade-off
- **Gain:** Verifiable benchmark integrity; zero possibility of inference pipeline cheating.
- **Cost:** Requires separate migration maintenance and distinct database connection strings for benchmark runners.

#### Ownership Status
`verified` (Verified in Supabase schema migration).
