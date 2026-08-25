status: DRAFT last\_updated: 2026-08-24 source\_of\_truth: ../research-exit-SOURCE-OF-TRUTH.md review\_required: true  
 Scope guard: This plan evaluates only the approved MVP workflow — exception-first multi-source reconciliation over payments, refunds, settlements, and bank credits (research-exit-SOURCE-OF-TRUTH.md §4, docs/PRD.md §7/§11). It defines no evaluation for Settlement Q\&A, forward cash forecasting, or tax-line matching — those remain future extensions (docs/PRD.md §18) and are out of scope here.  
 EVALUATION\_PLAN.md  
 1\. Dataset scale  
 Official minimum: at least 50 synthetic records (research-exit-SOURCE-OF-TRUTH.md §1, §9).  
 Recommended evaluation batch: 500 records, per the USER-PROVIDED design target in §9 of the source of truth. This is a design choice, not an OFFICIAL requirement — the 50-record minimum is what the track requires; 500 is what this project targets for a statistically meaningful precision/recall read.  
 ASSUMPTION, flagged rather than invented: "record" here means one payment-anchored reconciliation case — i.e., one row in the payments table, with its linked refunds/settlement/bank-credit rows and any deliberately-injected duplicates counted as part of that case's evidence, not as separate top-level records. DATA\_CONTRACT.md does not fix this unit explicitly; the generator and this plan adopt payment-level cases as the counting unit because the workflow (research-exit-SOURCE-OF-TRUTH.md §4) is anchored on payments. If a different unit is intended, this must be corrected before Gate 1, not assumed silently past this point.  
 Both the 50-minimum smoke run and the 500-record evaluation run use the same generator, same schemas (docs/DATA\_CONTRACT.md), and the same seed-based reproducibility requirement (§10 below).  
 2\. Synthetic data and hidden ground truth  
 Generated per docs/DATA\_CONTRACT.md §11–§12: a clean canonical transaction set, source tables derived from it, then known errors deliberately injected.  
 The dataset must include normal (cleanly reconciling) cases and at least one deliberately-injected instance of each of the eight exception types (docs/DATA\_CONTRACT.md §10): missing\_settlement, missing\_bank\_credit, amount\_mismatch, fee\_mismatch, duplicate\_payment, duplicate\_bank\_credit, partial\_refund\_not\_reflected, ambiguous\_match.  
 Distribution: exact proportions (what fraction of the 500 records are normal vs. each exception type) are not specified in research-exit-SOURCE-OF-TRUTH.md — left as a Gate 1 generator-configuration decision, flagged as an open question (§14) rather than invented here. A reasonable default worth carrying into Gate 1: enough of each exception type to compute a non-degenerate per-type precision/recall (a single injected instance per type is enough to prove detection but too small to trust a per-type recall number) — this plan recommends the generator support a configurable minimum count per exception type, not a fixed ratio picked here.  
 Hidden ground truth is generated once, alongside the synthetic batch, before the application ever processes it, and is never derived from anything the application computes at runtime (docs/DATA\_CONTRACT.md §11).  
 3\. Ground-truth schema used by this plan  
 Per docs/DATA\_CONTRACT.md §11:  
 case\_id  
 expected\_status  
 exception\_type \-- one of the eight, or null  
 expected\_resolution\_reason \-- matched | no\_candidate\_found | multiple\_candidates | ...  
 true\_payment\_id  
 true\_settlement\_id  
 expected\_net\_amount  
 expected\_settlement\_date  
 requires\_human\_review

This plan is the first consumer of expected\_resolution\_reason (defined but not scored in docs/DATA\_CONTRACT.md §15, which explicitly forward-references this file). What this plan adds: scoring compares the application's predicted resolution\_reason (docs/DATA\_CONTRACT.md §15) against expected\_resolution\_reason, in addition to comparing exception\_type against expected\_status. These are two separate correctness checks — a case can get exception\_type right while getting resolution\_reason wrong (e.g., correctly flagging no financial exception, but for the wrong underlying reason), and both are reported, not collapsed into one pass/fail.  
 4\. Match-rate formula and denominator  
 match\_rate \= auto\_reconciled\_count / total\_cases\_in\_batch

Numerator: cases where decision\_status \= auto\_reconciled (docs/ARCHITECTURE.md §11).  
 Denominator, documented explicitly (per NFR/research-exit-SOURCE-OF-TRUTH.md §11's requirement that the denominator be documented, not left implicit): the total number of payment-anchored cases the batch attempted to process — i.e. every case that reaches a terminal decision\_status (auto\_reconciled | needs\_review | unresolved | rejected | blocked | already\_processed), including cases blocked by data-quality issues at the row level (failure\_type/failure\_reason populated per docs/FAILURE\_AND\_RECOVERY.md §2). Batches that produced zero cases at all — batch\_status \= rejected (e.g. missing CSV columns) or batch\_status \= paused/failed before any case was created — contribute nothing to this denominator. batch\_status and decision\_status are now separate fields (docs/FAILURE\_AND\_RECOVERY.md §2): decision\_status is never stretched to describe a whole batch.  
 This denominator choice is a decision made by this document, not sourced verbatim from research-exit-SOURCE-OF-TRUTH.md (which requires "a clearly documented denominator" but does not fix which one). Flagged for confirmation at Gate 3, not silently treated as settled.

4a. Safe auto-match rate and overall resolution rate  
 safe\_auto\_match\_rate \= auto\_reconciled\_count / eligible\_cases  
 overall\_resolution\_rate \= (auto\_reconciled\_count \+ human\_approved\_count) / eligible\_cases

eligible\_cases is the §4 denominator, scoped to batches that reached batch\_status \= completed or completed\_with\_errors. The two metrics are reported separately, never blended: safe\_auto\_match\_rate isolates what the system resolves with zero human involvement — the figure most relevant to NFR1 and the false\_auto\_approvals safety check (§7) — while overall\_resolution\_rate additionally credits human\_approved\_count (a human confirming a needs\_review case). A batch can show high overall\_resolution\_rate with low safe\_auto\_match\_rate, which is an expected, meaningful pattern early on, not a bug to hide by collapsing the two numbers into one. human\_approved\_count only counts approvals that are durably persisted — never during a paused batch (docs/FAILURE\_AND\_RECOVERY.md §10, no unpersisted approval).  
 5\. Precision and recall  
 Two distinct classification problems are scored, not one:  
 (a) Binary — "does this case have a financial exception at all?" Positive class \= expected\_status ≠ matched (i.e., ground truth says some exception type applies).  
 precision \= TP / (TP \+ FP)  
 recall \= TP / (TP \+ FN)

where TP \= predicted exception\_type ≠ null and expected\_status ≠ matched; FP \= predicted exception\_type ≠ null but expected\_status \= matched (system raised a false exception); FN \= predicted exception\_type \= null (or auto\_reconciled) but expected\_status ≠ matched (system missed a real exception — the more dangerous error, since it risks a false automatic approval).  
 (b) Multiclass — "which of the eight exception types is it?" Computed only over cases where expected\_status ≠ matched (i.e., conditional on (a) correctly or incorrectly flagging an exception). Report per-type precision/recall/F1 for all eight types, plus macro-averaged precision/recall across types. A confusion matrix (8×8, plus a "missed entirely" row/column) is the primary artifact — a single aggregate number would hide, e.g., systematic confusion between amount\_mismatch and fee\_mismatch.  
 6\. Exception detection rate  
 exception\_detection\_rate \= (cases where predicted exception\_type \= expected\_status, for expected\_status ≠ matched) / (total cases where expected\_status ≠ matched)

This is recall from §5(b) restated as the track's required "honest exception list" metric (research-exit-SOURCE-OF-TRUTH.md §1, §11) — reported separately because it is one of the track's mandatory metrics, not merely a derived statistic.

6a. Financial exception recall and exception-type accuracy  
 financial\_exception\_recall \= correctly detected financial exceptions / all ground-truth financial exceptions  
 exception\_type\_accuracy \= correctly classified exception cases / all detected exception cases

financial\_exception\_recall is the same quantity as recall in §5(a), restated under the track's own terminology; it is reported alongside §5(a)/§6, not computed a third time independently. exception\_type\_accuracy is a single summary number over the §5(b) multiclass population (correct classifications ÷ total detected) — reported in addition to, never instead of, the full §5(b) confusion matrix, since one accuracy figure can hide which specific exception-type pairs are being confused.  
 7\. False automatic approvals  
 false\_auto\_approvals \= count of cases where decision\_status \= auto\_reconciled AND expected\_status ≠ matched

This is the single most safety-critical number in this plan (research-exit-SOURCE-OF-TRUTH.md §11 safety metrics; docs/PRD.md NFR1: target zero in the demonstration set). It is reported as an absolute count and as a rate (false\_auto\_approvals / auto\_reconciled\_count), and is checked on every evaluation run, not sampled. A non-zero count blocks Gate 3 sign-off regardless of how good match rate or overall accuracy looks — this plan treats it as a hard gate, not a metric to be averaged away.  
 8\. Throughput measurement  
 throughput \= total\_cases\_processed / total\_batch\_duration\_seconds

Measured for the full batch, wall-clock, from first row ingested to last case reaching a terminal decision\_status. Reported once for the rules-only baseline (Gate 2, no AI) and again for rules+AI (Gate 5), since AI calls are expected to materially change throughput (§11 below) — a single blended number would hide that trade-off.  
 9\. Latency  
 Per-case processing latency, not just batch-level throughput:  
 Deterministic-path latency (matching \+ policy, no AI needed): p50/p95/p99, measured independently of AI latency.  
 AI-assisted-path latency (cases that hit the AI/RAG service): p50/p95/p99, and reported separately from deterministic-path latency so a small number of slow AI calls don't get averaged into an otherwise-fast deterministic majority.  
 Latency and throughput are related but not interchangeable: a batch can have high throughput with a long tail of slow individual cases (e.g., every retry-then-fallback case per docs/FAILURE\_AND\_RECOVERY.md) — both are reported.  
 10\. Model-call count and cost  
 Model-call count: total AI/RAG calls per batch run, broken down by call type (candidate suggestion, exception classification assist, explanation generation, recommended-action drafting — docs/ARCHITECTURE.md §10), plus average calls per AI-assisted case (expected \> 1 where a malformed-JSON or timeout retry occurred, per docs/FAILURE\_AND\_RECOVERY.md).  
 Cost: estimated cost per batch run \= Σ(calls × price-per-call, by call type and token count). ASSUMPTION, explicitly unresolved: model provider and pricing are not fixed anywhere in this pack (docs/ARCHITECTURE.md §19 lists LLM provider choice as UNVERIFIED; docs/PROJECT\_REQUIREMENTS.md §4 open question 3 — "confirm allowed model providers and quotas" — is still open). This plan defines the cost formula and what must be logged (model name, input/output token counts per call) so cost can be computed retroactively once a provider is chosen; it does not invent a provider or a price here.  
 11\. Rules-only baseline vs. rules+AI vs. optional rules+AI+RAG  
 Three comparison conditions, run against the same fixed dataset, same seed (§13):  
 Rules-only baseline (Gate 2 stop condition): deterministic matching \+ policy engine only. No AI call of any kind. Confidence is derived purely from deterministic match certainty (exact-identifier match → high; broader-pass single candidate → medium; broader-pass zero or tied candidates → low). This run establishes the floor — what the reconciliation engine achieves with zero AI assistance — and is what docs/ARCHITECTURE.md §18 trade-off 1 ("rules-first, AI only for ambiguity and explanation") is measured against.  
 Rules \+ AI (Gate 5): same engine, AI enabled for messy narration interpretation, candidate suggestions, exception-classification assistance, and explanation/recommendation drafting — all still bounded by the AI/RAG boundary (docs/ARCHITECTURE.md §10). Compared against the baseline on every metric in §4–§10, plus the cost/latency delta the AI adds.  
 Optional rules \+ AI \+ RAG: only if vector/document RAG is added later (docs/ARCHITECTURE.md §10 — explicitly optional, not provisioned at Gate 1). If it is added, the same fixed dataset/seed is re-run with retrieval enabled and compared against condition 2\. This comparison is not required for the core acceptance gate (research-exit-SOURCE-OF-TRUTH.md §1 gate checklist does not require RAG) and is not blocking if RAG is never added.  
 Every run under all three conditions records: dataset version, random seed, code commit, model and prompt version, retrieval configuration, thresholds in effect, and evaluation timestamp (§13).  
 12\. DeepEval metrics and their boundaries  
 DeepEval is used only for qualities that are genuinely about AI output quality, not for anything §4–§8 already measures deterministically:  
 MetricApplies toNotes  
 Faithfulness  
 AI explanations  
 Does the explanation stay grounded in the SQL-retrieved evidence actually given to it, without inventing facts?  
 Answer relevancy  
 AI explanations, recommended actions  
 Is the output actually responsive to the case, not generic boilerplate?  
 Contextual relevancy / precision / recall  
 Only relevant if vector/document RAG is enabled (§11, condition 3\) — not applicable when only SQL-grounded retrieval is used (docs/ARCHITECTURE.md §10), since there is no retrieved-document set to score against under condition 1 or 2\.

Exception-classification quality  
 AI-assisted classification, as a qualitative/rubric check  
 This is supplementary to the deterministic precision/recall in §5 — DeepEval here is a G-Eval-style rubric on the AI's stated reasoning, not the scoring mechanism for whether the label itself is correct.  
 Recommended-action quality  
 AI recommendations  
 G-Eval rubric: bounded (falls within the fixed action set), evidence-referenced, non-hallucinated, does not imply an action outside docs/PRD.md scope exclusions (no real money movement, no accounting advice, etc.).  
 Structured-output validity rate  
 Every AI call  
 Percentage of calls that pass Pydantic schema validation on first attempt vs. after the single retry (docs/FAILURE\_AND\_RECOVERY.md §5). Measured directly via Pydantic/pytest, not a DeepEval LLM-judge call — listed here because it is part of "AI output quality" reporting even though the mechanism is deterministic.  
 Hard boundary, restated directly from research-exit-SOURCE-OF-TRUTH.md §11 and carried through docs/ARCHITECTURE.md §10: DeepEval / an LLM judge is never the authority for exact amounts, final IDs, financial approval (decision\_status), persistence, batch completion, or throughput. Those are exclusively the deterministic metrics in §4–§9. DeepEval scores are reported alongside the deterministic metrics, never substituted for them, and never allowed to override a decision\_status.  
 13\. Reproducibility  
 Every evaluation run logs, at minimum:  
 Dataset version (generator output hash or version tag).  
 Random seed used for generation.  
 Code commit hash.  
 Model and prompt version (per call type, since different call types may use different prompts).  
 Retrieval configuration (SQL-grounded only, or SQL \+ vector RAG, and if the latter, index/version).  
 Confidence thresholds in effect at run time.  
 Evaluation timestamp.  
 Gate 3 stop condition, restated: one command produces the full evaluation report (research-exit-SOURCE-OF-TRUTH.md §19) — all of §4–§12 in a single reproducible run, not a manually assembled set of separate scripts.  
 14\. Regression testing  
 A fixed golden dataset (a frozen subset or the full 500-record set, seed-pinned) is re-run on every meaningful code or prompt change.  
 The pytest/DeepEval suite asserts that key metrics (match rate, false-auto-approvals — especially this one, per §7 — precision/recall per exception type, throughput) do not regress beyond a documented tolerance from the last accepted baseline run.  
 Historical run logs (per §13's fields) are retained so a regression can be traced to a specific commit, prompt version, or threshold change, not just detected.  
 Open question, not resolved here: exact regression tolerance thresholds (e.g., how much match-rate drop is acceptable before failing CI) are not specified anywhere in this pack — left for Gate 3 configuration, flagged rather than picked arbitrarily.  
 15\. Data-leakage prevention  
 Automated check, run as part of the evaluation suite: no field from the hidden ground-truth schema (§3) may appear in any AI prompt, retrieval document, or API/UI response payload captured during a run. This is implemented as a check against the captured prompts/responses logged for each run (§13), not a one-time manual review.  
 This directly implements the exit criterion in docs/DATA\_CONTRACT.md §11 ("an automated check ... that no ground-truth field ever appears in an AI prompt or API response") — that file names the check as planned and defers its definition here; this section is where it is defined.  
 The check runs on every evaluation run, not only the first one, since a leakage regression could be introduced by an unrelated prompt-template change.  
 16\. Human evaluation  
 A small, non-exhaustive qualitative spot-check, distinct from the automated metrics above:  
 A sample of AI explanations and recommended actions (ASSUMPTION: a sample size in the 20–30 case range is proposed here as a starting point, not fixed by any source document — flagged for Gate 3 confirmation) is manually reviewed by the project team against a short rubric: clarity, evidence-groundedness, actionability, and absence of anything that reads as more confident than the underlying confidence level warrants.  
 This is qualitative and advisory — it informs prompt/UX iteration but is never itself a pass/fail gate the way §7 (false auto-approvals) or §14 (regression tolerance) are. It does not replace DeepEval or the deterministic metrics; it exists because some failure modes (an explanation that is technically faithful but confusing to a human reviewer) are easier for a person to catch than a metric.  
 17\. Open questions carried or newly flagged by this plan  
 Exact distribution/count of injected exceptions per type within the 500-record set (§2) — left for Gate 1 generator configuration.  
 Match-rate denominator (§4) is a decision made in this document, not previously fixed — flagged for explicit confirmation before Gate 3, since it affects every downstream metric.  
 Model provider, pricing, and quotas (§10) remain unresolved — carried from docs/PROJECT\_REQUIREMENTS.md §4 open question 3 and docs/ARCHITECTURE.md §19.  
 Human-evaluation sample size (§16) is proposed, not fixed.  
 Regression tolerance thresholds (§14) are not specified — left for Gate 3\.  
 Confidence thresholds feeding decision\_status (docs/ARCHITECTURE.md §11) are tuned on validation data and frozen only before held-out evaluation — this plan assumes that tuning happens before the Gate 3 held-out run it evaluates, consistent with research-exit-SOURCE-OF-TRUTH.md §13, but the tuning itself is out of scope for this document.  
 No contradiction with research-exit-SOURCE-OF-TRUTH.md, docs/PRD.md, docs/PROJECT\_REQUIREMENTS.md, docs/ARCHITECTURE.md, or docs/DATA\_CONTRACT.md was found while drafting this file. If one is found later, it is logged in docs/CONSISTENCY\_REPORT.md (Batch 5), not resolved silently here.

