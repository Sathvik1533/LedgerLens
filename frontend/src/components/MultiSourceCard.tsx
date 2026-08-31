import React from 'react';
import {
  ReceiptText,
  Landmark,
  Building2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { CaseEvidenceResponse } from '../types/api';
import { AmountDisplay } from './AmountDisplay';
import { ExceptionBadge } from './ExceptionBadge';

export const MultiSourceCard: React.FC<{ evidence: CaseEvidenceResponse }> = ({ evidence }) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const {
    payment,
    settlement,
    bank_credits,
    settlement_discrepancy,
    expected_net_settlement,
    reported_net_settlement,
    exception_type,
  } = evidence;

  const discrepancyNum = Math.abs(parseFloat(settlement_discrepancy || '0'));
  const hasDiscrepancy = discrepancyNum > 0.001;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. "Why This Was Flagged" Explanation & Delta Banner */}
      <div
        className={`rounded-xl border p-4 shadow-sm transition ${
          hasDiscrepancy
            ? 'bg-critical-subtle border-critical-border text-rose-200'
            : 'bg-warning-subtle border-warning-border text-amber-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-surface border border-border-strong text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-xs flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-white text-sm">Why this case was flagged</span>
              <ExceptionBadge type={exception_type} size="sm" />
            </div>
            <p className="text-slate-300">
              {exception_type === 'amount_mismatch' &&
                `Calculated expected net payout of ₹${expected_net_settlement || '0.00'} deviates from the gateway reported net of ₹${reported_net_settlement || '0.00'}.`}
              {exception_type === 'missing_settlement' &&
                'Payment was captured by merchant, but no gateway settlement batch file was received.'}
              {exception_type === 'missing_bank_credit' &&
                'Settlement was reported by gateway, but no matching bank UTR credit appears in statement feed.'}
              {exception_type === 'fee_mismatch' &&
                'Gateway settlement fee / GST calculation deviates from the contractual 2% rate + 18% GST formula.'}
              {exception_type === 'duplicate_payment' &&
                'Multiple captured payments share the same order identifier.'}
              {exception_type === 'duplicate_bank_credit' &&
                'Multiple bank credits reference the same settlement batch ID.'}
              {exception_type === 'partial_refund_not_reflected' &&
                'Customer refund was processed, but the settlement batch net amount was not adjusted.'}
              {exception_type === 'ambiguous_match' &&
                'Multiple candidate settlement records matched transaction attributes.'}
            </p>
            {hasDiscrepancy && (
              <div className="pt-2 border-t border-rose-500/20 flex items-baseline gap-2 font-mono">
                <span className="text-slate-400">Calculated Delta:</span>
                <AmountDisplay amount={settlement_discrepancy} isDiscrepancy={true} className="text-sm font-bold" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Source Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source 1: Captured Payment */}
        <div className="rounded-xl bg-surface border border-border-strong p-4 space-y-3 shadow-panel">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ReceiptText className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <span>1. Captured Payment</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/60 border border-blue-600/40 text-blue-300 font-semibold">
              {payment?.status || 'Missing'}
            </span>
          </div>

          {payment ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Gross Amount</span>
                <AmountDisplay amount={payment.amount} className="font-bold text-white" />
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Expected Net</span>
                <AmountDisplay amount={expected_net_settlement} className="text-slate-200" />
              </div>
              <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-border-subtle">
                <span className="text-slate-400">Payment ID</span>
                <button
                  onClick={() => copyText(payment.payment_id, 'payment_id')}
                  className="font-mono text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>{payment.payment_id}</span>
                  {copiedKey === 'payment_id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                </button>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono text-[11px] text-slate-300">{payment.order_id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Merchant</span>
                <span className="font-mono text-[11px] text-slate-300">{payment.merchant_id}</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-rose-400">
              No payment record found.
            </div>
          )}
        </div>

        {/* Source 2: Gateway Settlement */}
        <div className="rounded-xl bg-surface border border-border-strong p-4 space-y-3 shadow-panel">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Landmark className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span>2. Gateway Settlement</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/60 border border-purple-600/40 text-purple-300 font-semibold">
              {settlement?.settlement_status || 'Missing'}
            </span>
          </div>

          {settlement ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Reported Net</span>
                <AmountDisplay amount={settlement.net_settlement_amount} className="font-bold text-white" />
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Deducted Fee</span>
                <AmountDisplay amount={settlement.fee_amount} className="text-slate-300" />
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">GST (18%)</span>
                <AmountDisplay amount={settlement.tax_amount} className="text-slate-300" />
              </div>
              <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-border-subtle">
                <span className="text-slate-400">Settlement ID</span>
                <button
                  onClick={() => copyText(settlement.settlement_id, 'settlement_id')}
                  className="font-mono text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>{settlement.settlement_id}</span>
                  {copiedKey === 'settlement_id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-amber-400">
              No settlement file line item received.
            </div>
          )}
        </div>
      </div>

      {/* Source 3: Bank Credit Statement Feed */}
      <div className="rounded-xl bg-surface border border-border-strong p-4 space-y-3 shadow-panel">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Building2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>3. Bank Credit Statement Feed</span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-semibold">
            {bank_credits && bank_credits.length > 0 ? `${bank_credits.length} Credit(s)` : 'Missing UTR'}
          </span>
        </div>

        {bank_credits && bank_credits.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {bank_credits.map((bc) => (
              <div key={bc.bank_credit_id} className="py-2 first:pt-0 last:pb-0 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Credited Amount</span>
                  <AmountDisplay amount={bc.credited_amount} className="font-bold text-emerald-400" />
                </div>
                <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                  <span>Bank UTR:</span>
                  <button
                    onClick={() => copyText(bc.bank_reference, bc.bank_credit_id)}
                    className="text-slate-200 hover:text-white flex items-center gap-1"
                  >
                    <span>{bc.bank_reference}</span>
                    {copiedKey === bc.bank_credit_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>
                {bc.narration && (
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    Narration: {bc.narration}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-amber-400">
            No bank statement credit record matching settlement UTR.
          </div>
        )}
      </div>
    </div>
  );
};
