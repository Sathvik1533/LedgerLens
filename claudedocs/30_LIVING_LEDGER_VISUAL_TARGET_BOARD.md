# LedgerLens Visual Target Board — The Living Ledger

## 1. Locked Palette
- **Canvas:** `#F4F1EA` (Light-first mineral canvas for public & primary pages)
- **Ink (Primary Text & Frame):** `#1C1B19`
- **Secondary Ink (Labels, Descriptions, Meta):** `#716E68`
- **Quiet Rule (Dividers, Borders, Table Gridlines):** `#D8D2C8`
- **Ledger Green (Reconciled, Resolved, Trusted parity):** `#3D6B55`
- **Oxide Red (Discrepancies, Redlines, Exceptions, Material Risk):** `#B94E3D`
- **Brass (Pending review, Policy Notes, Advisory judgment):** `#A87931`
- **Blue (Deep links, Provenance citations, Focus rings):** `#385D82`
- **Operator Workspace Dark Mode (Optional Reading Mode):**
  - Dark Canvas: `#161514`
  - Dark Surface: `#201F1D`
  - Dark Rule: `#2F2D2A`
  - Dark Primary Ink: `#F4F1EA`
  - Dark Muted Ink: `#9E9A92`

## 2. Locked Typography Hierarchy
- **Newsreader** (`500–600`):
  - Used for: Major page mastheads, editorial introductions, case titles, high-level narrative statements.
  - Never used for: Data tables, operator buttons, form inputs, tooltips, or numbers.
- **Instrument Sans** (`400–600`):
  - Used for: Primary UI, navigation items, column headers, form labels, body text, explanation notes, buttons.
  - Weights: `400` (Body), `500` (Labels & Controls), `600` (Section Anchors).
  - Sentence case everywhere (no all-caps buttons or titles).
- **IBM Plex Mono** (`400`):
  - Used strictly for: Payment IDs (`pay_...`), case UUIDs, UTRs, timestamps, currency amounts (`tabular-nums`), math formulas, hash signatures.
  - Never used as general decorative texture or in prose.

## 3. Spacing Scale & Rhythms
- **Grid Unit:** 4px base / 8px modular cadence.
- **Rules & Dividers:** 1px hairline rules (`#D8D2C8`). No heavy box-shadows, no rounded-full card nesting.
- **Table Density:** 42px row height in queue, flush alignment, right-aligned monetary values, left-aligned strings.
- **Pacing:** Generous whitespace between narrative sections; compact, disciplined density within tables and evidence slips.

## 4. Visual Metaphors (The Living Ledger)
- **Ledger Lines:** Subtle ruling lines (`#D8D2C8`) establishing clear geometric alignment and transparent arithmetic.
- **Evidence Slips:** The four records (Payment, Settlement, Refund, Bank Credit) presented as distinct traceable slips with visible source provenance, not generic feature cards.
- **Margin Notes:** Policy guidance positioned alongside the discrepancies they explain—like notes written in the ledger margin.
- **Redline Exceptions:** A surgical oxide-red line (`#B94E3D`) drawn through mismatched amounts or flagging uncredited funds.
- **Bound Volumes:** Clear, authored structure to each page: an editorial beginning, an operational body, and an accountable close with dated receipts.

## 5. Copy & Tone Standards
- "Reconcile new records" (not "Run Recon Engine" or "Execute Loop")
- "Record review decision" (not "Human Decision Panel" or "Submit Review")
- "Review exceptions" / "Review queue" (not "Exception Control Room")
- "Open evidence" (not "View Case")
- "Policy note" (not "AI copilot")
- "Approved policy library" (not "RAG grounding engine")
- "Search operating rules" (not "Semantic policy retrieval playground")
- "Decision recorded to ledger" (not "Permanent state transition")

## 6. Anti-Patterns Explicitly Banned
- ❌ No pastel or neon glows
- ❌ No literal paper textures, skeuomorphic wrinkles, or fake handwriting
- ❌ No floating glass docks with heavy backdrop blur
- ❌ No decorative terminal typing logs or data stream animations
- ❌ No robots, coins, calculators, or AI illustration tropes
- ❌ No `3-way` vs `4-way` discrepancy (4-source model strictly enforced everywhere)
- ❌ No raw `[object Object]` error messages
- ❌ No unpersisted or silent form submissions

