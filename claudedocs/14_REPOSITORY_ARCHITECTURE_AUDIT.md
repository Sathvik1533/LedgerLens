# Repository Architecture Audit

## 1. Current State
- **Branch:** `ui/control-room-v2`
- **Working Tree:** Clean.

## 2. Frameworks & Dependencies
- **Frontend Framework:** React 18, Vite, TailwindCSS, Framer Motion, Lenis (Smooth Scroll).
- **Backend Framework:** FastAPI 0.115+, Python 3.11+.
- **Database:** PostgreSQL 16 with `pgvector` extension.

## 3. Frontend Routes (All Verified via Playwright Navigation)
- `/` - Marketing Landing Page (Status 200, 0 Errors)
- `/how-it-works` - Narrative Mechanism Page (Status 200, 0 Errors)
- `/evidence` - Marketing Proof Page (Status 200, 0 Errors)
- `/evaluation` - Evaluation Summary (Status 200, 0 Errors)
- `/docs` - Documentation/API (Status 200, 0 Errors)
- `/about` - Project Narrative (Status 200, 0 Errors)
- `/app/queue` - Review Queue Dashboard (Status 200, 0 Errors)
- `/app/dashboard` - Real-time Telemetry Dashboard (Status 200, 0 Errors)
- `/app/case/:caseId` - Case Investigation Workspace (Tested via DOM)
- `/app/ingestion` - Data Upload Pipeline (Status 200, 0 Errors)
- `/app/audit` - Immutable Audit Trail (Status 200, 0 Errors. TS Null-check bug explicitly fixed and verified).
- `/app/policies` - RAG Knowledge Base (Status 200, 0 Errors)
- `/app/settings` - Configuration (Status 200, 0 Errors)

## 4. Backend Endpoints Consumed
- `GET /api/v1/review/queue`
- `GET /api/v1/review/cases/{id}`
- `POST /api/v1/review/cases/{id}/review`
- `GET /api/v1/review/audit/all`
- `GET /api/v1/reconciliation/stats`
- `POST /api/v1/reconciliation/run`
- `GET /api/v1/ingestion/status`
- `POST /api/v1/ingestion/{feed_type}`
- `POST /api/v1/rag/investigate/{id}`
- `GET /api/v1/rag/policies`
- `POST /api/v1/rag/query`

## 5. Database Models
- `payments`, `settlements`, `refunds`, `bank_credits`, `reconciliation_results`, `review_cases`, `review_actions` (Audit events), `ingestion_batches`, `policy_documents`.
- **Optimistic Locking:** Embedded as `version` in `review_cases`.

## 6. Hardcoded / Mocked Data Locations
- **NO OPERATIONAL DATA IS HARDCODED.**
- Previous hardcoded fallback arrays in `AuditLogPage.tsx` have been purged.
- The `SettingsPage.tsx` uses static UI configuration constants to represent the system state.

## 7. Type Mismatches & Dead Routes
- **None found**. All navigation elements reach valid components.
- Types in `types/api.ts` correctly map to Pydantic outputs.
