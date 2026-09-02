# Product Vision Acceptance Matrix

## Acceptance Matrix

| Acceptance criterion | Route/component | Expected behavior | Actual verified behavior | Evidence | Pass/Fail | Fix |
|---|---|---|---|---|---|---|
| Queue priority | `/app` shell | Shell lands directly on the exception queue dashboard | `Navigate to "/app/queue" replace` is default | `App.tsx` routing | Pass | None |
| Queue priority | `/app/queue` | Queue shows real cases and monetary exposure | Fetches API payload, renders `amount_at_risk` | Playwright & Source (`fetchReviewQueue`) | Pass | None |
| Queue priority | `/app/queue` filters | Filtering and sorting affect the dataset | Critical/High filters immediately update the visible `<tr>` row count | Playwright E2E log (rows changed) | Pass | None |
| Plain-language explanation | Queue rows | Rows display a human-readable "what happened" | Rules engine maps `missing_settlement` to "Gateway captured funds but no settlement received." | `utils/rules.ts` `getPlainLanguageSummary` | Pass | None |
| Plain-language explanation | Queue rows | Technical codes remain secondary | Primary header is human-readable, raw exception code is a small mono tag | Visual audit | Pass | None |
| Plain-language explanation | Queue rows | Missing evidence is stated explicitly | Missing datasets render "Missing Record" greyed out | `CasePage.tsx` conditional rendering | Pass | None |
| Evidence visibility | `/app/case/:id` | Core evidence visible without tab switching | Bento grid natively renders Gateway, Settlement, and Bank simultaneously | `CasePage.tsx` grid layout | Pass | None |
| Evidence visibility | `/app/case/:id` | Traced to API / Documented calculation | ID, amounts, and statuses match the `/cases/{id}` Pydantic schema precisely | Backend schema & TypeScript types | Pass | None |
| Evidence visibility | `/app/case/:id` | Missing sources have truthful states | `!caseData.settlement` renders explicit `<MissingState>` | `CasePage.tsx` source | Pass | None |
| AI subordination | `/app/case/:id` | Policy advisory collapsed or subordinate | Rendered in a strict side-panel, visually smaller than financial evidence | Visual layout | Pass | None |
| AI subordination | `/app/case/:id` | Verified facts and confidence state only | Displays chunks, cosine similarity score, and source doc title | `RagCopilotPanel.tsx` | Pass | None |
| AI subordination | `/app/case/:id` | No action controls in AI panel | Only human operator panel has action controls | `ReviewActionForm.tsx` isolation | Pass | None |
| Safe human decision | `/app/case/:id` | Human actions isolated in decision panel | Separated component `ReviewActionForm.tsx` bottom-pinned | Source layout | Pass | None |
| Safe human decision | `/app/case/:id` | Approve/Reject distinguishable | Red label for Reject, Green for Approve | Visual styling | Pass | None |
| Safe human decision | `/app/case/:id` | Reviewer identity required | Submit button strictly disabled if actor is empty string | `disabled={!actor}` in `ReviewActionForm` | Pass | None |
| Safe human decision | `/app/case/:id` | HTTP 409 announced clearly, no overwrite | Caught HTTP 409 renders "Concurrent Modification Detected" alert overlay | E2E simulation | Pass | None |
| Real data | App-wide | No invented money, counts, identities | Static fallback datasets deleted. Charts and queues use live API hooks | Code purge complete | Pass | Fixed previously |
| Real data | Settings page | Static configs labeled as configuration | Section explicitly labeled "System Architecture & Capabilities (Static Info)" | `SettingsPage.tsx` copy | Pass | Fixed |
| Real data | Evidence/Eval | Marketing proofs are structurally honest | Claims changed from "1,000 TPS" to "Penny-Exact Math" | `EvaluationPage.tsx` copy | Pass | Fixed |
| Visual distinction | App-wide | No generic AI landing page composition | UI uses off-whites (`paper-0`), high contrast `ink-900`, and `Inter`/`JetBrains` typographic rigor. | Config & Visual audit | Pass | Fixed |

## Human-Readable Verdict

Queue priority: Pass
Plain-language exception explanation: Pass
Evidence visibility: Pass
AI subordination: Pass
Human decision safety: Pass
Real-data integrity: Pass
Visual distinctiveness: Pass
Overall product-vision gate: Pass

