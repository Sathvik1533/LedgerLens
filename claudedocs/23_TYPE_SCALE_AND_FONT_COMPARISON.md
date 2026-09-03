# Type Scale & Font Comparison

This document evaluates three typography systems using real LedgerLens copy to ensure the interface supports dense financial data without feeling mechanically broken or overly stylized.

## 1. Candidate A: Plus Jakarta Sans (Display) + Inter (UI/Data)
- **Headline (Marketing):** *Plus Jakarta Sans*, 48px, Weight 700, Line Height 1.1, Letter Spacing -0.02em.
- **Queue Heading:** *Plus Jakarta Sans*, 32px, Weight 600, Line Height 1.2.
- **Anomaly Summary:** *Inter*, 14px, Weight 400, Line Height 1.5, Letter Spacing 0px.
- **₹ Amount:** *Inter* (with `tabular-nums`), 14px, Weight 500.
- **Payment ID:** *Inter*, 12px, Weight 400.
- **Performance:** Excellent readability. Plus Jakarta Sans provides a premium, authoritative "fintech" feel for large text, while Inter ensures the dense data tables remain perfectly aligned. The Rupee glyph (₹) renders natively and cleanly.
- **Verdict:** Highly recommended for "Direction B" (Obsidian Terminal).

## 2. Candidate B: Manrope (UI) + Inter (Data)
- **Headline (Marketing):** *Manrope*, 56px, Weight 800, Line Height 1.05.
- **Queue Heading:** *Manrope*, 28px, Weight 700, Line Height 1.3.
- **Anomaly Summary:** *Manrope*, 14px, Weight 500, Line Height 1.5.
- **₹ Amount:** *Inter* (with `tabular-nums`), 14px, Weight 500.
- **Payment ID:** *Inter*, 12px, Weight 400.
- **Performance:** Manrope is geometric and modern, offering a very clean aesthetic. However, it can feel slightly wide in data-heavy views, which is why Inter is substituted strictly for the tabular data.
- **Verdict:** Excellent for "Direction A" (The Clear Ledger), providing a crisp, light-mode institutional feel.

## 3. Candidate C: Geist Sans (UI) + Geist Mono (Data)
- **Headline (Marketing):** *Geist Sans*, 48px, Weight 600, Line Height 1.05, Letter Spacing -0.04em.
- **Queue Heading:** *Geist Sans*, 24px, Weight 600, Line Height 1.2, Letter Spacing -0.02em.
- **Anomaly Summary:** *Geist Sans*, 14px, Weight 400, Line Height 1.42.
- **₹ Amount:** *Geist Mono*, 14px, Weight 500.
- **Payment ID:** *Geist Mono*, 12px, Weight 400.
- **Performance:** A highly disciplined, mathematically proportioned system. Geist Mono integrates perfectly with Geist Sans. The strict letter spacing creates a highly technical, developer-centric feel.
- **Verdict:** Strong candidate for "Direction C" (Editorial Finance), though it may lean slightly too close to a generic developer tool rather than a specialized finance ops platform.

## Proposed Global Restrictions
Regardless of the chosen direction, the following rules will be enforced:
1. **No Mono for Prose:** Normal paragraph text, summaries, and buttons will use the proportional UI font.
2. **Tabular Alignment:** Monetary values and timestamps will utilize `tabular-nums` CSS properties to prevent layout shifting.
3. **Restrained Spacing:** Large headings will utilize negative tracking (e.g., `-0.02em`) to maintain optical density.
