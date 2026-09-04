# Research Evidence and Design Rationale

LedgerLens uses publicly available research on synthetic data and financial agent systems as **design guidance**, not as external validation of the product.

The J.P. Morgan AI Research material referenced in [`RESEARCH_REFERENCES.md`](RESEARCH_REFERENCES.md) helped sharpen four decisions:

1. Synthetic records should preserve relationships across tables rather than generate unrelated random rows.
2. Financial arithmetic and structured fact extraction should stay in deterministic tools rather than be delegated to an LLM.
3. Policy text and transaction facts should have separate evidence paths.
4. High-stakes finance operations should retain a human supervisory boundary and an audit history.

LedgerLens applies those ideas through seeded multi-source fixtures, Python `Decimal` calculations, PostgreSQL persistence, SQL-backed case evidence, read-only policy RAG, explicit exception routing, and human review records.

> I used publicly available J.P. Morgan AI Research material as design guidance for synthetic-data quality and the AI boundary. LedgerLens is not affiliated with, endorsed by, or validated by J.P. Morgan Chase.

The LedgerLens benchmark remains independent. Its match rate, precision, recall, throughput, and exception list come from the repository’s own evaluation harness and should be regenerated from the stated seed and dataset size. Research context explains why the architecture was chosen; it does not prove the benchmark result.

## Citation checklist before public submission

- Add the exact public title, author or institution, publication date, URL or DOI, and access date for every source.
- Keep paraphrases clearly separated from direct quotations.
- Do not commit a full paper or private review notes without redistribution permission.
- Replace broad claims such as “gold standard” or “guarantees” with source-specific, verifiable wording.
- Keep the Razorpay and J.P. Morgan non-affiliation statement visible.
