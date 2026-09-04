import { Link } from 'react-router-dom';

export default function EvidencePage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16 font-sans">
      {/* 1. Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
          TRANSPARENT MONEY COMMUNICATION
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-ink leading-tight">
          The four-source evidence model
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary font-normal leading-relaxed">
          Reconciliation failure occurs when organizations rely on internal databases without cross-referencing external banking proof. Here is how LedgerLens verifies truth across all four financial counterparties.
        </p>
      </div>

      {/* 2. Step-by-Step Calculation Walkthrough */}
      <div className="border border-rule bg-surface p-8 rounded-xs space-y-6 shadow-subtle">
        <div className="border-b border-rule pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-ink-secondary uppercase tracking-wider block">
              Mathematical Parity Walkthrough
            </span>
            <span className="px-1.5 py-0.5 rounded-xs bg-ink/5 border border-rule text-[10px] font-mono text-ink-secondary uppercase">
              Illustrative Specimen
            </span>
          </div>
          <h3 className="font-editorial text-2xl font-medium text-ink mt-0.5">
            How a clean ₹10,000 transaction clears
          </h3>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {/* Step 1 */}
          <div className="p-4 bg-canvas border border-rule rounded-xs space-y-1">
            <div className="flex justify-between items-center text-ink font-semibold">
              <span>1. Merchant Captured Gross (Source 1: Payments)</span>
              <span className="tabular-nums text-sm">₹10,000.00</span>
            </div>
            <p className="font-sans text-xs text-ink-secondary">
              The customer checked out on the merchant storefront. Payment captured with ID <code className="text-ink font-mono">pay_01JN...</code>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-canvas border border-rule rounded-xs space-y-1">
            <div className="flex justify-between items-center text-ink font-semibold">
              <span>2. Agreed Gateway Deductions (Source 2: Settlements)</span>
              <span className="tabular-nums text-sm text-critical">-₹236.00</span>
            </div>
            <div className="font-sans text-xs text-ink-secondary space-y-0.5">
              <div>&bull; Processing Fee (2.00% of ₹10,000): ₹200.00</div>
              <div>&bull; Goods &amp; Services Tax (18.00% of Fee): ₹36.00</div>
              <div className="font-semibold text-ink pt-0.5">Expected Net Payout: ₹9,764.00</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-canvas border border-rule rounded-xs space-y-1">
            <div className="flex justify-between items-center text-ink font-semibold">
              <span>3. Customer Reversals (Source 3: Refunds)</span>
              <span className="tabular-nums text-sm">₹0.00</span>
            </div>
            <p className="font-sans text-xs text-ink-secondary">
              No partial or full refunds were issued prior to gateway payout cutoff.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-ledger-green/10 border border-ledger-green/30 rounded-xs space-y-1 text-ink">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-ledger-green">4. Bank Deposit Verification (Source 4: Bank Credits)</span>
              <span className="tabular-nums text-sm text-ledger-green">₹9,764.00</span>
            </div>
            <p className="font-sans text-xs text-ink-secondary">
              HDFC Bank statement confirms NEFT credit with matching UTR <code className="text-ink font-mono">202604031847291</code>. Exact penny-level parity satisfied.
            </p>
          </div>
        </div>

        <div className="p-4 bg-canvas border border-rule rounded-xs flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
          <span className="text-ink-secondary">Calculated Variance: ₹0.00</span>
          <span className="text-ledger-green font-semibold">✓ Automatically Reconciled</span>
        </div>
      </div>

      {/* 3. The Eight Mandatory Exception Types Explained */}
      <div className="space-y-6">
        <div className="space-y-1 border-b border-rule pb-3">
          <span className="text-xs font-mono uppercase text-ink-secondary">EXCEPTION TAXONOMY</span>
          <h3 className="font-editorial text-2xl font-medium text-ink">
            The eight financial exceptions surfaced by LedgerLens
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary font-sans">
            Every exception represents a specific operational failure mode requiring human review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">1. Missing Settlement</strong>
              <span className="text-high font-medium">Unsettled Payout</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              A merchant transaction was successfully captured, but the gateway payout batch never included the settlement line. Indicates delayed payout or gateway hold.
            </p>
          </div>

          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">2. Missing Bank Credit</strong>
              <span className="text-critical font-medium">Material Exposure</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              The gateway reported that funds were deposited to the corporate bank account, but no credit entry appears on the bank statement. Immediate cash risk.
            </p>
          </div>

          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">3. Amount Mismatch</strong>
              <span className="text-critical font-medium">Mathematical Discrepancy</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              The actual net payout deposited differs from the calculated expected net. Usually caused by unannounced gateway clawbacks or fee schedule alterations.
            </p>
          </div>

          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">4. Fee Mismatch</strong>
              <span className="text-high font-medium">Contract Deviation</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              The gateway deducted processing fees or GST that depart from commercial contract terms (e.g. charging 2.5% instead of contracted 2.0%).
            </p>
          </div>

          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">5. Duplicate Payment</strong>
              <span className="text-critical font-medium">Double Capture</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              Two captured payments cite the exact same merchant order ID. Indicates duplicate checkout submissions or web hook replay issues.
            </p>
          </div>

          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">6. Duplicate Bank Credit</strong>
              <span className="text-high font-medium">Double Deposit</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              Multiple bank statement line items reference the same settlement batch ID. Requires ledger review before recognizing revenue.
            </p>
          </div>

          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">7. Partial Refund Not Reflected</strong>
              <span className="text-high font-medium">Unadjusted Reversal</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              A customer return was processed in the merchant order system, but the gateway settled the full gross amount without deducting the refunded sum.
            </p>
          </div>

          <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <strong className="text-ink">8. Ambiguous Match</strong>
              <span className="text-high font-medium">Equal Candidates</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              Two candidate settlement records satisfied the matching invariants with identical confidence scores. Routed to human review to prevent accidental misallocation.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-6 border-t border-rule flex justify-between items-center text-xs">
        <span className="text-ink-secondary font-mono">Explore how the queue categorizes these exceptions</span>
        <Link to="/app/queue" className="px-4 py-2 bg-ink text-canvas font-medium rounded-xs hover:bg-ink/90">
          Open review queue &rarr;
        </Link>
      </div>
    </div>
  );
}
