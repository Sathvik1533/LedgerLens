# Real Evidence and Data Provenance Audit

## 1. Traceability Map

| Claim / Value | Source / Classification | Verified? |
|---|---|---|
| Queue Count (e.g. 91) | API: `GET /review/queue` | YES |
| Total Amount at Risk | API: `GET /reconciliation/stats` | YES |
| Total Cases (310) | API: `GET /reconciliation/stats` | YES |
| Auto-Reconciled (211) | API: `GET /reconciliation/stats` | YES |
| Unresolved Cases (8) | API: `GET /reconciliation/stats` | YES |
| Case Versions | API: `GET /review/cases/{id}` | YES |
| Audit Timeline | API: `GET /review/audit/all` | YES |
| Reviewer Identity | User Input -> POST `/review/cases/{id}/review` | YES |
| RAG Confidence | API: `POST /rag/investigate/{id}` | YES |
| 4 Feeds Live | Static UI Copy (`SettingsPage.tsx`) | N/A (Copy) |
| PostgreSQL 16 | Static UI Copy (`SettingsPage.tsx`) | N/A (Copy) |
| 2% Fee / 18% GST | Static UI Config (`SettingsPage.tsx`) | N/A (Config) |

## 2. Hardcoded Business Rule Explanations
- **Severity Threshold:** The system assigns 'Critical' and 'High' not purely by amount, but via a documented business rule mapped in the frontend `getSeverity(item)` function. `amount_mismatch` and `missing_bank_credit` are hardcoded to Critical. This is a permitted UI presentation rule.
- **Cosine Floor >= 0.35:** This is the default `useState` configuration value on the Settings page, simulating the `pgvector` threshold. 

## 3. Evidence Handling (Missing Data)
- If a case is missing settlement evidence, the backend explicitly returns `settlement: null`. The frontend `<CasePage>` evaluates `!caseData.settlement` and renders a truthful "Missing Record" placeholder, completely avoiding hallucinated data representation.
