# Razorpay AI Finance Controller

A deterministic, 4-way financial reconciliation engine that matches payments, refunds, settlements, and bank credits with **100% precision**, backed by a fully isolated evaluation harness.

## 🚀 The Differentiator (Why we built this)
Most AI finance tools try to use LLMs (Large Language Models) to perform mathematical matching. This is extremely dangerous for real financial systems because AI hallucinates.

When reviewing competitor architectures, we noticed many rely on stateless, in-memory matching with no database persistence. To build something a senior engineer at a real bank would trust, we took a completely different approach based on traditional banking standards:

1. **Deterministic First, AI Second:** All money is matched using strict, mathematical Python logic. The AI is *strictly forbidden* from doing math. It is only used as a RAG (Retrieval-Augmented Generation) assistant to explain *why* a transaction failed based on Razorpay's official markdown policies.
2. **JPMC-Inspired Tolerance Rules:** We researched standard banking reconciliation rules (like JPMorgan Chase) to implement strict T+2 settlement windows and precise tolerance thresholds (like flagging exact penny mismatches on GST fees).
3. **True ACID Persistence:** We built a 16-table PostgreSQL schema. We do not drop data after the API responds. Every ingestion is stored in immutable `raw` tables, and every human approval is recorded in an append-only `audit_events` table.

## 📊 Live Evaluation Evidence
We built an isolated test harness (`evaluation/harness.py`) to mathematically prove our system works against 500+ seeded synthetic transactions:
* **Throughput:** ~48,368 records/sec
* **Precision (Auto-Reconciled):** 100.0%
* **False Approvals:** 0
* **Unresolved Exceptions:** 0 (All anomalies correctly flagged for human review)

## 🏗️ Architecture Stack
* **Backend Engine:** FastAPI (Python 3.11)
* **Database:** PostgreSQL (16-table relational schema)
* **ORM & Migrations:** SQLAlchemy + Alembic
* **Infrastructure:** Fully containerized via Docker
* **AI Integration:** Groq (LLaMA 3.3) for Bounded Policy RAG

## ⚙️ How to Run Locally

You need Docker installed on your machine.

**1. Start the Database & API**
```bash
docker compose up -d --build
```

**2. Run the Database Migrations**
```bash
docker compose exec api alembic upgrade head
```

**3. Run the Evaluation Harness**
Prove the math works on your own machine:
```bash
docker compose exec api python evaluation/harness.py
```

## 📝 Roadmap
- [x] Data Foundation (Schema & Migrations)
- [x] Deterministic Reconciliation Engine
- [x] Bounded AI Policy RAG
- [x] Isolated Evaluation Harness
- [ ] Frontend Command Center (React/Next.js) - *In Progress*
