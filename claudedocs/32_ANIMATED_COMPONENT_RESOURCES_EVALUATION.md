# Animated Component Resources Evaluation & Adaptation Protocol
**Libraries Evaluated:** AnimasterLib (Animaster UI), Skiper UI, Vengeance UI  
**Target Product:** LedgerLens (Cinematic Ledger / The Living Ledger)  
**Status:** Evaluation Complete & Approved Components Selected

---

## 1. Evaluation Premise & Filtering Criteria

AnimasterLib, Skiper UI, and Vengeance UI represent modern animated component ecosystems built for React, Next.js, Tailwind CSS, and shadcn/ui. While technically capable, their out-of-the-box styling targets generic SaaS, crypto, or developer portfolio aesthetics: neon glow accents, floating glass cards, WebGL shaders, cursor trails, and high-frequency visual movement.

In accordance with the project directives, these libraries are treated as **optional component resources**. Every component is screened against four inviolable filters:

```
                          FOUR-FILTER ADAPTATION FUNNEL
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. VISUAL WORLD ALIGNMENT: Supports calm, mineral Living Ledger?       │
  │    (Zero neon, zero glassmorphism, zero crypto/AI demo aesthetic)      │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 2. INTERACTION GOALS: Solves an operational financial review task?     │
  │    (Enhances clarity, data scanning, or state transitions)             │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 3. ACCESSIBILITY REQUIREMENTS: WCAG 2.1 AA compliant?                 │
  │    (prefers-reduced-motion, ARIA semantics, keyboard navigation)       │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 4. PERFORMANCE BUDGET: Zero runtime bloat?                             │
  │    (Pure CSS / lightweight Framer Motion; no Three.js or heavy canvas) │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Component Rejection Log (Anti-Patterns)

The following components from the three libraries are **explicitly rejected** to protect the project's visual integrity:

| Library | Component Pattern | Evaluation & Reason for Rejection |
|---|---|---|
| **AnimasterLib** | WebGL Shader & Noise Backgrounds | **REJECTED.** Distracting visual noise. Destroys the tactile physical paper and deep ink reality. Unacceptable GPU overhead during tabular data rendering. |
| **AnimasterLib** | Magnetic Cursor & Cursor Trails | **REJECTED.** Gimmicky and disorienting. Hinders precise cursor aiming on dense financial rows and copy-to-clipboard actions. |
| **Skiper UI** | 3D Tilt Cards & Parallax Layers | **REJECTED.** Skews financial evidence slips at angles, distorting monetary amounts and violating the seriousness of financial audit documents. |
| **Skiper UI** | Card Stack Scroll Overlays | **REJECTED.** Obscures previous records and introduces unpredictable scroll hijacking. Violates smooth tabular scanning. |
| **Vengeance UI** | Neon Radial Glow & Shining Borders | **REJECTED.** Violates the locked mineral palette (`#3D6B55`, `#B94E3D`, `#A87931`). Makes the product look like a gaming or crypto tool. |
| **Vengeance UI** | ASCII Ripple & Glitch Text | **REJECTED.** Financial figures and audit trails must communicate mathematical permanence, not unstable hacker/glitch motifs. |
| **Vengeance UI** | Floating Glassmorphism Cards | **REJECTED.** Translucent blurry panels reduce contrast and violate the tactile document metaphor of physical evidence slips. |

---

## 3. Approved Component Selections & Design System Restyling

Only components that solve concrete financial interaction problems and can be restyled 100% into the **Cinematic Ledger** design system are selected:

### Selection 1: Tabular Rolling Number Ticker (`RollingNumberTicker`)
- **Source Pattern:** Vengeance UI / Skiper UI stats counter.
- **Operational Need:** In the Dashboard and Review Queue, displaying large exposure sums (e.g. ₹3,88,177.84) and case counts benefit from an authoritative, mechanical count-up on load that reinforces mathematical verification.
- **Restyling Protocol:**
  - Font: Strict `IBM Plex Mono` with `tabular-nums` and `lining-nums`.
  - Currency: Permanent prefix `₹` locked in place without jitter.
  - Colors: Primary ink (`#1C1B19`) or Oxide red (`#B94E3D`) for exposure.
  - Motion: Smooth ease-out duration (800ms); instantly renders final value when `prefers-reduced-motion` is active.

### Selection 2: Tactile Sliding Segmented Indicator (`TactileSegmentedControl`)
- **Source Pattern:** Skiper UI layout tabs.
- **Operational Need:** In `IngestionFeedsPage.tsx`, operators switch between 4 feeds (Payments, Settlements, Refunds, Bank Credits). A tactile physical indicator clarifies the active feed without abrupt layout jumps.
- **Restyling Protocol:**
  - Container: Mineral canvas background (`#EFECE4`) with fine quiet rule (`#D8D2C8`).
  - Active Slider: Clean white surface (`#FFFFFF`) with subtle paper shadow (`0 1px 2px rgba(28,27,25,0.06)`).
  - Typography: `Instrument Sans` medium, sentence case.
  - Accessibility: Full `role="tablist"` / `role="tab"` ARIA roles with keyboard arrow key navigation.

### Selection 3: Calibrated Audit Disclosure Accordion (`CalibratedAccordion`)
- **Source Pattern:** Skiper UI / Vengeance collapsible disclosure.
- **Operational Need:** In `PolicyKnowledgePage.tsx` and `RagCopilotPanel.tsx`, legal clauses and technical vector embeddings must be accessible on demand without overwhelming the primary evidence reading path.
- **Restyling Protocol:**
  - Dividers: Quiet hairline rules (`#D8D2C8`).
  - Trigger: Clean hover states with subtle rotate indicator (`transform 200ms ease`).
  - Typography: Newsreader headings with Instrument Sans descriptions and IBM Plex Mono metadata badges.
  - Accessibility: Native `<button>` toggle with `aria-expanded` and semantic region panel.

### Selection 4: Illuminated Sequential Trace Connector (`SequentialTraceLine`)
- **Source Pattern:** AnimasterLib connected steppers.
- **Operational Need:** In `HowItWorksPage.tsx`, visually connecting Stage 01 through Stage 05 as an active audit pipeline.
- **Restyling Protocol:**
  - Line: Fine 1px vertical hairline in Ledger Green (`#3D6B55`) or Quiet Rule (`#D8D2C8`).
  - Node: Small 6px solid circular ink terminal.
  - Zero neon, zero pulsing glow.

---

## 4. Implementation Schedule

1. Build modular components in `frontend/src/components/ui/`:
   - `RollingNumberTicker.tsx`
   - `TactileSegmentedControl.tsx`
   - `CalibratedAccordion.tsx`
   - `SequentialTraceLine.tsx`
2. Integrate into target routes:
   - `DashboardPage.tsx` & `QueuePage.tsx`: Add `RollingNumberTicker` to monetary metrics.
   - `IngestionFeedsPage.tsx`: Replace static tab buttons with `TactileSegmentedControl`.
   - `HowItWorksPage.tsx`: Connect the 5 stages with `SequentialTraceLine`.
   - `PolicyKnowledgePage.tsx`: Implement `CalibratedAccordion` for policy sections.
3. Verify accessibility, responsive behavior, and bundle performance.
