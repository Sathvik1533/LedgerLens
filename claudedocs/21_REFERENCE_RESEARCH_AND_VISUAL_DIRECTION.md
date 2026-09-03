# Reference Research & Visual Direction

This document captures the visual research from premium developer-tool and SaaS design systems, prioritizing dense data presentation, trustworthy aesthetics, and high-fidelity interactions without resorting to generic "AI-generated" tropes. 
The research was conducted directly via browser agents inspecting the provided URLs.

## 1. Verified Observations & Principle Extraction

| Reference | Verified observations | Principle learned | LedgerLens adaptation | Pattern rejected |
|---|---|---|---|---|
| **Vercel / Aceternity** | High-density utilitarian whitespace, 1px strict translucent borders (`rgba(255,255,255,0.1)`), purely semantic color, negative tracking (-0.02em) on large headings, proportional monospace. True Pitch Black (#000000) base with luminous depth. | **Precision over Decoration**: Trust is built through structural clarity. Depth on dark mode is achieved through border luminosity and subtle surface lightness (#09090b), not shadows. | Implement a strict 1px border-grid system for tables and cards; use a deep canvas base with crisp, low-opacity borders to separate evidence cards. | Arbitrary rounded corners >12px; Decorative background gradients; Heavy animated particle emitters or neon glows that distract from financial data. |
| **OriginKit / ReactBits** | Typography: High-contrast sans-serif (Inter/Geist) with tight tracking on headers. Whitespace: Generous, strict bento-box grids. Surface: True black background, elevated dark gray cards (#0A0A0A). | **Subtle Containerization**: Let whitespace and ultra-thin borders define structure rather than heavy background fills. | Use 1px subtle borders for dashboard widgets and a true black background to reduce eye strain. Glowing hovers for active ledger rows. | Heavy drop-shadows on dark mode cards; Excessive animations on purely informational data tables. |
| **Mobbin / Godly.design** | Extreme restraint in typography. Proportional UI fonts (Inter, Manrope) used extensively. Monospace strictly reserved for technical IDs. Subtle off-white backgrounds (e.g., #F9F9FB) layered with pure white (#FFFFFF) cards. | **Typographic Restraint & Spatial Rhythm**: Legibility is paramount. Consistent spatial rhythm (8px/16px/24px scale) naturally guides the eye. Subtle surface contrast establishes depth. | Restrict monospace exclusively to IDs, UTRs, and monetary values. Use an off-white app background with pure white cards for light mode to make interactive elements pop. | Entire pages styled in monospace trying to look "technical"; Edge-to-edge content layouts without safe margins. |

## 2. Core Visual Principles for LedgerLens

1. **Typographic Authority:** Move away from the "broken hacker" all-monospace look. Adopt a highly legible proportional UI font with tight optical kerning for headings and standard tracking for body copy.
2. **Structural Integrity:** Favor sharp 1px borders and defined surfaces over floating, shadow-heavy elements. The app must feel like a stable, engineered tool for financial operators.
3. **Intentional Navigation:** Navigation must either be static or intelligently compact. It must never permanently obscure content (e.g., floating pills that cover table headers).
4. **Data Density with Breathing Room:** Macro gaps between major sections (64px+) must contrast with micro gaps (8px-16px) inside tables and cards to ensure data is readable but dense.
