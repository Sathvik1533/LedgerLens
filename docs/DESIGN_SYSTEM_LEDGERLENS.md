# LedgerLens Design System (Implementation-Ready)

```text
status: ACTIVE_CONTRACT
version: 1.0.0
applies_to: frontend/**, docs/**
governance: BINDING_UI_CONTRACT
last_updated: 2026-08-31
```

---

## 1. Context and Goals

### 1.1 Mission
LedgerLens is a calm, evidence-first control room for finance operators. It bridges the gap between high-volume anomaly detection and decisive human intervention, enabling finance teams to move from risk signals to audited resolutions without losing context or precision.

### 1.2 Design Intent
Deliver a token-driven, strictly accessible, and consistent interface that functions as a high-throughput financial operations terminal—not a marketing dashboard, generic AI demo, or conversational chat assistant.

### 1.3 Non-Negotiable Tenets
- **No generic AI/SaaS dashboard tropes**: Decorative gradients, glowing light blobs, glassmorphism, animated borders, and oversized KPI walls pushing the queue below the fold are strictly prohibited.
- **No chat-first AI interfaces**: AI is strictly secondary, read-only, and grounded in deterministic ledger facts and contractual policies. AI never acts as a chatbot and never executes direct financial approval.
- **No arbitrary spacing or typography**: Every margin, padding, font size, and color must resolve directly to a design token. Arbitrary pixel values (e.g., 13px, 19px, 27px) are rejected by lint/QA.
- **No fake telemetry or ungrounded claims**: No artificial live counters, fake operator personas, or unsupported confidence percentages.

---

## 2. Design Tokens and Foundations

Component implementations must consume tokens exclusively. Direct hex literals and arbitrary values in component rules are prohibited.

### 2.1 Color Tokens

```text
Canvas & Surfaces
--------------------------------------------------------------------------------------
color.canvas            = #080D1A   Main application dark backdrop
color.surface.base      = #0F172A   Elevated panels, table headers, container cards
color.surface.alt       = #1E293B   Nested evidence cards (Payments, Settlements, Credits)
color.surface.hover     = #1E293B   Hover state for interactive rows and cards
color.surface.active    = #334155   Active/pressed state for interactive containers

Borders & Dividers
--------------------------------------------------------------------------------------
color.border.subtle     = #1E293B   Table row dividers, inner card dividers (1px)
color.border.strong     = #334155   Outer card frames, active container boundaries (1px)
color.border.focus      = #2563EB   Keyboard focus ring boundaries

Interactive & Brand
--------------------------------------------------------------------------------------
color.primary           = #2563EB   Primary action buttons, focused controls, selection pills
color.primary.hover     = #1D4ED8   Hover state for primary action buttons
color.primary.active    = #1E40AF   Active/pressed state for primary buttons
color.advisory          = #0891B2   Read-only AI policy copilot, citation tags, info chips

Semantic Status & Severity
--------------------------------------------------------------------------------------
color.resolved          = #059669   Auto-reconciled matches, resolved cases, zero delta
color.resolved.subtle   = rgba(5, 150, 105, 0.12)
color.needsReview       = #D97706   Exceptions requiring human intervention, warnings
color.needsReview.subtle= rgba(217, 119, 6, 0.12)
color.critical          = #E11D48   High financial exposure, missing files, severe mismatch
color.critical.subtle   = rgba(225, 29, 72, 0.12)

Typography & Text
--------------------------------------------------------------------------------------
color.text.primary      = #FFFFFF   Main headings, monetary amounts, primary values
color.text.secondary    = #94A3B8   Field labels, secondary identifiers, table column headers
color.text.muted        = #64748B   Disabled labels, footnotes, timestamps
```

### 2.2 Typography Tokens

```text
Font Families
--------------------------------------------------------------------------------------
font.family.ui          = Inter, system-ui, -apple-system, sans-serif
font.family.mono        = "JetBrains Mono", "DM Mono", monospace

Font Weights
--------------------------------------------------------------------------------------
font.weight.base        = 400 (Body text, narrative descriptions)
font.weight.medium      = 500 (Form labels, filter chips, secondary headings)
font.weight.semibold    = 600 (Section titles, card headers, table headers)
font.weight.bold        = 700 (Main display titles, primary monetary values)

Type Scale (UI)
--------------------------------------------------------------------------------------
text-xs                 = 12px / line-height: 16px (Badges, metadata, timestamp tags)
text-sm                 = 14px / line-height: 20px (Table cells, form labels, body text)
text-md                 = 16px / line-height: 24px (Sub-headings, card titles)
text-lg                 = 18px / line-height: 28px (Panel headers, hero bullets)
text-xl                 = 20px / line-height: 28px (Section titles, case workspace headers)
text-2xl                = 24px / line-height: 32px (Page titles, primary stat figures)
text-3xl                = 30px / line-height: 36px (Marketing hero headlines)

Tabular Monospace Application Contract
--------------------------------------------------------------------------------------
font.family.mono with font-variant-numeric: tabular-nums is MANDATORY for:
- Monetary figures with explicit currency (e.g. ₹6,030.25, ₹0.00)
- Payment IDs, Order IDs, Settlement IDs, Batch UUIDs (e.g. pay_001014, set_001014)
- Bank UTR numbers (e.g. UTR00001014)
- Timestamps and relative durations (e.g. 2026-08-31 11:20:40Z, 2h ago)
- Lock versions and cryptographic hashes (e.g. v1, expected_version=1)
```

### 2.3 Spacing Tokens (Base-8 + 4px Micro-Scale)

| Token | Value | Target Context |
| :--- | :--- | :--- |
| `space-1` | `4px` | Micro-gaps (icon-to-text, badge internal padding, indicator dots) |
| `space-2` | `8px` | Tight grouping (label-to-input, title-to-subtitle, button internal gap) |
| `space-3` | `12px` | Compact component padding (filter chips, dropdown triggers, search box) |
| `space-4` | `16px` | Standard stack spacing (card padding, table cells, vertical list gaps) |
| `space-6` | `24px` | Panel interior padding (case cards, decision panel, policy drawer) |
| `space-8` | `32px` | Major layout gutters, screen container padding, section boundaries |

### 2.4 Radius, Shadow, and Motion Tokens

```text
Border Radius
--------------------------------------------------------------------------------------
radius.xs               = 2px (Badges, inline monospace tags, status dots)
radius.sm               = 4px (Buttons, form inputs, dropdown triggers, tooltips)
radius.md               = 8px (Container cards, workspace panels, table containers)

Box Shadows
--------------------------------------------------------------------------------------
shadow.subtle           = 0 1px 2px rgba(0, 0, 0, 0.3)
shadow.card             = 0 4px 12px rgba(0, 0, 0, 0.4)

Motion & Transitions
--------------------------------------------------------------------------------------
motion.duration         = 150ms–220ms
motion.easing           = cubic-bezier(0, 0, 0.2, 1) (ease-out)
Motion Rules:
- Motion is triggered ONLY upon state transitions (accordion open, tab change, modal submit).
- Perpetual animations, glowing borders, pulsing neon rings, and floating canvas meshes are prohibited.
```

---

## 3. Component-Level Specifications

---

### 3.1 Exception Queue Table & Rows

#### 3.1.1 Context and Goals
The primary operations hub for finance operators. Reads as a high-density, low-noise reconciliation table that communicates anomaly severity, clear monetary impact, and source identifiers.

#### 3.1.2 Anatomy
1. **Context Strip**: Header displaying active backlog volume and monetary exposure (`31 cases need review · ₹1,21,989.46 total exposure`).
2. **Filter Strip**: Combined search input, exception category dropdown, segmented severity buttons, and sort control.
3. **Table Structure**:
   - Header row with column labels: `Severity`, `What Happened & Identifiers`, `At Risk`, `Action`.
   - Data rows:
     - Column 1: Severity indicator (colored dot + text label: `Critical` or `High`).
     - Column 2: Plain-language summary (line 1) + Copyable Payment ID, Case UUID, and Exception category badge (line 2).
     - Column 3: Tabular monetary amount at risk (right-aligned INR figure).
     - Column 4: Single action affordance (`Inspect →`).

#### 3.1.3 Variants
- **Severity**: `critical` (`#E11D48`), `high` (`#D97706`), `medium` (`#2563EB`), `low` (`#059669`).
- **Status**: `needs_review`, `resolved`, `escalated`.

#### 3.1.4 States
- **Row Default**: Background `color.surface.base`, bottom border 1px `color.border.subtle`, text `color.text.primary`.
- **Row Hover**: Background `color.surface.alt`, bottom border 1px `color.border.strong`, cursor pointer.
- **Row Focus-Visible**: Full row outline `ring-2 ring-primary ring-offset-2 ring-offset-canvas`.
- **Table Loading**: 6-row pulsing skeleton matching exact cell dimensions.
- **Table Empty**: Centered `EmptyState` component with `ShieldCheck` icon.

#### 3.1.5 Responsive Behavior
- **Desktop (≥1280px)**: 4 full columns with comfortable spacing.
- **Tablet (768px–1279px)**: Compact padding, truncated Case UUID, summary lines wrapped to 2 lines max.
- **Mobile (<768px)**: Stacked card view per row (Top: Severity + Summary, Middle: IDs + Badge, Bottom: Amount + Inspect button).

#### 3.1.6 Interaction Contract
- `Tab` traverses search input, category dropdown, severity toggles, and each row's `Inspect` affordance.
- `Enter` or `Space` on a focused row triggers navigation to `/app/case/:caseId`.
- Clicking copy icon next to Payment ID copies text and toggles `Check` icon for 1500ms.

#### 3.1.7 Spacing and Typography
- Table cell padding: `space-4` horizontal, `space-3` vertical.
- Anomaly summary: `text-sm`, `font.weight.base`, `color.text.primary`.
- Monetary amounts: `text-sm`, `font.family.mono`, `font.weight.semibold`, `color.text.primary`.

---

### 3.2 Filter Bar (Search, Category, Severity, Sort)

#### 3.2.1 Anatomy
1. Search input with leading `Search` icon and trailing clear `X` button.
2. Category `<select>` dropdown listing all 8 deterministic exception types.
3. Segmented severity button group (`All`, `Critical`, `High`).
4. Sort dropdown (`Discrepancy (High to Low)`, `Amount (High to Low)`, `Newest First`).

#### 3.2.2 States
- **Default**: Background `color.surface.base`, border 1px `color.border.subtle`, text `color.text.primary`.
- **Hover**: Border 1px `color.border.strong`.
- **Focus-Visible**: Border `color.primary`, outline `ring-2 ring-primary ring-offset-1`.
- **Disabled**: Background `color.surface.alt`, opacity 50%, cursor not-allowed.
- **Error**: Border 1px `color.critical`.

#### 3.2.3 Responsive Behavior
- **Desktop**: Single continuous flex row with search expanding to fill remaining width.
- **Mobile/Tablet**: Wraps into two rows (Row 1: Search + Category, Row 2: Severity + Sort).

---

### 3.3 Case Workspace (3-Column Desktop Terminal)

#### 3.3.1 Anatomy
1. **Workspace Header**: Breadcrumb (`← Queue`), Case ID with copy affordance, Exception badge, Lock Version tag (`Version: v1`), and Refresh button.
2. **Column 1 (25% Width - Context & Audit)**:
   - Case Metadata card (Amount at Risk, Calculated Discrepancy, Exception Code, Decision State, Lock Version).
   - Audit Trail timeline card displaying immutable ledger events.
3. **Column 2 (45% Width - Evidence & Policy Advisory)**:
   - "Why this case was flagged" root-cause banner.
   - Side-by-side Multi-Source Evidence cards (Payments, Gateway Settlements, Bank Credits).
   - Collapsible Read-Only Policy Advisory Drawer.
4. **Column 3 (30% Width - Human Decision Terminal)**:
   - Sticky Human Decision Panel with Reviewer identity, radio actions, mandatory rationale, and CAS commit button.

#### 3.3.2 States
- **Default**: 3-column desktop layout separated by `space-6` gutters on `color.canvas`.
- **Loading**: Full-screen skeleton matching 3-column geometry.
- **Error**: High-visibility alert banner at top of workspace with "Retry" action.

---

### 3.4 Multi-Source Evidence Cards (Payment, Settlement, Bank Credit)

#### 3.4.1 Anatomy
1. **1. Captured Payment Feed Card**: Gross amount in INR, Expected net calculation, Payment ID, Order ID, Merchant ID, Timestamp.
2. **2. Gateway Settlement Feed Card**: Reported net settlement, Deducted fee (2%), Deducted GST (18%), Settlement ID, Batch ID.
3. **3. Bank Statement Feed Card**: Credited ledger amount, Core banking UTR number, Narration, Matching status badge.

#### 3.4.2 Spacing & Typography
- Container padding: `space-4`.
- Field labels: `text-xs`, `font.family.ui`, `color.text.secondary`.
- Field values: `text-xs`, `font.family.mono`, `tabular-nums`, `color.text.primary`.

---

### 3.5 Policy Advisory Drawer (Read-Only AI Copilot)

#### 3.5.1 Context & Authority
Provides grounded contractual SOP guidance and root-cause analysis. It is strictly advisory and read-only. No approval or settlement actions are permitted inside this component.

#### 3.5.2 Anatomy
1. **Trigger Header**: Sparkles icon, "Policy Advisory" title, "Read-Only" badge, "Grounded (Cosine ≥ 0.35)" status pill, and accordion chevron.
2. **Content Body (Expanded)**:
   - Verified Case Facts list.
   - Root Cause Analysis summary.
   - Contractual Citation Cards with source policy title, excerpt, and similarity metric.

#### 3.5.3 States
- **Collapsed**: 48px header bar displaying grounding score and toggle affordance.
- **Expanded**: Smooth ease-out reveal (`180ms`) displaying facts, analysis, and citations.
- **Loading**: Inline spinner with text "Retrieving policy citations...".

---

### 3.6 Human Decision Panel & Atomic CAS

#### 3.6.1 Anatomy
1. **Header**: "Human Decision Panel" + current lock version tag (`v1`).
2. **Reviewer Identity**: Input field prepopulated with operator identifier (`finance_ops_reviewer`).
3. **Review Actions**: Semantic `<fieldset>` with radio options:
   - `Approve (Resolve Anomaly)`
   - `Reject (Flag Financial Error)`
   - `Mark Unresolved (Escalate)`
4. **Resolution Rationale**: Mandatory `<textarea>` for audit trail logging.
5. **Lock Notice**: Monospace text: `Expected Version: N · Atomic CAS`.
6. **Submit Button**: Primary action button with spinner on submission.

#### 3.6.2 HTTP 409 Conflict Banner (Stale Version)
- **Role**: `role="alert"`, `aria-live="assertive"`.
- **Anatomy**: `AlertTriangle` icon + Headline: *"Another reviewer updated this case first."* + Subtext: *"Your action was not saved to prevent overwriting. Please refresh to inspect the latest version."* + Button: `[Refresh Case Data]`.

---

### 3.7 Empty States

#### 3.7.1 Variants
1. **Empty Queue**: `ShieldCheck` icon + *"All caught up. Zero financial exceptions require attention right now."*
2. **Filtered Queue**: `SlidersHorizontal` icon + *"No exceptions match your active filter criteria. Try resetting search or category."*
3. **Partial Evidence**: `AlertCircle` icon + *"Partial records found. Payment captured, but settlement line item is missing."*

---

### 3.8 Loading Skeletons

- **Design**: Skeleton pulse with `color.surface.alt` base and `color.surface.hover` shimmer.
- **Geometry**: Zero layout shift; skeletons must match exact dimensions of the target table rows and cards.

---

### 3.9 Left Sidebar Navigation (App Shell)

#### 3.9.1 Anatomy
1. **Brand Mark**: LedgerLens logo + title at top (`h-16`).
2. **Navigation List**: Semantic `<nav>` containing `Control Room` (`/app/queue`) and `Settings` (`/app/settings`).
3. **Operator Identity Footer**: Monospace operator badge + persona details at bottom (`finance_ops_reviewer`).

#### 3.9.2 States
- **Active Route**: Background `color.surface.alt`, text `color.text.primary`, `aria-current="page"`.
- **Inactive Route**: Text `color.text.secondary`, hover background `rgba(255, 255, 255, 0.04)`.
- **Focus**: `focus-visible: ring-2 ring-primary`.

---

### 3.10 Public Marketing & Story Layer

#### 3.10.1 Routes & Narrative Sections
1. **`/` (Landing Page)**: Problem statement (lost money, invisible reconciliation errors) → 3-bullet core promise → Honest Exception Control Room screenshot → Direct CTA to `/how-it-works` and `/app/queue`.
2. **`/how-it-works`**: 6-Step Operator Journey (Signal → Evidence → Policy Guidance → Human Decision → Cryptographic Audit).
3. **`/evidence`**: 4-Source Determinism, Grounded AI Policy constraints, Optimistic CAS locking, and Append-only Audit Trail.
4. **`/evaluation`**: Benchmark metrics (>1,000 rps, 100% precision, 0 false positives) + Honest 8-Exception failure mode checklist.
5. **`/about`**: The LedgerLens Manifesto (No fake confidence scores, no black-box AI, built for finance operators).

---

## 4. Accessibility Requirements (WCAG 2.2 AA)

1. **Keyboard-First Navigation**: Every interactive element (inputs, buttons, rows, citations, tabs) must be reachable and operable via `Tab`, `Enter`, and `Space`.
2. **Focus Indicators**: Focused interactive elements must render a crisp, 2px visible focus ring:
   ```css
   focus-visible: outline-none ring-2 ring-primary ring-offset-2 ring-offset-[#080D1A]
   ```
3. **Contrast Constraints**: Minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text against backgrounds.
4. **No Color-Alone Signals**: Severity and status indicators must always pair color dots with text labels and icons.
5. **Form Field Semantics**: All `<input>`, `<select>`, and `<textarea>` elements must have associated `<label>` or `aria-label` attributes. Radio groups must be wrapped in `<fieldset>` with `<legend>`.
6. **Live Regions**: Stale version conflict alerts must use `role="alert"` and `aria-live="assertive"`.

---

## 5. Content and Tone Standards

- **Tone**: Calm, concise, transparent, and operations-focused.
- **Anomaly Summaries**:
  - *Good*: *"Calculated 2% gateway fee and 18% GST deviate from settlement line item."*
  - *Good*: *"Expected net ₹2,151.74, but gateway reported ₹2,101.74."*
  - *Prohibited*: *"AI detected an intelligent anomaly in your ledger."*
- **Empty States**:
  - *Good*: *"All caught up. Zero financial exceptions require attention right now."*
  - *Prohibited*: *"Nothing here! Have a great day!"*

---

## 6. Prohibited Implementations & Anti-Patterns

1. **No Decorative Gradients or Glowing Blobs**: Backgrounds must be flat, high-contrast dark surfaces (`#080D1A`, `#0F172A`, `#1E293B`).
2. **No Oversized KPI Walls**: KPI banners must never push the operational queue below the fold.
3. **No Chat-First AI**: AI must never be presented as a conversational chat bubble or given direct approval powers.
4. **No Hidden Core Evidence**: Payment, settlement, and bank credit details must be visible side-by-side without hiding behind multi-level tab clicks.
5. **No Arbitrary Spacing or Dimensions**: All CSS values must resolve to tokens (`space-1` through `space-8`).

---

## 7. QA & Verification Checklist

### Component-Level QA
- [ ] Consumes only defined semantic color, typography, and spacing tokens.
- [ ] All interactive states implemented (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`).
- [ ] Keyboard navigation verified (`Tab`, `Enter`, `Space`, visible focus rings).
- [ ] WCAG 2.2 AA contrast verified.
- [ ] Responsive layout verified (Desktop 1440px, Tablet 768px, Mobile 375px).

### Page-Level QA
- [ ] Public marketing site clearly delivers the problem-solution-evidence narrative.
- [ ] App shell renders persistent left sidebar navigation with operator context.
- [ ] Exception queue renders 4-column layout with tabular monetary figures.
- [ ] Case workspace enforces 3-column desktop layout with optimistic CAS concurrency protection.
- [ ] Zero generic AI dashboard tropes or ungrounded claims present.

---

*This document is the binding visual and architectural contract for LedgerLens UI. Any component or page that fails this specification must not be shipped.*
