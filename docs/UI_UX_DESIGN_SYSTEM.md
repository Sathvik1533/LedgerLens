# LedgerLens UI/UX Design System Specification

## 1. Design Thesis

> LedgerLens is a calm, evidence-first control room where finance operators
> move from risk signal to human decision without losing context.

LedgerLens is designed as a focused investigation workspace for finance and
payment operations. It rejects consumer fintech gamification, decorative
dark-mode glow, and generic AI chat bubbles in favor of spatial discipline,
high data density, and clear evidence inspection.

---

## 2. Operator Workflow Journey

The interface structures the finance operator's journey through six
connected steps:

```text
1. See what needs attention (Queue Triage)
   ↓
2. Understand why a case was flagged (Case Header & Context)
   ↓
3. Compare payment, settlement, refund, and bank evidence (Evidence Grid)
   ↓
4. Read optional policy-based guidance (Read-Only AI Advisory Drawer)
   ↓
5. Make the human decision (Decision Panel with Optimistic Locking)
   ↓
6. See the recorded audit outcome (Audit Trail)
```

---

## 3. Information Hierarchy & the Law of Proximity

The interface follows the Law of Proximity: items that share a functional
relationship are grouped tightly, while distinct operational zones are
separated by clear spatial gutters.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SPATIAL PROXIMITY RULES                            │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ 4px–8px Micro-Gap     │ Label to input, icon to label, badge inner padding  │
│ 16px Stack Spacing    │ Card to card, list item to list item, table rows    │
│ 24px Panel Padding    │ Internal padding inside case and decision panels    │
│ 32px Column Clearance │ Gutters between Context, Evidence, and Decision     │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 4. Strict Spatial System (Base-8 + 4px Micro-Scale)

Every margin, padding, gap, and dimension is locked to an exact mathematical
scale:

- `space-1` (`4px`): Micro-gap (icon-to-text gap, badge inner padding).
- `space-2` (`8px`): Tight grouping (form label to input, title to subtitle).
- `space-3` (`12px`): Compact element padding (filter chips, dropdown triggers).
- `space-4` (`16px`): Standard stack spacing (evidence card gaps, list rows).
- `space-6` (`24px`): Panel interior padding (case cards, decision container).
- `space-8` (`32px`): Major column gutters, section headers, screen padding.

---

## 5. Typography

- **Interface Typography**: `Inter` / system UI sans-serif (`400` body, `500`
  labels, `600` headers, `700` titles).
- **Tabular Monospace**: `JetBrains Mono` with
  `font-variant-numeric: tabular-nums` applied to:
  - Monetary values (`₹488.20`);
  - Transaction and order identifiers (`ord_synth_004`, `pay_synth_004`);
  - Bank UTR numbers (`UTR99887711`);
  - Timestamps and relative age (`2h ago`);
  - Version numbers (`v1`, `expected_version=1`).

---

## 6. LedgerLens Semantic Color System

- **App Canvas** (`#080D1A`): Main application backdrop.
- **Card Surface** (`#0F172A`): Elevated panels, table headers, case cards.
- **Card Surface Alt** (`#1E293B`): Nested source cards (Payment, Settlement).
- **Border Subtle** (`#1E293B`): Table row dividers, subtle inner borders.
- **Border Strong** (`#334155`): Outer card frames, interactive boundaries.
- **Primary Interaction** (`#2563EB`): Active buttons, focused inputs.
- **Advisory AI** (`#0891B2`): Read-only AI policy copilot, citation tags.
- **Resolved State** (`#059669`): Approved cases, auto-reconciled matches.
- **Needs Review** (`#D97706`): Exceptions requiring human intervention.
- **Critical Risk** (`#E11D48`): High discrepancy amounts, missing files.
- **Text Primary** (`#FFFFFF`): Main headings, monetary amounts, values.
- **Text Secondary** (`#94A3B8`): Field labels, timestamps, identifiers.

---

## 7. Exception Queue UX

The exception queue is the primary work surface of the application:

1. **Header & Context Strip**:
   - Header shows the compact LedgerLens mark (`Candidate 2`), title
     `Exception Control Room`, and supported source pill
     (`Supports 4 financial data sources`).
   - Context strip displays live totals from `ReviewQueueResponse`:
     `N cases need review · ₹X.XX total at risk`.
   - Oversized decorative KPI cards are prohibited.

2. **Filter Strip**:
   - Search input (Order ID, Payment ID, UTR).
   - Exception category dropdown (`amount_mismatch`, `missing_settlement`, etc.).
   - Severity filters and sorting controls.

3. **Table Construction**:
   - Primary line displays **what happened in plain language**
     (e.g., *"Bank credited ₹400.00, but ₹488.20 was expected."*).
   - Secondary line displays identifiers and technical exception badge
     (`amount_mismatch`).
   - Right-aligned monetary values in tabular monospace font.

> **Wireframe data note:** Counts, amounts, identifiers, and timestamps shown
> below are illustrative examples. The implemented interface must render live
> queue data only from supported backend API responses.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Compact Mark] LedgerLens  Control Room   [Supports 4 data sources] [Sync]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ EXCEPTION CONTROL ROOM                                                      │
│ 18 cases need review · ₹48,920.00 total at risk                             │
│                                                                             │
│ ┌─ FILTER STRIP ──────────────────────────────────────────────────────────┐ │
│ │ [Search Order / Payment / UTR...] [Cat: All ▾] [Sev: All ▾] [Status: All]││
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ QUEUE TABLE (Sorted by Severity & Age) ────────────────────────────────┐ │
│ │ SEVERITY │ WHAT HAPPENED & IDENTIFIERS           │ AT RISK   │ ACTION   │ │
│ ├──────────┼───────────────────────────────────────┼───────────┼──────────┤ │
│ │ [Crit]   │ Bank credited ₹400.00, expected ₹488  │ ₹488.20   │ [Open]   │ │
│ │          │ pay_004 · order_004 (Example)         │           │          │ │
│ ├──────────┼───────────────────────────────────────┼───────────┼──────────┤ │
│ │ [High]   │ Payment captured, no settlement file  │ ₹1,250.00 │ [Open]   │ │
│ │          │ pay_012 · order_012 (Example)         │           │          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Case Workspace UX (3-Column Desktop Structure)

On desktop ($\ge 1280\text{px}$), the workspace maintains a persistent 3-column
layout so context, evidence, and decision controls remain visible
simultaneously without tab switching:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Back to Queue] Case #case_004 [High] [Needs Review] Version: v1 [Refresh]  │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│ 1. CASE CONTEXT       │ 2. EVIDENCE COMPARISON      │ 3. DECISION PANEL     │
├───────────────────────┼─────────────────────────────┼───────────────────────┤
│ Total at Risk:        │ "Why this was flagged:"     │ Current State:        │
│ ₹488.20               │ Bank credited ₹400.00, but  │ [ Needs Review ]      │
│                       │ ₹488.20 was expected.       │                       │
│ Discrepancy:          ├─────────────────────────────┤ Reviewer Identity:    │
│ -₹88.20               │ ┌─ PAYMENT ───────────────┐ │ [ Reviewer ID/Email ] │
│                       │ │ Gross: ₹500.00          │ │                       │
│ Opened:               │ │ Net Expected: ₹488.20   │ │ Decision Action: *    │
│ 2 hours ago           │ └─────────────────────────┘ │ (o) Approve           │
│                       │ ┌─ SETTLEMENT ────────────┐ │ ( ) Reject            │
│ Identifiers:          │ │ Reported Net: ₹488.20   │ │ ( ) Mark Unresolved   │
│ • Pay: pay_004        │ └─────────────────────────┘ │                       │
│ • Set: set_004        │ ┌─ BANK CREDIT ───────────┐ │ Rationale / Reason: * │
│ • UTR: UTR99887711    │ │ Credited: ₹400.00       │ │ ┌───────────────────┐ │
│                       │ └─────────────────────────┘ │ │ Fee variance.     │ │
│ Technical Code:       │                             │ └───────────────────┘ │
│ `amount_mismatch`     │ ┌─ POLICY ADVISORY ───────┐ │                       │
│                       │ │ Root Cause: Bank fee    │ │ Expected Version: 1   │
│ ┌─ AUDIT SUMMARY ───┐ │ │ Policy: Sec 4.2 SLA     │ │ [ Submit Decision ]   │
│ │ • 14:10 Ingested  │ │ └─────────────────────────┘ │                       │
│ └───────────────────┘ │                             │ Collision Safe (Lock) │
└───────────────────────┴─────────────────────────────┴───────────────────────┘
```

### Responsive Viewport Rules

- **Desktop** ($\ge 1280\text{px}$): 3 persistent columns: Context (22%) \|
  Evidence (48%) \| Decision (30%).
- **Tablet** ($768\text{px} - 1279\text{px}$): 2 columns: Evidence &
  Context (65%) \| Decision (35%).
- **Mobile** ($< 768\text{px}$): 1 column stacked: Case Context $\rightarrow$
  Evidence Grid $\rightarrow$ Policy AI Drawer $\rightarrow$ Sticky Decision.

---

## 9. Read-Only AI Policy Drawer

The policy investigation assistant is visually secondary and placed below
the evidence comparison cards:

- **Heading**: Lucide `Sparkles` icon with label:
  `Policy-based explanation (read-only)`.
- **Fact Extraction**: Displays verified database facts (amounts, timestamps).
- **Root Cause & Guidance**: Explains the discrepancy and recommends
  operational actions based on local policy files.
- **Policy Citations**: Expandable cards quoting source documents and
  section numbers.
- **Confidence Indicator**: Relies strictly on backend boolean `is_confident`.
- **Strict Boundary**: The AI container contains no decision controls. Human
  review actions remain in the separate Decision Panel.

---

## 10. Review & Outcome States

- **Loading State**: Skeleton pulse rows matching exact table and card
  dimensions. Microcopy: `Loading financial records and audit history...`
- **No Cases (Empty)**: Centered state with Lucide `ShieldCheck`.
  Microcopy: `All caught up. Zero financial exceptions require attention.`
- **Filtered Empty State**: Centered state with Lucide `SlidersHorizontal`.
  Microcopy: `No exceptions match your active filter criteria.`
- **Partial Evidence**: Notice card with Lucide `AlertCircle`.
  Microcopy: `Partial records found. Settlement line item is missing.`
- **Decision Success**: Inline confirmation banner with Lucide `CheckCircle2`.
  Microcopy: `Case resolved. Decision and rationale recorded in audit trail.`
- **HTTP 409 Conflict**: Alert banner with Lucide `AlertTriangle`.
  Microcopy: `Another reviewer updated this case first. Please refresh.`
  Action: `[Refresh Case]`.
- **Audit Update**: Highlights newly appended event in the chronological audit
  list with actor badge and timestamp.

---

## 11. Motion Principles

- **State-Change Transitions Only**: Motion is triggered strictly when data
  state changes (opening an accordion drawer, submitting a decision, or
  receiving a conflict).
- **Duration & Easing**: `150ms–220ms` with `ease-out`.
- **Prohibited Motion**: Zero perpetual animations, zero glowing borders, zero
  bouncing or floating cards, and zero animated gradients.

---

## 12. Accessibility Requirements to Implement & Verify

- **Keyboard Navigation**: Full logical `Tab` order through filters, table
  rows (`Enter`/`Space` opens case), and decision forms.
- **Visible Focus Indicators**: High-contrast
  `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none`
  on all interactive elements.
- **Semantic HTML Controls**: Explicit `<label htmlFor="...">`, `<fieldset>`,
  `<legend>`, and `<button>` elements.
- **Multi-Signal Status**: Status and severity are communicated through text
  labels (`Critical`, `High`, `Needs Review`), icons, and color.
- **Screen Reader ARIA**:
  - `role="alert"` and `aria-live="assertive"` on HTTP 409 collision notices.
  - `aria-live="polite"` on queue count updates.
  - `aria-describedby` linking decision inputs to the expected-version warning.
- **Responsive Reflow**: Preserves readability and functionality down to
  `320px` width without horizontal content clipping.

---

## 13. Lucide Functional Icon System

Functional iconography uses Lucide SVG icons with `aria-hidden="true"`.
Emojis are prohibited in functional UI controls.

- **Payment Captured**: `ReceiptText`
- **Settlement File**: `Landmark`
- **Customer Refund**: `RotateCcw`
- **Bank Credit / UTR**: `Building2`
- **Reconciliation Evidence**: `Scale`
- **Exception / Anomaly**: `AlertTriangle`
- **Critical Severity**: `AlertOctagon`
- **Human Review Action**: `UserCheck`
- **Audit Trail**: `History`
- **Live Sync / Refresh**: `RefreshCw`
- **Advisory Policy AI**: `Sparkles`

---

## 14. Visual Anti-Patterns (Prohibited in LedgerLens)

1. **Generic Dark SaaS Dashboards**: No dark templates filled with purple
   gradients or blurred glowing orbs.
2. **Oversized KPI Walls**: No row of 4 large cards with floating percentages
   that push the actual exception queue below the fold.
3. **Decorative Glassmorphism**: No heavy frosted glass overlays that impair
   text legibility.
4. **Arbitrary Spacing**: No random margins (`13px`, `19px`, `27px`); strict
   Base-8 scale enforced.
5. **Chat-First AI Interfaces**: No chat bubbles or open conversational inputs;
   AI output is rendered as structured inspection notes.
6. **Hidden Evidence Behind Tabs**: Core evidence (Payment, Settlement, Refund,
   Bank Credit) is visible simultaneously.
7. **Fabricated Live Claims**: No fake operator identities or unverified "live"
   claims without real authentication.
8. **Unsupported Confidence Percentages**: AI confidence uses the verified
   boolean `is_confident` rather than invented percentage scores.
