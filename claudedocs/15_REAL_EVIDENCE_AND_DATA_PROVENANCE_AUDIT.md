# Real Evidence and Data Provenance Audit

## 1. Value Classification

| Claim | Source/Classification | Verified |
|---|---|---|
| Queue Counts (e.g. 91) | API Value (`/review/queue`) | YES |
| Case IDs/Versions | API Value (`/review/cases/{id}`) | YES |
| RAG Confidence/Cosine | API Value (`/rag/investigate/{id}`) | YES |
| Reviewer Identity | User Input -> API Request Payload | YES |
| "4 feeds live" | Static Config (Relabeled as 'Configured Supported Feeds') | YES |
| "PostgreSQL 16" | Static Config (Relabeled as 'Configured Target DB') | YES |
| Severity > ₹500 | Business Rule (Hardcoded `getSeverity` via anomaly type, not purely float amount) | YES |
| Fee 2% / GST 18% | Configuration (`useState` Defaults in Settings) | YES |

## 2. Evidence Realism
- The `/evaluation` marketing page previously held hallucinatory startup claims (e.g., "> 1,000 rps", "100% precision").
- These were actively stripped and replaced with structurally honest claims: "O(N) Complexity", "Penny-Exact Math", and "Strict Float-Free".

## 3. Strict Absence of Mocks
- No unverified fallbacks exist for critical financial state.
- If data is missing (e.g., `settlement_event: null`), the application explicitly renders an empty `Missing Record` block rather than inferring data or hallucinating a JSON payload.
