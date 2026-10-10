# LedgerLens Interview Guide

## 1. Problem and user
LedgerLens solves the problem of automated financial reconciliation. Finance teams often have multiple records for a single transaction (payment gateway, settlement file, refunds, bank statements). Manually finding discrepancies is slow and error-prone. The user is a Finance Controller who needs an automated engine to isolate mismatches and provide evidence for human review.

## 2. Complete user journey
1. The system ingests a batch of transaction records (Payment, Settlement, Refund, Bank Credit).
2. The deterministic matching engine attempts to auto-reconcile the batch based on exact arithmetic.
3. Successfully matched records bypass human review. Discrepancies (e.g., amount mismatch, missing bank credit) are flagged as exceptions.
4. The Finance Controller logs into the React web dashboard (`/app/queue`).
5. The controller reviews exceptions ranked by "Amount at Risk".
6. In the Case Dossier, the controller views side-by-side evidence and a grounded AI policy explanation.
7. The controller decides to Approve, Reject, or Escalate, recording a rationale.
8. The decision is appended to an immutable audit trail.

## 3. Architecture and request flow
- **Frontend**: React 18, TypeScript, Vite.
- **Backend**: FastAPI (`backend/app/api/v1/`).
- **Database**: PostgreSQL 15, accessed via SQLAlchemy models (`backend/app/models/`).
- **Matching Engine**: Deterministic `matcher.py` runs Python `Decimal` math.
- **AI RAG**: `rag/corpus/` policy files are embedded. Groq LLM explains SOPs based on exact retrieved policy.
- **Request Flow**: Client -> FastAPI Endpoints -> Services -> PostgreSQL -> (If RAG needed) -> Vector Retrieval -> LLM -> Response.

## 4. Technology choices and trade-offs
- **PostgreSQL**: Chosen for ACID compliance, essential for financial data.
- **Python Decimal**: Chosen to prevent floating-point precision errors in financial calculations.
- **FastAPI**: Chosen for rapid development, async support, and type safety with Pydantic.
- **React**: Chosen for building a responsive, interactive review dashboard.
- **Synthetic Data**: Used for benchmarking to avoid exposing real PII or financial data. Trade-off: might not capture all real-world edge cases.

## 5. Data flow
1. Synthetic data is generated via `evaluation/generator_fixture.py`.
2. Data is inserted into PostgreSQL.
3. `matcher.py` reads data, calculates expected fees/taxes, and links corresponding records by UTR/payment ID.
4. Discrepancies are persisted as `FinancialException` records.
5. Frontend fetches exceptions via `/api/v1/review/queue`.
6. Review decisions update exception status via optimistic concurrency control (version increments).

## 6. Deterministic vs AI behavior
- **Deterministic**: The matching engine, fee calculations (rounding to 2 decimal places with `ROUND_HALF_UP`), threshold checks, and exception classification are strictly deterministic.
- **AI Behavior**: The AI is a read-only advisor. It retrieves markdown policies from `rag/corpus/` (e.g., `fee_policy.md`) to explain *why* an exception occurred according to the company SOP. It does NOT alter ledger amounts or approve cases.

## 7. Authentication, authorization, and security
- **Mechanism**: Session cookies (`ledgerlens_session`) map to mock user roles (Reviewer, Admin).
- **Security**: Optimistic locking (`case.version`) prevents concurrent modifications (HTTP 409).
- **Weaknesses**: The demo login uses a partially predictable password (`DemoPass_{role}_2026!`). CSRF middleware allows `*.vercel.app` origins, which means any Vercel-hosted app could theoretically spoof requests if it obtained a valid session. `SECRET_KEY` is now required in production, preventing token forging.

## 8. Tests and exact coverage
- `tests/unit/test_domain_math.py`: Tests penny-exact `quantize_money` Decimal math (Verified).
- `tests/unit/test_matcher.py`: Tests reconciliation of the synthetic batch (Verified).
- `tests/unit/test_evaluation_harness.py`: Validates benchmark throughput and invariants like 0 false approvals (Verified).
- `tests/e2e/test_browser_*.py`: These are not currently browser-verified as Chromium binaries are not guaranteed in this environment.
- Overall unit test suite: 14 passing tests locally.

## 9. Failure handling
- **Concurrency Conflicts**: If two reviewers edit the same case, PostgreSQL version checking rejects the second save with HTTP 409.
- **RAG/LLM Failure**: Falls back to deterministic mismatch text without AI enrichment.
- **Database Down**: Health check endpoint reflects failure.

## 10. Personal contribution
- Built the deterministic `Decimal` matching engine and synthetic benchmark generator.
- Implemented the RAG policy retrieval mechanism to ground AI explanations.
- Structured the React frontend and integrated optimistic concurrency.

## 11. One real bug and fix
- **Bug**: `SECRET_KEY` defaulted to an empty string in `config.py` if the environment variable was missing, meaning sessions could be forged easily.
- **Fix**: Added a startup check in `config.py` that raises a `ValueError` if `SECRET_KEY` is empty outside of the "test" environment.

## 12. Current limitations
- The rate limiter (`PrototypeRateLimiter`) uses in-memory single-process tracking, which resets on restarts and doesn't sync across multi-worker deployments.
- E2E browser tests require manual Playwright/Chromium setup.
- Authentication relies on demo hardcoded credentials.

## 13. 2–5 minute demo script
1. "Welcome to LedgerLens, an AI Finance Controller prototype. Let's run a batch of 60 transactions."
2. Run `python evaluation/run_benchmark.py --size 60 --seed 42` and show the output: ~60,000 records/sec throughput, 70% auto-matched, 0 false approvals.
3. "Now let's log in to the dashboard as a Demo Reviewer. We see 18 cases in our queue."
4. "I'll open the highest 'Amount at Risk' case. Here's the multi-source dossier: Payment, Settlement, Bank Credit."
5. "Notice the AI Copilot on the right. It doesn't guess—it cites the exact `fee_policy.md` to explain why the settlement amount is short."
6. "I will click 'Reject' and save. The system uses optimistic locking, so if another controller just edited this, my request would be blocked."
7. "Finally, let's view the Audit Trail to see my decision permanently recorded."
