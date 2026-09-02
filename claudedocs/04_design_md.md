# LedgerLens — Financial Reconciliation Control Room
## Comprehensive UI/UX Design System & Architectural Specification

```text
document_version: 1.0.0
status: ACTIVE_ENGINEERING_CONTRACT
target_surfaces: Public Story Layer (/) & Authenticated Financial Terminal (/app/*)
governance: BINDING_IMPLEMENTATION_SPECIFICATION
authors: Senior Product Designer & UI/UX Systems Lead
last_updated: 2026-08-31
```

---

## 1. Context and Goals

### 1.1 One-Sentence Design Intent
Deliver a token-driven, strictly accessible, and evidence-first financial operations terminal that enables finance operators to resolve multi-source transaction anomalies without loss of context, without marketing fluff, and without ungrounded AI decision-making.

### 1.2 Product Vision Summary
LedgerLens is an industrial-grade **Financial Reconciliation Control Room**. It closes the operational loop between four disparate financial data streams:
1. **Internal Merchant Ledger (Captured Payments)**
2. **Gateway Settlement Batches (Net Payouts, Fees, GST)**
3. **Customer Refund Records (Partial & Full Reversals)**
4. **Core Banking Statements (UTR Credits & Bank Narrations)**

Unlike consumer payment dashboards or customer-facing fintech portals, LedgerLens is engineered for triage, investigation, and audit compliance. It treats every unreconciled cent as an operational risk signal, provides deterministic side-by-side evidence diffs, contextualizes anomalies with read-only contractual policy guidance, and requires human accountability via atomic Compare-And-Swap (CAS) locking.

### 1.3 Explicit "Do Not Imitate" List
- **Payment Gateway Dashboards** (Stripe, Razorpay, Adyen, PayPal): Prohibited from using consumer-style onboarding widgets, marketing banners, colorful payment method distribution donuts, or soft-padded billing layouts.
- **Generic AI Copilot / Chat-First Interfaces**: Prohibited from using conversational chat bubbles, floating AI assistant heads, prompt textareas, or granting AI direct approval authority. AI is strictly a read-only policy citation tool.
- **Template SaaS Admin Dashboards**: Prohibited from using decorative glowing background blobs, neon gradient meshes, translucent glassmorphism blur effects, or oversized KPI summary walls that push actionable exception queues below the fold.

---

## 2. Design Tokens and Foundations

Every UI component must consume these tokens directly. Arbitrary pixel values, hardcoded hex codes, and ad-hoc CSS properties are strictly prohibited.

### 2.1 Color Tokens

The color system is designed for prolonged operational focus under high-density information loads. It relies on deep slate foundations, high-contrast typography, and strict semantic signaling.

```text
Canvas & Surfaces
--------------------------------------------------------------------------------------------------
color.canvas              = #080D1A   Deep midnight canvas; base viewport backdrop
color.surface.base        = #0F172A   Base panel background; table bodies, headers, control cards
color.surface.alt         = #1E293B   Nested evidence cards, active sidebar pills, secondary panels
color.surface.hover       = #1E293B   Interactive hover state for table rows and buttons
color.surface.active      = #334155   Pressed/active container state

Borders & Structural Dividers
--------------------------------------------------------------------------------------------------
color.border.subtle       = #1E293B   Inner dividers, table row borders, metadata separators (1px)
color.border.strong       = #334155   Container card perimeters, input field boundaries (1px)
color.border.focus        = #2563EB   Keyboard navigation focus boundary (2px solid)

Brand & Primary Action
--------------------------------------------------------------------------------------------------
color.primary             = #2563EB   Primary actions, active filters, CAS submission triggers
color.primary.hover       = #1D4ED8   Hover state for primary action buttons
color.primary.active      = #1E40AF   Pressed state for primary action buttons
color.primary.subtle      = rgba(37, 99, 235, 0.12)

Semantic Status & Financial Severity
--------------------------------------------------------------------------------------------------
color.resolved            = #059669   Auto-reconciled rows, 0.00 delta, approved resolutions
color.resolved.subtle     = rgba(5, 150, 105, 0.12)
color.resolved.border     = rgba(5, 150, 105, 0.30)

color.needsReview         = #D97706   Standard financial exceptions, unreflected refunds, warnings
color.needsReview.subtle  = rgba(217, 119, 6, 0.12)
color.needsReview.border  = rgba(217, 119, 6, 0.30)

color.critical            = #E11D48   Critical discrepancies (>₹500), duplicate payments, errors
color.critical.subtle     = rgba(225, 29, 72, 0.12)
color.critical.border     = rgba(225, 29, 72, 0.30)

color.advisory            = #0891B2   Read-only AI policy guidance, citation badges, pgvector tags
color.advisory.subtle     = rgba(8, 145, 178, 0.12)
color.advisory.border     = rgba(8, 145, 178, 0.30)

Typography & Text Content
--------------------------------------------------------------------------------------------------
color.text.primary        = #FFFFFF   High-contrast headings, primary monetary values, table text
color.text.secondary      = #94A3B8   Column headers, form field labels, secondary identifiers
color.text.muted          = #64748B   Disabled states, timestamps, table row count captions
```

### 2.2 Typography Tokens

```text
Font Families
--------------------------------------------------------------------------------------------------
font.family.ui            = Inter, system-ui, -apple-system, sans-serif
font.family.mono          = "JetBrains Mono", "DM Mono", monospace

Font Weights
--------------------------------------------------------------------------------------------------
font.weight.base          = 400 (Body narrative, descriptions, table cell subtext)
font.weight.medium        = 500 (Field labels, button copy, category filter tags)
font.weight.semibold      = 600 (Panel headers, section titles, column headers)
font.weight.bold          = 700 (Display page titles, primary monetary figures)

Type Scale (UI Body & Headings)
--------------------------------------------------------------------------------------------------
text-xs                   = 12px / line-height: 16px (Metadata tags, timestamp badges, footnotes)
text-sm                   = 14px / line-height: 20px (Standard table cells, form labels, body copy)
text-md                   = 16px / line-height: 24px (Sub-headings, card titles, banner summaries)
text-lg                   = 18px / line-height: 28px (Panel headers, hero bullets, modal titles)
text-xl                   = 20px / line-height: 28px (Workspace section titles, queue headers)
text-2xl                  = 24px / line-height: 32px (Command center titles, total exposure values)
text-3xl                  = 30px / line-height: 36px (Public landing page display headlines)

Tabular Monospace Application Contract
--------------------------------------------------------------------------------------------------
font.family.mono with font-variant-numeric: tabular-nums is MANDATORY for:
- All monetary amounts with explicit currency symbols (e.g., ₹6,030.25, ₹0.00, -₹106.73)
- Transaction IDs, Payment IDs, Order IDs, Batch UUIDs (e.g., pay_001014, set_001014)
- Bank Statement UTR numbers (e.g., UTR00001014)
- Exact timestamps and relative elapsed times (e.g., 2026-08-31 11:20:40Z, 2h ago)
- Concurrency lock versions and cryptographic SHA-256 hashes (e.g., lock_version=v1)
```

### 2.3 Spacing Tokens (Base-8 + 4px Micro-Scale)

| Token | Value | Target Architectural Application |
| :--- | :--- | :--- |
| `space-1` | `4px` | Micro-gaps: Icon-to-text gaps, badge inner padding, status indicator dots |
| `space-2` | `8px` | Tight grouping: Form label-to-input gap, title-to-subtitle gap, button internal padding |
| `space-3` | `12px` | Compact element padding: Filter chips, dropdown triggers, search box padding |
| `space-4` | `16px` | Standard stack spacing: Evidence card padding, table cells, vertical list gaps |
| `space-6` | `24px` | Panel interior padding: Decision terminal container, Case Metadata, Policy drawer |
| `space-8` | `32px` | Major column gutters, screen viewport padding, major section dividers |

*Rule*: All margins, paddings, and flex/grid gaps must resolve to one of these 6 tokens. Arbitrary values (e.g., 13px, 19px, 27px) are compile-time lint failures.

### 2.4 Radius, Shadow, and Motion Tokens

```text
Border Radius
--------------------------------------------------------------------------------------------------
radius.xs                 = 2px (Monospace code chips, status indicator dots, inline tags)
radius.sm                 = 4px (Action buttons, form text inputs, select dropdown triggers)
radius.md                 = 8px (Container panels, workspace cards, table boundary wrappers)

Elevation & Shadows
--------------------------------------------------------------------------------------------------
shadow.subtle             = 0 1px 2px rgba(0, 0, 0, 0.30) (Table rows, search bars)
shadow.card               = 0 4px 12px rgba(0, 0, 0, 0.40) (Decision panel, elevated modals)

Motion & Transitions
--------------------------------------------------------------------------------------------------
motion.duration           = 150ms–220ms
motion.easing             = cubic-bezier(0, 0, 0.2, 1) (Standard ease-out)

Motion Rules:
- Motion MUST strictly accompany user-triggered state changes (accordion expand, tab switch, submit).
- Perpetual animations, glowing pulse rings, hovering cards, and ambient background meshes are strictly prohibited.
```

---

## 3. Site Structure & Narrative Architecture

The application is architected into two clearly separated layers:
1. **Public Story & Proof Layer** (Narrative marketing, technical evidence, and benchmark evaluations)
2. **Authenticated Financial Operations Layer** (The persistent left-sidebar control room terminal)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PUBLIC STORY & PROOF LAYER (Public Marketing Layout)                                              │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  /                 -> Landing Page (Problem -> 4-Source Promise -> Honest Terminal Screenshot)   │
│  /how-it-works     -> 6-Step Operator Journey (Signal -> Evidence -> Policy -> Decision -> Audit) │
│  /evidence         -> 4-Source Determinism, Optimistic CAS Locking, and Grounded RAG Math         │
│  /evaluation       -> Benchmark Report (>1,000 rps, 100% Precision, Honest 8-Exception List)     │
│  /docs             -> Data Contracts, Schema Specifications, and SOP Markdown Archive             │
│  /about            -> The LedgerLens Manifesto (Zero Hallucinated Approvals, Built for Ops)       │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AUTHENTICATED FINANCIAL OPERATIONS TERMINAL (Left-Sidebar App Shell Layout)                       │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  /app/dashboard    -> Command Center (Parity overview, 8 exception breakdown, feed throughput)    │
│  /app/queue        -> Exception Control Room (Primary triage surface with 4-column dense table)   │
│  /app/case/:id     -> Case Investigation Workspace (3-column terminal: Context | Evidence | CAS) │
│  /app/ingestion    -> Multi-Source Data Feeds & Batch Ingestion (CSV drag-and-drop & feed health) │
│  /app/audit        -> Immutable Compliance & CAS Audit Ledger (Cryptographic event stream)        │
│  /app/policies     -> Contractual Policies & pgvector Semantic RAG Search Playground              │
│  /app/settings     -> System Configuration, Fee Formula Invariants, and Guardrail Thresholds     │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component-Level Specifications

---

### 4.1 Exception Queue Table & Rows (`/app/queue`)

#### 4.1.1 Anatomy
1. **Context Strip**: Header displaying backlog count and monetary exposure (`31 cases need review · ₹1,21,989.46 total exposure`).
2. **Filter Strip**: Combined search input, category dropdown, segmented severity buttons, and sort control.
3. **Table Grid**:
   - Header: `Severity`, `What Happened & Identifiers`, `At Risk`, `Action`.
   - Data Row (Column 1): Severity dot + text label (`Critical` / `High`).
   - Data Row (Column 2): Plain-language anomaly summary (Line 1) + Copyable Payment ID, Case UUID, and Exception badge (Line 2).
   - Data Row (Column 3): Right-aligned tabular INR amount at risk (`₹6,030.25`).
   - Data Row (Column 4): Single action affordance (`Inspect →`).

#### 4.1.2 States
- **Default**: Background `color.surface.base`, bottom border 1px `color.border.subtle`, text `color.text.primary`.
- **Hover**: Background `color.surface.alt`, bottom border 1px `color.border.strong`, cursor pointer.
- **Focus-Visible**: Full row outline `ring-2 ring-primary ring-offset-2 ring-offset-canvas`.
- **Loading**: 6 pulsing skeleton rows matching exact column dimensions (`motion.duration` 180ms).
- **Empty**: Centered `EmptyState` component with `ShieldCheck` icon.

#### 4.1.3 Interaction & Key Mappings
- `Tab` navigates through filter controls and down row actions.
- `Enter` or `Space` on a focused row triggers navigation to `/app/case/:caseId`.
- Copy icon next to Payment ID copies string to clipboard and renders `Check` icon for 1500ms.

---

### 4.2 Filter Bar (Search, Category, Severity, Sort)

#### 4.2.1 Anatomy
- Search input with leading `Search` icon and trailing clear `X` button.
- Category `<select>` listing the 8 deterministic exception types.
- Segmented button group (`All`, `Critical`, `High`).
- Sort dropdown (`Discrepancy (High to Low)`, `Amount (High to Low)`, `Newest First`).

#### 4.2.2 Computed Styles
- Height: `40px` (`h-10`).
- Container: Background `color.surface.base`, border 1px `color.border.subtle`, padding `12px` (`space-3`), radius `8px` (`radius.md`).
- Focus Ring: `outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`.

---

### 4.3 Case Workspace (3-Column Desktop Terminal Layout)

#### 4.3.1 Anatomy & Geometry
- **Column 1 (24% Width / ~320px)**: Case Context & Audit Timeline
  - Case Metadata: Gross Amount, Calculated Discrepancy delta, Lock Version, Status.
  - Audit Trail: Immutable chronological list of actor-stamped ledger events.
- **Column 2 (44% Width / ~560px)**: Evidence Comparison & Policy AI
  - "Why this case was flagged" root-cause banner.
  - Side-by-side Multi-Source Cards: Captured Payment Feed, Gateway Settlement Feed, Bank Statement Feed.
  - Collapsible Read-Only Policy Advisory Drawer.
- **Column 3 (32% Width / ~380px)**: Human Decision Terminal
  - Reviewer Identity field (`finance_ops_reviewer`).
  - Semantic Radio Selection: `Approve (Resolve Anomaly)`, `Reject (Flag Financial Error)`, `Mark Unresolved (Escalate)`.
  - Required Rationale textarea.
  - Expected version CAS tag + Submit button.
  - Assertive HTTP 409 conflict alert banner when stale version collisions occur.

---

### 4.4 Multi-Source Evidence Cards (Payment, Settlement, Bank Statement)

#### 4.4.1 Anatomy
- **1. Captured Payment Feed Card**: Gross captured amount, Expected net settlement, Payment ID, Order ID, Merchant ID, Timestamp.
- **2. Gateway Settlement Feed Card**: Reported net payout, Deducted fee (2%), Deducted GST (18%), Settlement ID, Batch ID.
- **3. Bank Statement Feed Card**: Credited ledger amount, Bank UTR number, Statement Narration, Match confirmation.

#### 4.4.2 Token Mapping
- Background: `color.surface.alt` (`#1E293B`).
- Border: 1px `color.border.subtle` (`#1E293B`).
- Padding: `16px` (`space-4`).
- Monetary Numbers: `font.family.mono`, `tabular-nums`, `font.weight.semibold`, `color.text.primary`.

---

### 4.5 Policy Advisory Drawer (Read-Only AI Guidance)

#### 4.5.1 Invariants
- AI is strictly read-only and advisory.
- Zero decision buttons or approval triggers may exist inside this component.
- Must display pgvector cosine grounding metric ($\ge 0.35$).

#### 4.5.2 Anatomy
- Header: `Sparkles` icon + "Policy Advisory" + "Read-Only" tag + "Grounded (Cosine ≥ 0.35)" pill + Chevron.
- Content: Verified Case Facts list + Root Cause Analysis + Expandable Contractual Citation Cards.

---

### 4.6 Decision Panel & HTTP 409 Conflict Banner

#### 4.6.1 Anatomy
- Container: Background `color.surface.base`, border 1px `color.border.strong`, padding `24px` (`space-6`), radius `8px` (`radius.md`).
- Form Elements:
  - Reviewer ID: `<input type="text" required>` with `User` icon.
  - Actions: `<fieldset>` with `<legend>` containing 3 radio options with custom hover/active states.
  - Rationale: `<textarea required rows={3}>`.
  - Concurrency Note: `Expected Version: N · Atomic CAS` in `font.family.mono`.
  - Submit Button: Full-width `color.primary` button with submission spinner.

#### 4.6.2 HTTP 409 Stale Version Alert
- Role: `role="alert" aria-live="assertive"`.
- Container: `bg-rose-950/40 border border-rose-500/30 p-4 rounded-md text-xs text-rose-200`.
- Action: Direct `[Refresh Case Data]` button to fetch the latest server version.

---

### 4.7 Left Sidebar Navigation (App Shell)

#### 4.7.1 Anatomy
- Width: `256px` (`w-64`), fixed height `100vh`, background `color.canvas` (`#080D1A`), right border 1px `color.border.subtle`.
- Top: Brand mark + `AI Finance Controller` subtitle + `PROD` badge.
- Quick Action: `[Run Reconciliation]` button with active engine spinner.
- Navigation Groups:
  - *Operations*: `Command Center`, `Control Room` (with live exception count badge), `Data Feeds & Ingest`.
  - *Compliance & Policy*: `Audit Ledger (CAS)`, `Policies & RAG`, `Contracts & Settings`.
  - *Documentation & Story*: `Landing Page`, `How It Works`, `Evaluation & Benchmarks`, `API Contracts & SOPs`.
- Bottom: Operator identity (`FO` / `finance_ops_reviewer`) + `● 4 Feeds Live · PostgreSQL 16`.

---

## 5. Accessibility Requirements (WCAG 2.2 AA)

1. **Keyboard Operability**: All interactive controls (buttons, table rows, filter dropdowns, accordion triggers, radio options) must be 100% accessible via `Tab`, `Enter`, and `Space`.
2. **Visible Focus Rings**:
   ```css
   focus-visible: outline-none ring-2 ring-[#2563EB] ring-offset-2 ring-offset-[#080D1A]
   ```
3. **Color Non-Exclusivity**: Anomaly severities and status indicators must always pair color dots with text labels (`Critical`, `High`, `Approved`, `Needs Review`) and icons.
4. **Form Labels & Semantics**: Every `<input>`, `<select>`, and `<textarea>` must have an explicit `<label htmlFor="...">` or `aria-label`. Radio groups must be grouped under `<fieldset>` and `<legend>`.
5. **Live Regions**: Version conflict errors must utilize `aria-live="assertive"` to immediately notify screen readers.

---

## 6. Content and Tone Standards

- **Tone**: Calm, concise, transparent, and operations-focused.
- **Plain-Language Anomaly Summaries**:
  - *Amount Mismatch*: "Expected net ₹2,151.74, but gateway reported ₹2,101.74."
  - *Fee Mismatch*: "Calculated 2% gateway fee and 18% GST deviate from settlement line item."
  - *Missing Settlement*: "Payment captured by merchant, but no gateway settlement line item was received."
  - *Missing Bank Credit*: "Settlement reported by gateway, but no matching bank statement UTR credit exists."
  - *Duplicate Payment*: "Multiple captured payment entries detected for the same order reference."
- **Empty States**:
  - *Queue Empty*: "All caught up. Zero financial exceptions require attention right now."
  - *Filtered Empty*: "No exceptions match your active filter criteria. Try resetting search or category."
- **Version Conflict**:
  - "Another reviewer updated this case first. Your action was not saved to prevent overwriting. Please refresh to inspect the latest version."

---

## 7. Anti-Patterns & Prohibited Implementations

| Prohibited Pattern | Reason for Rejection in LedgerLens |
| :--- | :--- |
| **Decorative Glowing Blobs & Gradients** | Degrades contrast, distracts operators, and signals an ungrounded consumer marketing demo. |
| **Oversized KPI Walls** | Pushes the primary triage queue below the fold, forcing unnecessary scrolling. |
| **Chat-First AI Interfaces** | Unpredictable, non-deterministic, and incompatible with strict financial auditability. |
| **Hidden Evidence Behind Multi-Level Tabs** | Slows down anomaly investigation; all 4 sources must be visible side-by-side. |
| **Arbitrary Spacing (13px, 19px, etc.)** | Breaks visual rhythm and destroys design-system consistency. |
| **Payment Gateway Clone Styling** | LedgerLens is a reconciliation terminal for operators, not a payment collection portal. |

---

## 8. Engineering QA Verification Checklist

### Component-Level QA
- [ ] Consumes only tokens defined in Section 2 (`color.*`, `font.*`, `space-*`, `radius.*`, `shadow.*`, `motion.*`).
- [ ] Implements all 7 interactive states (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`).
- [ ] Full keyboard navigation verified (`Tab` order, `Enter`/`Space` activation, visible focus ring).
- [ ] WCAG 2.2 AA contrast verified (minimum 4.5:1 text-to-background ratio).
- [ ] Responsive layouts verified across Desktop (1440px), Tablet (768px), and Mobile (375px).

### Page-Level QA
- [ ] Public marketing site delivers the problem-solution-evidence narrative without marketing buzzwords.
- [ ] Authenticated terminal renders the persistent left sidebar with live operator identity and quick actions.
- [ ] Exception Control Room displays dense 4-column triage grid with tabular monospace numbers.
- [ ] Case workspace enforces the 3-column layout with atomic CAS concurrency protection.
- [ ] Zero generic AI or payment gateway dashboard anti-patterns present.
