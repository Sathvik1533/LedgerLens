import React, { useState } from 'react';
import { CaseEvidenceResponse } from '../types/api';
import { AmountDisplay } from './AmountDisplay';
import { ExceptionBadge } from './ExceptionBadge';
import { calculateCaseReconciliation } from '../utils/reconciliationMath';

export const MultiSourceCard: React.FC<{ evidence: CaseEvidenceResponse }> = ({ evidence }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    payment,
    settlement,
    bank_credits,
    refunds,
    exception_type,
  } = evidence;

  // Compute mathematical reconciliation from exact case facts
  const summary = calculateCaseReconciliation(evidence);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 0. Financial Reconciliation Summary at a Glance */}
      <div className="p-6 bg-surface border border-rule rounded-xs space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-rule pb-3 gap-2">
          <div>
            <span className="text-[11px] font-mono text-ink-secondary uppercase tracking-wider block">
              RECONCILIATION SUMMARY &bull; AT A GLANCE
            </span>
            <h2 className="font-editorial text-2xl font-medium text-ink mt-0.5">
              What was expected vs. what arrived
            </h2>
          </div>
          <ExceptionBadge type={exception_type} size="sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Box 1: Expected Position */}
          <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="text-[11px] font-mono text-ink-secondary block">{summary.expectedLabel}</span>
            <div className="font-mono text-lg font-semibold text-ink">
              {summary.expectedFormatted}
            </div>
            <p className="text-[11px] text-ink-muted">{summary.expectedFormula}</p>
          </div>

          {/* Box 2: Observed / Actual Position */}
          <div className="p-3.5 bg-canvas border border-rule rounded-xs space-y-1">
            <span className="text-[11px] font-mono text-ink-secondary block">{summary.actualLabel}</span>
            <div className={`font-mono text-lg font-semibold ${summary.hasDiscrepancy ? 'text-critical' : 'text-ledger-green'}`}>
              {summary.actualFormatted}
            </div>
            <p className="text-[11px] text-ink-muted">{summary.actualSourceDescription}</p>
          </div>

          {/* Box 3: Truthful Variance & Status */}
          <div className={`p-3.5 rounded-xs space-y-1 border ${
            summary.hasDiscrepancy 
              ? 'bg-critical/5 border-critical/30' 
              : 'bg-ledger-green/5 border-ledger-green/30'
          }`}>
            <span className={`text-[11px] font-mono block ${summary.hasDiscrepancy ? 'text-critical' : 'text-ledger-green'}`}>
              {summary.varianceLabel}
            </span>
            <div className={`font-mono text-lg font-bold ${summary.hasDiscrepancy ? 'text-critical' : 'text-ledger-green'}`}>
              {summary.varianceFormatted}
            </div>
            <p className="text-[11px] text-ink-muted">{summary.varianceDescription}</p>
          </div>
        </div>
      </div>

      {/* 1. The Redline Exception Strip */}
      <div className={`p-5 rounded-xs border ${
        summary.hasDiscrepancy 
          ? 'border-critical/40 bg-surface redline-discrepancy' 
          : 'border-brass/40 bg-surface margin-note'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
          <div>
            <span className="text-[11px] font-mono text-ink-secondary uppercase tracking-wider block">
              Flagged Exception Detail &bull; Divergence at {summary.divergenceStreamName}
            </span>
            <span className="font-editorial text-xl font-medium text-ink mt-0.5 block">
              {exception_type === 'amount_mismatch' && 'Settlement amount mismatch'}
              {exception_type === 'missing_settlement' && 'Payment captured without settlement'}
              {exception_type === 'missing_bank_credit' && 'Settlement confirmed without bank credit'}
              {exception_type === 'fee_mismatch' && 'Contractual fee calculation mismatch'}
              {exception_type === 'duplicate_payment' && 'Duplicate payment record detected'}
              {exception_type === 'duplicate_bank_credit' && 'Duplicate bank statement credit'}
              {exception_type === 'partial_refund_not_reflected' && 'Partial refund not adjusted in settlement'}
              {exception_type === 'ambiguous_match' && 'Ambiguous candidate settlement match'}
              {!exception_type && 'Deterministic reconciliation match'}
            </span>
          </div>
          <ExceptionBadge type={exception_type} size="sm" />
        </div>

        <div className="pt-3 text-xs text-ink leading-relaxed space-y-1">
          <p>{summary.recommendedActionDetail}</p>
        </div>

        {summary.hasDiscrepancy && (
          <div className="mt-3 pt-3 border-t border-rule/60 flex items-baseline justify-between text-xs">
            <span className="text-ink-secondary">Unreconciled Variance:</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-semibold text-critical text-sm tabular-nums">
                {summary.varianceFormatted}
              </span>
              <span className="text-[10px] font-mono text-ink-muted uppercase">isolated discrepancy</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Four-Source Evidence Slips Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-ink-secondary border-b border-rule pb-1.5">
          <span>SOURCE EVIDENCE SLIPS (4-SOURCE RECONCILIATION)</span>
          <span>CURRENCY: {evidence.currency}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Slip 1: Merchant Payment */}
          <div className={`evidence-slip p-4 space-y-3 rounded-xs border ${summary.divergenceStreamIndex === 1 ? 'border-critical/60 bg-critical/5' : ''}`}>
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink">1. Merchant Payment Record</span>
                {summary.divergenceStreamIndex === 1 && (
                  <span className="text-[9px] font-mono text-critical font-semibold uppercase px-1 border border-critical/30 rounded-xs">
                    Discrepancy Source
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 border border-rule text-ink-secondary bg-surface rounded-xs">
                {payment?.status || 'Missing'}
              </span>
            </div>

            {payment ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>Captured Gross</span>
                  <AmountDisplay amount={payment.amount} className="font-mono font-medium text-ink" />
                </div>
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>Order Reference</span>
                  <span className="font-mono text-ink text-[11px]">{payment.order_id}</span>
                </div>
                <div className="flex justify-between items-center text-ink-secondary pt-1.5 border-t border-rule/60">
                  <span>Payment Identifier</span>
                  <button
                    onClick={() => copyText(payment.payment_id, 'pay_id')}
                    className="font-mono text-[11px] text-link hover:underline flex items-center gap-1"
                  >
                    <span>{payment.payment_id}</span>
                    {copiedKey === 'pay_id' ? <span className="text-ledger-green">✓</span> : null}
                  </button>
                </div>
                {payment.payment_timestamp && (
                  <div className="flex justify-between items-center text-ink-muted text-[11px] font-mono">
                    <span>Captured At</span>
                    <span>{new Date(payment.payment_timestamp).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-critical font-mono">
                No merchant payment record linked to this case.
              </div>
            )}
          </div>

          {/* Slip 2: Gateway Settlement */}
          <div className={`evidence-slip p-4 space-y-3 rounded-xs border ${summary.divergenceStreamIndex === 2 ? 'border-critical/60 bg-critical/5' : ''}`}>
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink">2. Gateway Settlement Slip</span>
                {summary.divergenceStreamIndex === 2 && (
                  <span className="text-[9px] font-mono text-critical font-semibold uppercase px-1 border border-critical/30 rounded-xs">
                    Discrepancy Source
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 border border-rule text-ink-secondary bg-surface rounded-xs">
                {settlement?.settlement_status || 'Missing'}
              </span>
            </div>

            {settlement ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>Reported Net Payout</span>
                  <AmountDisplay amount={settlement.net_settlement_amount} className="font-mono font-medium text-ink" />
                </div>
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>Processing Fee (2%)</span>
                  <AmountDisplay amount={settlement.fee_amount} className="font-mono text-ink-secondary" />
                </div>
                <div className="flex justify-between items-center text-ink-secondary">
                  <span>GST on Fee (18%)</span>
                  <AmountDisplay amount={settlement.tax_amount} className="font-mono text-ink-secondary" />
                </div>
                <div className="flex justify-between items-center text-ink-secondary pt-1.5 border-t border-rule/60">
                  <span>Settlement Batch ID</span>
                  <button
                    onClick={() => copyText(settlement.settlement_id, 'set_id')}
                    className="font-mono text-[11px] text-link hover:underline flex items-center gap-1"
                  >
                    <span>{settlement.settlement_id}</span>
                    {copiedKey === 'set_id' ? <span className="text-ledger-green">✓</span> : null}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-critical font-mono">
                No settlement row reported by gateway (T+2 SLA breached).
              </div>
            )}
          </div>

          {/* Slip 3: Customer Refund State */}
          <div className={`evidence-slip p-4 space-y-3 rounded-xs border ${summary.divergenceStreamIndex === 3 ? 'border-critical/60 bg-critical/5' : ''}`}>
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink">3. Customer Refund Slip</span>
                {summary.divergenceStreamIndex === 3 && (
                  <span className="text-[9px] font-mono text-critical font-semibold uppercase px-1 border border-critical/30 rounded-xs">
                    Discrepancy Source
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 border border-rule text-ink-secondary bg-surface rounded-xs">
                {refunds && refunds.length > 0 ? `${refunds.length} Refund Record(s)` : 'No Refunds'}
              </span>
            </div>

            {refunds && refunds.length > 0 ? (
              <div className="space-y-2.5">
                {refunds.map((ref) => (
                  <div key={ref.refund_id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-ink-secondary">
                      <span>Refund Amount</span>
                      <AmountDisplay amount={ref.refund_amount} className="font-mono font-medium text-ink" />
                    </div>
                    <div className="flex justify-between items-center text-ink-secondary text-[11px] font-mono">
                      <span>Refund Type</span>
                      <span className="capitalize">{ref.refund_type}</span>
                    </div>
                    <div className="flex justify-between items-center text-ink-secondary text-[11px] font-mono">
                      <span>Refund ID</span>
                      <span>{ref.refund_id}</span>
                    </div>
                    {ref.refund_timestamp && (
                      <div className="flex justify-between items-center text-ink-muted text-[11px] font-mono">
                        <span>Timestamp</span>
                        <span>{new Date(ref.refund_timestamp).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-ink-secondary font-mono">
                No customer refund active for this transaction.
              </div>
            )}
          </div>

          {/* Slip 4: Bank Statement Credit */}
          <div className={`evidence-slip p-4 space-y-3 rounded-xs border ${summary.divergenceStreamIndex === 4 ? 'border-critical/60 bg-critical/5' : ''}`}>
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink">4. Bank Credit Statement</span>
                {summary.divergenceStreamIndex === 4 && (
                  <span className="text-[9px] font-mono text-critical font-semibold uppercase px-1 border border-critical/30 rounded-xs">
                    {bank_credits.length > 1 ? 'Duplicate Credit Source' : 'Discrepancy Source'}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 border rounded-xs ${
                bank_credits.length > 1 
                  ? 'border-critical/40 text-critical bg-critical/10 font-bold' 
                  : 'border-rule text-ink-secondary bg-surface'
              }`}>
                {bank_credits && bank_credits.length > 0 
                  ? `${bank_credits.length} Matched Credit(s)` 
                  : 'Missing Credit'}
              </span>
            </div>

            {bank_credits && bank_credits.length > 0 ? (
              <div className="space-y-2.5">
                {bank_credits.map((bc, idx) => (
                  <div key={bc.bank_credit_id} className={`space-y-1.5 text-xs p-2 rounded-xs ${bank_credits.length > 1 ? (idx === 1 ? 'bg-critical/10 border border-critical/30' : 'bg-canvas') : ''}`}>
                    <div className="flex justify-between items-center text-ink-secondary">
                      <span>{bank_credits.length > 1 ? `Credit Entry 0${idx + 1}` : 'Bank Amount Credited'}</span>
                      <AmountDisplay 
                        amount={bc.credited_amount} 
                        className={`font-mono font-semibold ${idx === 1 && bank_credits.length > 1 ? 'text-critical' : 'text-ledger-green'}`} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-ink-secondary text-[11px] font-mono">
                      <span>UTR / Reference</span>
                      <button
                        onClick={() => copyText(bc.bank_reference, `utr_${idx}`)}
                        className="text-link hover:underline flex items-center gap-1"
                      >
                        <span>{bc.bank_reference}</span>
                        {copiedKey === `utr_${idx}` ? <span className="text-ledger-green">✓</span> : null}
                      </button>
                    </div>
                    {bc.bank_credit_timestamp && (
                      <div className="flex justify-between items-center text-ink-muted text-[11px] font-mono">
                        <span>Cleared At</span>
                        <span>{new Date(bc.bank_credit_timestamp).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-critical font-mono">
                No bank statement credit recorded in clearing feed (UTR missing).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Raw Data Inspection Disclosure */}
      <details className="text-xs font-mono text-ink-secondary border border-rule rounded-xs p-3.5 bg-surface/50">
        <summary className="cursor-pointer hover:text-ink select-none font-medium">
          Inspect raw counterparty telemetry (JSON)
        </summary>
        <pre className="mt-3 p-3 bg-ink text-[#EAE4D8] overflow-x-auto text-[11px] leading-relaxed rounded-xs">
          {JSON.stringify(evidence, null, 2)}
        </pre>
      </details>
    </div>
  );
};
