# LedgerLens — DESIGN.md

## Status

**Direction:** Editorial Evidence System
**Working visual world:** The Reconciliation Room
**Status:** Directional specification for Phase 1 implementation; owner approval required after screenshot review.
**Last updated:** 2026-09-04

## 1. Product truth

LedgerLens helps finance operators find out why money captured by a business does not match the money reported by a gateway or credited by a bank. It compares four financial records, isolates the exact difference, surfaces the relevant operating rule, and records the human decision.

The core promise is not “high-throughput reconciliation.” It is **confidence when the numbers disagree**.

The primary user is a finance controller or operations reviewer who must answer quickly and defensibly: what happened, where did the amount change, what evidence supports that conclusion, and what should we do next?

## 2. Emotional premise

> When the numbers stop agreeing, LedgerLens gives the operator a calm, exact path from doubt to a signed decision.

The product should make a user feel:

- Oriented rather than overwhelmed.
- Confident rather than suspicious of every number.
- In control rather than trapped in a report.
- Able to explain the decision to another person later.

It must never feel like a surveillance console, a developer terminal, a casino dashboard, or a generic AI finance template.

## 3. Brand thesis and voice

**Brand thesis:** Every amount leaves a trace. Every discrepancy can be explained. Every human decision deserves a record.

**Voice:** Composed, exact, human, evidence-led, quietly confident.

Write in the order of the operator’s question:

1. What happened?
2. What is different?
3. Which record proves it?
4. Which rule explains it?
5. What can I decide now?
6. What will be recorded?

Prefer “The bank credit is ₹150 short” over “A settlement invariant failed.” Prefer “Review the two credits” over “Resolve duplicate-bank-credit exception.” Technical language may appear as supporting detail, never as the first explanation.

Avoid hype, fake certainty, unexplained acronyms, and performance claims in the first viewport.

## 4. Signature metaphor

**The Reconciliation Line:** four source records travel as distinct colored lines across the product. They remain identifiable until a line diverges, terminates, or doubles. The discrepancy is marked with a physical redline and a short explanation. The lines then converge into a signed decision and an audit receipt.

This metaphor is a system, not a decorative hero illustration. Use it in:

- Landing hero.
- Case trace.
- Methodology sequence.
- Queue risk summaries when useful.
- Audit chronology.

Do not draw a complex trace where a table is more useful. Do not animate lines continuously without a user-relevant state change.

## 5. Art direction

### Overall world

A quiet financial evidence room: warm paper, dark ink, thin registration marks, red pencil corrections, source slips, and carefully placed lines. The experience should feel authored and tactile without pretending to be skeuomorphic accounting software.

### Materials

- Deep ink canvas for high-attention narrative moments.
- Warm mineral/paper surfaces for evidence and reading.
- Fine rules and registration marks for structure.
- Soft paper shadows, not floating glass cards.
- Oxide red for the exact discrepancy only.
- Quiet grain or texture only if it remains performant and does not reduce legibility.

### Composition

Use editorial asymmetry, deliberate margins, and a strong left-to-right reading path. Give the primary fact room to breathe. Use dense grids only for operator scanning surfaces such as queues and evidence tables.

## 6. Color semantics

| Token role | Direction | Meaning |
| --- | --- | --- |
| Ink | Deep blue-black | Investigation, seriousness, focus |
| Paper | Warm mineral white | Evidence, reading, explanation |
| Capture | Muted green | Merchant payment source |
| Settlement | Oxide/coral | Gateway settlement source; not automatically danger |
| Refund | Ochre | Refund or reversal source |
| Bank | Dusty blue | Bank credit source |
| Discrepancy | Strong oxide red | Exact mismatch, never decoration |
| Verified | Deep teal/green | Confirmed, matched, cited |
| Attention | Burnished amber | Pending review, caution |
| Muted | Warm gray | Metadata, secondary explanation |

Use color sparingly. A red element must answer “what is wrong?” A green element must answer “what is confirmed?” Do not use four bright chart colors by default.

## 7. Typography

Use three intentional roles, with accessible sizes:

| Role | Use | Behavior |
| --- | --- | --- |
| Display serif or distinctive display | Hero statements, major section titles, key case conclusion | Large, expressive, calm; never used for dense data |
| Humanist or neutral sans | Body copy, controls, labels, decisions | High readability, generous line height |
| Restrained utility face | IDs, timestamps, amounts, technical metadata | Used selectively; never for whole pages |

Do not make every label uppercase. Do not use tiny type to imply sophistication. Do not let IDs, UUIDs, RPS, cosine scores, or database terms compete with the discrepancy and decision.

## 8. Spacing and scale

Use an editorial rhythm:

- 8px base unit.
- 16px minimum interactive gap.
- 24–32px content grouping gap.
- 48–72px section separation.
- 96px+ breathing room for major narrative moments on desktop.
- 20–24px page padding on mobile.

Prefer fewer, larger blocks over many small cards. Keep paragraph measure around 55–75 characters where possible. Avoid walls of metadata.

## 9. Interaction and motion

Motion should reveal relationships:

- Trace lines draw only when a source relationship is introduced.
- Discrepancy redlines appear when the mismatch is explained.
- Evidence slips settle into alignment when loaded.
- Decision confirmation produces a quiet receipt state.
- Tabs and accordions transition quickly and preserve focus.

Keep common transitions under 240ms. Avoid perpetual motion, scroll hijacking, cursor gimmicks, and decorative 3D. Honor `prefers-reduced-motion` with instant state changes.

## 10. Page-expression map

| Surface | Expression | Primary question |
| --- | --- | --- |
| Landing | Cinematic editorial trace | Why should I trust this investigation? |
| How it works | Sequential evidence story | How does doubt become confidence? |
| Queue | Review desk, dense but calm | What needs my attention first? |
| Case workspace | Evidence table + trace + decision panel | What happened and what should I sign? |
| Ingestion | Guided intake desk | What am I adding and what will be validated? |
| Policy library | Reading room / indexed precedent | Which rule applies and why? |
| Audit | Chronological receipt book | What was decided, by whom, and when? |
| Settings | Contract register | Which rules and thresholds are active? |
| Docs | Clear reference library | How do I understand the system? |
| Evaluation | Method card / proof room | How was this measured? |

## 11. Marketing-to-product continuity

The landing page introduces the Reconciliation Line. The case workspace proves it. The methodology explains it. The queue prioritizes breaks in it. The policy library explains rules behind it. The audit page records what happened after it.

The marketing page may be more spacious and cinematic. The product may be denser and more operational. They must still share:

- Typography roles.
- Color semantics.
- Line/redline metaphor.
- Material language.
- Voice.
- Evidence-first hierarchy.

## 12. Component principles

Create shared primitives for:

- Trace/source legend.
- Discrepancy marker.
- Evidence slip.
- Status label.
- Source badge.
- Policy citation.
- Decision receipt.
- Section eyebrow.
- Empty/loading/error state.

A component must have a product reason before it becomes a shared primitive. Do not create a library of visual wrappers that all look like cards.

## 13. Content rules

Every important screen should make the following visible in plain language:

- The amount expected.
- The amount observed.
- The difference.
- The source of the difference.
- The rule or evidence.
- The recommended next step.
- The decision that can be recorded.

Move technical details behind progressive disclosure. Keep exact IDs and citations available, but subordinate them to the human decision.

## 14. Accessibility and resilience

Maintain strong contrast on paper and ink surfaces. Never use color as the only status signal. Provide text labels, visible focus, keyboard reachability, screen-reader names, reduced motion, 200% zoom support, and usable 320px/375px layouts.

Every async surface needs intentional loading, empty, error, retry, disabled, and success states. A blank frame is not a loading state.

## 15. Anti-patterns

Reject:

- Generic dark SaaS dashboard treatment.
- Excessive pills and rounded cards.
- Tiny uppercase labels everywhere.
- Neon gradients.
- Decorative terminal copy.
- Unexplained RPS or AI claims in the hero.
- Random glassmorphism.
- Unrelated 3D objects.
- Unreadable dense metadata.
- A cinematic landing page followed by generic product screens.
- Color used without semantic meaning.
- “Premium” expressed only through shadows and blur.

## 16. Phase 1 acceptance criteria

Phase 1 is complete only when:

- The landing page tells the financial story before technical implementation details.
- The case workspace makes expected, actual, difference, evidence, policy, and decision visible in one coherent composition.
- The two surfaces share the Reconciliation Line, typography roles, material language, and color semantics.
- Desktop and 375px screenshots are captured for both surfaces.
- The owner or designated reviewer records whether the direction feels like LedgerLens rather than a generic AI finance dashboard.
- Unverified behavior is labeled unverified.

This document is a direction, not permission to change backend behavior or invent product claims.
