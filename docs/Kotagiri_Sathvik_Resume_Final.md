# Kotagiri Sathvik
**+91-99591-69851** | **kotagirisathvik@gmail.com** | **[linkedin.com/in/kotagirisathvik](https://linkedin.com/in/kotagirisathvik)** | **[github.com/Sathvik1533](https://github.com/Sathvik1533)**

B.Tech CSE student (2024–2028) building production-grade AI backend systems and deterministic agent pipelines. Experience architecting grounded RAG engines with sub-millisecond retrieval (FAISS), multimodal OCR pipelines, and multi-source financial reconciliation workflows. Proficient in FastAPI, Python, PostgreSQL, and LLM guardrails. Seeking AI Backend / GenAI internships.

---

## Education

**MLR Institute of Technology** — Hyderabad, Telangana  
*B.Tech in Computer Science Engineering* | **CGPA: 8.64 / 10** | Sep 2024 – 2028  

**Sri Chaitanya Junior College** — Hyderabad, Telangana  
*Intermediate (MPC)* | **92%** | 2022 – 2024  

---

## Projects

**AI Finance Controller** *(Flagship Project)* | FastAPI · PostgreSQL · SQLAlchemy · Python · Next.js · Docker  
*[GitHub](https://github.com/Sathvik1533/razorpay-ai-finance-controller)* | *Razorpay AI Buildathon (Track 04: AI Finance Controller)*  
- Architected an automated 4-way finance reconciliation engine that processed simulated transactional batches at over 45,000 records/sec with 100% precision, by designing an ACID-compliant FastAPI and PostgreSQL backend.
- Delivered a safe, "fail-closed" financial system that eliminated false transaction approvals (0 false auto-matches), by enforcing strict deterministic math rules before delegating to an AI assistant for policy explanations.
- Ensured enterprise-grade auditability by implementing raw-data retention schemas and append-only audit trails, verified against an isolated evaluation harness and fully containerized via Docker.

**VERITAS (pdf-rag-chat)** | FastAPI · FAISS · Groq LLaMA 3.3 70B · Python 3.11 · Render  
*[GitHub](https://github.com/Sathvik1533/pdf-rag-chat)* | *[Live Demo](https://pdf-rag-chat-nylf.onrender.com)*  
- Engineered an industrial-grade RAG platform with a mathematical cosine similarity grounding floor (0.35 threshold) that rejects out-of-scope queries with zero LLM token consumption, eliminating hallucinations.  
- Implemented disk-serialized FAISS vector persistence across container restarts (cold-start recovery in <6ms) with per-session multi-tenant isolation via `X-Session-ID` header namespacing.  
- Built a 3-tier LLM circuit breaker (`llama-3.3-70b` → `llama-3.1-8b` → extractive fallback) with exponential backoff and sliding-window rate limiting (20–45 req/min); verified with 13/13 automated test suites.  

**FinSight** | Next.js 14 · FastAPI · Groq Vision OCR · Supabase · Vercel · Railway  
*[GitHub](https://github.com/Sathvik1533/Finsight-New)* | *[Live Demo](https://finsight-new.vercel.app)*  
- Reduced GST claim processing time from 5–10 minutes (manual) to under 3 seconds by shipping an end-to-end receipt OCR → LLM categorization → ITC eligibility verdict pipeline to production.  
- Eliminated off-topic AI drift by constraining the Groq streaming assistant to verified user financial transaction context, guaranteeing deterministic output across 100% of user queries.  
- Secured financial data isolation by architecting a 3-table Supabase PostgreSQL schema with Row Level Security (RLS) policies, confirming zero cross-user data leakage across multi-tenant test suites.  

---

## Technical Skills

- **Languages:** Python (primary), Java, JavaScript, SQL
- **AI & GenAI:** LangGraph, LangChain, LlamaIndex, Groq LLM, Groq Vision OCR, Guardrails AI, FAISS, Dense Vector Retrieval, Structured Prompt Engineering (Pydantic / JSON Schema), LangSmith
- **Backend & APIs:** FastAPI, Pydantic, SQLAlchemy, REST API Design, Async Workflows, APScheduler, Redis Streams
- **Databases:** PostgreSQL, Supabase (RLS, Storage, Auth), ChromaDB, Upstash Redis
- **Cloud & DevOps:** Vercel, Render, Railway, AWS EC2, AWS S3, Docker, Git, GitHub, Linux CLI

---

## Achievements & Certifications

- **3rd Prize — Agentic AI Hackathon (Team):** Designed n8n automation workflow and agent orchestration layer for AI-powered marketing assistant using LangChain.  
- **3rd Prize — AWS Cloud Challenge (Solo):** Deployed production-style static site on EC2 + S3 under competition time constraints.  
- **Google Cloud:** Build Real-World AI Applications with Gemini — badge verified.  
