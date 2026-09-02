# LedgerLens Design System – Component Specifications

This document defines implementation-ready specifications for all core LedgerLens components. It must be used together with `UI_UX_DESIGN_SYSTEM.md`, which defines tokens, foundations, accessibility targets, and global rules.

For every component below:

- All spacing must use tokens: `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px).
- All colors must use semantic tokens from `UI_UX_DESIGN_SYSTEM.md` (e.g., `color.surface.base`, `color.primary`), not raw hex.
- All typography must use `font.family.ui` (Inter) for interface text and `font.family.mono` (JetBrains Mono, tabular) for money, IDs, UTRs, timestamps, and versions.
- All interactive elements must define states: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`.
- All components must support keyboard, pointer, and touch interaction and meet WCAG 2.2 AA.

---

## 1. Exception Queue Table

### 1.1 Context and Goals

Primary work surface for finance operators. Must read as a dense, high-signal operations table, not a marketing hero.

### 1.2 Anatomy

- Context strip:
  - Text: `N cases need review · ₹X.XX total at risk`.
  - Typography: `text-sm`, `font.family.ui`, `color.text.secondary`.
  - Spacing: `space-4` vertical padding inside strip.
- Filter strip:
  - Search input, category dropdown, severity filters, sort control.
  - Gaps between controls: `space-2`–`space-3`.
- Table:
  - Header row with column labels: Severity, What Happened & Identifiers, At Risk, Action.
  - Data rows with:
    - Severity indicator (icon + text label + color).
    - Plain-language anomaly summary (line 1).
    - Identifiers + exception badge (line 2).
    - Right-aligned monetary values (tabular monospace).
    - Action link/button: `Inspect`.

### 1.3 Variants

- Severity: `critical`, `high`, `medium`, `low`.
- Status: `needsReview`, `resolved`, `escalated`.

### 1.4 States

**Row – default**

- Background: `color.surface.base`.
- Border bottom: `color.border.subtle`, 1px.
- Text: `color.text.primary` for summary, `color.text.secondary` for metadata.

**Row – hover**

- Background: `color.surface.alt` with subtle highlight.
- Border bottom: `color.border.strong`.

**Row – focus-visible**

- Focused action or row must show:
  - `focus-visible: ring-2 ring-primary outline-none`.

**Table – loading**

- Skeleton rows matching exact table geometry.
- Pulsing animation within `motion.duration` (150–220ms) and `motion.easing`.

**Table – empty**

- Centered content:
  - Icon: `ShieldCheck`.
  - Headline: “All caught up. Zero financial exceptions require attention right now.”
  - Subtext (optional): “New exceptions will appear here as they are detected.”

### 1.5 Responsive Behavior

- Desktop (≥1280px): full table with all columns.
- Tablet (768–1279px): compress secondary columns; keep anomaly summary and amount visible.
- Mobile (<768px): stack into card-like rows:
  - Top: severity + summary.
  - Middle: identifiers + badge.
  - Bottom: amount + action.

### 1.6 Keyboard, Pointer, Touch

- `Tab` navigates through search, filters, and row actions.
- `Enter`/`Space` on a focused row opens the case.
- Pointer hover highlights the row.
- Touch:
  - Row tappable with minimum vertical padding `space-4`.
  - Touch targets for actions ≥ 44x44px.

### 1.7 Spacing and Typography

- Table cell vertical padding: `space-2`–`space-4`.
- Filter strip gaps: `space-2`–`space-3`.
- Anomaly summary: `text-sm` or `text-md`, `font.family.ui`.
- Monetary values: `font.family.mono`, `tabular-nums`.

### 1.8 Long-Content, Overflow, Empty-State

- Anomaly summary truncates with ellipsis after 2 lines on small screens.
- Identifiers truncate gracefully with tooltip on hover/focus.
- Empty state as defined in 1.4.

### 1.9 Accessibility Acceptance Criteria

- All interactive elements reachable via keyboard with visible focus ring.
- Severity/status not conveyed by color alone; text labels and icons present.
- Contrast between text and background meets WCAG 2.2 AA.

### 1.10 Anti-Patterns

- Oversized KPI cards pushing the queue below the fold.
- Decorative gradients or glowing effects around the table.
- Using color alone to indicate severity.

---

## 2. Filter Bar (Search, Category, Severity, Sort)

### 2.1 Context and Goals

Compact, high-density filter toolbar for the Exception Queue.

### 2.2 Anatomy

- Search input (Order ID / Payment ID / UTR).
- Category dropdown (`amount_mismatch`, `missing_settlement`, etc.).
- Severity filter (chips or dropdown).
- Sort control (discrepancy, amount, age).

### 2.3 States

**Input / Select – default**

- Background: `color.surface.base`.
- Border: `color.border.subtle`, 1px.
- Text: `color.text.primary`.
- Placeholder: `color.text.secondary`.

**Input / Select – hover**

- Border: `color.border.strong`.

**Input / Select – focus-visible**

- Border: `color.border.strong`.
- Ring: `ring-2 ring-primary`.

**Input / Select – disabled**

- Background: `color.surface.alt`.
- Text: reduced opacity `color.text.secondary`.
- No interaction.

**Input / Select – error**

- Border: `color.critical`, 1px.
- Error message below: `text-xs`, `color.critical`.

### 2.4 Responsive Behavior

- Desktop: single row with compact inputs.
- Tablet/mobile: wrap into multiple rows; keep search and category most prominent.

### 2.5 Keyboard, Pointer, Touch

- All inputs and selects focusable and operable via keyboard.
- Dropdowns navigable with arrow keys.
- Touch targets minimum 44x44px.

### 2.6 Spacing and Typography

- Gaps between controls: `space-2`–`space-3`.
- Input padding: `space-3` vertical, `space-4` horizontal.
- Labels and placeholders: `text-sm`, `font.family.ui`.

### 2.7 Accessibility

- Labels associated with inputs (`htmlFor` / `id`).
- Error messages linked via `aria-describedby`.

### 2.8 Anti-Patterns

- Overly large, marketing-style filter sections.
- Hidden filters behind “More” buttons without clear indication.

---

## 3. Case Workspace (3-Column Desktop Layout)

### 3.1 Context and Goals

Persistent 3-column investigative layout for desktop (≥1280px): Context | Evidence | Decision.

### 3.2 Anatomy

- Header:
  - Case ID, severity badge, status badge, version tag, refresh action.
- Column 1 (22–25%): Case Context & Audit.
  - Amount at risk, discrepancy delta, version, identifiers, audit timeline.
- Column 2 (42–48%): Evidence Comparison & Policy AI.
  - “Why this was flagged” banner.
  - Evidence cards: Payment, Settlement, Bank Credit.
  - Collapsible Policy Advisory drawer (read-only).
- Column 3 (30–33%): Human Decision Panel.
  - Reviewer identity input.
  - Radio options: Approve / Reject / Mark Unresolved.
  - Rationale textarea.
  - Expected version notice.
  - Submit button.
  - HTTP 409 conflict banner (when applicable).

### 3.3 Variants

- Desktop: 3 columns.
- Tablet: 2 columns (Context+Evidence | Decision).
- Mobile: single stacked column.

### 3.4 States

**Workspace – default**

- Background: `color.canvas`.
- Column gutters: `space-8`.
- Panel padding: `space-6`.

**Workspace – loading**

- Skeleton layout matching column structure.
- Subtle pulse within `motion.duration` and `motion.easing`.

**Workspace – error**

- Error banner at top:
  - Background: `color.critical` with `color.text.primary`.
  - Text: “Failed to load case details. Please try again.”

### 3.5 Keyboard, Pointer, Touch

- Tab order: header → left column → center column → right column.
- All interactive elements within columns keyboard accessible.
- Drawer toggle operable via `Enter`/`Space`.

### 3.6 Spacing and Typography

- Column gutters: `space-8`.
- Panel internal padding: `space-6`.
- Headings: `text-lg`–`text-xl`, `font.weight.semibold`.
- Body: `text-sm`–`text-md`.

### 3.7 Accessibility

- Landmarks: `aside` for side columns, `main` for evidence.
- Headings reflect hierarchy.

### 3.8 Anti-Patterns

- Collapsing core evidence behind tabs.
- Making AI the central focus instead of evidence.

---

## 4. Evidence Cards (Payment, Settlement, Bank Credit)

### 4.1 Context and Goals

Display side-by-side financial source records for comparison.

### 4.2 Anatomy

- Card header: source name (Payment / Settlement / Bank Credit), icon.
- Card body:
  - Rows of key-value pairs:
    - Gross, Fee, Tax, Net Expected (Payment).
    - Reported Net, Fee, Tax (Settlement).
    - Credited Amount, UTR, Narration (Bank Credit).
  - All monetary values in tabular monospace.

### 4.3 States

**Card – default**

- Background: `color.surface.alt`.
- Border: `color.border.subtle`, 1px.
- Header text: `color.text.primary`, `font.weight.semibold`.
- Body text: `color.text.secondary`.

**Card – hover**

- Border: `color.border.strong`.

**Card – loading**

- Skeleton blocks matching card geometry.

### 4.4 Responsive Behavior

- Desktop: side-by-side cards in Evidence column.
- Tablet/mobile: stacked vertically.

### 4.5 Spacing and Typography

- Card padding: `space-6`.
- Gap between rows: `space-3`.
- Key labels: `text-sm`, `font.family.ui`.
- Values (money/IDs): `text-sm`, `font.family.mono`, `tabular-nums`.

### 4.6 Accessibility

- Each key-value pair semantically grouped (e.g., `dl`/`dt`/`dd` or clear label structure).

---

## 5. Policy Advisory Drawer (Read-Only)

### 5.1 Context and Goals

Secondary, collapsible drawer below evidence. Provides grounded, read-only policy-based explanation.

### 5.2 Anatomy

- Header:
  - Icon: `Sparkles`.
  - Label: “Policy-based explanation (read-only)”.
- Content:
  - Verified case facts.
  - Root cause analysis.
  - Policy citations (expandable cards).
  - Confidence indicator (`is_confident`: “Grounded” vs “Low Confidence”).

### 5.3 States

**Drawer – collapsed**

- Header visible, content hidden.
- Toggle icon indicates expandable state.

**Drawer – expanded**

- Content visible with `space-4` internal spacing.

**Drawer – loading**

- Skeleton lines for facts and citations.

### 5.4 Keyboard, Pointer, Touch

- Toggle operable via `Enter`/`Space`.
- Content scrollable if long; focus trapped inside when expanded (if modal-like behavior is used).

### 5.5 Spacing and Typography

- Header padding: `space-4`.
- Content padding: `space-4`–`space-6`.
- Headings: `text-sm`–`text-md`, `font.weight.semibold`.
- Body: `text-sm`, `font.family.ui`.

### 5.6 Accessibility

- Drawer toggle has clear label (“Expand policy explanation”).
- Citations have clear headings and are navigable via keyboard.

### 5.7 Anti-Patterns

- Any decision controls inside this drawer.
- Presenting AI output as chat bubbles or conversational UI.

---

## 6. Decision Panel

### 6.1 Context and Goals

Sticky right column component for human review decisions with optimistic locking.

### 6.2 Anatomy

- Reviewer identity input.
- Radio group:
  - Approve (Resolve Anomaly)
  - Reject (Flag Financial Error)
  - Mark Unresolved (Escalate)
- Rationale textarea (required).
- Expected version notice (`Expected Version: N`).
- Submit button.
- HTTP 409 conflict banner (when applicable).

### 6.3 States

**Panel – default**

- Background: `color.surface.base`.
- Border: `color.border.strong` on outer frame.
- Padding: `space-6`.

**Inputs – default/hover/focus/disabled/error**

- As defined in Filter Bar spec, adapted for textarea and radio.

**Submit button**

- `default`: background `color.primary`, text `color.text.primary`.
- `hover`: slightly darker shade of `color.primary`.
- `focus-visible`: `ring-2 ring-primary`.
- `disabled`: reduced opacity, no interaction.
- `loading`: spinner + “Submitting…”.

**Conflict banner**

- Background: `color.critical`.
- Text: `color.text.primary`.
- Action button: `[Refresh Case Data]`.

### 6.4 Responsive Behavior

- Desktop: sticky right column.
- Mobile: sticky bottom bar or fixed bottom section.

### 6.5 Keyboard, Pointer, Touch

- All inputs and radios keyboard operable.
- Submit button reachable via `Tab` and activatable via `Enter`/`Space`.

### 6.6 Spacing and Typography

- Internal padding: `space-6`.
- Gaps between fields: `space-4`.
- Labels: `text-sm`, `font.family.ui`.
- Version notice: `text-xs`, `font.family.mono`.

### 6.7 Accessibility

- Radio group wrapped in `fieldset` with `legend`.
- Labels associated with inputs.
- Conflict banner uses `role="alert"` and `aria-live="assertive"`.

---

## 7. HTTP 409 Conflict Banner

### 7.1 Context and Goals

Assertive alert when another reviewer updated the case first.

### 7.2 Anatomy

- Icon: `AlertTriangle`.
- Headline: “Another reviewer updated this case first.”
- Subtext: “Your action was not saved to prevent overwriting. Please refresh to inspect the latest version.”
- Action button: `[Refresh Case Data]`.

### 7.3 States

- `default`: as above.
- `loading`: button shows spinner, text “Refreshing…”.

### 7.4 Spacing and Typography

- Padding: `space-4`.
- Gap between icon, text, and button: `space-3`.
- Headline: `text-sm`, `font.weight.semibold`.
- Subtext: `text-sm`, `font.family.ui`.

### 7.5 Accessibility

- `role="alert"`, `aria-live="assertive"`.
- Button focusable and operable via keyboard.

---

## 8. Empty States (Queue, Filtered Queue, Partial Evidence)

### 8.1 Context and Goals

Actionable, calm empty states that guide the operator.

### 8.2 Variants

- Queue empty: “All caught up. Zero financial exceptions require attention right now.”
- Filtered empty: “No exceptions match your active filter criteria. Try resetting search or category.”
- Partial evidence: “Partial records found. Payment captured, but settlement line item is missing.”

### 8.3 Anatomy

- Icon (Lucide, e.g., `ShieldCheck`, `SlidersHorizontal`, `AlertCircle`).
- Headline.
- Subtext (optional).
- Optional action (e.g., “Clear filters”).

### 8.4 Spacing and Typography

- Padding: `space-6`.
- Gap between icon, headline, subtext: `space-3`.
- Headline: `text-md`, `font.weight.semibold`.
- Subtext: `text-sm`.

### 8.5 Accessibility

- Icon decorative (`aria-hidden="true"`).
- Text content fully accessible.

---

## 9. Loading Skeletons

### 9.1 Context and Goals

Match exact layout geometry to reduce perceived load time.

### 9.2 Variants

- Queue table skeleton.
- Case workspace skeleton.
- Card skeletons (Evidence, Policy, Decision).

### 9.3 Behavior

- Subtle pulse within `motion.duration` and `motion.easing`.
- Background: `color.surface.alt`.
- Pulse overlay: slightly lighter shade.

### 9.4 Spacing

- Match real component spacing exactly (`space-4`, `space-6`, etc.).

---

## 10. Left Sidebar Navigation (App Shell)

### 10.1 Context and Goals

Compact, functional navigation for the app layer.

### 10.2 Anatomy

- Logo + “LedgerLens” at top.
- Nav items:
  - Queue (`Control Room`)
  - Cases (optional)
  - Settings (later)
- Bottom: user/env info (`Finance Ops`, `finance_ops_reviewer`).

### 10.3 States

- Nav item – default: text `color.text.secondary`.
- Nav item – active: text `color.text.primary`, background `color.surface.alt`.
- Nav item – hover: subtle background `color.surface.alt`.
- Nav item – focus-visible: `ring-2 ring-primary`.

### 10.4 Spacing and Typography

- Sidebar width: ~220–260px.
- Nav item padding: `space-3`–`space-4` vertical, `space-4` horizontal.
- Gap between items: `space-2`.
- Text: `text-sm`, `font.family.ui`.

### 10.5 Accessibility

- Landmark: `nav`.
- Current page indicated with `aria-current="page"`.

---

## 11. Landing Page Sections (Hero, How-It-Works, Evidence, Evaluation)

### 11.1 Hero

- Headline: problem + promise in 1–2 lines.
- Sub-hero: 2–3 bullets.
- CTA button.
- Honest screenshot of Exception Control Room.

### 11.2 How-It-Works

- 6-step operator journey with simple visuals.

### 11.3 Evidence / Reconciliation

- Explanation of 4-source reconciliation and grounded AI.

### 11.4 Evaluation

- Metrics (throughput, accuracy, honest exceptions).
- Link to `evaluation/README.md`.

### 11.5 Spacing and Typography

- Section padding: `space-8` vertical.
- Max content width for readability.
- Headings: `text-2xl`–`text-3xl`.
- Body: `text-sm`–`text-md`.

---

## QA Checklist (All Components)

For every component above, implementation must verify:

- [ ] Uses only defined color, typography, and spacing tokens.
- [ ] All states defined and implemented (default, hover, focus-visible, active, disabled, loading, error).
- [ ] Keyboard, pointer, and touch behavior verified.
- [ ] Accessibility criteria met (focus, contrast, labels, ARIA where needed).
- [ ] Responsive behavior verified (desktop/tablet/mobile).
- [ ] No generic AI/SaaS anti-patterns present.
