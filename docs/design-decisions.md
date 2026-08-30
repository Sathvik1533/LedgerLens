# LedgerLens Architectural Decision Records (ADRs)

This document captures the core architectural and design decisions implemented in **LedgerLens**, along with their rationale, trade-offs, and verification evidence.

---

## ADR 01: Python `Decimal` and PostgreSQL `numeric(18,2)` for Currency

- **Context**: Standard floating-point arithmetic introduces IEEE 754 precision errors (e.g., `0.1 + 0.2 != 0.3`), which is intolerable in financial reconciliation.
- **Decision**: All monetary calculations in backend Python services use the `Decimal` module with explicit `ROUND_HALF_UP` quantization to two decimal places. In PostgreSQL, all money columns use `numeric(18,2)`.
- **Consequences**:
  - *Positive*: Zero rounding drift or IEEE 754 precision loss across multi-source calculations.
  - *Trade-off*: Slightly higher CPU overhead compared to primitive 64-bit floats, negligible for batch operations.
- **Verification**: `tests/integration/test_money_scale_validation.py` and `tests/integration/test_database_constraints_postgres.py`.

---

## ADR 02: Deterministic Python Engine vs. Generative AI for Matching

- **Context**: LLMs can hallucinate calculations, introduce non-deterministic outcomes, and fail on exact numeric parity checks.
- **Decision**: All multi-source matching and anomaly detection is executed by a deterministic Python engine (`backend/app/domain/matcher.py`). Generative AI is strictly restricted to a read-only advisory role explaining flagged exceptions.
- **Consequences**:
  - *Positive*: 100% reproducible matching results with verifiable mathematical guarantees.
  - *Trade-off*: Complex custom exception logic must be coded deterministically in Python rather than prompted.
- **Verification**: `tests/e2e/test_financial_workflow_e2e.py` and `tests/evaluation/test_evaluation_benchmark_report.py`.

---

## ADR 03: Optimistic Concurrency Control (`expected_version`) for Reviews

- **Context**: Multiple finance operators reviewing high-volume queues concurrently can overwrite decisions or approvals if case updates are uncoordinated.
- **Decision**: Every case record maintains an integer `version` field. When submitting review actions, the client must supply `expected_version`. The backend executes an atomic `UPDATE ... WHERE id = :id AND version = :expected_version`. If 0 rows are updated, the backend raises `HTTP 409 Conflict`.
- **Consequences**:
  - *Positive*: Completely prevents stale-state overwrites without holding database row locks during human read time.
  - *Trade-off*: The frontend must catch HTTP 409 and provide a refresh prompt for the reviewer.
- **Verification**: `tests/integration/test_review_concurrency_race_conditions.py` (10-worker async barrier test) and `tests/integration/test_review_optimistic_locking_postgres.py`.

---

## ADR 04: Read-Only RAG Assistant with Cosine Similarity Grounding Floor

- **Context**: Operators need policy guidance on complex edge cases, but ungrounded AI can hallucinate regulatory compliance or policy rules.
- **Decision**: The investigation copilot extracts exact database rows via `SQLEvidenceTool` and retrieves policy excerpts using dense vector embeddings with a minimum grounding floor of $\ge 0.35$ cosine similarity. If the retrieved context is below threshold, `is_confident` is set to `false`.
- **Consequences**:
  - *Positive*: Policy citations are strictly anchored in local markdown policy files. The tested path does not mutate database records.
  - *Trade-off*: Cold-start model load time for embedding generation on CPU.
- **Verification**: `tests/integration/test_rag_investigation_grounding.py` and `tests/integration/test_rag_api.py`.
