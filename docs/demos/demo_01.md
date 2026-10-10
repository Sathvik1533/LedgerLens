# LedgerLens Product Demonstration

- **Video Artifact Path:** `/Users/k.sathvik/.gemini/antigravity/scratch/LedgerLens_brag.mp4`
- **Workflow Shown:** Deterministic multi-source reconciliation batch execution (`evaluation/run_benchmark.py`), sub-millisecond matching of 60 transactions across 4 legs (payment, settlement, refund, bank credit), 0 false approvals, and exception queue prioritization.
- **Environment & Date:** Local verification environment (macOS, Python 3.11.15), October 10, 2026.
- **What the Demo Proves:**
  1. Deterministic Python `Decimal` matching engine executes with 0 false approvals.
  2. High-throughput in-memory evaluation (>24,000 records/sec).
  3. Automatic categorization of 18 discrepancies into closed financial exception classes (Amount Mismatch, Missing Bank Credit, Fee Mismatch, etc.).
  4. Emission of JSON and CSV evaluation benchmark artifacts.
- **Known Limitations:**
  - Full browser Playwright E2E suite unverified locally due to missing Chromium binaries.
  - Live Groq RAG policy explanation requires active API key.
- **Synthetic-Data Statement:** All data used in this demonstration is 100% synthetic/simulated. Generated via `evaluation/generator_fixture.py`. No real financial data, banking credentials, or personal records are used.
