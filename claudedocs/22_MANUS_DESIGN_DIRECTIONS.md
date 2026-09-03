# Manus Design Directions

Based on the research phase and the requirement to move away from generic AI templates, I am presenting three distinct visual directions tailored specifically for a Finance Operations Control Room.

## Direction A: "The Clear Ledger" (Institutional Light)
- **Visual Thesis:** A highly trustworthy, paper-like interface that prioritizes extreme legibility and data density. It evokes a modern banking terminal built for 2026.
- **Typography Pair:** `Manrope` (Headings & UI) + `Inter` (Data/Body) + `Geist Mono` (Strictly for UUIDs/UTRs).
- **Color Palette:**
  - Canvas: `#F9F9FB` (Off-white paper)
  - Surfaces: `#FFFFFF` with `1px solid #E5E7EB`
  - Text Primary: `#111827` (Near black)
  - Semantic: `#DC2626` (Critical), `#D97706` (High/Review)
- **Layout Principles:** Flat design. Zero drop shadows. Strict 4pt/8pt grid.
- **Navigation Model:** Top-aligned static navigation on public pages (scrolls away). Fixed, slim sidebar for the app shell with independent scrolling.
- **Case Workspace:** 2-column layout. Left column for evidence comparison (bento style, but flat), right column for the read-only AI advisory and human decision log.
- **Why it fits LedgerLens:** It is sober, professional, and rejects the "dark mode hacker" trope, making it accessible for extended finance operations work.

## Direction B: "Obsidian Terminal" (Precision Dark)
- **Visual Thesis:** A high-contrast, edge-to-edge dark environment focused on reducing eye strain during long-duration anomaly hunting. Inspired by Vercel and Aceternity, but stripped of decorative animations.
- **Typography Pair:** `Plus Jakarta Sans` (Display/Marketing) + `Inter` (App UI/Data) + `JetBrains Mono` (Restricted to technical codes).
- **Color Palette:**
  - Canvas: `#000000` (True Pitch Black)
  - Primary Surface: `#09090B` (Deep Zinc)
  - Borders: `rgba(255, 255, 255, 0.1)` (10% White)
  - Text Primary: `#FAFAFA`
  - Semantic: `#EF4444` (Critical), `#F59E0B` (Advisory)
- **Layout Principles:** Depth achieved entirely through border luminosity and subtle background lightness shifts.
- **Navigation Model:** Public site uses a compact sticky header with `backdrop-filter: blur(12px)`. App uses a fixed top bar (not floating pills) that pushes content down.
- **Case Workspace:** Edge-to-edge grid lines. Evidence blocks sit in `#09090B` containers separated by 1px luminous borders.
- **Why it fits LedgerLens:** It feels highly engineered and secure. By removing gradients and neon glows, it elevates the dark theme from "startup landing page" to "enterprise control room."

## Direction C: "Editorial Finance" (Monochrome & Accent)
- **Visual Thesis:** A stark, high-contrast black-and-white theme with a single, aggressive accent color (e.g., Vermilion or deep Blue) to direct attention exclusively to financial discrepancies.
- **Typography Pair:** `Geist Sans` (UI & Body) + `Geist Mono` (Data & Financials).
- **Color Palette:**
  - Canvas: `#FFFFFF`
  - Primary Surface: `#F5F5F5`
  - Borders: `#000000` (Harsh, editorial 1px borders)
  - Accent/Primary Action: `#FF3B30` (Vermilion)
  - Text Primary: `#000000`
- **Layout Principles:** Brutalist but refined. Heavy use of whitespace, strict alignment, and stark contrasts.
- **Navigation Model:** Thick borders separating the navigation from content. Static scroll-away behavior.
- **Case Workspace:** The anomaly is highlighted in the stark accent color against the monochrome grid, making the problem instantly identifiable.
- **Why it fits LedgerLens:** It treats financial anomalies as critical editorial information. The lack of ambient color forces focus entirely onto the data and the required human decision.

*Awaiting User Approval on one of the above directions before proceeding with implementation.*
