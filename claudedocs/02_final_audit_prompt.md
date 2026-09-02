# Final Design Audit Prompt: Go / No-Go Evaluation for LedgerLens

## Context

You have been provided with the complete context suite for LedgerLens:
- `01_frontier_role_prompt.md` (Role, Constraints & Vision)
- `03_readme.md` (Product Architecture & Trust Boundary)
- `04_design_md.md` (Full Token Dictionary & Component Specs)
- `05_data_contracts.md` (Schemas, Mathematical Invariants, 8 Exceptions)
- `06_component_inventory.md` (Page & Component Responsibilities)
- `07_api_endpoint_map.md` (API Request/Response Payloads)
- `08_product_vision_brief.md` (One-page Vision Summary)
- `09_references_taste_filters.md` (Design References)
- `11_user_stories.md` (Operator Personas)
- `12_example_cases.md` (Real Exception Data Scenarios)
- `13_anti_patterns_gallery.md` (Visual Anti-Patterns)

---

## Audit Mission

Perform a rigorous, exhaustive, and honest UI/UX and architectural audit of the LedgerLens frontend codebase.

Evaluate whether the design and implementation satisfy the **Financial Reconciliation Control Room** vision and comply with all binding constraints.

---

## Required Output Structure

Your evaluation must return a structured scorecard containing:

### 1. Executive Verdict
- **Decision**: `GO` (Ready for Production / Pitch) OR `NO-GO` (Requires Remediation)
- **Overall Score**: Score out of 100.
- **Summary**: Concise 3-paragraph operational assessment.

### 2. Conformance Matrix (Pass / Fail / Warning)
Evaluate and grade each of these 8 categories:
1. **Domain Fit & Anti-Imitation**:
   - Does this feel like an operational control room?
   - Is it completely free of payment-gateway dashboard clones (Stripe/Razorpay) and generic AI chat copilots?
2. **Token Discipline & Geometry**:
   - Are spacing tokens strictly Base-8 + 4px (`space-1` to `space-8`)?
   - Are all colors semantic without raw hardcoded hex codes?
3. **Typography & Monospace Discipline**:
   - Are all monetary figures (`₹`), UUIDs, UTRs, and timestamps formatted in `font.family.mono` with `tabular-nums`?
4. **Information Density & Queue Hierarchy**:
   - Does the Exception Queue table (`/app/queue`) appear above the fold without oversized KPI walls?
   - Are the 4 columns (`Severity`, `What Happened & Identifiers`, `At Risk`, `Action`) clean and scannable?
5. **Investigation Workspace (3-Column Layout)**:
   - Does `/app/case/:id` maintain the strict 24% / 44% / 32% geometry?
   - Are Payments, Gateway Settlements, and Bank Statement Credits displayed side-by-side without hidden tabs?
6. **AI Safety & Read-Only Grounding**:
   - Is the Policy Advisory drawer strictly read-only?
   - Are citations anchored to pgvector cosine metrics ($\ge 0.35$)?
   - Is AI strictly barred from auto-approving or mutating cases?
7. **Concurrency & Human Review (Atomic CAS)**:
   - Does the Decision Panel enforce Reviewer Identity, mandatory rationale, and lock versioning?
   - Does the UI handle HTTP 409 stale version collisions gracefully?
8. **Accessibility & State Lifecycle**:
   - Are all interactive components accessible via keyboard (`Tab`, `Enter`, `Space`) with visible 2px focus rings?
   - Are all 7 interaction states (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`) implemented?

### 3. Identified Defects & Concrete Remediation Plan
- List any specific violations with route/component, severity (`P0`, `P1`, `P2`), problem description, and exact fix.

### 4. Final Sign-Off
- Formal sign-off declaration by the Product Design & UI/UX Systems Lead.
