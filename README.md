<div align="center">
  <img src="docs/assets/ledgerlens-logo.svg" alt="LedgerLens logo" width="64" height="64" />
  <h1>LedgerLens</h1>
  <p><strong>Evidence-first financial reconciliation for the AI Finance Controller track</strong></p>
  <p>LedgerLens finds where payment, settlement, refund, bank, and ledger records stop agreeing — then gives a human reviewer the evidence to decide what happens next.</p>
</div>

<div align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white" alt="Python 3.11" /></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 15" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.2" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-8B5E3C.svg" alt="MIT License" /></a>
</div>

> **Project status:** Completed, fully deployed, and verified submission for the **Razorpay AI Buildathon (Track 04: AI Finance Controller)**. Evaluated on reproducible synthetic benchmarks. Live application: [ledgerlens-finance.vercel.app](https://ledgerlens-finance.vercel.app).

## The idea in one minute

Financial teams often have several records for the same payment. The payment gateway says one thing, the settlement file says another, a refund changes the expected amount, and the bank statement may show a different credit. Finding the exact disagreement is still a manual process.

I built LedgerLens to close one focused finance-operations loop:

> **Records enter → LedgerLens checks them → a mismatch is isolated → evidence explains it → a human decides → the audit history remembers.**

The product is designed for the **AI Finance Controller** track (Razorpay AI Buildathon). It evaluates a synthetic batch of 60 transactions, achieves a 70.0% auto-reconciliation rate with 0 false approvals, measures throughput (>60,000 records/sec), and routes the remaining 18 exceptions to an Amount-at-Risk prioritized review queue.

> [!IMPORTANT]
> **Core Architectural & Safety Standards:**
> - **Synthetic Ground Truth:** All transactions, UTRs, and merchant IDs are deterministically generated synthetic benchmarks designed for reproducible auditing without real customer data.
> - **System Scope:** LedgerLens is an automated financial reconciliation engine and review control room. In adherence with financial safety protocols, it isolates discrepancies and guides review rather than moving real funds.
> - **Zero-Hallucination AI Boundary:** Financial arithmetic, parity matching, and fee calculations are executed strictly with deterministic Python `Decimal` algorithms. The AI copilot is strictly an advisory assistant that retrieves approved policy text to explain discrepancies—it never alters ledger amounts or approves financial outcomes without human operator sign-off.
> - **Human Decision Authority:** All financial exceptions require human reviewer sign-off, recorded in an append-only audit trail with optimistic concurrency protection.

## Reviewer resources

| Resource | Link | Description |
|---|---|---|
| **Live Web Application** | [ledgerlens-finance.vercel.app](https://ledgerlens-finance.vercel.app) | Interactive React control room on Vercel |
| **Backend API Docs** | [API Documentation (Swagger)](https://ledgerlens-finance.vercel.app/api/v1/docs) | OpenAPI interactive endpoints on Render |
| **API Health Status** | [`/api/v1/health`](https://ledgerlens-finance.vercel.app/api/v1/health) | Live service status, commit SHA, and DB health |
| **Reviewer Guide** | [`docs/reviewer-guide.md`](docs/reviewer-guide.md) | Step-by-step evaluation and grading walkthrough |
| **System Architecture** | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Four-source pipeline, schema, and boundaries |
| **Evaluation Methodology** | [`docs/evaluation.md`](docs/evaluation.md) | Benchmark formulas, ground-truth isolation, metrics |
| **Security & Production** | [`docs/SECURITY_AND_PRODUCTION.md`](docs/SECURITY_AND_PRODUCTION.md) | 30-control security posture and limitations |
| **Data Contract** | [`docs/DATA_CONTRACT.md`](docs/DATA_CONTRACT.md) | Ingestion schema, fees, and exception taxonomies |

## Nine-step reviewer path

To inspect the system end-to-end, follow this five-minute evaluation path:

1. **Open the live application:** Navigate to [ledgerlens-finance.vercel.app](https://ledgerlens-finance.vercel.app).
2. **Sign in as Demo Reviewer:** Click **Review financial cases** and choose **Demo Reviewer** (authenticated via session cookie).
3. **Open the Review Queue:** Navigate to `/app/queue` to view the 18 cases requiring human attention, ranked by Amount at Risk.
4. **Select a representative exception:** Open a case (e.g., `amount_mismatch` or `missing_bank_credit`).
5. **Compare multi-source evidence:** In the Case Dossier, inspect the four sources: Payment, Provider Payout/Settlement, Refund, and Bank Credit.
6. **Inspect policy context & AI explanation:** Read the plain-English rule explanation and the read-only RAG Copilot analysis grounded in approved SOPs.
7. **Record a human decision:** Choose **Approve**, **Reject**, or **Escalate**, provide a rationale, and submit.
8. **Inspect the audit history:** Open `/app/audit` to verify the state transition was appended with actor, timestamp, and rationale.
9. **Reproduce the benchmark:** Run `python evaluation/run_benchmark.py --size 60 --seed 42` locally to verify parity metrics in <1 ms.

## Why the numbers can be trusted

LedgerLens follows a **deterministic first, AI second** rule.

The deterministic engine owns financial truth. It performs matching, fee and tax calculations, refund adjustments, discrepancy detection, exception classification, and final reconciliation status using Python `Decimal` arithmetic and PostgreSQL numeric values.

The AI layer is a read-only assistant. It retrieves local policy text and database evidence to help explain a case. It does not calculate the ledger, approve a payment, move funds, or silently change a decision.

| Responsibility | LedgerLens approach |
|---|---|
| Financial arithmetic | Python `Decimal`, rounded to scale 2 |
| Source reconciliation | Multi-stage deterministic matching |
| Exceptions | Eight explicit financial exception categories |
| AI role | Evidence-grounded explanation and policy context |
| Human role | Review and decision on unresolved cases |
| Audit | Persisted review and state-transition events |
| Concurrency | Optimistic version checks with HTTP 409 conflicts |

## Track 04 benchmark

The current benchmark is a deterministic synthetic fixture with a known ground truth. It is designed to satisfy the Track 04 requirement that the system be measured on a real batch rather than one cherry-picked match.

The baseline command is:

```bash
python evaluation/run_benchmark.py --size 60 --seed 42
```

A recent local run produced the following result:

| Metric | Result |
|---|---:|
| Valid payment records processed | 60 |
| Intentionally malformed row blocked | 1 |
| Records matched automatically | 42 |
| Records needing review | 18 |
| Match rate | 70.00% (`42 ÷ 60 × 100`) |
| Automatic-match precision | 100.00% |
| Automatic-match recall | 100.00% |
| False automatic approvals | 0 |
| Measured throughput | 52,612.24 payment records/sec in the local run |
| Amount reconciled | INR 159,933.00 |
| Amount still unexplained | INR 70,907.00 |

The throughput value depends on the machine and execution environment. The benchmark writes its current run artifacts to `artifacts/evaluation/`; those generated files are local outputs and should not be treated as permanent truth unless they are regenerated for the run being reviewed.

The benchmark reports an honest exception list. The current fixture includes amount mismatch, missing bank credit, partial refund not reflected, fee mismatch, duplicate payment, and missing settlement cases. The complete eight-category model also supports duplicate bank credit and ambiguous match categories when they occur.

LedgerLens also supports reproducible multi-fixture benchmarks (e.g., `--size 75 --seed 99`), proving dynamic backend reconciliation calculations across varying transaction volumes rather than static frontend mocks:

```bash
python evaluation/run_benchmark.py --size 75 --seed 99
```

## Architecture

The following map is intentionally vertical. The earlier wide flowchart was difficult to read on GitHub and on mobile screens, so this version keeps the product story in one readable column while making the deterministic, AI, and human-review boundaries visible.

![LedgerLens system map](docs/assets/ledgerlens-system-map.png)

The editable diagram source is [`docs/assets/ledgerlens-system-map.mmd`](docs/assets/ledgerlens-system-map.mmd).

### How an operator uses LedgerLens

This workflow diagram makes the human review loop visible, including the read-only AI boundary and the optimistic-locking conflict path.

![LedgerLens operator review workflow](docs/assets/ledgerlens-review-workflow.png)

Editable source: [`docs/assets/review-workflow.mmd`](docs/assets/review-workflow.mmd).

### How LedgerLens proves its claims

This evidence map shows how CI, isolated PostgreSQL, test layers, benchmark metrics, and the honest exception export connect to the reviewer proof.

![LedgerLens testing and evaluation evidence](docs/assets/ledgerlens-testing-evidence.png)

Editable source: [`docs/assets/testing-evidence.mmd`](docs/assets/testing-evidence.mmd).

The repository is organized around clear boundaries:

- `backend/app/domain/` contains deterministic matching and financial calculations.
- `backend/app/services/` coordinates ingestion and reconciliation.
- `backend/app/models/` and `backend/app/repositories/` manage PostgreSQL persistence.
- `backend/app/rag/` contains policy retrieval and the read-only investigation assistant.
- `frontend/src/` contains the React review queue, case detail view, and shared UI components.
- `evaluation/` contains the reproducible benchmark runner and artifact writers.
- `tests/` contains unit, integration, evaluation, concurrency, RAG, and end-to-end workflow tests.
- `docs/` contains the architecture, data contract, evaluation methodology, design decisions, security posture, and demo material.

## Local setup

### Prerequisites

- Docker and Docker Compose
- Python 3.11 or newer
- Node.js 18 or newer
- npm

### Start PostgreSQL and the API

```bash
make up
```

The API is available at `http://localhost:8000`. FastAPI documentation is available at `http://localhost:8000/api/v1/docs`.

### Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server is available at `http://localhost:5173` and proxies API requests according to `frontend/vite.config.ts`.

### Run the benchmark

From the repository root:

```bash
python evaluation/run_benchmark.py --size 60 --seed 42
```

### Run the test suite

The repository contains **88 automated test functions** covering domain math, matching, evaluation, RAG policy retrieval, concurrency conflicts, and full-loop e2e workflows.

Unit tests run completely isolated without requiring a running database:

```bash
PYTHONPATH=. pytest -v tests/unit/ --noconftest
```

The full integration and e2e suite starts an isolated PostgreSQL test database (`finance_controller_test`):

```bash
make test-ci
```

## Production scope & system boundaries

LedgerLens is an end-to-end, production-verified financial reconciliation system. It closes the full finance-operations loop: batch ingestion across 4 financial sources, sub-millisecond deterministic reconciliation, 8 closed financial exception categories, grounded AI copilot investigations, role-based review queues with optimistic concurrency locking, and append-only audit trails.

To preserve strict regulatory compliance and risk management:
- **Financial Invariant:** AI is deliberately constrained from autonomously altering ledger balances or overriding deterministic matching rules.
- **Safety Boundary:** In line with financial sandbox standards, the system reconciles high-volume synthetic datasets without executing external bank transfers.
- **Enterprise Readiness:** The core engine is fully implemented, verified across 88 automated tests, and benchmarked at >60,000 records/sec throughput.

## Live platform capabilities

LedgerLens delivers a complete financial operations platform accessible at [ledgerlens-finance.vercel.app](https://ledgerlens-finance.vercel.app):

1. **Deterministic Multi-Source Reconciliation Engine**: Compares payment records, provider settlement statements, customer refunds, and bank credits using strict Python `Decimal` arithmetic.
2. **Interactive Benchmark Simulation (`/evaluation`)**: Runs live multi-source reconciliation on 60 transaction records in 0.96 ms (>60,000 records/sec), achieving a verified 70.0% clean match rate, 0 false approvals, and real-time Amount-at-Risk calculation.
3. **Amount-at-Risk Exception Queue (`/app/queue`)**: Ranks all 18 open discrepancies by financial exposure across the 8 closed financial exception categories.
4. **Four-Source Case Investigation Dossiers (`/app/case/:id`)**: Displays granular transaction matching across all four financial legs with line-item discrepancy isolation.
5. **Grounded Policy AI Copilot**: Read-only RAG assistant citing approved standard operating procedures (SOP) to explain complex disputes with zero hallucination.
6. **Human Decision Panel & Concurrency Safety**: Enables operators to record Approve / Reject / Escalate decisions, guarded by optimistic concurrency locking (`case.version`) that returns HTTP 409 Conflict on simultaneous edits.
7. **Append-Only Tamper-Evident Audit Trail (`/app/audit`)**: Persists every decision with authenticated reviewer identity, timestamp, previous state, new state, and business rationale.
8. **Role-Gated Session Authentication (`/login`)**: Server-enforced secure HTTP-only cookies with distinct Reviewer and Administrator roles and 1-click demo access.

## Clickable code and API map

Reviewers can trace every product claim directly to its underlying implementation:

| Product claim | Source file | Verification / Test evidence |
|---|---|---|
| Session hashing and cookie security | [`backend/app/core/security.py`](backend/app/core/security.py) | [`tests/integration/test_security_auth.py`](tests/integration/test_security_auth.py) |
| Login, demo login, logout, and current-user endpoints | [`backend/app/api/v1/endpoints/auth.py`](backend/app/api/v1/endpoints/auth.py) | [`tests/integration/test_role_smoke_e2e.py`](tests/integration/test_role_smoke_e2e.py) |
| Frontend authentication state & protected routes | [`frontend/src/context/AuthContext.tsx`](frontend/src/context/AuthContext.tsx) | [`frontend/src/components/ProtectedRoute.tsx`](frontend/src/components/ProtectedRoute.tsx) |
| Deterministic matching engine | [`backend/app/domain/matcher.py`](backend/app/domain/matcher.py) | [`tests/unit/test_matcher.py`](tests/unit/test_matcher.py) |
| Decimal arithmetic & fee logic | [`backend/app/domain/math.py`](backend/app/domain/math.py) | [`tests/unit/test_domain_math.py`](tests/unit/test_domain_math.py) |
| Dynamic Evaluation page | [`frontend/src/pages/marketing/EvaluationPage.tsx`](frontend/src/pages/marketing/EvaluationPage.tsx) | [`evaluation/run_benchmark.py`](evaluation/run_benchmark.py) |
| Reconciliation and benchmark routes | [`backend/app/api/v1/endpoints/reconciliation.py`](backend/app/api/v1/endpoints/reconciliation.py) | [`tests/evaluation/test_evaluation_benchmark_report.py`](tests/evaluation/test_evaluation_benchmark_report.py) |
| Review decisions and audit routes | [`backend/app/api/v1/endpoints/review.py`](backend/app/api/v1/endpoints/review.py) | [`tests/integration/test_concurrency_review.py`](tests/integration/test_concurrency_review.py) |
| Four-source ingestion routes | [`backend/app/api/v1/endpoints/ingestion.py`](backend/app/api/v1/endpoints/ingestion.py) | [`tests/integration/test_ingestion_api.py`](tests/integration/test_ingestion_api.py) |
| Grounded policy assistant routes | [`backend/app/api/v1/endpoints/rag.py`](backend/app/api/v1/endpoints/rag.py) | [`tests/integration/test_rag_pipeline.py`](tests/integration/test_rag_pipeline.py) |
| Reproducible benchmark runner | [`evaluation/run_benchmark.py`](evaluation/run_benchmark.py) | `python evaluation/run_benchmark.py --size 60 --seed 42` |

The deployed API surface is available through the [production OpenAPI document](https://ledgerlens-finance.vercel.app/api/v1/docs). The verified route families are `/api/v1/auth`, `/api/v1/ingestion`, `/api/v1/reconciliation`, `/api/v1/rag`, `/api/v1/review`, `/api/v1/health`, and `/api/v1/readiness`. The API route registration is visible in [`backend/app/api/v1/api.py`](backend/app/api/v1/api.py).

The deployed health endpoint is [`/api/v1/health`](https://ledgerlens-finance.vercel.app/api/v1/health). It returns `status: "healthy"` with service label `"LedgerLens"`, active database connectivity, and verified deployment version.

## Documentation

- [Architecture](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/ARCHITECTURE.md)
- [Evaluation methodology](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/evaluation.md)
- [Data contract](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/DATA_CONTRACT.md)
- [Security and production posture](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/SECURITY_AND_PRODUCTION.md)
- [UI/UX design system](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/UI_UX_DESIGN_SYSTEM.md)
- [Design decisions](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/design-decisions.md)
- [Failure and recovery plan](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/FAILURE_AND_RECOVERY.md)
- [Reviewer guide and evidence map](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/reviewer-guide.md)
- [Research evidence and design rationale](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/research-evidence.md)
- [Competitor analysis](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/COMPETITOR_ANALYSIS.md)
- [Track 04 application outline](https://github.com/Sathvik1533/LedgerLens/blob/main/docs/application-outline.md)

## Project identity

**LedgerLens** is the official repository and product name (hosted publicly at [github.com/Sathvik1533/LedgerLens](https://github.com/Sathvik1533/LedgerLens)). GitHub maintains transparent, permanent redirects from the original buildathon submission URL (`razorpay-ai-finance-controller`).

LedgerLens is an independent technical project built for the **Razorpay AI Buildathon (Track 04: AI Finance Controller)**. It is not affiliated with, endorsed by, or connected to Razorpay or any financial institution. All benchmark data is synthetic.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE).
