# LedgerLens Design System (Implementation-Ready)

## 1. Context and Goals

**Mission**  
LedgerLens is a calm, evidence-first control room for finance operators. It helps teams move from risk signal to human decision without losing context.

**Design intent (one sentence)**  
Deliver a token-driven, accessible, and consistent UI that feels like a financial operations terminal—not a generic AI dashboard, marketing site, or chat-first copilot.

**Non-negotiables**

- No generic AI/SaaS dashboard tropes (gradients, glowing blobs, glassmorphism, oversized KPI walls).
- No chat-first AI interfaces; AI is secondary, read-only, and grounded in facts and policies.
- No arbitrary spacing or typography; all values must come from tokens.
- No fake live claims, fake operator identities, or unsupported confidence percentages.

**Goals**

- Provide implementation-ready guidance for all core components and pages.
- Ensure consistency, accessibility (WCAG 2.2 AA), and fast delivery across:
  - Marketing/site layer (landing, how-it-works, evidence, evaluation, docs, about).
  - App layer (Exception Control Room: queue, case workspace, decision, audit).
- Make “generic AI vibes” a testable failure condition.

---

## 2. Design Tokens and Foundations

All component and page rules must refer to these tokens. Raw hex values and arbitrary pixels are prohibited in component specs.

### 2.1 Color Tokens

| Token                 | Value     | Role                                                    |
|-----------------------|-----------|---------------------------------------------------------|
| `color.canvas`        | `#080D1A` | Main application backdrop                               |
| `color.surface.base`  | `#0F172A` | Elevated panels, table headers, case cards              |
| `color.surface.alt`   | `#1E293B` | Nested source cards (Payment, Settlement, Bank Credit)  |
| `color.border.subtle` | `#1E293B` | Table row dividers, subtle inner borders                |
| `color.border.strong` | `#334155` | Outer card frames, interactive container boundaries     |
| `color.primary`       | `#2563EB` | Active buttons, focused inputs, selection chips         |
| `color.advisory`      | `#0891B2` | Read-only AI policy copilot, citation tags, info pills  |
| `color.resolved`      | `#059669` | Approved cases, auto-reconciled matches, zero delta     |
| `color.needsReview`   | `#D97706` | Exceptions requiring human intervention, warnings       |
| `color.critical`      | `#E11D48` | High discrepancy amounts, missing files, errors         |
| `color.text.primary`  | `#FFFFFF` | Main headings, monetary amounts, primary values         |
| `color.text.secondary`| `#94A3B8` | Field labels, timestamps, secondary identifiers         |

**Usage rules**

- Backgrounds must use `color.canvas`, `color.surface.base`, or `color.surface.alt`.
- Borders must use `color.border.subtle` or `color.border.strong`.
- Interactive primary elements must use `color.primary`.
- Advisory AI elements must use `color.advisory` only as an accent, never as a dominant background.
- Status colors (`resolved`, `needsReview`, `critical`) must be used consistently for their semantic roles.

### 2.2 Typography Tokens

| Token                 | Value                                      |
|-----------------------|--------------------------------------------|
| `font.family.ui`      | `Inter, system-ui, sans-serif`             |
| `font.family.mono`    | `JetBrains Mono, monospace`                |
| `font.weight.base`    | `400`                                      |
| `font.weight.medium`  | `500`                                      |
| `font.weight.semibold`| `600`                                      |
| `font.weight.bold`    | `700`                                      |
| `font.size.base`      | `16px`                                     |
| `font.lineHeight.base`| `1.5` (24px at 16px base)                  |

**Type scale (UI)**

- `text-xs`: 12px
- `text-sm`: 14px
- `text-md`: 16px
- `text-lg`: 18px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px

**Tabular monospace usage**

`font.family.mono` with `font-variant-numeric: tabular-nums` must be used for:

- Monetary values (`₹488.20`)
- Transaction and order identifiers (`ord_synth_004`, `pay_synth_004`)
- Bank UTR numbers (`UTR99887711`)
- Timestamps and relative age (`2h ago`)
- Version numbers (`v1`, `expected_version=1`)

### 2.3 Spacing Tokens (Base-8 + 4px Micro-Scale)

| Token       | Value | Applied Context                                              |
|-------------|-------|--------------------------------------------------------------|
| `space-1`   | 4px   | Micro-gap (icon-to-text, badge inner padding)                |
| `space-2`   | 8px   | Tight grouping (label-to-input, title-to-subtitle)           |
| `space-3`   | 12px  | Compact element padding (filter chips, dropdown triggers)    |
| `space-4`   | 16px  | Standard stack spacing (card gaps, list rows, table cells)   |
| `space-6`   | 24px  | Panel interior padding (case cards, decision container)      |
| `space-8`   | 32px  | Major column gutters, section headers, screen container      |

**Rules**

- All margins, paddings, and gaps must use these tokens.
- Arbitrary values (13px, 19px, 27px, etc.) are prohibited.

### 2.4 Radius, Shadow, and Motion Tokens

| Token          | Value                              |
|----------------|------------------------------------|
| `radius.xs`    | 2px                                |
| `radius.sm`    | 4px                                |
| `radius.md`    | 8px                                |
| `shadow.subtle`| `0 1px 2px rgba(0,0,0,0.3)`       |
| `shadow.card`  | `0 4px 12px rgba(0,0,0,0.4)`      |
| `motion.duration` | `150ms–220ms`                   |
| `motion.easing`   | `ease-out`                      |

**Motion rules**

- Motion is triggered only by state changes (drawer toggle, submit, conflict banner).
- Duration must be within `150ms–220ms` with `ease-out`.
- Perpetual animations, glowing borders, bouncing/floating cards, and animated gradients are prohibited.

---

## 3. Component-Level Rules

### 3.1 Exception Queue Table

**Context and goals**  
The Exception Queue is the primary work surface. It must read as a dense financial operations table, not a marketing hero.

**Anatomy**

- Context strip: live totals (`N cases need review · ₹X.XX total at risk`).
- Filter strip: search input, category dropdown, severity filters, sort controls.
- Table:
  - Header row.
  - Data rows with:
    - Severity indicator.
    - Plain-language anomaly summary (line 1).
    - Identifiers + exception badge (line 2).
    - Right-aligned monetary values (tabular monospace).
    - Action link/button (`Inspect`).

**Variants**

- Severity: `critical`, `high`, `medium`, `low` (mapped to `color.critical`, `color.needsReview`, etc.).
- Status: `needsReview`, `resolved`, `escalated`.

**States**

- `default`: clear row separation with `color.border.subtle`.
- `hover`: subtle background shift on `color.surface.alt` with visible row highlight.
- `focus-visible`: focused row or action must show `focus-visible: ring-2 ring-primary`.
- `loading`: skeleton rows matching exact geometry.
- `empty`: centered empty state with icon, headline, and guidance.

**Responsive behavior**

- Desktop: full table with all columns.
- Tablet: compress secondary columns, keep anomaly summary and amount visible.
- Mobile: stack into card-like rows with summary on top, metadata below.

**Keyboard, pointer, touch**

- `Tab` navigates through interactive elements (search, filters, row actions).
- `Enter`/`Space` on a focused row opens the case.
- Pointer hover highlights the row.
- Touch: rows must be tappable with adequate padding (`space-4` vertical minimum).

**Spacing and typography**

- Table cell vertical padding: `space-2`–`space-4`.
- Filter strip gaps: `space-2`–`space-3`.
- Anomaly summary: `text-sm` or `text-md`, `font.family.ui`.
- Monetary values: `font.family.mono`, `tabular-nums`.

**Long-content, overflow, empty-state**

- Anomaly summary must truncate with ellipsis after 2 lines on small screens.
- Identifiers must truncate gracefully with tooltip on hover/focus.
- Empty state: “All caught up. Zero financial exceptions require attention right now.” with `ShieldCheck` icon.

**Accessibility acceptance criteria**

- All interactive elements reachable via keyboard with visible focus ring.
- Color is not the only signal for severity/status; text labels and icons must be present.
- Contrast between text and background meets WCAG 2.2 AA.

**Anti-patterns**

- Oversized KPI cards pushing the queue below the fold.
- Decorative gradients or glowing effects around the table.
- Using color alone to indicate severity.

---

### 3.2 Filter Bar (Search, Category, Severity, Sort)

**Context and goals**  
Compact, high-density filter toolbar for the Exception Queue.

**Anatomy**

- Search input (Order ID / Payment ID / UTR).
- Category dropdown (`amount_mismatch`, `missing_settlement`, etc.).
- Severity filter (chips or dropdown).
- Sort control (discrepancy, amount, age).

**States**

- `default`: clear borders (`color.border.subtle`).
- `hover`: border color shifts to `color.border.strong`.
- `focus-visible`: ring-2 `color.primary`.
- `disabled`: reduced opacity, no interaction.
- `error`: red border (`color.critical`) with error message.

**Responsive behavior**

- Desktop: single row with compact inputs.
- Tablet/mobile: wrap into multiple rows, keep search and category most prominent.

**Keyboard, pointer, touch**

- All inputs and selects must be focusable and operable via keyboard.
- Dropdowns must be navigable with arrow keys.
- Touch targets minimum 44x44px.

**Spacing and typography**

- Gaps between controls: `space-2`–`space-3`.
- Input padding: `space-3` vertical, `space-4` horizontal.
- Labels and placeholders: `text-sm`, `font.family.ui`.

**Accessibility**

- Labels must be associated with inputs (`htmlFor` / `id`).
- Error messages must be linked via `aria-describedby`.

**Anti-patterns**

- Overly large, marketing-style filter sections.
- Hidden filters behind “More” buttons without clear indication.

---

### 3.3 Case Workspace (3-Column Desktop Layout)

**Context and goals**  
Persistent 3-column investigative layout for desktop (≥1280px): Context | Evidence | Decision.

**Anatomy**

- Header: case ID, severity, status, version, refresh action.
- Column 1 (22–25%): Case Context & Audit.
- Column 2 (42–48%): Evidence Comparison & Policy AI.
- Column 3 (30–33%): Human Decision Panel.

**Variants**

- Desktop: 3 columns.
- Tablet: 2 columns (Context+Evidence | Decision).
- Mobile: single stacked column.

**States**

- `default`: clear column separation with `space-8` gutters.
- `loading`: skeleton layout matching column structure.
- `error`: error banner at top of workspace.

**Keyboard, pointer, touch**

- Tab order: header → left column → center column → right column.
- All interactive elements within columns must be keyboard accessible.

**Spacing and typography**

- Column gutters: `space-8`.
- Panel internal padding: `space-6`.
- Headings: `text-lg`–`text-xl`, `font.weight.semibold`.
- Body: `text-sm`–`text-md`.

**Accessibility**

- Landmarks: use `aside` for side columns, `main` for evidence.
- Headings must reflect hierarchy.

**Anti-patterns**

- Collapsing core evidence behind tabs.
- Making AI the central focus instead of evidence.

---

## 4. Accessibility Requirements and Testable Acceptance Criteria

**Target**: WCAG 2.2 AA.

**Keyboard-first interactions**

- All interactive elements must be reachable and operable via keyboard alone.
- Focus order must be logical and follow visual layout.

**Focus-visible**

- All interactive elements must have visible focus indicators:
  - `focus-visible: ring-2 ring-primary outline-none`.

**Contrast constraints**

- Text/background contrast must meet WCAG 2.2 AA.
- Status colors must be paired with text labels and icons.

**Testable criteria**

- “All interactive elements must be reachable via Tab with visible focus ring.”
- “No information is conveyed by color alone.”
- “All form inputs have associated labels.”

---

## 5. Content and Tone Standards

**Tone**: concise, confident, implementation-focused.

**Examples**

- Anomaly summary:  
  “Bank credited ₹400.00, but ₹488.20 was expected.”
- Empty state:  
  “All caught up. Zero financial exceptions require attention right now.”
- Conflict banner:  
  “Another reviewer updated this case first. Your action was not saved. Please refresh.”

**Prohibited**

- Marketing fluff (“AI-powered magic”, “revolutionary”, etc.).
- Vague labels (“Process”, “Action”) without context.

---

## 6. Anti-Patterns and Prohibited Implementations

- Generic dark SaaS dashboards with gradients/glow.
- Oversized KPI walls pushing the queue below the fold.
- Chat-first AI interfaces.
- Hidden evidence behind tabs.
- Fake live claims and unsupported confidence percentages.
- Arbitrary spacing (13px, 19px, 27px).

---

## 7. QA Checklist

**For components**

- [ ] Uses only defined color, typography, and spacing tokens.
- [ ] All states defined and implemented (default, hover, focus-visible, active, disabled, loading, error).
- [ ] Keyboard, pointer, and touch behavior verified.
- [ ] Accessibility criteria met (focus, contrast, labels).
- [ ] Responsive behavior verified (desktop/tablet/mobile).

**For pages**

- [ ] Structure matches the design system layout.
- [ ] Narrative is clear (problem, solution, proof).
- [ ] No generic AI/SaaS patterns present.
- [ ] All components conform to their specs.
