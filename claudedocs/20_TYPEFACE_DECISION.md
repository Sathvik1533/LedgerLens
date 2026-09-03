# Typeface Decision & Typography Reset

## Executive Summary
The previous implementation overused `JetBrains Mono` and forced a mechanical "AI-generated" aesthetic that contradicted the goal of a premium, trustworthy SaaS application. This document outlines the typography reset, evaluating multiple candidates and establishing a strict usage matrix.

## Candidates Tested

### 1. Manrope
- **Strengths:** Excellent readability, modern geometric sans with a highly professional, neutral tone. Renders numbers beautifully.
- **Weaknesses:** Slightly wide in tabular contexts.
- **Verdict:** Excellent for UI/Body.

### 2. Plus Jakarta Sans
- **Strengths:** High-end "fintech" feel, excellent legibility, crisp rendering on high-DPI displays.
- **Weaknesses:** Can feel slightly over-styled for very dense data tables.
- **Verdict:** Selected as the primary Display/Heading font.

### 3. Inter
- **Strengths:** The industry standard for dense UI. Perfect x-height, flawless tabular lining (`tnum`) support for rupees and numbers.
- **Weaknesses:** Can feel generic if used for everything including marketing headers.
- **Verdict:** Selected as the primary UI/Body font.

### 4. JetBrains Mono
- **Strengths:** Great for code.
- **Weaknesses:** Felt broken, mechanical, and "hacker-themed" when used for UI elements like buttons, small labels, and table headers.
- **Verdict:** Rejected from general UI. Restricted strictly to actual UUIDs, hashes, and UTRs.

## The Final Typography System

We have chosen a **Dual-Sans** approach, completely eliminating monospace from standard UI components.

1. **Display / Headings:** `Plus Jakarta Sans`
   - Used for marketing headlines, page titles, and empty state titles.
   - Conveys premium fintech authority.
2. **UI / Body / Tables:** `Inter`
   - Used for navigation, buttons, table rows, paragraphs, labels.
   - Enforces a clean, readable, and highly familiar layout.
3. **Numeric (Money/Dates):** `Inter` with `tabular-nums`
   - By enabling tabular lining on Inter, we get perfectly aligned financial columns without the "broken typewriter" look of a full monospace font.
4. **Monospace (Restricted):** `Inter` or standard system sans (We removed JetBrains Mono entirely).

## Browser-Rendered Verification
- **Rupee Symbol:** Both Inter and Plus Jakarta Sans render `₹` perfectly without fallback glyph substitution.
- **Computed Styles:** The CSS rule `.font-mono` has been redefined to fallback to standard sans-serif to instantly cure the mechanical aesthetic across the legacy components, while preserving explicit spacing where needed.
- **Readability:** Contrast and line-heights now adhere to premium SaaS benchmarks (e.g., Envato, App10).

## Why Rejected Combinations Failed
Forcing a true monospace (JetBrains Mono) onto table headers, badges, and standard numerical amounts created a disjointed, "developer-tool" vibe rather than a trustworthy financial controller. It felt "AI-generated" because many AI tools default to monospace to look "technical." We have replaced this with a deliberate, human-centered design.
