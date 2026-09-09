# LedgerLens — Razorpay Buildathon Application Outline

This outline is a preparation document for the twelve application fields. It is written in a student voice and should be updated with the applicant’s personal details, final public repository URL, and final pitch link before submission.

## About you

| Application field | Draft answer or preparation note |
|---|---|
| Full name | Add the applicant’s full legal name. |
| College | Add the current college or university name. |
| Graduation year | Add the expected graduation year. |
| In-person from September | Select Yes or No honestly based on availability. |
| 6 or 12 months | Select the commitment the applicant can actually make. |
| Resume file | Upload the final one-page resume that matches the project story. |

## About the build

| Application field | Draft answer |
|---|---|
| Track | **AI Finance Controller — Track 04** |
| Project name | **LedgerLens** |
| What it solves | I built LedgerLens to solve one narrow finance-operations problem: finding where payment records stop agreeing with settlement, refund, bank, and ledger records. It processes a synthetic batch of more than 50 records, measures what can be matched automatically, lists the exceptions that still need attention, and gives a human reviewer the evidence to decide what happens next. |
| GitHub repository URL | Official public repository: `https://github.com/Sathvik1533/LedgerLens` (permanent redirect preserved from original submission `razorpay-ai-finance-controller`). |
| Five-minute pitch video | Record a short evidence-led walkthrough: batch enters → benchmark shows throughput, measured accuracy, and honest exceptions → queue → one case across four sources → policy explanation → human decision → saved audit history. Use an unlisted video link if permitted. |
| What broke, and how you got out | The first production-style prototype exposed two important failures: the Evaluation page could become blank when an exception field was missing, and the review queue could remain stuck in loading when an upstream response stalled or used a different object shape. I treated those as contract and state-management problems rather than hiding them. The recovery plan adds explicit response normalization, request timeouts, loading/empty/error states, and test evidence. The next hardening milestone adds real server-enforced authentication, backend role checks, and authenticated audit actors before the product is presented as ready. |

## The core answer to remember

LedgerLens is not trying to be another generic AI dashboard. It closes one finance-operations loop. Deterministic rules establish the financial result. AI explains evidence and policy without approving or moving money. A human reviewer decides unresolved cases. The audit history preserves what happened.

## Evidence to have ready before submitting

The final application should be supported by a public repository, a stable demo link, a five-minute pitch, a reproducible 50+ record benchmark, throughput and measured accuracy, an honest exception list, a fresh no-run state, a two-fixture change test, and a complete evidence-to-decision-to-audit walkthrough. Do not use a final answer that describes authentication, dynamic UI behavior, or deployment as complete until the corresponding implementation and evidence exist.
