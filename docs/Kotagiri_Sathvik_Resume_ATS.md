Kotagiri Sathvik | +91-99591-69851 | kotagirisathvik@gmail.com
linkedin.com/in/kotagirisathvik | github.com/Sathvik1533 | Hyderabad, Telangana

PROFESSIONAL SUMMARY
B.Tech CSE student (2024–2028, MLR Institute of Technology, CGPA 8.64) building AI backend systems with FastAPI and Python. Three deployed projects spanning RAG pipelines, agent workflows, and OCR automation. Seeking an AI Backend / GenAI internship.

TECHNICAL SKILLS
Languages: Python, Java, SQL, JavaScript
AI/GenAI: LangChain, LangGraph, RAG, FAISS, Groq API (LLaMA), prompt engineering, Pydantic structured outputs
Backend: FastAPI, SQLAlchemy, REST API design, Docker
Databases: PostgreSQL, Supabase, ChromaDB
Cloud/Tools: Git, GitHub, Render, Railway, Vercel, AWS EC2, Linux

EDUCATION
MLR Institute of Technology, Hyderabad — B.Tech CSE (2024–2028), CGPA 8.64/10
Sri Chaitanya Junior College, Hyderabad — Intermediate MPC (2022–2024), 92%

INTERNSHIP EXPERIENCE
Associate Software Engineer Intern — thaa Technologies, Hyderabad
(Jan 2026 – Mar 2026, Remote, Unpaid)
• Reviewed a production web application end-to-end from a user's perspective, identifying UI/UX defects and workflow flaws.
• Documented and reported actionable fixes directly to the founding team via calls and chat.

PROJECTS
1. AI Finance Controller — 4-Way Reconciliation Engine (FastAPI, PostgreSQL, SQLAlchemy, Docker) | GitHub | Razorpay AI Buildathon — Track 04
• Designed a fail-closed reconciliation flow where deterministic rule matching approves transactions before any LLM involvement, achieving zero false auto-matches across my evaluation batches.
• Built an ACID-compliant FastAPI and PostgreSQL backend with append-only audit trails, ensuring every matching decision traces back to raw data.
• Containerized the full stack with Docker and validated matching logic against an isolated evaluation harness.
• Benchmarked system throughput at over 48,000 records/sec on simulated transaction data, by isolating the deterministic matcher and evaluating it on 500+ seeded synthetic records.

2. VERITAS — PDF RAG Chat Application (FastAPI, FAISS, Groq LLaMA 3.3 70B, Render) | GitHub | Live Demo
• Built a RAG chatbot that answers questions from uploaded PDFs and rejects out-of-scope queries using a cosine-similarity grounding threshold (0.35) before any LLM call, reducing hallucinated answers to near zero in my test set.
• Implemented a 3-tier model fallback (70B to 8B to extractive) with exponential backoff that kept the app responding during API rate limits, validated with 13 automated test cases.
• Persisted FAISS indexes to disk for recovery across restarts and isolated sessions via header-based namespacing.

3. FinSight — GST Receipt Analyzer (Next.js, FastAPI, Groq Vision OCR, Supabase) | GitHub | Live Demo
• Built an OCR to categorization to ITC-eligibility pipeline that cut receipt processing time from minutes to under 3 seconds in my testing.
• Constrained the streaming to verified user transaction context to keep outputs deterministic and on-topic.
• Designed a 3-table Supabase PostgreSQL schema with Row Level Security, ensuring zero cross-user data leakage across my test accounts.

CERTIFICATIONS
• Google Cloud: Build Real-World AI Applications with Gemini

ACHIEVEMENTS
• 3rd Prize — Agentic AI Hackathon (team): LangChain agent and n8n integration for an AI marketing assistant.
• 3rd Prize — AWS Cloud Challenge (solo): Deployed a static site on EC2 and S3 under competition time constraints.

SOFT SKILLS
• Communication — presented project designs and explained tradeoff decisions to hackathon judges
• Problem-Solving — fixed real failures in deployed apps (API rate limits crashing the app, data lost on server restart)
• Adaptability — learned a new stack for each project (Vision OCR, vector search, reconciliation workflows)
• Willingness to Learn — self-taught AI backend stack through daily project work; currently pursuing Oracle Agentic AI course
