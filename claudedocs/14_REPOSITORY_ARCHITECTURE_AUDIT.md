# Repository Architecture Audit

## 1. Current State
- **Branch:** `ui/control-room-v2`
- **Working Tree:** Fully synchronized (Typography revert to Inter + static claims fixed).

## 2. Frameworks & Dependencies
- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Lenis.
- **Backend:** FastAPI 0.115+, Python 3.11+, SQLAlchemy, asyncpg.
- **Database:** PostgreSQL 16 + pgvector.

## 3. Frontend Routes
All verified via exhaustive Playwright E2E and direct URL refreshes yielding HTTP 200:
- `/` 
- `/how-it-works` 
- `/evidence` 
- `/evaluation` 
- `/docs` 
- `/about` 
- `/app/queue` 
- `/app/dashboard` 
- `/app/case/:caseId` 
- `/app/ingestion` 
- `/app/audit` 
- `/app/policies` 
- `/app/settings` 

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

## 5. Mismatches & Dead Routes
- None. TS compile errors in `AuditLogPage` were actively resolved prior to final E2E test.
