# LedgerLens — UI Component Inventory & Architectural Blueprint

```text
inventory_version: 1.0.0
applies_to: frontend/src/**
framework: React 18.3 + TypeScript 5.5 + Tailwind CSS 3.4 + Vite 5.4
routing_model: React Router DOM v6 (Nested Dual-Layer Routing)
last_updated: 2026-08-31
```

---

## 1. Directory & File Structure

```text
frontend/src/
├── App.tsx                               # Master Router & Route Hierarchy
├── index.css                             # Global styles, Tailwind base, and focus utilities
├── main.tsx                              # React DOM root mounting
│
├── layouts/                              # Architectural Shells
│   ├── MarketingLayout.tsx               # Public layer top navbar + footer layout
│   └── AppLayout.tsx                     # 260px Left Sidebar financial terminal layout
│
├── pages/
│   ├── marketing/                        # Public Story & Technical Proof Layer
│   │   ├── LandingPage.tsx               # / (Problem -> 4-Source Promise -> Terminal Screenshot)
│   │   ├── HowItWorksPage.tsx            # /how-it-works (6-Step Operator Journey)
│   │   ├── EvidencePage.tsx              # /evidence (4-Source Parity, CAS, Grounded AI)
│   │   ├── EvaluationPage.tsx            # /evaluation (Throughput >1000 rps, 100% Precision)
│   │   ├── DocsPage.tsx                  # /docs (API Schemas & SOP Markdown Archive)
│   │   └── AboutPage.tsx                 # /about (The LedgerLens Operations Manifesto)
│   │
│   ├── app/                              # Authenticated Control Room Surfaces
│   │   ├── QueuePage.tsx                 # /app/queue (4-column Exception Control Room Table)
│   │   └── CasePage.tsx                  # /app/case/:caseId (3-column Case Investigation Terminal)
│   │
│   ├── DashboardPage.tsx                 # /app/dashboard (Recon Command Center & Parity Metrics)
│   ├── IngestionFeedsPage.tsx            # /app/ingestion (CSV Drag-and-Drop & Multi-Source Feeds)
│   ├── AuditLogPage.tsx                  # /app/audit (Immutable Cryptographic Compliance Ledger)
│   ├── PolicyKnowledgePage.tsx           # /app/policies (Vector Search Policy Explorer)
│   └── SettingsPage.tsx                  # /app/settings (Fee Formulas, Invariants & CAS Settings)
│
└── components/                           # Reusable UI & Domain Components
    ├── ReviewActionForm.tsx              # Human Decision Panel with Atomic CAS & HTTP 409 Banner
    ├── MultiSourceCard.tsx               # Side-by-side Payment, Settlement, and Bank Statement Cards
    ├── RagCopilotPanel.tsx               # Read-Only Policy Advisory Drawer with pgvector Citations
    ├── CitationCard.tsx                  # Contractual SOP Citation with similarity score
    ├── AuditTimeline.tsx                 # Chronological Audit Event Timeline
    ├── AmountDisplay.tsx                 # Tabular Monospace Currency (`₹`) Renderer
    ├── ExceptionBadge.tsx                # Semantic Status Badges for the 8 Exception Categories
    ├── StatusBadge.tsx                   # Lifecycle Status Badges (`needs_review`, `resolved`, etc.)
    ├── EmptyState.tsx                    # Operations-grade Empty and Filtered State Handlers
    ├── SkeletonLoaders.tsx               # Layout-Matched Pulsing Loading Skeletons
    └── ConfidenceIndicator.tsx           # Grounding Confidence Badge (`Cosine ≥ 0.35`)
```

---

## 2. Component Responsibilities & Contract Mappings

| Component | What It Renders | Consumed Data & Context | User Interactions Handled |
| :--- | :--- | :--- | :--- |
| **`AppLayout.tsx`** | 260px persistent dark left sidebar, top header with live context breadcrumbs (`Context: 4 Deterministic Feeds`), live parity badge (`● Parity Live`), and operator identity footer (`finance_ops_reviewer`). | Current URL path (`useLocation`), `GET /api/v1/review/queue` (for live backlog badge count). | - Click nav items to switch routes.<br>- `[Run Reconciliation]` button triggers `POST /api/v1/reconciliation/run` with spinner & toast notice. |
| **`MarketingLayout.tsx`** | Fixed top navigation bar with brand mark, story links (`How it works`, `Evidence`, `Evaluation`, `Docs`, `About`), `Open App` CTA, and monospace footer. | Current URL path (`useLocation`). | Navigates between public technical proof pages and switches into `/app/queue`. |
| **`QueuePage.tsx`** (`/app/queue`) | **Exception Control Room**: Header context strip with total exposure (`₹1,21,989.46`), unified filter bar, and dense 4-column exception triage table. | `GET /api/v1/review/queue` (`ReviewQueueResponse`). | - Search by Payment ID / Case UUID.<br>- Category dropdown filter.<br>- Severity segment buttons (`All`, `Critical`, `High`).<br>- Sort by discrepancy / amount / age.<br>- Copy Payment ID.<br>- Row click → navigate to `/app/case/:caseId`. |
| **`CasePage.tsx`** (`/app/case/:caseId`) | **Case Investigation Workspace**: 3-column desktop terminal (Context & Audit 24% • Evidence Comparison 44% • Human Decision Terminal 32%). | `GET /api/v1/review/cases/{case_id}` (`CaseEvidenceResponse`) and `GET /api/v1/review/cases/{case_id}/audit`. | - Copy Case ID.<br>- `[← Queue]` back button.<br>- `[Refresh Case Data]` button.<br>- Expand/collapse Policy Advisory drawer.<br>- Submit human review decision. |
| **`ReviewActionForm.tsx`** | Sticky human decision container with Reviewer Identity field, radio decision group (`Approve`, `Reject`, `Mark Unresolved`), required rationale textarea, expected lock version notice, submit button, and HTTP 409 conflict alert banner. | `CaseEvidenceResponse` (case ID and `version`). | - Radio select decision.<br>- Type rationale.<br>- Form submit triggers `POST /api/v1/review/cases/{case_id}/review`.<br>- If HTTP 409 occurs, displays assertive conflict banner with `[Refresh Case Data]` button. |
| **`MultiSourceCard.tsx`** | "Why this case was flagged" root-cause banner + 3 side-by-side evidence cards (Captured Payment Feed, Gateway Settlement Feed, Bank Statement Feed). | `CaseEvidenceResponse` (payment, settlement, bank_credits, deltas). | - Copy buttons for Payment ID, Settlement ID, and Bank UTR numbers. |
| **`RagCopilotPanel.tsx`** | Read-Only Policy Advisory accordion drawer with verified case facts, root cause analysis, and contractual citation cards with grounding confidence indicator. | `POST /api/v1/rag/investigate/{case_id}` (`InvestigationResult`). | - Accordion toggle (`Enter`/`Space`/click).<br>- Expand/collapse citation quotes. |

---

## 3. Route-to-Page Direct Mapping Table

| URL Route | Layout Container | Page Component | Functional Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `MarketingLayout` | `LandingPage.tsx` | Problem statement, 4-source promise, honest terminal screenshot. |
| `/how-it-works` | `MarketingLayout` | `HowItWorksPage.tsx` | 6-step operator journey (Signal → Evidence → Policy → Decision → Audit). |
| `/evidence` | `MarketingLayout` | `EvidencePage.tsx` | 4-source determinism, optimistic CAS locking, pgvector cosine grounding math. |
| `/evaluation` | `MarketingLayout` | `EvaluationPage.tsx` | Benchmark metrics (>1,000 rps, 100% precision, 0 false positives, 8-exception list). |
| `/docs` | `MarketingLayout` | `DocsPage.tsx` | API data contracts, CSV schemas, and SOP markdown repository. |
| `/about` | `MarketingLayout` | `AboutPage.tsx` | The LedgerLens Manifesto (Zero black-box approvals, built for operators). |
| `/app/dashboard` | `AppLayout` | `DashboardPage.tsx` | Command center parity overview, feed counters, 8 exception breakdown matrix. |
| `/app/queue` | `AppLayout` | `QueuePage.tsx` | **Primary work surface**: 4-column Exception Control Room table. |
| `/app/case/:caseId` | `AppLayout` | `CasePage.tsx` | **Investigation workspace**: 3-column multi-source terminal with CAS review panel. |
| `/app/ingestion` | `AppLayout` | `IngestionFeedsPage.tsx` | Drag-and-drop CSV batch upload and live source feed health monitors. |
| `/app/audit` | `AppLayout` | `AuditLogPage.tsx` | Immutable compliance ledger with CAS lock version history. |
| `/app/policies` | `AppLayout` | `PolicyKnowledgePage.tsx` | SOP markdown reader with semantic RAG vector search playground. |
| `/app/settings` | `AppLayout` | `SettingsPage.tsx` | Contract fee formulas (2% + 18% GST), grounding thresholds, and invariants. |
