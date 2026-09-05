import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function EvidencePage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16 font-sans selection:bg-surface-evidence selection:text-ink">
      {/* 1. Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface border border-rule rounded-xs text-[11px] font-mono text-ink-secondary shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-ledger-green" />
          <span className="tracking-wider uppercase">FOUR FINANCIAL RECORDS</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-ink leading-tight">
          How LedgerLens compares the evidence
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary font-normal leading-relaxed">
          Reconciliation breaks when companies rely on internal reports without checking the bank. Here is how LedgerLens compares payment, settlement, refund, and bank records.
        </p>
      </div>

      {/* 2. Side-by-Side or Sequential Examples */}
      <div className="space-y-10">
        
        {/* EXAMPLE A: Clean Transaction */}
        <div className="border border-rule bg-surface p-6 sm:p-8 rounded-xs space-y-6 shadow-subtle">
          <div className="border-b border-rule pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-ink-secondary uppercase tracking-wider block">
                EXAMPLE A &bull; MATCHED RECORDS
              </span>
              <h2 className="font-editorial text-2xl font-medium text-ink mt-0.5">
                Clean transaction: all four records agree
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-ledger-green/10 border border-ledger-green/30 text-xs font-mono text-ledger-green font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All four records agree
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {/* Payment */}
            <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-ink-secondary block">1. Payment</span>
              <div className="text-sm font-semibold text-ink">₹10,000.00</div>
              <p className="text-[11px] text-ink-muted font-sans">Customer checkout amount captured.</p>
            </div>

            {/* Settlement */}
            <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-ink-secondary block">2. Settlement</span>
              <div className="text-sm font-semibold text-ink">₹9,764.00</div>
              <p className="text-[11px] text-ink-muted font-sans">Agreed fee (₹200) + tax (₹36) deducted.</p>
            </div>

            {/* Refund */}
            <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-ink-secondary block">3. Refund</span>
              <div className="text-sm font-semibold text-ink">₹0.00</div>
              <p className="text-[11px] text-ink-muted font-sans">No customer refund requested.</p>
            </div>

            {/* Bank Credit */}
            <div className="p-3.5 bg-ledger-green/10 border border-ledger-green/30 rounded-xs space-y-1 text-ink">
              <span className="text-[11px] uppercase tracking-wider text-ledger-green font-medium block">4. Bank Credit</span>
              <div className="text-sm font-semibold text-ledger-green">₹9,764.00</div>
              <p className="text-[11px] text-ink-secondary font-sans">Exact deposit confirmed on bank statement.</p>
            </div>
          </div>

          <div className="p-3.5 bg-canvas border border-rule rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-ink-secondary">Difference: ₹0.00 (Zero variance)</span>
            <span className="text-ledger-green font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Automatically verified and closed
            </span>
          </div>
        </div>

        {/* EXAMPLE B: Broken Transaction */}
        <div className="border border-rule bg-surface p-6 sm:p-8 rounded-xs space-y-6 shadow-subtle">
          <div className="border-b border-rule pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-critical uppercase tracking-wider block">
                EXAMPLE B &bull; DISCREPANCY DETECTED
              </span>
              <h2 className="font-editorial text-2xl font-medium text-ink mt-0.5">
                Broken transaction: ₹150 is missing from the settlement
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-critical/10 border border-critical/30 text-xs font-mono text-critical font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Sent to human review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {/* Payment */}
            <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-ink-secondary block">1. Payment</span>
              <div className="text-sm font-semibold text-ink">₹10,000.00</div>
              <p className="text-[11px] text-ink-muted font-sans">Gross customer payment received.</p>
            </div>

            {/* Expected vs Actual Settlement */}
            <div className="p-3.5 bg-critical/5 border border-critical/30 rounded-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-critical font-medium block">2. Settlement</span>
              <div className="text-sm font-bold text-critical">₹9,614.00</div>
              <p className="text-[11px] text-critical font-sans">
                Expected ₹9,764.00. <strong>₹150 is missing from the settlement.</strong>
              </p>
            </div>

            {/* Refund */}
            <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-ink-secondary block">3. Refund</span>
              <div className="text-sm font-medium text-ink-secondary">No refund applies</div>
              <p className="text-[11px] text-ink-muted font-sans">Pure settlement shortfall with zero refund.</p>
            </div>

            {/* Bank Credit */}
            <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1 text-ink">
              <span className="text-[11px] uppercase tracking-wider text-ink-secondary block">4. Bank Credit</span>
              <div className="text-sm font-semibold text-ink">₹9,614.00</div>
              <p className="text-[11px] text-ink-muted font-sans">Bank received the short gateway remittance.</p>
            </div>
          </div>

          <div className="p-3.5 bg-critical/10 border border-critical/30 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-critical">
            <span>Difference: -₹150.00 missing from payout</span>
            <span className="font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Flagged for human reviewer decision
            </span>
          </div>
        </div>
      </div>

      {/* 3. Simple Summary of Financial Breakpoints */}
      <div className="border border-rule bg-surface p-6 sm:p-8 rounded-xs space-y-4 shadow-subtle">
        <div className="border-b border-rule pb-3">
          <span className="text-xs font-mono uppercase text-ink-secondary block">COMMON DISCREPANCIES</span>
          <h3 className="font-editorial text-2xl font-medium text-ink mt-0.5">
            Why financial records disagree
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary font-sans">
            In everyday operations, money stops matching for standard, explainable reasons:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="font-semibold text-ink block">Settlement payout shortfall</span>
            <p className="text-ink-secondary leading-relaxed">
              The gateway took higher processing fees than agreed in the contract, leaving less money than expected.
            </p>
          </div>
          <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="font-semibold text-ink block">Missing bank credit</span>
            <p className="text-ink-secondary leading-relaxed">
              The payment gateway reported that funds were remitted, but no matching credit appeared on the bank statement.
            </p>
          </div>
          <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="font-semibold text-ink block">Customer refund not adjusted</span>
            <p className="text-ink-secondary leading-relaxed">
              A customer return was processed, but the gateway settled the full payout without adjusting for the refund.
            </p>
          </div>
          <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="font-semibold text-ink block">Duplicate payment or bank credit</span>
            <p className="text-ink-secondary leading-relaxed">
              A customer was charged twice due to a browser retry, or the bank credited the same payout batch twice.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Next Step Callout */}
      <div className="border border-rule bg-surface-evidence p-8 rounded-xs text-center space-y-4 shadow-subtle">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block">
          NEXT STEP IN THE JOURNEY
        </span>
        <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-ink">
          Inspect the benchmark evaluation
        </h3>
        <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
          See how LedgerLens performs across standardized test batches with honest reporting of matched cases, exceptions, and amount at risk.
        </p>
        <div className="pt-2">
          <Link
            to="/evaluation"
            className="px-6 py-2.5 bg-ink text-canvas hover:bg-ink/90 text-xs font-medium rounded-xs transition-colors inline-flex items-center gap-2 shadow-subtle"
          >
            <span>View benchmark evaluation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
