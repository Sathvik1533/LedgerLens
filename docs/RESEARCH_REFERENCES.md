# 🏛️ Research Foundation: J.P. Morgan AI Synthetic Data & Financial Agent Methodology

**Document Title:** Institutional Financial AI Architecture & Synthetic Data Grounding  
**Authoritative Reference:** [J.P. Morgan Chase AI Research — Synthetic Data & Financial Systems](https://www.jpmorganchase.com/about/technology/research/ai/synthetic-data)  
**Project Application:** `Sathvik1533/LedgerLens`  
**Status:** Integrated into Gate 1 Data Foundation & Gate 5 RAG Architecture  

---

## 1. Executive Summary of J.P. Morgan AI Research

In quantitative banking and institutional fintech, **J.P. Morgan AI Research** establishes the gold standard for applying artificial intelligence, synthetic transaction modeling, and autonomous agent workflows to high-stakes financial operations (payments, clearing, market simulation, and treasury).

Key published frameworks from J.P. Morgan AI Research:
1. **Synthetic Data for Financial Scarcity & Privacy (FedSyn / Simulators):** Generating high-fidelity behavioral and transactional traces that preserve complex cross-table relational invariants while guaranteeing zero leakage of customer PII.
2. **TS-Agent (Financial Time-Series & Statistical Tool Delegation):** A framework demonstrating that Large Language Models (LLMs) should **never** perform direct numeric or time-series calculations. Instead, the LLM delegates statistical and structural extraction to deterministic code and focuses strictly on high-level reasoning and policy synthesis.
3. **"Ask David" & Supervisor Agent Workflows:** Orchestrating multi-agent systems where specialized agents execute deterministic SQL queries over structured data, while vector RAG analyzes unstructured policy documentation with strict human oversight.

---

## 2. Key Takeaways & Direct Implementation in Our Project

Below is the exact mapping between J.P. Morgan's published research principles and how we engineered them into the **Razorpay AI Finance Controller**:

| J.P. Morgan AI Research Principle | Institutional Financial Problem | How We Implemented It in Our Project | Verified Code Artifact |
|---|---|---|---|
| **1. Cross-Table Relational Invariants** | Naive synthetic generators create isolated rows with random numbers that violate double-entry bookkeeping. | `data/generator.py` uses deterministic seed-based graph generation to preserve exact relational invariants ($T+2$ settlement timestamps, fee deductions, net bank credits) across 4 relational tables. | `data/generator.py`, `data/synthetic/*.csv` |
| **2. Controlled Anomaly & Edge-Case Injection** | Real-world payment gateways experience rare but severe operational failures that clean datasets miss. | We implemented an exact statistical distribution: **70% clean happy-path** vs **30% injected anomalies** across **8 mandatory exception classes** (fee variance, settlement delays, missing credits, duplicate payments). | `data/generator.py` lines 40–180 |
| **3. Deterministic Arithmetic Delegation (TS-Agent Principle)** | LLMs suffer from floating-point representation errors and arithmetic hallucinations on multi-step financial math. | Zero LLM math. All monetary calculations (`gross - fee - tax = net`) are delegated to Python `Decimal` and PostgreSQL `NUMERIC(18,2)` with `ROUND_HALF_UP` quantization (`0.01`). | `backend/app/domain/settlement_calc.py` |
| **4. Hybrid Structured SQL + Unstructured Policy RAG ("Ask David" Principle)** | Pure RAG over unstructured PDFs hallucinates transaction figures; pure SQL cannot explain complex corporate policy variances. | Hybrid Investigation Architecture: SQL is authoritative for transaction evidence; Vector RAG is contextual for versioned policy documents. | `docs/ARCHITECTURE.md`, `backend/app/rag/` |
| **5. Isolated Evaluation & Non-Contaminated Benchmarking** | Benchmarks are invalid if generative models or test runners access ground truth labels in application context. | `evaluator.ground_truth` table is physically isolated in a separate PostgreSQL schema with application user access revoked. | `migrations/20260825000000_gate1_initial_schema.sql` |
| **6. Human-in-the-Loop Supervisory Boundaries** | High-stakes financial operations require deterministic review boundaries before any ledger mutation. | Low-confidence and ambiguous exceptions route to an Amount-at-Risk prioritized review queue with append-only audit tracking (`audit_events`). | `migrations/20260825000000_gate1_initial_schema.sql` |

---

## 3. How to Explain This in an Interview or Pitch

When an interviewer or buildathon judge asks: **"How did you generate your dataset and design your AI boundary?"**

You can explain:
> *"We grounded our data architecture in J.P. Morgan AI Research's published methodology for financial synthetic data and agentic systems. Following their TS-Agent and FedSyn principles:*
> 1. *We generated a 500-record, multi-table dataset that strictly maintains relational invariants across payments, gateway settlements, and bank feeds with an exact 70/30 clean-to-anomaly distribution.*
> 2. *We enforced a strict separation of concerns: 100% of the financial arithmetic and matching is delegated to a deterministic Python Decimal core, while the LLM is restricted to a supervisory investigation role using Hybrid SQL + Policy Vector RAG with mathematical citation guardrails.*
> 3. *Our ground truth is physically schema-isolated in PostgreSQL, guaranteeing zero data leakage during automated accuracy and throughput evaluations."*
