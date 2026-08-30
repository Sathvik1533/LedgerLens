<div align="center">
  <img src="docs/assets/ledgerlens-logo.svg" alt="LedgerLens Mark" width="56" height="56" />
  <h1>LedgerLens</h1>
  <p><strong>Financial Reconciliation Control Room</strong></p>
  <p>Four financial sources. Deterministic matching. Human-reviewed exceptions.</p>

  [![CI Test Gate](https://github.com/Sathvik1533/razorpay-ai-finance-controller/actions/workflows/ci-tests.yml/badge.svg)](https://github.com/Sathvik1533/razorpay-ai-finance-controller/actions)
  ![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
  ![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
  ![React 18 + TS](https://img.shields.io/badge/React%2018-TypeScript-61DAFB?logo=react&logoColor=black)
  ![License MIT](https://img.shields.io/badge/License-MIT-green.svg)

  <br />
  <img src="docs/assets/ledgerlens-social-preview.svg" alt="LedgerLens Overview" width="100%" />
</div>

---

## 1. Problem

Financial reconciliation breaks down when customer payments, payment gateway reports, refund records, and bank statements disagree. Common issues include unexpected fees, partial refunds, missing settlement batches, and unlinked bank credits.

Many modern AI tools attempt to match transactions by feeding raw numbers into Large Language Models. This approach is risky because language models can make arithmetic mistakes and invent plausible-sounding values.

---

## 2. What LedgerLens Does

The LedgerLens mark represents four financial data sources converging through an inspection point into a traceable reconciliation outcome. It is a visual metaphor for the system’s role; it does not represent an automated approval.

LedgerLens keeps financial matching strictly rule-based while using AI only to help humans understand flagged issues:

- **Four-Source Matching**: Ingests and compares payments, settlements, refunds, and bank credits.
- **Accurate Money Handling**: Money is handled to exactly two decimal places using Python `Decimal` and PostgreSQL `numeric(18,2)`, avoiding floating-point rounding errors.
- **Original + Clean Storage**: Retains original uploaded data alongside validated, structured records across 13 application tables.
- **Human-in-the-Loop Review**: Discrepancies are routed to an operations dashboard where human reviewers investigate line items and make the final call.
- **AI Investigation Tool**: When a case is flagged, an AI assistant reads the transaction facts and relevant policy notes to explain the root cause with source citations.
- **Collision Protection**: If two reviewers open the same case, only the first submitted decision is saved; the second reviewer is prompted to refresh before deciding.
- **Audit History**: Every approved, rejected, or unresolved decision is saved with reviewer identity, timestamp, and notes.

---

## 3. How It Works

```mermaid
flowchart TD
    subgraph INGEST["1. Ingestion"]
        CSV["Payments, Settlements, Refunds, Bank Credits"] --> API["FastAPI Endpoints"]
        API --> RAW[("Retained Raw Records")]
        API --> NORM[("Validated Domain Records")]
    end

    subgraph MATCH["2. Rule-Based Engine"]
        NORM --> MATCHER["Matching Engine (Python Decimal)"]
        MATCHER --> AUTO["Matched Records (Parity Matches)"]
        MATCHER --> CASES[("Flagged Cases (Needs Review)")]
    end

    subgraph REVIEW["3. Operations Review"]
        CASES --> UI["React Review Dashboard"]
        UI --> DECISION["Review Decision (Approve / Reject)"]
        DECISION --> AUDIT[("Persisted Audit Events")]
    end

    subgraph AI["4. Advisory AI Assistant"]
        CASES --> RAG["AI Policy Copilot"]
        RAG --> CITATIONS["Explanations + Policy Citations"]
        CITATIONS -.-> UI
    end

    classDef db fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    class RAW,NORM,CASES,AUDIT db;
```
<sub>View the editable diagram source: [`docs/assets/architecture-overview.mmd`](docs/assets/architecture-overview.mmd)</sub>

---

## 4. Built for Safe Review

| Responsibility | Handled By | Why |
|---|---|---|
| **Math & Matching** | Python `Decimal` & PostgreSQL | Ensures exact calculations with no AI hallucination risk |
| **Data Retention** | PostgreSQL raw JSONB + typed tables | Keeps original input safe while powering clean queries |
| **Review Decisions** | Human operators via React UI | Maintains accountability for all financial status changes |
| **Concurrent Reviews** | Case versioning (`expected_version`) | Prevents reviewers from accidentally overwriting each other |
| **Case Explanations** | Read-only AI with policy search | Helps operators understand why an anomaly happened faster |
| **Decision History** | Audit events table | Tracks who decided what, when, and why |

```mermaid
sequenceDiagram
    autonumber
    actor Reviewer as Finance Operator
    participant UI as React Control Room
    participant API as FastAPI Backend
    participant DB as PostgreSQL Database
    participant RAG as Grounded Policy Assistant

    Reviewer->>UI: Select Case (#pay_synth_001)
    UI->>API: GET /api/v1/review/cases/{case_id}
    API->>DB: Fetch case facts, version, and multi-source records
    DB-->>API: Return evidence (version = 1)
    API-->>UI: Render 3-Source Comparison Grid

    opt Advisory RAG Investigation
        Reviewer->>UI: Open "AI Copilot" Tab
        UI->>API: POST /api/v1/rag/investigate/{case_id}
        API->>RAG: Synthesize DB facts + Policy Citations
        RAG-->>UI: Return Summary, Root Cause & Quotes (Read-Only)
    end

    Reviewer->>UI: Submit Review Decision (Approve/Reject + Actor Stamp)
    UI->>API: POST /api/v1/review/cases/{case_id}/review (expected_version = 1)
    alt Version Matches (version == 1)
        API->>DB: Atomic UPDATE version=2, status=new_status
        API->>DB: INSERT INTO audit_events
        DB-->>API: Commit Transaction
        API-->>UI: HTTP 200 OK (Updated State)
        UI-->>Reviewer: Render Case Closed & Append Audit Event
    else Stale Version / Concurrent Update
        DB-->>API: ConcurrentUpdateError
        API-->>UI: HTTP 409 Conflict
        UI-->>Reviewer: Display Collision Banner + Refresh Prompt
    end
```
<sub>View the editable diagram source: [`docs/assets/review-workflow.mmd`](docs/assets/review-workflow.mmd)</sub>

---

## 5. Evidence It Works

We test the system against a reproducible 60-record multi-source synthetic evaluation dataset (seed `42`):

| Metric | Target | Result | Status |
|---|---|---|---|
| **Clean Auto-Reconciliation** | 70.0% (42 / 60) | **70.00%** | Matched correctly |
| **Auto-Reconcile Precision** | 100.0% | **100.00%** | 0 false approvals |
| **Auto-Reconcile Recall** | 100.0% | **100.00%** | 0 missed clean matches |
| **Exception Isolation** | 18 anomalies flagged | **18 / 18 Flagged** | All anomalies caught |
| **Input Validation** | 1 malformed row rejected | **1 Rejected (60/61)** | Invalid format blocked |

Version-controlled benchmark outputs:
- JSON Report: [`artifacts/evaluation/reconciliation_benchmark_report.json`](artifacts/evaluation/reconciliation_benchmark_report.json)
- Metrics CSV: [`artifacts/evaluation/reconciliation_metrics_summary.csv`](artifacts/evaluation/reconciliation_metrics_summary.csv)

---

## 6. Try It Locally

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ and npm

### 1. Start Backend API & Database
```bash
make up
docker compose exec api alembic upgrade head
```
Interactive API docs will be at `http://localhost:8000/docs`.

### 2. Start Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
The UI starts at `http://localhost:5173`.

### 3. Run Full Automated Test Suite
```bash
make test-ci
```
Spins up an isolated PostgreSQL test container on port 5433, runs all 40 tests, and cleans up.

---

## 7. Follow the Code

| Area | What It Does | Key Code |
|---|---|---|
| **Upload and validation** | Accepts and validates CSV files | [`backend/app/services/ingestion_service.py`](backend/app/services/ingestion_service.py) |
| **Matching rules** | Compares the four financial sources | [`backend/app/domain/matcher.py`](backend/app/domain/matcher.py) |
| **Money calculation** | Calculates fee, tax, and expected net settlement | [`backend/app/domain/settlement_calc.py`](backend/app/domain/settlement_calc.py) |
| **Case persistence** | Stores review cases and candidate matches | [`backend/app/repositories/reconciliation_repo.py`](backend/app/repositories/reconciliation_repo.py) |
| **Review safety** | Rejects stale review decisions (HTTP 409) | [`backend/app/repositories/review_repo.py`](backend/app/repositories/review_repo.py) |
| **AI investigation** | Reads evidence and local policy notes | [`backend/app/rag/assistant.py`](backend/app/rag/assistant.py) |
| **Workflow test** | Proves upload → match → review → audit loop | [`tests/e2e/test_financial_workflow_e2e.py`](tests/e2e/test_financial_workflow_e2e.py) |

---

## 8. Deeper Documentation

For reviewers and engineers who want deeper technical details:

- [Architecture Reference](docs/ARCHITECTURE.md): Database schema (13 tables), ingestion pipelines, and RAG grounding design.
- [Architectural Decision Records (ADRs)](docs/design-decisions.md): Trade-offs behind Decimal math, optimistic locking, and read-only AI.
- [Evaluation Methodology](docs/evaluation.md): Deep-dive into dataset generation, anomaly distributions, and benchmark metrics.
- [Demo Walkthrough Script](docs/demo-script.md): 5-minute technical pitch and demonstration guide.

---

## 9. Known Limitations

- **Batch CSV Only**: Processes batch CSV uploads; real-time Kafka or banking webhook streams are not implemented.
- **Advisory AI**: The AI assistant explains discrepancies with policy citations; it cannot approve cases or initiate money transfers.
- **Single-Tenant**: Designed as an internal operations dashboard for single-team reconciliation.

---

## 10. Project Context & License

LedgerLens is a student-built technical project. It is not affiliated with, endorsed by, or connected to Razorpay or any financial institution.

Distributed under the MIT License. See `LICENSE` for details.
