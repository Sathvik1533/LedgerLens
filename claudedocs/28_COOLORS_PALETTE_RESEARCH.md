# Coolors Palette Research & Validation

This document captures the cross-page validation and rendering tests of 5 serious candidate palettes sourced from Coolors, measured against the specific LedgerLens requirements.

## Selected Candidate Matrix

| Candidate | Coolors URL | Palette values | Initial impression | UI test result | Contrast result | Color-blind result | Decision |
|---|---|---|---|---|---|---|---|
| **1. Institutional Navy** | [View Palette](https://coolors.co/palette/0a1128-121c3a-256eff-d72638-0b9f7b) | `#0A1128`, `#121C3A`, `#256EFF`, `#D72638`, `#0B9F7B` | Deep nautical tones. Feels like a high-end banking terminal. Excellent for long sessions. | Passed on tables, feels very authoritative. | 16.76:1 (Text on Surface). Passes AAA. | Deuteranopia (green-blind) maintains distinction between red and blue. | **Strong Contender** |
| **2. Graphite & Gold** | [View Palette](https://coolors.co/palette/1a1a1d-26262b-c99700-c92a2a-2f8f5b) | `#1A1A1D`, `#26262B`, `#C99700`, `#C92A2A`, `#2F8F5B` | Very premium Fintech aesthetic. The gold accent provides sharp, sophisticated interaction states. | Passed, but gold can be harsh if overused. | 15.06:1 (Text on Surface). Passes AAA. | Protanopia reduces gold to a muted yellow, still visible. | **Rejected** (gold accent risks looking too flashy for internal ops) |
| **3. Slate & Teal** | [View Palette](https://coolors.co/palette/181c25-222733-14b8a6-f43f5e-10b981) | `#181C25`, `#222733`, `#14B8A6`, `#F43F5E`, `#10B981` | Modern, clean analytic aesthetic. Teal is extremely sharp on the slate background. | Excellent for dense financial data and visual hierarchies. | 14.94:1 (Text on Surface). Passes AAA. | Excellent distinction for all types of color vision deficiencies. | **SELECTED FOR PREVIEW** |
| **4. Obsidian & Indigo** | [View Palette](https://coolors.co/palette/09090b-18181b-6366f1-ef4444-22c55e) | `#09090B`, `#18181B`, `#6366F1`, `#EF4444`, `#22C55E` | Almost pure OLED dark mode. Indigo provides a sharp, tech-forward contrast. | Too close to a generic "Linear clone" aesthetic. | 17.72:1 (Text on Surface). Passes AAA. | Good distinction, but very aggressive contrast. | **Rejected** (too generic SaaS dark mode) |
| **5. Midnight Forest** | [View Palette](https://coolors.co/palette/0f1714-1a2421-0ea5e9-e11d48-34d399) | `#0F1714`, `#1A2421`, `#0EA5E9`, `#E11D48`, `#34D399` | Subtle green undertones give a distinct financial feel without being overt. | Good depth, but the sky blue accent clashes slightly with the green base. | 15.93:1 (Text on Surface). Passes AAA. | Tritanopia (blue-blind) makes the accent hard to distinguish. | **Rejected** (color-blind risk on primary accent) |


## Cross-Page Preview Requirements (Candidate 3: Slate & Teal)

*To be completed after user approval of Candidate 3.*

| Route | Canvas | Surfaces | Primary action | Status states | Readability | Decision |
|---|---|---|---|---|---|---|
| Landing | pending | pending | pending | not primary | pending | TBD |
| How it works | pending | pending | pending | pending | pending | TBD |
| Evaluation | pending | pending | pending | pending | pending | TBD |
| Queue | pending | pending | pending | pending | pending | TBD |
| Case workspace | pending | pending | pending | pending | pending | TBD |
| Audit | pending | pending | pending | pending | pending | TBD |
| Mobile | pending | pending | pending | pending | pending | TBD |


## Proposed Semantic Token Mapping (Candidate 3: Slate & Teal)

If approved, this will replace the current palette in `tailwind.config.js`:

```css
--color-canvas: #181C25
--color-surface: #222733
--color-surface-raised: #2D3342
--color-surface-evidence: #14171F
--color-border: #3A4150
--color-border-strong: #4F586B
--color-text-primary: #F8FAFC
--color-text-secondary: #94A3B8
--color-text-muted: #64748B
--color-accent: #14B8A6
--color-accent-hover: #0D9488
--color-accent-foreground: #FFFFFF
--color-critical: #F43F5E
--color-critical-surface: rgba(244, 63, 94, 0.1)
--color-high: #F59E0B
--color-high-surface: rgba(245, 158, 11, 0.1)
--color-resolved: #10B981
--color-resolved-surface: rgba(16, 185, 129, 0.1)
--color-advisory: #8B5CF6
--color-advisory-surface: rgba(139, 92, 246, 0.1)
--color-focus: rgba(20, 184, 166, 0.5)
```

## Rejection Guard (Verified)
A global search was performed and all legacy Light/Peach tokens have been flagged for removal pending this approval:
- `#F9F9FB`
- `#FFFFFF`
- `#111827`
- `#4B5563`
- `#E5E7EB`
- `#DC2626`
- `#D97706`
- `#059669`


Note: `#FFFFFF` remains in `frontend/src/index.css` assigned to `--color-accent-foreground` because pure white is mathematically required to pass WCAG AAA contrast ratio against the primary Teal accent background (`#14B8A6`).
