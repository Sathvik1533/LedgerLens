# LedgerLens Architecture & System Engineering Evidence

- **Repository**: `Sathvik1533/LedgerLens`
- **Source Commit**: `30d853d`
- **Generation Date**: 2026-10-10
- **Verification Standard**: Distinguishes strictly between Verified, Partially verified, Unverified, Planned, and Simulated components.

## Available Architecture Diagrams & Artifacts

| Diagram Title | Interactive Archify / HTML | Rendered SVG | Mermaid Source | Description & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Canonical System Architecture** | [architecture.html](./architecture.html) | [canonical-architecture.svg](./canonical-architecture.svg) | [canonical-architecture.mmd](./canonical-architecture.mmd) | End-to-end multi-tier system: React frontend, FastAPI backend, PostgreSQL ACID persistence, Groq RAG advisory boundary. |
| **Product & Data Flow** | [architecture.html](./architecture.html) | [product-data-flow.svg](./product-data-flow.svg) | [product-data-flow.mmd](./product-data-flow.mmd) | 4-source ingestion (payments, settlements, refunds, bank credits), Python Decimal parity matching, and exception routing. |
| **Reviewer Decision Sequence** | [architecture.html](./architecture.html) | [reviewer-decision-sequence.svg](./reviewer-decision-sequence.svg) | [reviewer-decision-sequence.mmd](./reviewer-decision-sequence.mmd) | Human-in-the-loop exception review lifecycle, including the **HTTP 409 Optimistic Concurrency Conflict** race condition path. |
| **Testing & Evaluation Evidence** | [architecture.html](./architecture.html) | [testing-evidence.svg](./testing-evidence.svg) | [testing-evidence.mmd](./testing-evidence.mmd) | Separate evidence map showing unit tests, CI test gate, and synthetic benchmark artifact emission. |

## Component Verification Status Matrix

* **Verified**:
  - `Deterministic Matching Engine`: Python `Decimal` with `ROUND_HALF_UP` (0 false approvals, 14 passing tests in `tests/unit/`).
  - `Synthetic Benchmark Harness`: Evaluates batches at 24,800 - 63,188 records/sec.
  - `8 Closed Exception Taxonomies`: Amount mismatch, missing credit, fee mismatch, duplicate credit, etc.
* **Partially Verified**:
  - `RAG Policy Assistant`: Chunks local SOP markdown files (`backend/app/rag/corpus/`); requires active Groq API key for runtime synthesis.
  - `Optimistic Locking`: Model includes `case.version`; tested in isolated Docker DB.
  - `Session Authentication`: PBKDF2-HMAC-SHA256 cookie auth with seeded demo credentials.
* **Unverified / Known Blockers**:
  - `Browser E2E Tests`: Playwright browser suite requires local Chromium binaries.
* **Simulated**:
  - `Demo Transaction Batches`: Built strictly from synthetic deterministic fixtures (`evaluation/generator_fixture.py`) with zero real banking PII.
