# LedgerLens — Consolidated Product Understanding, Contradiction Audit, and Design Exploration

**Prepared by:** Manus AI  
**Date:** 2 September 2026  
**Status:** Design exploration and audit; no implementation code or repository changes

## 1. Executive understanding

LedgerLens is a **financial reconciliation control room** for finance operations analysts and controllers who investigate discrepancies among captured payments, gateway settlement batches, customer refunds, and core-bank credits. Its value is not that it “uses AI” to make financial decisions. Its value is that it turns a fragile, spreadsheet-heavy investigation into a traceable operational loop: deterministic matching identifies the exception, the interface preserves the relevant evidence in one view, policy retrieval explains the applicable contractual context, and a human records an accountable decision under optimistic concurrency control. This product framing is consistent across the vision brief, README, data contracts, and user stories.[1] [2] [3] [4]

The primary user is `finance_ops_reviewer`, whose daily objective is rapid triage of unreconciled transactions by exposure and exception type. The secondary user is a controller or auditor who needs to verify the integrity of the matching rules, inspect source evidence, confirm that AI did not mutate state, and follow the actor-stamped audit trail from one case version to the next. The product therefore has two distinct modes of trust: **deterministic system facts** and **human-accountable interpretation**. The advisory RAG layer is useful only inside that boundary; it can retrieve and summarize local policy citations, but it must not decide, approve, alter ledger state, or replace the reviewer.[1] [2]

The current documentation is unusually explicit about the operational core: the queue is the primary work surface; investigation is a three-column workspace; evidence must remain visible rather than hidden in multi-level tabs; decisions require identity, rationale, and an expected version; and a stale write returns HTTP 409 with a refresh path. These are strong product decisions. The major risk is not lack of specificity but **over-specification in one visual direction**. The current contract treats a dark, monospace, terminal-like aesthetic as if it were inseparable from the workflow. That choice may produce a credible control room, but it can also make LedgerLens look like a generic AI/terminal or payment-operations clone. The recommended direction below preserves the information architecture and trust boundary while moving the visual language toward a calmer, editorial-industrial “reconciliation ledger” identity.

## 2. Consolidated product and technical model

### 2.1 Product problem and value proposition

The problem is the silent financial error: a payment capture may not produce a settlement line, a gateway may apply the wrong fee tier, a refund may fail to reduce a payout, or a bank credit may not link to a settlement UTR. Existing workarounds are described as large CSV files, manual spreadsheet lookups, opaque auto-resolvers, or payment-gateway dashboards optimized for collection and merchant reporting rather than exception investigation.[3] [4]

LedgerLens creates value through five connected capabilities. First, it ingests four feeds with duplicate/idempotency checks. Second, it preserves raw payloads while normalizing validated domain entities. Third, it applies exact scale-2 Decimal arithmetic and a deterministic three-stage matcher. Fourth, it gives operators an evidence-first review surface. Fifth, it records a human decision and append-only audit event with actor, timestamp, status transition, and version change. The RAG assistant is a constrained sixth capability: it retrieves local contractual policy and explains facts without becoming the reconciler.[2] [3]

### 2.2 Personas and operational goals

| Persona | Primary responsibility | What success looks like | Interface consequence |
|---|---|---|---|
| Finance Operations Analyst (`finance_ops_reviewer`) | Triage and resolve daily exceptions across four financial feeds | Find the highest-risk cases quickly, understand the variance, compare evidence without context switching, and submit a defensible decision | Queue-first shell, exposure sorting, compact identifiers, side-by-side evidence, mandatory rationale, fast keyboard paths |
| Compliance / Financial Controller (`finance_controller`, `internal_auditor`) | Validate financial integrity, controls, and historical decisions | Verify formulas, source facts, policy citations, actor attribution, version transitions, and audit completeness | Audit-readable event history, deterministic-vs-advisory labeling, inspectable calculations, immutable event presentation |
| System / reconciliation engine | Ingest, normalize, match, auto-reconcile clean parity, and isolate anomalies | Zero false auto-approvals, exact arithmetic, idempotent batches, reproducible exception classification | Clear system-status states, ingestion health, reconciliation run status, and no UI affordance implying AI authority |

### 2.3 Complete operator workflow

The intended operator journey is a queue-to-audit loop rather than a dashboard-to-chat loop.

| Step | Operator action | System behavior | Required UI evidence or state |
|---|---|---|---|
| 1. Ingest | Submit or monitor Payments, Settlements, Refunds, and Bank Credits batches | Validate rows, retain raw records, normalize entities, reject duplicates or malformed input | Four-feed health, batch identity, accepted/rejected counts, idempotency result |
| 2. Match | Allow the deterministic engine to compare sources | Apply scale-2 Decimal rules, exact matching, fee and GST formulas, refund adjustments, and exception routing | Run status, rule version, completed/failed state, no AI language in the decision path |
| 3. Triage | Open `/app/queue` and sort/filter the backlog | Return open cases and total exposure | Backlog context strip, exposure, severity, category, age, stable identifiers, loading/empty/error states |
| 4. Investigate | Open `/app/case/:caseId` | Fetch facts, version, payment, settlement, bank credits, and audit events | Root-cause statement, source comparison, discrepancy math, missing-source treatment, copyable IDs |
| 5. Consult policy | Expand the advisory section if needed | Retrieve local policy passages and combine them with read-only SQL facts | Verified-facts block, citation card, similarity score, read-only label, no decision controls inside advisory UI |
| 6. Decide | Select Approve, Reject, or Mark Unresolved; enter identity and rationale | Submit expected version through atomic CAS | Fieldset/legend, required rationale, current version, submit/loading state, validation errors |
| 7. Resolve contention | Submit against a stale case | Return 409 without overwriting the other reviewer’s action | Assertive alert, plain-language explanation, refresh action, preserved unsaved rationale where safe |
| 8. Audit | Controller inspects the result | Persist actor, time, previous/new status, version transition, and event ID | Chronological event stream, immutable language, filterable case/batch context, machine-readable identifiers |

One documentation mismatch is important here: the README sequence calls the RAG affordance an “AI Copilot” tab, while the design specification explicitly prohibits chat-first copilot patterns and describes a collapsible read-only policy drawer. The latter is the safer product behavior; “copilot” should be retired from visible product language.[2] [5]

### 2.4 Backend architecture and trust boundary

The architecture has four functional layers. Ingestion accepts four CSV-style sources and performs batch idempotency checks. Persistence keeps raw source payloads and normalized relational entities. The deterministic engine performs three-stage matching and writes either auto-reconciled outcomes or review cases. The review layer exposes the queue and case data, then accepts human actions under an expected version. The policy layer retrieves local Markdown policy through a vector similarity threshold and reads database facts through a read-only evidence tool.[2]

The central trust boundary should be represented visually as a **separation of authority**, not merely as a decorative architecture diagram:

| Authority | Allowed | Not allowed | UI treatment |
|---|---|---|---|
| Deterministic reconciliation engine | Arithmetic, matching, exception classification, state enforcement, persistence | Narrative embellishment that changes a result | Neutral system-fact styling; show formula, source, and rule outcome |
| Read-only policy retrieval | Retrieve relevant clauses, summarize verified facts, show similarity/grounding | Approve, reject, mutate, hold funds, write ledger state | Advisory tone, citation cards, explicit `Read-only` label, no action controls |
| Human reviewer | Decide, add rationale, resolve ambiguity, accept or reject an anomaly | Bypass required rationale or overwrite another reviewer | Decision terminal with identity, rationale, version, and audit confirmation |
| Audit ledger | Record immutable event metadata and transitions | Silent edits or deletion implied by UI | Chronological, append-only presentation with actor and version |

The data contract uses Decimal values serialized as strings, INR as the primary currency, UUIDs and UTRs as high-integrity identifiers, and `version` as the optimistic lock number. The interface must never visually collapse a missing source into a zero. “No bank credit found” and “bank credit of ₹0.00” are materially different states.

### 2.5 Data model and API boundaries

The queue contract returns `total_cases`, `total_amount_at_risk`, and a list of `ReviewQueueItem` records containing case ID, payment ID, exception type, status, confidence, expected and reported settlement, discrepancy, opened timestamp, and exposure. The case contract adds payment, settlement, and bank-credit facts plus the current version. Human review accepts actor, action, expected version, comment, and optional candidate ID, and returns the status transition and audit event ID. The API map defines one explicit conflict response: HTTP 409 when the expected version is stale.[6]

The front end should therefore treat the API as four boundary types: **collection** (`queue`), **evidence** (`case detail`), **advisory** (`RAG investigation`), and **mutation** (`human review`). That boundary can guide component naming and visual styling without changing the underlying endpoints.

### 2.6 Deterministic reconciliation rules

The documented financial derivations are:

- `Fee = round(Gross × 0.02, 2)`.
- `GST = round(Fee × 0.18, 2)`.
- `Expected Net = Gross − (Fee + GST) − Refunds`.
- `Discrepancy = |Reported Net − Expected Net|`.
- For missing settlement or bank credit, exposure is the gross amount; for amount or fee mismatch, exposure is the discrepancy.
- A review increments the lock version: `new_version = current_version + 1`.

These rules belong in the interface as inspectable reasoning, not as visual decoration. An operator should see the expected value, reported value, component deductions, and delta in a compact comparison row. The UI should label calculation output as **deterministic** and distinguish it from a policy interpretation.

### 2.7 The eight exception types and evidence requirements

| Exception | Severity in source contract | What the operator must see | Primary action cue |
|---|---|---|---|
| `missing_settlement` | High | Payment capture, payment timestamp, gross amount, absent settlement ID, batch cutoff or age context | Investigate missing batch / escalate |
| `missing_bank_credit` | High | Settlement ID, reported net, settlement timestamp, absent UTR/credit, bank-feed search context | Investigate uncredited transfer |
| `amount_mismatch` | Critical | Gross, expected net, reported net, absolute delta, settlement line, bank credit, source timestamps | Reject or escalate based on evidence |
| `fee_mismatch` | High | Contractual 2% fee, 18% GST, reported fee/tax, expected net, reported net, variance, policy clause | Dispute / approve correction with rationale |
| `duplicate_payment` | Critical | All same-order captures, payment IDs, amounts, timestamps, settlement relationships | Select or reject duplicate candidate |
| `duplicate_bank_credit` | High | Repeated UTR or settlement reference, credit IDs, amounts, timestamps, bank narrations | Isolate duplicate credit |
| `partial_refund_not_reflected` | High | Refund ID and amount, refund timestamp, expected net after refund, reported payout, cutoff context | Escalate or reject payout line |
| `ambiguous_match` | High | All equally matched candidate settlements or credits, matching fields, candidate IDs, selection control | Choose candidate or mark unresolved |

The examples make the interface concrete. For `fee_mismatch`, the sample case shows gross `₹6,030.25`, expected net `₹5,887.93`, reported net `₹5,781.20`, a `₹106.73` unauthorized overcharge, and bank UTR `UTR00001014`. For missing cases, absence is itself evidence and should receive an explicit empty/missing treatment rather than a blank card.[7]

### 2.8 Frontend routes, pages, and components

The public layer contains `/`, `/how-it-works`, `/evidence`, `/evaluation`, `/docs`, and `/about`. It should tell a restrained proof-oriented story: problem, four-source model, deterministic rules, controlled advisory guidance, human decision, and audit. The authenticated layer contains `/app/dashboard`, `/app/queue`, `/app/case/:caseId`, `/app/ingestion`, `/app/audit`, `/app/policies`, and `/app/settings`. The queue and case workspace are the primary operational surfaces; the remaining routes support monitoring, controls, and documentation.[5] [8]

The component inventory names the architectural atoms: `AppLayout`, `MarketingLayout`, `ReviewActionForm`, `MultiSourceCard`, `RagCopilotPanel`, `CitationCard`, `AuditTimeline`, `AmountDisplay`, `ExceptionBadge`, `StatusBadge`, `EmptyState`, `SkeletonLoaders`, and `ConfidenceIndicator`. The visual system should keep these contracts but revise two naming choices: `RagCopilotPanel` should become `PolicyAdvisoryPanel`, and “AI Finance Controller” should not be the primary brand descriptor because it overstates the role of AI and sounds like an autonomous accounting agent.[8]

### 2.9 Responsive, accessibility, security, and auditability requirements

The existing contract asks for desktop at 1440px, tablet at 768px, and mobile at 375px, with a persistent 256px sidebar in the app shell. That geometry cannot simply be compressed onto mobile. The recommended responsive behavior is: retain the queue as a priority-ordered list/table with an accessible disclosure for secondary identifiers; transform the case workspace from three columns into a guided vertical sequence while keeping evidence cards in a comparison group; and move the decision terminal into a sticky-bottom or final-step region only if it remains keyboard- and screen-reader-accessible.

Accessibility requirements include keyboard operation, visible 2px focus treatment, explicit form labels, fieldset/legend semantics for decisions, non-color severity cues, assertive 409 alerts, and all seven lifecycle states: default, hover, focus-visible, active, disabled, loading, and error. The supplied Vercel guidelines reinforce several useful additions: minimum hit targets, preserved browser zoom, focus management, reduced-motion variants, stable skeletons, URL-addressable filters, correct native semantics, and local error placement.[9]

Security and auditability are mostly expressed as product invariants rather than UI controls. The interface must not imply that advisory text is authoritative; it must not allow the AI layer to write state; it must expose actor identity and version; it must avoid silently overwriting a stale case; and it must preserve evidence provenance. Sensitive identifiers should be copyable but not unnecessarily exposed in public marketing surfaces. Public benchmark claims should be linked to a reproducible report, not presented as unsupported hero statistics.

## 3. Requirements matrix: binding, conditional, or optional

| Requirement | Classification | Rationale / interpretation |
|---|---|---|
| Deterministic Decimal arithmetic and penny-exact serialization | **Binding** | This is a domain and data-integrity invariant, not a style preference. |
| Four-source model: payments, settlements, refunds, bank credits | **Binding** | It defines the product’s differentiated reconciliation scope. |
| Read-only policy retrieval with grounding floor `≥ 0.35` | **Binding** | It is the documented AI trust boundary; the numeric threshold must be verified against implementation and benchmark artifacts. |
| Human decision with actor, rationale, and expected version | **Binding** | It is required for accountability and concurrency safety. |
| HTTP 409 stale-version handling with refresh path | **Binding** | It prevents silent overwrite and is explicitly part of the API contract. |
| Append-only audit event presentation | **Binding** | Required for controller and compliance workflows. |
| Eight deterministic exception categories | **Binding** | The queue filters and case handling depend on the taxonomy. |
| Queue above the fold and prioritized by exposure | **Binding** | It encodes the primary operator goal and rejects KPI-first layouts. |
| Evidence visible without multi-level tabs | **Binding at desktop**; **conditional responsive adaptation** | Simultaneous comparison is binding; mobile may use stacked comparison with persistent labels when side-by-side is physically impossible. |
| Seven interaction states | **Binding** | Explicit QA contract. |
| WCAG 2.2 AA target | **Binding** | Explicit engineering and acceptance requirement. |
| Base-8 plus 4px micro-scale | **Binding as token discipline**; **conditional as literal zero-exception rule** | The scale is valuable, but compile-time rejection of every non-token pixel should be reconciled with browser-native controls, focus rings, borders, and responsive constraints. |
| Inter for all UI typography | **Conditional** | It is a current token, not a product behavior. A distinctive display face for public narrative can improve ownership if readability and implementation constraints are preserved. |
| JetBrains Mono / DM Mono for monetary values and identifiers | **Binding for numeric comparability**; **conditional for every timestamp** | Tabular numerals are binding; a monospace face for every timestamp may be excessive in narrative contexts. |
| Midnight canvas and dark slate surfaces | **Conditional** | Useful for a dark operational mode, but not equivalent to workflow quality. A light or hybrid mode can better serve readability and reduce terminal-clone risk. |
| 260px/256px persistent sidebar | **Conditional** | Appropriate at desktop; must collapse or transform at tablet/mobile. |
| 24% / 44% / 32% case geometry | **Binding at wide desktop**; **conditional below desktop** | It protects hierarchy at the intended workspace size, but cannot be preserved literally at 375px. |
| 150–220ms ease-out, state-change-only motion | **Binding** | Supports calmness and operational predictability. Add reduced-motion behavior. |
| “AI Finance Controller” product subtitle | **Optional / should be changed** | It conflicts with the read-only AI boundary and may suggest autonomous financial authority. |
| “AI Copilot” visible product language | **Optional / should be removed** | It conflicts with the prohibition on chat-first copilot patterns. |
| Decorative terminal, Bloomberg, Palantir, Stripe, Razorpay, or other brand resemblance | **Prohibited** | References may calibrate principles but must not determine the visual identity. |
| Marketing claims such as `>1,000 rps` | **Conditional pending evidence** | Keep only when the benchmark artifact, environment, workload, and measurement method are linked and reproducible. |

## 4. Contradiction and stale-instruction log

| ID | Conflict / stale instruction | Severity | Recommended resolution |
|---|---|---:|---|
| C-01 | The archive index says there are 13 Markdown files, but the ZIP contains 14 Markdown files when macOS metadata is excluded: `00_index` through `13_anti_patterns_gallery`. | P2 | Treat the numbered files as the source set and update the index count to 14; exclude `__MACOSX` metadata. |
| C-02 | `03_readme.md` titles the product “Razorpay AI Finance Controller,” while multiple files prohibit payment-gateway imitation and state that LedgerLens is not affiliated with Razorpay. | P0 | Rename the product and repository-facing title to LedgerLens; use Razorpay only as a test-data or integration context where legally appropriate. |
| C-03 | The product vision metadata says `LedgerLens (Razorpay AI Finance Controller)`, repeating the naming conflict. | P0 | Remove the Razorpay product name from the public brand and product metadata. |
| C-04 | The audit history claims `54/54` backend tests passed, while the README and CI section claim `40` tests passing. | P1 | Verify the current repository and CI run; record one canonical count with commit hash and test command. Do not use either number in marketing until verified. |
| C-05 | The app shell footer says `PostgreSQL 16`, while the README stack, Docker image, and CI description say PostgreSQL 15. | P1 | Make the displayed version derive from runtime configuration or change all documentation to the verified deployed version. |
| C-06 | The design contract requires a 3-column case workspace with a 44% evidence column and three cards for Payment, Settlement, and Bank, while the product model has four sources including Refunds. | P0 | Add Refunds as a first-class evidence lane or explicitly document why refunds are represented inside the payment/settlement card. The current omission is dangerous for `partial_refund_not_reflected`. |
| C-07 | The README sequence says “3-Source Comparison Grid,” while the product promise is a four-source reconciliation system. | P0 | Replace the phrase with “four-source evidence comparison,” and show a visible refund evidence treatment. |
| C-08 | The design specification labels the AI surface “Policy Advisory,” but the README and sequence diagram say “AI Copilot,” and the component inventory names `RagCopilotPanel`. | P1 | Standardize on `Policy Advisory` / `PolicyAdvisoryPanel`; prohibit chat semantics and approval language. |
| C-09 | The role prompt mandates a midnight dark canvas, while the user’s explicit audit brief asks the exploration not to assume dark mode, terminal aesthetics, monochrome, or payment-dashboard conventions. | P1 | Treat dark mode as an existing proposal to assess, not as an immutable product requirement. Explore light, dark, and hybrid directions. |
| C-10 | The evaluation route is described as benchmarked at `>1,000 rps`, but the supplied measured-result table only documents a 60-record reconciliation benchmark, not a throughput measurement method. | P1 | Remove the throughput claim or attach a reproducible load-test artifact with environment, concurrency, dataset, duration, and p95/p99 latency. |
| C-11 | The audit history says “0 build errors” and `54/54` tests, but it is historical evidence, not current repository verification. | P2 | Label it as historical and require a fresh implementation audit before sign-off. |
| C-12 | The binding token rule says zero arbitrary pixel values, yet the design includes values such as 1px borders, 2px focus rings, 2px/4px/8px radii, 40px controls, and 30px type. | P2 | Define token families for borders, focus, radii, control heights, and type separately. “No arbitrary values” should mean no undocumented values, not that every value must belong to the spacing scale. |
| C-13 | The user story says “one-click resolution,” but the system requires reviewer identity and mandatory rationale. | P1 | Reframe as “one-pass resolution” or “single-submit resolution after required review,” never as a literal one-click approval. |
| C-14 | The design says all four sources must be visible side-by-side, but the specified case response and evidence cards omit a `RefundFacts` object. | P0 | Extend the data contract and evidence component contract before visual implementation. |
| C-15 | The data contract makes `human_comment` optional while the UI and user stories make rationale mandatory. | P0 | Make the backend field required for `approve`, `reject`, and `mark_unresolved`, with a minimum meaningful length and a clear validation error. |
| C-16 | The API description says “Internal Operator Identity Header / Session,” but the README also describes a single-tenant scope without dynamic multi-tenant RBAC. | P1 | Document the exact identity source, session boundary, and authorization assumptions; do not imply production-grade multi-tenant access control. |
| C-17 | The queue confidence field can be `high`, `medium`, or `low`, while the policy advisory grounding floor is numeric `≥ 0.35`. | P2 | Separate `case confidence` from `citation similarity`; never use the qualitative confidence label as a substitute for the numeric grounding metric. |
| C-18 | `amount_at_risk` is described as gross amount for missing cases and discrepancy for mismatch cases, but the queue example shows `₹6,030.25` for a fee discrepancy of `₹106.73`. | P1 | Verify whether exposure intentionally means affected transaction gross or disputed delta. Display both `Transaction amount` and `Disputed delta` so the meaning is not ambiguous. |
| C-19 | The source contract says `PostgreSQL 15`, while the top-level README badge and component inventory versions differ in React/Vite/TypeScript patch versions. | P2 | Create a single generated stack manifest; avoid hand-maintained patch-level claims across design docs. |
| C-20 | The queue row interaction says both “focused row triggers navigation” and “single action affordance `Inspect →`,” which can create nested interactive targets. | P2 | Choose either a semantic link row with a separate copy button, or a non-interactive row with one inspect link. Ensure no nested links/buttons. |

### Claims requiring verification before public use

The measured reconciliation table documents a synthetic 60-record dataset with 70% clean auto-reconciliation, 100% precision, 100% recall, 18/18 exception isolation, and one malformed row rejected. Those figures are internally coherent as a benchmark description, but they are not evidence of production financial performance. The `>1,000 rps` claim is not substantiated in the supplied measurements. Public pages should show dataset seed, test version, environment, and artifact links, and should label the results synthetic and project-specific.[2]

### Technical constraints that must not be changed casually

The following should survive visual exploration: penny-exact Decimal arithmetic; raw plus normalized persistence; idempotency checks; deterministic exception classification; read-only RAG; citation grounding threshold after verification; no AI mutation authority; optimistic CAS with 409 behavior; actor/rationale/audit persistence; and explicit missing-source states. By contrast, the following are visual choices open to redesign: dark canvas, Inter as display typography, fixed sidebar treatment, exact card geometry at non-desktop widths, “copilot” terminology, and terminal-like branding.

## 5. Current-design risk assessment

### 5.1 Strong foundations

The current system has a clear domain center. The queue is not a generic KPI dashboard; the evidence model is specific; the concurrency story is unusually concrete; and the anti-pattern gallery actively rejects the common AI-generated visual defaults. The separation between deterministic calculation and advisory policy retrieval is a credible trust narrative. The requirement for plain-language anomaly summaries is also strong because it translates machine classification into an operator-ready explanation without requiring a chat interaction.

### 5.2 Highest risks

**Brand collision and legal ambiguity.** Repeated use of “Razorpay AI Finance Controller,” Razorpay-specific marketing language, and sample bank narration makes the product appear affiliated with a payment provider even though the README disclaims affiliation. This should be corrected before any public visual design work.

**Incomplete four-source evidence.** Refunds are central to the stated value proposition and have their own exception type, but the primary case evidence contract contains only Payment, Settlement, and Bank Credit objects. This is the most material product/UI gap because the interface cannot honestly explain a refund exception without a refund object or a deliberate, documented representation.

**Dark-terminal overfitting.** The current visual system conflates operational seriousness with midnight surfaces, monospace-heavy text, and terminal geometry. A dark mode may work, but the product can become visually indistinguishable from developer tooling, AI infrastructure dashboards, or a payment-risk console. The solution is not to add decoration; it is to build ownership through a distinct mark, editorial public layer, controlled color semantics, and a clear evidence-comparison grammar.

**Unreadable severity and exposure semantics.** Critical/high color cues are specified, but the financial meaning of “amount at risk” is ambiguous in the example data. The UI should display at least two separate values where relevant: gross transaction amount and disputed delta. A single “At risk” number is too easy to misinterpret.

**Responsive contradiction.** A three-column 24/44/32 desktop terminal is reasonable at wide screens, but the same requirement cannot remain literal at 375px. Mobile must use a guided stacked investigation order and preserve source labels, context, and decision safeguards.

**Public proof risk.** The public layer could accidentally become a benchmark billboard. Evaluation should be presented as a reproducible evidence page with methodology, not as a wall of unsupported “100%” and “>1,000 rps” claims.

## 6. Reference analysis

The supplied references should calibrate principles, not become a visual source to copy. The table below distinguishes useful learning from prohibited imitation.

| Reference | Principle worth learning | Possible LedgerLens application | What must not be copied |
|---|---|---|---|
| Bloomberg Professional Terminal | High information density can support expert workflows when hierarchy and keyboard access are strong | Dense but ordered queue, stable columns, compact source identifiers, command-friendly navigation | Bloomberg’s black/green financial-market aesthetic, ticker language, or trading-floor urgency |
| Palantir Foundry | Complex operational systems benefit from linked entities, provenance, and investigative context | Show relationships among payment, settlement, refund, bank credit, case, and audit event | Palantir’s military/intelligence tone, ontology visuals, or dark enterprise styling |
| Linear | Restrained typography, keyboard-first flows, and subtle state changes make dense tools feel controlled | Queue filtering, focus order, URL-state filters, low-noise transitions, command hints | Linear’s purple accent, issue-tracker metaphors, or ultra-minimal product identity |
| Ballance Design System Spec | Token discipline, explicit component states, responsive rules, and testable accessibility criteria | Define state matrices and acceptance tests for every operational component | Treating an abstract spec as a brand or importing irrelevant component forms |
| `awesome-design-md` | A plain-text design system can express tokens, visual rules, and agent-facing constraints in a portable form.[10] | Keep the final handoff as an explicit, implementation-ready design contract with examples and rejection rules | Copying any catalogued brand system or treating scraped brand analysis as authoritative for LedgerLens |
| designmd.co | Design systems can be searched, compared, and made useful to design agents; the value is structured vocabulary rather than visual cloning.[11] | Use a structured design vocabulary for mark, type roles, surfaces, evidence states, and motion | Catalog aesthetics, MCP/product branding, or generated brand presets |
| Emil Kowalski motion reference / `design-motion-principles` | Motion should clarify cause and effect, be restrained, and include reduced-motion behavior; the accessible repository explicitly audits decorative animation, `scale(0)` starts, bare `ease`, and missing reduced-motion handling.[12] | Animate row selection, panel expansion, submit/loading transitions, and conflict refresh affordances only; provide reduced-motion variants | Glowing loops, ambient meshes, attention-seeking motion, or motion used to disguise weak hierarchy |
| `kylezantos/design-motion-principles` | Context-aware motion review and explicit anti-AI-slop checks | Add motion QA to the handoff: property list, duration, easing, interruptibility, reduced-motion | Treating motion as a visual signature more important than operator speed |
| OriginKit | Browsable component collections can expose interaction ideas and implementation references | Use only as a source of interaction mechanics if a component solves a real queue or evidence need | Neon borders, plasma effects, cursor fields, starfields, or decorative backgrounds; the site prominently catalogs such effects.[13] |
| React Bits | Customizable React components can accelerate prototyping and show interaction possibilities | Borrow only functional patterns such as a stable skeleton or accessible disclosure after review | Animated showcase style, gradient-heavy hero patterns, or generic “stunning UI” language.[14] |
| Aceternity UI | It demonstrates reusable blocks and production-ready component composition | Consider structural patterns for public proof pages, but simplify them for financial trust | AI chat sections, shader backgrounds, bento/SaaS templates, glowing effects, and gradient login forms; these are prominent in its catalog.[15] |
| Taste Skill | Anti-slop practice is valuable: infer the brief, choose a design direction, use a named scale, provide reduced motion, and avoid centered-everything templates.[16] | Use its rejection logic to keep LedgerLens from collapsing into a generic AI landing page; bias the public composition intentionally | Its own stylistic prescriptions, brand voice, or “anti-slop” marketing language as LedgerLens identity |
| Hallmark | Study structure rather than pixels; diagnose macrostructure, type roles, layout bias, and repeated AI defaults | Give the public site an owned macrostructure: a proof ledger, not a centered SaaS hero; use asymmetry sparingly | Hallmark’s editorial/experimental presentation, “refuses to repeat” mechanics, or particular type/hero treatments.[17] |
| Impeccable | Iterative visual critique and concrete vocabulary can improve agent handoffs | Add a design-review checklist with named issues such as hierarchy, density, evidence provenance, and anti-pattern detection | Its product voice, before/after treatment, or generalized design-command UI.[18] |
| Vercel Web Interface Guidelines | Keyboard operation, visible focus, focus management, hit targets, stable skeletons, URL-state, reduced motion, semantic HTML, and all-state design are directly applicable.[9] | Add these to the acceptance criteria, especially filter deep links, 44px mobile targets, focus return after 409 refresh, and reduced motion | Vercel’s black-and-white brand, Geist-specific typography, or developer-platform visual language |
| Godly Design | Curated galleries broaden awareness of composition, interaction, and visual craft.[19] | Use it to study hierarchy and restraint in public proof pages, not operational app patterns | Trend-chasing, spectacle, scroll theater, or decorative motion in the control room |
| Awwwards UI Design | It exposes a wide range of UI composition and visual craft, useful for studying how narrative pages balance beauty and function.[20] | Borrow editorial pacing and proof-page composition only where it does not delay evidence | Award-site spectacle, agency portfolio tropes, novelty for its own sake, or campaign-style pages |
| Minimal Gallery | Its stated focus on beautiful and functional websites is useful for studying whitespace, composition, and quiet presentation.[21] | Use selective whitespace on the public layer and let the app remain information-dense | Applying portfolio minimalism to a queue where operators need visible context |
| SiteInspire | Its large curated collection and filters can broaden visual vocabulary across typography, grid, and unusual layout categories.[22] | Study alternate public information architectures, especially grid and typographic hierarchy | Copying showcased layouts or using visual novelty to distract from the product proof |
| Fonts In Use | It documents typefaces in real contexts and includes business/finance, software/apps, web, and institutional categories.[23] | Use it to validate a distinctive public display face paired with highly legible UI and tabular numeric treatment | Selecting a display font merely because it is fashionable, or replacing numeric clarity with expressive typography |
| Landingfolio | It is useful for reviewing landing-page section patterns and conversion structures.[24] | Use sparingly for CTA placement and proof sequencing on the public layer | Generic hero → logo strip → three cards → pricing/CTA SaaS formula |

The reference pattern is clear: use operational tools for density and interaction discipline, editorial/design references for the public narrative, and anti-slop references for rejection criteria. Do not let any one source dictate the entire brand.

## 7. Three design directions

### Direction A — Reconciliation Ledger: warm editorial-industrial hybrid (recommended)

**Brand concept and personality.** LedgerLens becomes a calm instrument for making financial truth legible. It feels closer to a well-edited operations ledger or an archival accounting room than to a developer terminal. The personality is exact, sober, observant, and human-accountable.

**Logo / mark direction.** A compact mark built from two offset ledger rules and a centered lens aperture: two horizontal source lines converge into a small square or circular “inspection window.” It should work in one color, remain legible at 16–24px, and avoid literal spectacles, coins, shields, or AI sparkles. The mark’s concept is “compare, reveal, record.”

**Color mode.** Hybrid. The public layer uses a warm paper canvas, charcoal ink, muted indigo, and one restrained vermilion or amber signal. The authenticated app uses a pale mineral canvas with ink-blue structural surfaces, while a dark high-contrast mode may be offered for long shifts. Semantic colors remain explicit and are paired with labels. This avoids assuming that dark equals trustworthy and makes the public/app relationship distinctive.

**Typography.** Use a distinctive but restrained display face for public headlines, a highly legible grotesk for UI and body, and a tabular mono only for values, identifiers, timestamps, and version tags. This preserves the data contract without making every sentence look like code. A candidate system would be: editorial display serif or humanist grotesk for public narrative; Inter or system sans for operational UI; JetBrains Mono/DM Mono for numeric and identifier roles.

**Layout, grid, density.** Public pages use a left-biased editorial grid with a persistent “proof rail” that labels the current layer: `SOURCE`, `RULE`, `REVIEW`, `AUDIT`. The app uses a 12-column desktop grid, with the queue occupying the full content field and the case workspace retaining the 24/44/32 relationship at wide desktop. Surfaces are flatter than cards: rules, dividers, and label bands create hierarchy. Density is high in the queue and moderate in the evidence workspace.

**Public website structure.** The landing page opens with a short assertion such as “Find the line that broke.” It shows a real, de-identified evidence comparison rather than a glossy dashboard screenshot. Sections follow the operator journey: four sources, deterministic rule, policy boundary, human decision, audit event. `/evaluation` presents methodology before metrics. `/docs` feels like a public control manual, not a blog.

**Authenticated app structure.** The sidebar is a narrow “control index” with section labels and a live queue count. The header shows current scope, feed freshness, and operator identity. `/app/queue` is the default landing surface rather than a KPI dashboard. `/app/dashboard` becomes an overview for monitoring, not the primary work surface.

**Queue and case behavior.** Queue rows use a left severity rail, a plain-language anomaly sentence, a compact identifier line, and two distinct numbers where needed: `Disputed delta` and `Transaction exposure`. Selecting a case opens the workspace with a breadcrumb trail that includes the case ID and version. The case header includes a source-presence strip so missing refunds or bank credits are visible before the cards.

**Evidence comparison.** Use a “same field, four sources” comparison grammar. Each source has a stable accent line and a consistent field order. For wide screens, show four aligned evidence lanes or a three-lane evidence area with the refund lane integrated as a first-class expandable row that never hides the refund facts. For narrow screens, stack cards but retain a comparison index and jump links.

**Separation of authorities.** Deterministic facts use ink/neutral styling and labels such as `Calculated by reconciliation rule`. Policy guidance uses a muted cyan/blue advisory treatment with a `Read-only policy` label and citation metadata. Human decisions use a solid, high-contrast action area with identity, rationale, and CAS version. No advisory panel shares visual weight or controls with the decision terminal.

**Motion and state changes.** Use short, interruptible transitions for opening a case, expanding evidence, loading a policy citation, and confirming a successful review. Avoid motion on idle surfaces. A stale-version alert should enter with a clear state change and place focus on the alert or refresh action. Honor `prefers-reduced-motion`.[9] [12]

**Accessibility and readability.** Light backgrounds allow long-form public text to meet contrast more easily. The app must preserve semantic severity labels, explicit missing states, focus rings, zoom, keyboard access, and mobile hit targets. Warm colors must be checked carefully against white and pale surfaces; amber is not sufficient as the sole status cue.

**Three ownable signatures.** (1) The `Source → Rule → Review → Audit` proof rail. (2) A four-source comparison index that makes absent evidence visually explicit. (3) A “decision receipt” after submit showing actor, version transition, rationale presence, and audit event ID.

**Five generic patterns deliberately rejected.** Purple-gradient AI hero; centered-everything SaaS landing page; glowing terminal panels; floating chatbot button; KPI wall before the queue.

**Risks and trade-offs.** A warm editorial public layer may feel less like a traditional fintech product, and a hybrid app requires disciplined theme tokens. The biggest implementation risk is inconsistent semantics between light and dark modes. The reward is a more ownable brand and lower probability of terminal/payment-dashboard imitation.

### Direction B — Midnight Evidence Grid: dark operational instrument

**Brand concept and personality.** LedgerLens is a precision instrument for anomaly investigation: quiet, fast, and engineered for long operational shifts. This direction is the closest to the existing proposal but makes the dark mode more disciplined and less “AI terminal.”

**Logo / mark direction.** A four-node mark representing the four source systems, with one broken connection highlighted by a small gap. It should be geometric, static, and legible without glow. The mark can animate only when a reconciliation run completes, and then only through a short connection-state change.

**Color mode.** Dark-first, with midnight canvas, slate surfaces, pale text, blue primary, and rose/amber/green/cyan semantics. Provide a light reading mode for public docs and audit exports. Dark is justified for high-density work and strong grouping, not because it is inherently more technical.

**Typography.** Inter remains the UI face. JetBrains Mono/DM Mono is reserved aggressively for figures, IDs, timestamps, UTRs, hashes, and CAS values. Public headlines use a slightly distinctive grotesk or condensed sans so the site is not an Inter-only template.

**Layout, grid, density.** Preserve the dense four-column queue and 24/44/32 desktop case geometry. Replace large rounded cards with flush panels, one-pixel rules, small section labels, and a strong baseline grid. Sidebar navigation becomes a vertical index with section numbers or short labels, not a generic icon list. Density is highest in queue and evidence, lowest in marketing pages.

**Public website structure.** The public story is organized as an evidence atlas: `Four inputs`, `Three checks`, `Eight exceptions`, `One accountable decision`. The hero shows a cropped, de-identified investigation surface with annotated callouts, not a giant product screenshot. `/evidence` is the primary trust page; `/evaluation` includes methodology and artifact links.

**Authenticated app structure.** `/app/queue` is the default route. The shell exposes feed health and current case count but does not show oversized KPIs. The sidebar keeps the current route and backlog count visible. The command center is a monitoring page for managers, not an operator home.

**Queue and case behavior.** Rows support keyboard selection and a separate inspect link. A thin severity rail, small status label, anomaly sentence, identifiers, disputed delta, and exposure appear in a strict scan order. The case workspace keeps the decision panel sticky on wide screens but releases it into document flow on small screens.

**Evidence comparison.** Use aligned columns with field labels on the left and source values on the right. A missing source displays a structured empty block: `No matching bank credit`, the query/key used, and the last feed freshness. Refunds are rendered as a fourth source lane, not a hidden subtab.

**Separation of authorities.** Neutral blue-gray surfaces mean system facts; cyan means policy advisory; the decision panel receives a reserved border and a solid primary submit action. The RAG panel uses citations and verified facts, not chat bubbles. The similarity score is displayed next to the citation, not promoted as a vague “AI confidence” badge.

**Motion and state changes.** Skeletons match final geometry. Row hover is subtle. Panels expand with opacity/transform only. Submission keeps the original label and adds a spinner; conflict state is assertive and interruptible. Reduced motion disables nonessential transitions.[9] [12]

**Accessibility and readability.** High contrast must be measured, especially muted slate text on dark surfaces and amber/rose semantic colors. Avoid tiny 12px text for essential evidence. On mobile, controls must meet larger hit targets and text inputs must avoid browser auto-zoom problems.

**Three ownable signatures.** (1) The `Disputed delta / Transaction exposure` paired metric. (2) A visible source-presence strip with states `matched`, `missing`, `duplicate`, and `ambiguous`. (3) The CAS decision receipt as a compact audit object.

**Five generic patterns deliberately rejected.** Bloomberg imitation; payment gateway cards; neon gradients; chat copilot; oversized command-center KPI tiles.

**Risks and trade-offs.** This direction fits the current design contract and is likely fastest to implement, but it retains the highest risk of looking like a generic dark operations dashboard. The product must be differentiated through evidence grammar and brand mark rather than decorative effects.

### Direction C — Paper Control Manual: light civic-technical system

**Brand concept and personality.** LedgerLens is a public-interest control manual for making financial systems accountable. It feels precise, inspectable, and humane, closer to a modern civic records office than a software command center.

**Logo / mark direction.** A typographic wordmark paired with a small “registered line” symbol: four short horizontal rules, one interrupted and annotated. The mark should work as a rubber-stamp-like monochrome asset, with no shield, coin, eye, or sparkle literalism.

**Color mode.** Light-first. Use paper white, graphite, cool gray, deep navy, and a single rust or cobalt signal. Critical and needs-review states use color plus a left rule, label, icon, and text. Dark mode is optional and secondary. This mode suits docs, audit review, long-form policy, and controller workflows exceptionally well.

**Typography.** Public headings use a confident serif or humanist display face; body and UI use a neutral sans; values/identifiers use tabular mono. The contrast between narrative type and evidence type becomes a product signature, while the app remains highly readable.

**Layout, grid, density.** Public pages use numbered chapters, wide margins, diagrams, and ledger-like proof tables. The app uses a two-tier information hierarchy: a compact command band at top and a generous evidence canvas below. The queue is dense but not visually dark; rows use hairline rules, exposure columns, and severity labels. The case workspace retains three conceptual zones but uses a responsive document layout rather than a terminal shell.

**Public website structure.** The landing page begins with a manifesto and a real exception walkthrough. `/how-it-works` is a six-chapter operating manual. `/evidence` publishes the formula and trust boundary. `/evaluation` is a lab note with benchmark limitations. `/about` explains the human-review philosophy.

**Authenticated app structure.** The sidebar is a light index with a distinct current-section bar. The top band can show `Queue / Case / Decision` as a process breadcrumb. Dashboard, ingestion, audit, policies, and settings are framed as records in a control manual, not as app tiles.

**Queue and case behavior.** The queue uses a readable table with a sticky header, persistent filter state in the URL, and visible descriptions. The case opens as a structured record: case context, source evidence, policy note, and human decision. A right-side decision panel is retained on wide desktop but becomes the last, clearly marked section on mobile.

**Evidence comparison.** Instead of dense dark cards, use a comparison table with source columns and field rows, supplemented by source-specific notes. For a missing or ambiguous source, the table shows a typed absence or candidate set. This makes calculations and provenance especially easy for auditors to scan.

**Separation of authorities.** System facts appear as black/blue text and formula rows. Policy guidance is a shaded note with citations and explicit `Advisory only`. Human decisions are a signed record form with a strong border and a visible `This action creates an audit event` statement. The visual language makes authority boundaries feel procedural rather than ornamental.

**Motion and state changes.** Motion is minimal: filter changes, disclosure expansion, loading, and confirmation. Public pages may use a restrained chapter transition, but the app should be nearly still. Reduced motion is the default posture for audit surfaces.

**Accessibility and readability.** The light mode is excellent for policy, audit, and long sessions, but contrast must be tested for pale borders and muted text. Do not use paper texture or gray-on-gray panels that reduce clarity. Ensure sticky table headers do not obscure focus.

**Three ownable signatures.** (1) The numbered control-manual chapter structure. (2) A comparison table that explicitly distinguishes value, absence, and ambiguity. (3) A signed decision receipt that reads like an accountable record rather than a toast.

**Five generic patterns deliberately rejected.** Dark AI terminal; card-grid SaaS dashboard; gradient hero; chatbot assistant; decorative glassmorphism.

**Risks and trade-offs.** A light civic-technical system may be perceived as less “real-time” by users accustomed to dark operations tools, and it requires careful density tuning so the queue does not feel like a static report. It offers the strongest differentiation and audit readability but is the largest visual departure from the current contract.

## 8. Recommended direction and trade-offs

### Recommendation: Direction A — Reconciliation Ledger

Direction A is recommended because it preserves the product’s strongest operational decisions while removing the most avoidable visual assumptions. It keeps a high-density queue, evidence-first case investigation, tabular figures, explicit semantic states, and a separated decision terminal. It does not require LedgerLens to look like a terminal, a payment gateway, or an AI startup. The hybrid approach also gives the public story and authenticated workflow appropriate but related personalities: the public site can be editorial and proof-led; the app can be mineral, dense, and calm.

The recommendation is not an instruction to add softness, gradients, or decorative editorial flourishes. It is a recommendation to make the brand ownable through **comparison grammar, source presence, and decision receipts**. The three signatures should be treated as product-level patterns that appear consistently across public and authenticated surfaces.

### Recommended authority hierarchy

| Visual layer | Meaning | Example treatment | Explicitly avoid |
|---|---|---|---|
| System fact | A value returned or calculated by deterministic logic | Neutral ink, source label, formula or provenance | AI sparkle, speculative copy, unlabeled confidence |
| Exception signal | A case requiring attention | Text label + icon + severity rule + restrained semantic color | Color-only dots, alarmist animation |
| Policy advisory | Retrieved contractual guidance | Tinted note, citation ID, similarity metric, `Read-only` | Chat bubbles, prompt box, approval CTA |
| Human decision | Reviewer action with consequences | Strong form boundary, identity, rationale, version, audit confirmation | “One-click AI resolution,” ambiguous primary actions |
| Audit record | Persisted historical event | Chronological record with actor and version transition | Editable-looking cards, transient-only confirmation |

### Recommended route priorities

1. Make `/app/queue` the authenticated default.
2. Make `/app/case/:caseId` the flagship interaction and resolve the missing refund evidence contract before design handoff.
3. Make `/evidence` the public trust page and link every benchmark claim to a methodology artifact.
4. Keep `/app/dashboard` useful for monitoring but subordinate it to the queue.
5. Treat `/docs`, `/app/policies`, and `/app/audit` as first-class proof surfaces, not secondary utility pages.

## 9. Open questions and assumptions

| Question | Why it matters | Assumption for the recommended direction |
|---|---|---|
| Is LedgerLens replacing the Razorpay naming entirely? | Brand, legal, and public-copy risk | Yes; Razorpay-specific references are treated as test/integration context only until confirmed. |
| What is the canonical database version? | Runtime status and technical credibility | PostgreSQL 15 remains the documented baseline until repository/runtime evidence says otherwise. |
| What is the canonical test count? | Public audit history and sign-off | The historical counts are unverified; no count is used as a current claim. |
| Is `amount_at_risk` gross exposure or disputed delta? | Operator interpretation and prioritization | Show both when they differ; never force one overloaded number. |
| How are refunds represented in case detail? | Correctness of the four-source promise | Add a first-class refund object and evidence treatment before implementation. |
| Is a policy citation score comparable across models or only within one retriever? | Trustworthiness of the grounding display | Show the score with retriever/version context and avoid presenting it as universal confidence. |
| Are users authenticated through a real session, identity header, or both? | Security and audit attribution | UI assumes a resolved operator identity but does not claim multi-tenant RBAC. |
| Is mobile a full investigation surface or a triage companion? | Responsive architecture | Mobile supports triage and complete review in stacked order, with no hidden evidence. |
| Which public claims are supported by artifacts? | Avoiding misleading marketing | Only the synthetic 60-record benchmark claims are retained until throughput evidence is attached. |
| Must every filter be shareable/deep-linkable? | Reproducibility and controller handoff | Yes; queue filters, sort, and expanded policy state should be URL-addressable where practical. |

## 10. Proposed next phase for an implementation-ready design handoff

The next phase should not begin with React components. It should begin with a **contract repair and design-system freeze**.

First, resolve the P0/P1 contradictions: remove Razorpay from the product title, add refund facts to the case contract, make rationale mandatory at the API boundary, reconcile PostgreSQL and test-count claims, separate gross exposure from disputed delta, and replace “copilot” terminology. Second, approve one design direction and create a small set of reference frames: public landing page, evidence page, queue desktop/tablet/mobile, case desktop/tablet/mobile, policy advisory open/closed, decision form, 409 conflict, audit record, and empty/loading/error states. Third, define semantic tokens rather than only raw colors: `surface`, `content`, `border`, `severity`, `advisory`, `decision`, `missing`, `ambiguous`, and `audit`. Fourth, write the state matrix and accessibility acceptance criteria for every named component. Fifth, create content examples for all eight exception types and at least one case with a missing refund or ambiguous match. Sixth, produce an Antigravity handoff with route map, component contracts, responsive transformations, authority rules, benchmark caveats, and a visual anti-pattern checklist.

The implementation-ready handoff should include these artifacts:

| Artifact | Required content | Exit criterion |
|---|---|---|
| Brand and mark sheet | Mark variants, clear space, one-color version, favicon/16px test, prohibited uses | Mark is ownable and not a literal eye, shield, coin, or AI sparkle |
| Semantic token sheet | Color roles, typography roles, spacing, radius, borders, focus, motion, light/hybrid variants | Every component maps to semantic roles; no unexplained raw values |
| Route storyboard | Public and app route purpose, navigation, page title, primary action, recovery path | Every route has a next step and no dead end |
| Queue specification | Column widths, row anatomy, filter URL state, keyboard model, exposure semantics | Queue remains primary above the fold at 1440px and usable at 768px/375px |
| Case specification | Source presence, refund lane, comparison order, policy boundary, decision terminal, 409 behavior | All four sources and all authority boundaries are visible without misleading omission |
| State matrix | Default, hover, focus, active, disabled, loading, error, empty, sparse, dense, conflict | Each state has copy, semantics, and recovery behavior |
| Accessibility checklist | Keyboard, labels, focus management, contrast, reduced motion, hit targets, zoom, live regions | WCAG 2.2 AA review passes on representative routes |
| Evidence content pack | Eight exception examples with values, missing states, root causes, and policy citations | Operators can understand each exception without invented data |
| Claims and benchmark note | Dataset, seed, environment, measurements, limitations, artifact links | Public copy never implies production guarantees from synthetic results |
| Antigravity handoff | Approved direction, tokens, routes, component contracts, responsive rules, QA checklist | Implementation can begin without resolving product contradictions in code |

The implementation gate should be **GO only after the contract repair list is closed**. Until then, the design direction is approved in principle but the repository should not be asked to encode an incomplete four-source evidence model or an ambiguous AI authority story.

## References

[1]: `01_frontier_role_prompt.md` — LedgerLens role, product narrative, hard constraints, and site architecture.
[2]: `03_readme.md` — Product architecture, trust boundary, workflow, benchmark, CI, and technology stack.
[3]: `08_product_vision_brief.md` — Core problem, solution, trust boundary, operator journey, and visual philosophy.
[4]: `11_user_stories.md` — Finance operations and controller personas, goals, and acceptance criteria.
[5]: `04_design_md.md` — Binding design tokens, routes, component specifications, accessibility, and anti-patterns.
[6]: `05_data_contracts.md` and `07_api_endpoint_map.md` — Schemas, formulas, exception taxonomy, request/response boundaries, and CAS conflict response.
[7]: `12_example_cases.md` — Concrete multi-source exception cases and root causes.
[8]: `06_component_inventory.md` — Frontend structure, route mapping, component responsibilities, and interactions.
[9]: [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) — Keyboard, focus, responsive, motion, content, forms, and accessibility guidance.
[10]: [VoltAgent Awesome DESIGN.md](https://github.com/voltagent/awesome-design-md) — Structured design-system documentation as a portable agent-readable format.
[11]: [DesignMD](https://designmd.co) — Searchable design-system and pattern reference platform.
[12]: [Design Motion Principles](https://github.com/kylezantos/design-motion-principles) — Purposeful motion and anti-AI-slop motion checks; the supplied `emilkowalski.ski/skill` URL did not resolve in this environment.
[13]: [OriginKit](https://www.originkit.dev/) — Component and effect gallery.
[14]: [React Bits](https://reactbits.dev/) — Animated and customizable React component collection.
[15]: [Aceternity UI](https://ui.aceternity.com/) — React/Tailwind landing-page components and templates.
[16]: [Taste Skill](https://www.tasteskill.dev/) — Anti-slop frontend design framework and design-direction inference.
[17]: [Hallmark](https://www.usehallmark.com/) — Structure-first study, audit, and redesign principles.
[18]: [Impeccable](https://impeccable.style/) — Agent-oriented visual critique and design vocabulary.
[19]: [Godly Design](https://godly.design/) — Curated web, app, UI, and visual-design gallery.
[20]: [Awwwards UI Design](https://www.awwwards.com/websites/ui-design/) — Curated UI design and interaction inspiration.
[21]: [Minimal Gallery](https://minimal.gallery/) — Curated beautiful and functional website gallery.
[22]: [SiteInspire](https://www.siteinspire.com/) — Curated web-design showcase with typography, grid, and style categories.
[23]: [Fonts In Use](https://fontsinuse.com/) — Independent archive of typography in real contexts.
[24]: [Landingfolio](https://www.landingfolio.com/) — Landing-page design, template, and component reference.
