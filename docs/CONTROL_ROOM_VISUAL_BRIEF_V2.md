# LedgerLens Control Room — Visual Brief (v2)

## 1. Core Purpose & Mental Model
LedgerLens Control Room is an **institutional financial reconciliation and investigation terminal**. It is built for payment operations teams to audit variances, compare multi-source evidence, read grounded standard operating procedure (SOP) guidance, and record immutable human decisions.

**Core Test**:
- If an operator looks at this screen, it must immediately read as a **dense reconciliation terminal** (like Bloomberg Terminal, Linear, or Palantir Gotham).
- It must **NEVER** look like a generic AI startup landing page or a template dashboard with floating cards and glowing bubbles.

---

## 2. Non-Negotiables & Strict Visual Invariants

1. **Spatial Discipline (Strict Base-8 Scale)**:
   - `space-1` (`4px`): Micro-spacing (icon-to-text gap, badge internal padding).
   - `space-2` (`8px`): Element grouping (label-to-input, title-to-subtitle).
   - `space-3` (`12px`): Compact component padding.
   - `space-4` (`16px`): Standard container spacing (evidence card gaps, list items).
   - `space-6` (`24px`): Panel internal padding.
   - `space-8` (`32px`): Column clearance gutters and outer padding.
   - **Zero arbitrary pixels** (no `13px`, `19px`, `27px`).

2. **Typography**:
   - Primary Interface: `Inter` sans-serif (`400` body, `500` labels, `600` headers).
   - Tabular Monospace: `JetBrains Mono` with `font-variant-numeric: tabular-nums` for all monetary amounts (`₹2,203.75`), transaction IDs (`pay_001014`), UTRs, timestamps, versions, and metrics.

3. **Semantic Color Palette (from `docs/UI_UX_DESIGN_SYSTEM.md` Section 6)**:
   - **App Canvas**: `#080D1A`
   - **Card / Panel Surface**: `#0F172A`
   - **Nested Source Surface**: `#1E293B`
   - **Border Subtle**: `#1E293B`
   - **Border Strong**: `#334155`
   - **Primary Action**: `#2563EB`
   - **Advisory AI**: `#0891B2`
   - **Resolved State**: `#059669`
   - **Needs Review (Warning)**: `#D97706`
   - **Critical Risk**: `#E11D48`
   - **Text Primary**: `#FFFFFF`
   - **Text Secondary**: `#94A3B8`

4. **Visual Anti-Patterns (Prohibited)**:
   - ❌ No floating landing page hero sections or oversized KPI cards.
   - ❌ No decorative background glows, purplish blur orbs, or glassmorphism.
   - ❌ No chunky rounded pill badges; use clean rectangular borders (`rounded-sm`, 2px–4px) and subtle status dots (`●`).
   - ❌ No chat-first AI bots; AI guidance is a subordinated, read-only collapsible drawer with verified SOP citations.
   - ❌ No hidden evidence behind tabs; all 3 sources (Payment, Settlement, Bank Statement) are visible simultaneously in the investigation workspace.

---

## 3. Screen Specifications

### 3.1. Exception Queue Page
- **Context Strip**: Single-line summary (`18 cases need review · ₹48,920.00 total at risk`) from live API data.
- **Filter Toolbar**: Dense, compact search input, category dropdown, monochrome segmented severity selector (`[All | Critical | High]`), and sort dropdown.
- **Reconciliation Table**:
  - Crisp 1px solid dividers (`#1E293B`).
  - Columns: `SEVERITY` | `ANOMALY REASON & IDENTIFIERS` | `AT RISK` | `DISCREPANCY` | `AGE` | `STATUS` | `ACTION`.
  - Line 1: Plain-language anomaly statement.
  - Line 2: Monospace IDs with inline copy action.
  - Right-aligned tabular monetary numbers.

### 3.2. Case Workspace (3-Column Desktop $\ge 1280\text{px}$)
- **Column 1 ($22\%$) — Case Context & Audit Log**:
  - Key-value financial properties (Amount at Risk, Calculated Discrepancy, Exception Code, Lock Version).
  - Append-only chronological audit trail with actors and timestamps.
- **Column 2 ($48\%$) — Evidence Parity & Policy Guidance**:
  - Discrepancy formula alert banner (`Expected Net = Gross - Fee - GST`).
  - 3-Way Side-by-Side Source Grid (`1. Captured Payment`, `2. Gateway Settlement`, `3. Bank Statement`).
  - Subordinated `Policy Advisory (Read-Only)` drawer (collapsed by default, verified SOP citations).
- **Column 3 ($30\%$) — Human Decision Panel**:
  - State machine transition controls.
  - Reviewer identity input.
  - Radio options: `Approve`, `Reject`, `Mark Unresolved`.
  - Required rationale note.
  - Optimistic locking CAS version indicator.
  - HTTP 409 stale-lock collision banner with `[Refresh Case Data]`.
