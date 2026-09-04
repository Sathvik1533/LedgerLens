import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LedgerTraceA } from '../../components/concepts/LedgerTraceA';
import { Tooltip } from '../../components/ui/Tooltip';
import { HowToUseRoomGuide } from '../../components/HowToUseRoomGuide';
import { fetchReconciliationBenchmark, triggerBenchmarkRun } from '../../api/client';
import { ReconciliationBenchmarkResponse } from '../../types/api';

export default function LandingPage() {
  const [benchmarkData, setBenchmarkData] = useState<ReconciliationBenchmarkResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);

  const loadBenchmark = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReconciliationBenchmark();
      setBenchmarkData(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to query benchmark state.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBenchmark();
  }, []);

  const handleRunHarness = async () => {
    setIsTriggering(true);
    try {
      const result = await triggerBenchmarkRun(60, 42);
      setBenchmarkData(result);
    } catch (err: any) {
      alert(`Benchmark execution failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTriggering(false);
    }
  };

  const hasRun = Boolean(benchmarkData && benchmarkData.has_run);

  return (
    <div className="w-full font-sans text-ink bg-canvas">
      {/* 1. Simplified, High-Pacing Hero on Deep Ink Canvas */}
      <section className="relative bg-[#111315] text-[#FCFBF8] overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-white/10">
        {/* Soft Ambient Radial Light */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none opacity-25"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(234, 228, 216, 0.4), transparent 70%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
          {/* Masthead Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 text-xs font-mono text-[#D8D2C8]">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ledger-green" />
              <span className="tracking-wider uppercase text-[#EAE4D8]">
                Exception-First Multi-Source Reconciliation
              </span>
              <span className="text-[#716E68]">&bull;</span>
              <span className="text-[#A87931]">Four Counterparties Verified</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-white/5 border border-white/20 hover:border-white/40 text-xs text-[#FCFBF8] transition-colors"
                aria-label="Open 5-step operational guide"
              >
                <span className="text-brass">✦</span>
                <span>How to use this room</span>
                <span className="text-[10px] text-[#A8A49C] ml-1">[5 steps]</span>
              </button>
            </div>
          </div>

          {/* Hero Typography & Core Promise */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-6">
              <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#FCFBF8] leading-[1.06]">
                When the numbers disagree, <br />
                <span className="italic text-[#EAE4D8]">LedgerLens</span> shows you where.
              </h1>
              <p className="text-base sm:text-lg text-[#D8D2C8] leading-relaxed max-w-2xl font-light">
                A merchant payment was captured. Less money arrived in the bank. LedgerLens cross-examines four financial records, isolates the discrepancy down to the exact counterparty, cites the governing policy, and commits the human decision to an immutable ledger.
              </p>
            </div>

            <div className="lg:col-span-4 space-y-4 lg:pb-2">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  to="/app/queue"
                  className="px-6 py-3.5 bg-[#FCFBF8] text-[#111315] font-medium text-xs rounded-xs hover:bg-[#EAE4D8] transition-colors text-center shadow-lg"
                >
                  Open operational review queue &rarr;
                </Link>
                <Link
                  to="/evaluation"
                  className="px-5 py-3 border border-white/20 hover:border-white/40 text-[#D8D2C8] hover:text-white text-xs rounded-xs transition-colors text-center font-mono"
                >
                  View mathematical benchmark &rarr;
                </Link>
              </div>
              <div className="text-[11px] font-mono text-[#A8A49C] text-center lg:text-left">
                Zero AI floating-point math &bull; Human controller sign-off required
              </div>
            </div>
          </div>

          {/* Single Focused Product Preview: The Reconciliation Line */}
          <div className="space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs font-mono text-[#A8A49C] gap-1">
              <span>THE RECONCILIATION LINE &mdash; FOUR INDEPENDENT STREAMS CONVERGING TO EXACT PARITY</span>
              <span className="text-[#B94E3D] font-medium">DISCREPANCY ISOLATED AT GATEWAY SETTLEMENT</span>
            </div>
            <LedgerTraceA hasDiscrepancy={true} />
          </div>
        </div>
      </section>

      {/* 2. Truthful Dynamic Benchmark Status Strip */}
      <section className="bg-[#EAE4D8] border-b border-rule py-8">
        <div className="max-w-6xl mx-auto px-6 space-y-4">
          {error && (
            <div className="p-4 bg-critical/10 border border-critical/30 rounded-xs text-xs font-mono text-critical flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={loadBenchmark}
                className="px-2 py-1 bg-critical text-white text-[10px] rounded-xs hover:bg-critical/90"
              >
                Retry
              </button>
            </div>
          )}
          {isLoading ? (
            /* State 2a: Initial Fetching */
            <div className="p-6 bg-surface border border-rule rounded-xs space-y-2 animate-pulse text-center">
              <span className="text-xs font-mono text-ink-secondary block uppercase tracking-wider">
                Querying benchmark engine status...
              </span>
              <div className="h-4 w-64 bg-rule/50 mx-auto rounded-xs" />
            </div>
          ) : isTriggering ? (
            /* State 2b: Execution In Progress */
            <div className="p-6 bg-surface border border-rule rounded-xs space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-ink">
                <span className="w-2 h-2 rounded-full bg-brass animate-ping" />
                <span className="font-semibold uppercase tracking-wider">
                  Executing 4-Source Deterministic Reconciliation Harness...
                </span>
              </div>
              <p className="text-xs text-ink-secondary font-sans max-w-md mx-auto">
                Processing synthetic merchant payments, gateway deductions, customer refunds, and bank statements down to ₹0.01.
              </p>
            </div>
          ) : !hasRun ? (
            /* State 1: No Run Yet (Truthful Empty State) */
            <div className="p-6 sm:p-8 bg-surface border border-rule rounded-xs space-y-5 shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-rule pb-3 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-ink-secondary uppercase tracking-wider block">
                    STATUS: NO ACTIVE RUN RECORDED
                  </span>
                  <h3 className="font-editorial text-2xl font-medium text-ink">
                    Empirical benchmark harness has not been executed
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-ink-muted">
                  0 records evaluated &bull; 0 false claims
                </span>
              </div>

              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-3xl">
                To prevent false accuracy claims, LedgerLens does not display placeholder numbers or stale cached metrics. Execute the verification harness in your terminal or trigger the live runner below to evaluate synthetic counterparty records with strict mathematical parity.
              </p>

              <div className="p-3.5 bg-canvas border border-rule rounded-xs font-mono text-xs space-y-2">
                <div className="text-[10px] text-ink-muted uppercase">Terminal Execution Command:</div>
                <div className="text-ink font-semibold">
                  $ python evaluation/run_benchmark.py --size 60 --seed 42
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleRunHarness}
                  disabled={isTriggering}
                  className="px-4 py-2.5 bg-ink text-canvas hover:bg-ink/90 text-xs font-medium rounded-xs transition-colors shadow-sm flex items-center gap-2"
                >
                  <span className="text-brass">▶</span>
                  <span>Execute 60-Record Verification Harness</span>
                </button>
                <Link
                  to="/evaluation"
                  className="px-4 py-2.5 border border-rule bg-surface hover:bg-canvas text-xs font-mono text-ink rounded-xs transition-colors"
                >
                  Inspect Evaluation Protocol &rarr;
                </Link>
              </div>
            </div>
          ) : (
            /* State 3: Completed Run (Truthful Dynamic Evidence) */
            benchmarkData && (
              <div className="p-6 sm:p-8 bg-surface border border-rule rounded-xs space-y-6 shadow-subtle">
                {/* Docket Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-rule pb-3 gap-2 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-ledger-green" />
                    <strong className="text-ink">LIVE BENCHMARK DOCKET</strong>
                    <span className="text-ink-muted">&bull;</span>
                    <span className="text-ink-secondary">Run ID: {benchmarkData.run_id}</span>
                  </div>
                  <span className="text-[10px] text-ink-muted">
                    Executed: {benchmarkData.timestamp_utc ? new Date(benchmarkData.timestamp_utc).toLocaleString() : 'Recent'}
                  </span>
                </div>

                {/* Mathematical Formula Proof Banner */}
                <div className="p-4 bg-[#111315] text-[#FCFBF8] rounded-xs font-mono space-y-1.5 border border-white/10">
                  <div className="text-[10px] text-[#A8A49C] uppercase tracking-wider">
                    Mathematical Match-Rate Formula &bull; Exact Decimal Parity
                  </div>
                  <div className="text-lg sm:text-2xl font-semibold text-[#FCFBF8] tracking-tight">
                    {benchmarkData.summary.auto_reconciled_count} auto_reconciled ÷ {benchmarkData.dataset_size} records_processed × 100 ={' '}
                    <span className="text-ledger-green">{benchmarkData.match_rate_percentage}%</span>
                  </div>
                  <div className="text-xs text-[#D8D2C8] pt-0.5">
                    Needs Review: {benchmarkData.summary.needs_review_count} cases &bull; Unresolved Dropouts: {benchmarkData.summary.unresolved_count} (0.00%)
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                      Total Processed
                    </span>
                    <div className="text-xl font-bold font-mono text-ink">
                      {benchmarkData.dataset_size} records
                    </div>
                    <span className="text-[10px] text-ink-muted block">Across 4 counterparties</span>
                  </div>

                  <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                      Clean Auto-Match
                    </span>
                    <div className="text-xl font-bold font-mono text-ledger-green">
                      {benchmarkData.match_rate_percentage}%
                    </div>
                    <span className="text-[10px] text-ink-muted block">
                      {benchmarkData.summary.auto_reconciled_count} of {benchmarkData.dataset_size} matched cleanly
                    </span>
                  </div>

                  <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                      Exceptions at Risk
                    </span>
                    <div className="text-xl font-bold font-mono text-critical">
                      ₹{parseFloat(benchmarkData.summary.total_amount_at_risk_inr || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-ink-muted block">
                      {benchmarkData.summary.needs_review_count} routed to human review
                    </span>
                  </div>

                  <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                      Engine Throughput
                    </span>
                    <div className="text-xl font-bold font-mono text-ink">
                      {Math.round(benchmarkData.throughput_records_per_sec || 0).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-ink-muted block">
                      {benchmarkData.throughput_unit || 'records/sec'} (in {(Number(benchmarkData.elapsed_seconds || 0) * 1000).toFixed(2)} ms)
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[11px] text-ink-secondary">
                    <span className="px-1.5 py-0.5 rounded-xs bg-ink/5 border border-rule text-[10px] uppercase font-semibold">
                      Synthetic Benchmark
                    </span>
                    <span>Zero floating-point rounding tolerance allowed</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/evaluation"
                      className="px-3 py-1.5 bg-ink text-canvas hover:bg-ink/90 rounded-xs text-xs font-sans transition-colors"
                    >
                      View full evaluation docket &rarr;
                    </Link>
                    <button
                      onClick={handleRunHarness}
                      disabled={isTriggering}
                      className="px-3 py-1.5 border border-rule bg-surface hover:bg-canvas text-xs text-ink rounded-xs transition-colors"
                    >
                      {isTriggering ? 'Re-running...' : 'Re-run harness'}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* 3. The 6-Chapter Financial Narrative Arc */}
      <div className="bg-[#F4F1EA] py-20 md:py-28 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 space-y-28">

          {/* Chapter 1: The Financial Problem */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary uppercase tracking-wider border-b border-rule pb-2">
              <span className="font-semibold text-ink">CHAPTER 01</span>
              <span>&bull;</span>
              <span>THE RECONCILIATION BLIND SPOT</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink leading-snug">
                  When money moves between four systems, numbers quietly stop agreeing.
                </h2>
                <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans">
                  In modern commerce, a single customer purchase does not live in one database. It spans merchant store carts, payment gateway remittances, customer refund queues, and institutional bank statements.
                </p>
                <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans">
                  Gateways deduct contractual <Tooltip content="Merchant Discount Rate: The negotiated percentage fee charged by the payment gateway for processing electronic transactions.">MDR fees</Tooltip> and statutory GST, batches bundle hundreds of payouts together, and timing cutoffs delay bank credits. When a gateway under-settles by ₹150, conventional accounting catches it weeks later during manual month-end audits.
                </p>
              </div>

              <div className="lg:col-span-5 p-6 bg-surface border border-rule rounded-xs space-y-4 shadow-subtle text-xs font-sans">
                <div className="font-mono text-[11px] uppercase text-ink-secondary font-semibold border-b border-rule pb-2">
                  The Four Counterparty Silos
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-ink">01</span>
                    <div>
                      <strong className="text-ink block">Merchant Platform</strong>
                      <span className="text-ink-secondary">Records captured gross order amount and cart reference.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-ink">02</span>
                    <div>
                      <strong className="text-ink block">Payment Gateway</strong>
                      <span className="text-ink-secondary">Withholds processing fees, GST, and dispute reserves.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-ink">03</span>
                    <div>
                      <strong className="text-ink block">Refund Ledger</strong>
                      <span className="text-ink-secondary">Tracks asynchronous partial and full customer reversals.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-ink">04</span>
                    <div>
                      <strong className="text-ink block">Institutional Bank Statement</strong>
                      <span className="text-ink-secondary">Confirms actual net funds deposited with institutional <Tooltip content="Unique Transaction Reference: The official 16 to 22 character identifier assigned by the banking network (NEFT/RTGS/IMPS) to confirm institutional deposit.">UTR numbers</Tooltip>.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Chapter 2: Four-Source Reconciliation Line */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary uppercase tracking-wider border-b border-rule pb-2">
              <span className="font-semibold text-ink">CHAPTER 02</span>
              <span>&bull;</span>
              <span>THE RECONCILIATION LINE</span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink leading-snug">
                One continuous line of mathematical verification.
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans">
                LedgerLens joins all four streams into a single trace. Rather than hoping aggregate batch totals balance, every transaction is evaluated against exact contract terms using <Tooltip content="Penny-exact equality (≤ ₹0.01 tolerance) verified via PostgreSQL numeric and pure Python Decimal arithmetic with zero LLM guesswork.">Deterministic Parity</Tooltip>.
              </p>
            </div>

            <div className="p-6 bg-surface border border-rule rounded-xs space-y-4 shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-rule pb-3 gap-2 text-xs font-mono">
                <span className="font-semibold text-ink uppercase">Penny-Exact Mathematical Invariant</span>
                <span className="text-ledger-green">Tolerance: ≤ ₹0.01 (Zero Floating Point Drift)</span>
              </div>
              <div className="p-4 bg-canvas border border-rule rounded-xs font-mono text-xs text-ink space-y-1">
                <div className="text-[10px] text-ink-muted uppercase">Canonical Formula:</div>
                <div className="text-sm sm:text-base font-semibold">
                  Expected Net = Gross Captured − (Contract MDR Fee + Statutory GST) − Customer Refunds == Net Bank Credit
                </div>
              </div>
            </div>
          </section>

          {/* Chapter 3: Exact Discrepancy (Illustrative Specimen) */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-rule pb-2 gap-2 text-xs font-mono text-ink-secondary">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink uppercase">CHAPTER 03 &bull; EXACT DISCREPANCY ISOLATION</span>
                <span className="px-1.5 py-0.5 rounded-xs bg-ink/5 border border-rule text-[10px] text-ink-secondary uppercase">
                  Illustrative Specimen
                </span>
              </div>
              <span>CASE REF: CAS-2026-0921-MM &bull; ORDER: ORD-99218</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
              {/* Left: The Redlined Evidence Breakdown */}
              <div className="border border-rule bg-surface p-6 sm:p-8 space-y-6 rounded-xs shadow-subtle">
                <div className="flex items-start justify-between border-b border-rule pb-4">
                  <div>
                    <span className="text-[11px] font-mono text-ink-secondary uppercase tracking-wider block">
                      Surfaced Anomaly
                    </span>
                    <span className="font-editorial text-2xl font-medium text-ink mt-0.5 block">
                      Gateway settlement withheld unapproved deduction
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-critical/10 text-critical border border-critical/30 font-mono text-xs font-semibold rounded-xs">
                    Material Exposure
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-2 border-b border-rule/60">
                    <span className="text-ink-secondary">1. Merchant Captured Gross (pay_01JNXK89201)</span>
                    <span className="text-ink font-semibold tabular-nums">₹10,000.00</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-rule/60">
                    <span className="text-ink-secondary">2. Agreed Fee Deduction (2.0% MDR + 18% GST)</span>
                    <span className="text-ink-secondary tabular-nums">-₹236.00</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-rule/60">
                    <span className="text-ink-secondary">3. Expected Net Payout</span>
                    <span className="text-ink font-semibold tabular-nums">₹9,764.00</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-critical/40 bg-critical/5 px-2.5 -mx-2.5 rounded-xs">
                    <span className="text-critical font-medium">4. Actual Reported Net Payout</span>
                    <span className="text-critical font-bold tabular-nums line-through decoration-critical">
                      ₹9,614.00
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-ink font-semibold pt-2">
                    <span>Unexplained Settlement Shortfall</span>
                    <span className="text-critical font-bold tabular-nums">-₹150.00</span>
                  </div>
                </div>

                <div className="p-4 bg-canvas border border-rule rounded-xs text-xs space-y-1.5">
                  <div className="font-mono font-semibold text-ink text-[11px]">
                    Governing Policy Rule: SOP-2026-FEE-01
                  </div>
                  <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                    The payment provider withheld ₹386.00 total instead of the contracted ₹236.00. The ₹150.00 deficit is redlined as an unauthorized clawback requiring controller escalation.
                  </p>
                </div>
              </div>

              {/* Right: The Four Counterparty Slips */}
              <div className="space-y-3 font-sans">
                <span className="text-xs font-mono uppercase text-ink-secondary block">
                  Four Counterparty Records
                </span>

                <div className="p-4 bg-surface border border-rule rounded-xs space-y-1 text-xs">
                  <div className="flex justify-between font-mono font-semibold text-ink">
                    <span>1. Merchant Payment</span>
                    <span className="text-ledger-green font-mono">₹10,000.00</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-mono">pay_01JNXK89201 &bull; Captured UPI</p>
                </div>

                <div className="p-4 bg-surface border-2 border-critical rounded-xs space-y-1 text-xs">
                  <div className="flex justify-between font-mono font-semibold text-critical">
                    <span>2. Gateway Settlement</span>
                    <span className="font-mono">₹9,614.00</span>
                  </div>
                  <p className="text-[11px] text-critical font-mono">set_01JNXK89201 &bull; Shortfall Deficit</p>
                </div>

                <div className="p-4 bg-surface border border-rule rounded-xs space-y-1 text-xs">
                  <div className="flex justify-between font-mono font-semibold text-ink">
                    <span>3. Customer Refunds</span>
                    <span className="text-ink-secondary font-mono">₹0.00</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-mono">Zero customer reversals logged</p>
                </div>

                <div className="p-4 bg-surface border border-rule rounded-xs space-y-1 text-xs">
                  <div className="flex justify-between font-mono font-semibold text-ink">
                    <span>4. Bank Statement (HDFC)</span>
                    <span className="font-mono">₹9,614.00</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-mono">UTR 202604038194 &bull; Deposited</p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/app/case/264548b2-c896-42b7-a2a4-c0f3f0f614b9"
                    className="block text-center py-2.5 bg-ink text-canvas hover:bg-ink/90 text-xs font-medium rounded-xs transition-colors"
                  >
                    Open live case workspace &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Chapter 4: Evidence & Policy Context */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary uppercase tracking-wider border-b border-rule pb-2">
              <span className="font-semibold text-ink">CHAPTER 04</span>
              <span>&bull;</span>
              <span>EVIDENCE & POLICY CONTEXT</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink leading-snug">
                  Grounded AI retrieves contractual policy, not subjective guesswork.
                </h2>
                <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans">
                  Software flags the mathematical difference; our Grounded RAG assistant searches the approved operational corpus for governing policy clauses.
                </p>
                <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans">
                  The AI has strictly zero direct financial authority: it cannot sign off on variances, approve journal vouchers, or invent candidates. It serves exclusively as a transparent advisor citing verified Standard Operating Procedures.
                </p>
              </div>

              <div className="lg:col-span-5 p-6 bg-surface border border-rule rounded-xs space-y-3 shadow-subtle text-xs font-mono">
                <div className="text-[11px] text-ink-secondary uppercase font-semibold border-b border-rule pb-2">
                  Retrieved Policy Citation
                </div>
                <div className="text-ink font-semibold">
                  SOP-2026-FEE-01 &bull; Section 4.2 (Gateway Dispute Mandate)
                </div>
                <blockquote className="p-3 bg-canvas border-l-2 border-brass text-ink-secondary font-sans leading-relaxed text-xs">
                  &ldquo;Any variance exceeding ₹0.01 between reported net payout and contracted expected net constitutes a material breach requiring formal gateway dispute issuance, unless an authorized VP-Finance commercial waiver is on file.&rdquo;
                </blockquote>
                <div className="text-[10px] text-ledger-green font-semibold">
                  ✓ Vector match confidence: 0.94 &bull; Corpus hash verified
                </div>
              </div>
            </div>
          </section>

          {/* Chapter 5: Human Decision (No AI Approval) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary uppercase tracking-wider border-b border-rule pb-2">
              <span className="font-semibold text-ink">CHAPTER 05</span>
              <span>&bull;</span>
              <span>HUMAN GOVERNANCE</span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink leading-snug">
                The operator remains the sole authority.
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans">
                Every exception in the review queue requires explicit human determination. Operators select the appropriate resolution reason and enter a mandatory operational justification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
              <div className="p-5 bg-surface border border-rule rounded-xs space-y-2">
                <span className="font-mono text-critical font-semibold uppercase block">
                  Action Option 01
                </span>
                <strong className="text-ink font-editorial text-lg block">Escalate Gateway Dispute</strong>
                <p className="text-ink-secondary leading-relaxed">
                  Issues an automated clawback demand to the payment aggregator citing contract schedule SOP-2026-FEE-01.
                </p>
              </div>

              <div className="p-5 bg-surface border border-rule rounded-xs space-y-2">
                <span className="font-mono text-high font-semibold uppercase block">
                  Action Option 02
                </span>
                <strong className="text-ink font-editorial text-lg block">Request Fee Credit Note</strong>
                <p className="text-ink-secondary leading-relaxed">
                  Requests an adjusting GST credit memo from the gateway partner to offset over-deducted processing surcharges.
                </p>
              </div>

              <div className="p-5 bg-surface border border-rule rounded-xs space-y-2">
                <span className="font-mono text-ledger-green font-semibold uppercase block">
                  Action Option 03
                </span>
                <strong className="text-ink font-editorial text-lg block">Approve Commercial Waiver</strong>
                <p className="text-ink-secondary leading-relaxed">
                  Applies an authorized commercial waiver when a promotional fee rate or negotiated volume rebate was agreed out-of-band.
                </p>
              </div>
            </div>
          </section>

          {/* Chapter 6: The Immutable Audit Receipt */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-rule pb-2 gap-2 text-xs font-mono text-ink-secondary">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink uppercase">CHAPTER 06 &bull; THE IMMUTABLE AUDIT RECEIPT</span>
                <span className="px-1.5 py-0.5 rounded-xs bg-ink/5 border border-rule text-[10px] text-ink-secondary uppercase">
                  Illustrative Specimen
                </span>
              </div>
              <span>RECEIPT REF: REC-2026-0921-99218</span>
            </div>

            <div className="p-6 sm:p-8 bg-surface border border-rule rounded-xs space-y-6 shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rule pb-4 gap-2">
                <div>
                  <span className="text-[11px] font-mono text-ink-secondary uppercase tracking-wider block">
                    Cryptographic Audit Event
                  </span>
                  <span className="font-editorial text-2xl font-medium text-ink mt-0.5 block">
                    Controller Sign-Off Committed to Immutable Ledger
                  </span>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-ledger-green font-semibold block">✓ Stamped to Append-Only DB</span>
                  <span className="text-ink-muted text-[10px]">Sequence #49281 &bull; Tamper Evident</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 bg-canvas border border-rule rounded-xs space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted block">Resolution Determination</span>
                  <span className="text-ink font-semibold">gateway_dispute_raised</span>
                </div>
                <div className="p-3 bg-canvas border border-rule rounded-xs space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted block">Authorized Controller</span>
                  <span className="text-ink font-semibold">controller_lead@ops.vault</span>
                </div>
                <div className="p-3 bg-canvas border border-rule rounded-xs space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted block">Committed Timestamp</span>
                  <span className="text-ink font-semibold">2026-04-03 16:42:19 IST</span>
                </div>
                <div className="p-3 bg-canvas border border-rule rounded-xs space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted block">Amount Redlined</span>
                  <span className="text-critical font-semibold">₹150.00 Deficit</span>
                </div>
              </div>

              <div className="p-4 bg-canvas border border-rule rounded-xs text-xs font-sans space-y-1">
                <span className="font-mono text-[10px] uppercase text-ink-muted block">
                  Mandatory Operator Rationale:
                </span>
                <p className="text-ink leading-relaxed italic">
                  &ldquo;Gateway withheld ₹150.00 surcharge in excess of agreed 2.0% MDR + 18% GST tier on order ORD-99218. Formal dispute notice dispatched to payment provider operations desk.&rdquo;
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  to="/app/audit"
                  className="px-4 py-2 border border-rule bg-surface hover:bg-canvas text-ink text-xs font-mono rounded-xs transition-colors"
                >
                  Inspect complete audit ledger &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* Institutional Close */}
          <section className="border border-rule bg-surface p-8 sm:p-12 rounded-xs text-center space-y-5 shadow-subtle">
            <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
              Ready to eliminate reconciliation blind spots?
            </h2>
            <p className="text-sm text-ink-secondary max-w-xl mx-auto leading-relaxed">
              Explore the live operational review queue and observe how continuous four-source reconciliation brings certainty to high-volume finance.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to="/app/queue"
                className="px-8 py-3 bg-ink text-canvas hover:bg-ink/90 text-sm font-medium rounded-xs transition-colors inline-block shadow-md"
              >
                Open operational review queue &rarr;
              </Link>
              <button
                onClick={() => setGuideOpen(true)}
                className="px-6 py-3 border border-rule bg-surface hover:bg-canvas text-ink text-sm font-mono rounded-xs transition-colors"
              >
                ✦ Open 5-step room guide
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* 4. Interactive "How to use this room" Guide (Controlled & Non-Blocking) */}
      <HowToUseRoomGuide
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
