# 🎓 Project Learning & Hands-On Ownership Protocol

**Candidate:** Kotagiri Sathvik  
**Project:** Razorpay AI Finance Controller (Track 04)  
**Status Key:**
- `not started`: Topic not yet covered
- `practised`: Hands-on exercise completed with guidance
- `understood`: Concept explained correctly in candidate's own words
- `implemented`: Candidate reviewed, modified, and owns the code
- `tested`: Automated unit/integration tests pass
- `verified`: Implementation, tests, manual behavior, evidence, and explanation all agree

---

## 🧭 Master Progress Matrix

```
[1] Python & OOP                 [█░░░░░░░░░]  8% (1/12 Topics)
[2] Domain & Algorithms          [████░░░░░░] 40% (4/10 Topics)
[3] FastAPI Backend              [░░░░░░░░░░]  0% (0/20 Topics)
[4] SQLAlchemy & PostgreSQL      [██░░░░░░░░] 20% (2/11 Topics)
[5] PostgreSQL & Supabase DDL    [██████████] 100% (13/13 Topics - Gate 1 Verified)
[6] CSV Ingestion Pipeline       [████░░░░░░] 40% (4/10 Topics)
[7] Evaluation Architecture      [░░░░░░░░░░]  0% (0/10 Topics)
[8] RAG & AI Investigation       [░░░░░░░░░░]  0% (0/13 Topics)
[9] Docker & Runtime             [░░░░░░░░░░]  0% (0/8 Topics)
[10] CI/CD Automation            [░░░░░░░░░░]  0% (0/8 Topics)
[11] Manual Git Discipline       [██████████] 100% (Manual Commands Active)
```

---

## 📘 Section 1: Python & OOP Track (12 Topics)

| # | Topic | Exact Project Symbol / File | Status | Verifiable Evidence |
|---|---|---|:---:|---|
| 1.1 | **Classes and Objects** | `backend/app/schemas/domain.py::PaymentRecord` | `practised` | Interactive Python instantiation test |
| 1.2 | **Constructors & Methods** | `PaymentRecord.is_captured()` | `not started` | |
| 1.3 | **Composition** | `ReconciliationService` has-a `Matcher` | `not started` | |
| 1.4 | **Dependency Injection** | Injecting fake repo into service | `not started` | |
| 1.5 | **Dataclasses & Result Objects**| `ReconciliationCaseResult` | `not started` | |
| 1.6 | **Custom Exceptions** | `domain/exceptions.py::InvalidFinancialAmountError` | `not started` | |
| 1.7 | **Encapsulation & Invariants** | Reject negative money amounts | `not started` | |
| 1.8 | **Inheritance vs Composition** | Entity base models vs composite matchers | `not started` | |
| 1.9 | **Polymorphism** | Real vs Fake repository interface | `not started` | |
| 1.10| **Type Hints & Protocols** | `RepositoryProtocol` | `not started` | |
| 1.11| **Modules & Clean Imports** | Dependency direction audit | `not started` | |
| 1.12| **Testing Classes** | Unit tests for normal, invalid, and boundary inputs | `not started` | |

---

## ⚡ Section 2: FastAPI Backend Track (20 Topics)

| # | Topic | Exact Project Symbol / File | Status | Verifiable Evidence |
|---|---|---|:---:|---|
| 2.1 | **App Creation & Startup** | `backend/app/main.py::app` | `not started` | |
| 2.2 | **Route Functions** | `backend/app/api/v1/health.py::healthz` | `not started` | |
| 2.3 | **APIRouter & Registration** | `backend/app/api/v1/router.py` | `not started` | |
| 2.4 | **Path, Query, & Body Params**| `/api/v1/reconciliation/cases/{case_id}` | `not started` | |
| 2.5 | **Pydantic Request Models** | `IngestionBatchRequest` | `not started` | |
| 2.6 | **Pydantic Response Models**| `ReconciliationSummaryResponse` | `not started` | |
| 2.7 | **Multipart CSV Uploads** | `POST /api/v1/ingestion/upload` | `not started` | |
| 2.8 | **Dependency Injection** | `fastapi.Depends` | `not started` | |
| 2.9 | **Database-Session Dependencies**| `backend/app/api/deps.py::get_db` | `not started` | |
| 2.10| **Service Invocation from Routes**| Route $\rightarrow$ Service separation | `not started` | |
| 2.11| **HTTP Status Codes** | 200, 201, 400, 404, 409, 422 | `not started` | |
| 2.12| **Expected Error Handling** | Structured 409 for duplicate idempotency key | `not started` | |
| 2.13| **Custom Exception Handlers**| Global exception handlers | `not started` | |
| 2.14| **Middleware & Request IDs** | Correlation ID middleware (`X-Request-ID`) | `not started` | |
| 2.15| **Health & Readiness Probes** | `/healthz` (liveness) & `/readyz` (DB readiness) | `not started` | |
| 2.16| **OpenAPI / Interactive Docs**| `/docs` & `/redoc` schema inspection | `not started` | |
| 2.17| **Async Endpoint Behavior** | `async def` vs threadpool execution | `not started` | |
| 2.18| **API Testing (TestClient)** | `httpx.AsyncClient` / `TestClient` tests | `not started` | |
| 2.19| **Dependency Overrides** | `app.dependency_overrides[get_db]` in tests | `not started` | |
| 2.20| **Settings & Env Injection** | `backend/app/core/config.py::settings` | `not started` | |

---

## 🗄️ Section 3: SQLAlchemy & Database Track (11 Topics)

| # | Topic | Exact Project Symbol / File | Status | Verifiable Evidence |
|---|---|---|:---:|---|
| 3.1 | **Database URL & Driver** | `postgresql+psycopg2://` driver connection | `practised` | `.env.example` verified |
| 3.2 | **Engine & Connection Pooling**| `create_engine()` with pool sizing | `not started` | |
| 3.3 | **Session Factory** | `sessionmaker(autocommit=False, autoflush=False)` | `not started` | |
| 3.4 | **Session Lifecycle** | `yield db` then `db.close()` | `not started` | |
| 3.5 | **SQLAlchemy ORM Models** | `PaymentModel`, `SettlementModel` | `not started` | |
| 3.6 | **SQLAlchemy `select()` Queries**| `db.execute(select(PaymentModel)...)` | `not started` | |
| 3.7 | **Repository Layer Pattern** | `PaymentRepository.get_by_id()` | `not started` | |
| 3.8 | **Insert & Batch Operations** | `db.add_all()` | `not started` | |
| 3.9 | **ACID Transactions** | `with db.begin():` | `not started` | |
| 3.10| **Commit & Rollback on Error**| Forced failure test asserting rollback | `not started` | |
| 3.11| **Test Database Session Override**| SQLite/in-memory test session override | `not started` | |

---

## 📊 Section 4: Domain, Matcher & Algorithm Track (10 Topics)

| # | Topic | Exact Project Symbol / File | Status | Verifiable Evidence |
|---|---|---|:---:|---|
| 4.1 | **Exact Decimal Arithmetic** | `Decimal('1000.00') * Decimal('0.02')` | `verified` | `tests/unit/test_domain_math.py` passed |
| 4.2 | **Financial Quantization** | `ROUND_HALF_UP` to `0.01` | `verified` | `test_odd_amount_rounding` passed |
| 4.3 | **Settlement Math Invariants** | $\text{Gross} = \text{Net} + \text{Fee} + \text{Tax}$ | `verified` | Unit test verified |
| 4.4 | **8-Exception Taxonomy** | `domain/exceptions.py::FinancialExceptionType` | `implemented` | 8 enum classes defined |
| 4.5 | **Hash-Map O(1) Indexing** | `settlement_by_id = {...}` | `practised` | `tests/unit/test_matcher.py` passed |
| — | **CSV-to-DB Column Mapping (P0 Exercise 1)** | `backend/app/schemas/domain.py::PaymentRecord` | **`understood` ✅** | **11/11 fields mapped. Float failure mechanism. T+2 NULL semantics corrected. 2026-08-26.** |
| 4.6 | **Stage 1 Exact Identifier Match**| `payment_id == settlement_id` | `practised` | Batch matching test passed |
| 4.7 | **Stage 2 Composite Rule Match**| Amount + Date Window + Merchant | `not started` | |
| 4.8 | **Stage 3 Ambiguity Gating** | Multiple candidate routing | `practised` | Ambiguity test verified |
| 4.9 | **Time Complexity Trade-offs** | $O(N)$ hash lookup vs $O(N^2)$ brute-force | `understood` | Explanation recorded |
| 4.10| **Reconciliation Result Ledger**| `ReconciliationCaseResult` | `implemented` | Output model verified |

---

## 📈 Section 5: Evaluation & Statistical Rigor Track (10 Topics)

| # | Topic | Exact Project Symbol / File | Status | Verifiable Evidence |
|---|---|---|:---:|---|
| 5.1 | **Dataset Versioning & Seeds** | `seed=42`, `dataset_version="v1.0"` | `verified` | `data/generator.py` verified |
| 5.2 | **Isolated Ground Truth Schema**| `evaluator.ground_truth` table in Supabase | `verified` | Supabase migration applied |
| 5.3 | **Benchmark Test Runner** | `evaluation/harness.py` | `not started` | |
| 5.4 | **Match Rate Formula** | $\frac{\text{auto\_reconciled}}{\text{total}}$ | `not started` | |
| 5.5 | **Throughput Benchmark** | $\text{records} / \text{sec}$ wall-clock timer | `not started` | |
| 5.6 | **Precision Metric** | $\frac{TP}{TP + FP}$ (Target: 100% on auto-match) | `not started` | |
| 5.7 | **Recall Metric** | $\frac{TP}{TP + FN}$ per exception class | `not started` | |
| 5.8 | **Confusion Matrix Generation** | Scikit-learn / pure Python confusion matrix | `not started` | |
| 5.9 | **Zero False Approval Invariant**| Asserting 0 false positives | `not started` | |
| 5.10| **Unresolved Exception Export** | CSV/JSON export of `needs_review` cases | `not started` | |

---

## 🤖 Section 6: Hybrid RAG & AI Track (13 Topics)

| # | Topic | Exact Project Symbol / File | Status | Verifiable Evidence |
|---|---|---|:---:|---|
| 6.1 | **SQL Evidence Tool** | `backend/app/rag/tools/sql_tool.py` | `not started` | |
| 6.2 | **Policy Vector Retrieval** | `backend/app/rag/retriever.py` | `not started` | |
| 6.3 | **Corpus Versioning** | `backend/app/rag/corpus/*.md` | `not started` | |
| 6.4 | **Chunk Metadata & Invariants**| Chunking with policy name + line numbers | `not started` | |
| 6.5 | **Pydantic Citation Guardrail**| `[Doc: fee_policy.md#L12]` regex validation | `not started` | |
| 6.6 | **Structured Model Output** | `ExplanationResponse` schema | `not started` | |
| 6.7 | **Cosine Grounding Floor** | Reject context if similarity $< 0.35$ | `not started` | |
| 6.8 | **Model Abstention Behavior** | Refusal on out-of-scope prompts | `not started` | |
| 6.9 | **Bounded Retry & Exponential Backoff**| 3x retry before human fallback | `not started` | |
| 6.10| **AI Timeout Handling** | Route to `needs_review` on timeout | `not started` | |
| 6.11| **Malformed JSON Recovery** | Pydantic retry loop on bad LLM output | `not started` | |
| 6.12| **Prompt Injection Defense** | Sanitized template inputs | `not started` | |
| 6.13| **Zero Financial Mutation by AI**| Asserting AI cannot execute SQL `UPDATE` | `not started` | |

---

## 🐳 Section 7: Docker, CI/CD & Operations Track (16 Topics)

| # | Topic | Exact Project Symbol / File | Status | Verifiable Evidence |
|---|---|---|:---:|---|
| 7.1 | **Dockerfile Design** | `Dockerfile` multi-stage build | `not started` | |
| 7.2 | **Container Build & Run** | `docker build -t finance-controller .` | `not started` | |
| 7.3 | **Runtime Env Injection** | Passing `.env` to container | `not started` | |
| 7.4 | **Liveness vs Readiness** | `/healthz` vs `/readyz` | `not started` | |
| 7.5 | **Clean-Checkout Quickstart** | `docker-compose up` | `not started` | |
| 7.6 | **GitHub Actions CI Workflow** | `.github/workflows/ci.yml` | `not started` | |
| 7.7 | **Automated Lint & Typecheck** | `ruff`, `mypy` jobs in CI | `not started` | |
| 7.8 | **Automated Test Matrix** | `pytest` job in CI | `not started` | |
| 7.9 | **Automated Secret Scanner** | `trufflehog` / `git-secrets` in CI | `not started` | |
| 7.10| **5-Failure Injection Suite** | Test suite simulating DB/AI/Network failures | `not started` | |
| 7.11| **Manual Git Discipline** | Status, diff, atomic commits, push approval | `verified` | Actively enforced |
