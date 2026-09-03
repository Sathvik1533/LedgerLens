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
import { Tooltip } from './Tooltip';
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
    <div className="space-y-4 font-sans">
      {/* 1. "Why This Case Was Flagged" Banner */}
      <div
        className={`rounded-xl border p-4 transition shadow-none ${
          hasDiscrepancy
            ? 'bg-ledger-vermilion/10 border-ledger-vermilion text-ink-900'
            : 'bg-advisory-amber/10 border-advisory-amber text-amber-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-advisory-amber shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1.5 text-xs flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-ink-900 text-xs uppercase tracking-wider font-sans">Why this case was flagged</span>
              <ExceptionBadge type={exception_type} size="sm" />
            </div>
            <p className="text-ink-900 leading-relaxed font-sans text-xs">
              {exception_type === 'amount_mismatch' &&
                `Calculated expected net payout of ₹${expected_net_settlement || '0.00'} deviates from the gateway reported net of ₹${reported_net_settlement || '0.00'}.`}
              {exception_type === 'missing_settlement' &&
                'Payment was captured by merchant, but no gateway settlement batch line item was received.'}
              {exception_type === 'missing_bank_credit' &&
                'Settlement was reported by gateway, but no matching bank statement UTR credit appears in statement feed.'}
              {exception_type === 'fee_mismatch' &&
                'Gateway settlement fee / GST calculation deviates from contractual 2% rate + 18% GST formula.'}
              {exception_type === 'duplicate_payment' &&
                'Multiple captured payments share the same order identifier.'}
              {exception_type === 'duplicate_bank_credit' &&
                'Multiple bank statement credits reference the same settlement batch ID.'}
              {exception_type === 'partial_refund_not_reflected' &&
                'Customer refund was processed, but the settlement batch net amount was not adjusted.'}
              {exception_type === 'ambiguous_match' &&
                'Multiple candidate settlement records matched transaction attributes.'}
            </p>
            {hasDiscrepancy && (
              <div className="pt-2 border-t border-ledger-vermilion flex items-baseline gap-2 font-mono text-xs">
                <span className="text-ink-700 font-sans">Calculated Delta:</span>
                <AmountDisplay amount={settlement_discrepancy} isDiscrepancy={true} className="font-bold text-ledger-vermilion" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Source Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source 1: Captured Payment */}
        <div className="control-panel rounded-xl p-4 space-y-3 shadow-none">
          <div className="flex items-center justify-between border-b border-rule-300 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-900 font-sans">
              <ReceiptText className="w-4 h-4 text-source-blue" aria-hidden="true" />
              <span>1. Captured Payment Feed</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-paper-1 border border-rule-300 text-ink-700 font-medium">
              {payment?.status || 'Missing'}
            </span>
          </div>

          {payment ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-ink-700 font-sans">
                <span>Gross Amount</span>
                <AmountDisplay amount={payment.amount} className="font-bold text-ink-900 font-mono" />
              </div>
              <div className="flex justify-between items-center text-ink-700 font-sans">
                <span>Expected Net</span>
                <AmountDisplay amount={expected_net_settlement} className="text-ink-900 font-mono" />
              </div>
              <div className="flex justify-between items-center text-ink-700 pt-2 border-t border-rule-300 font-mono text-[11px]">
                <span className="font-sans">Payment ID</span>
                <button
                  onClick={() => copyText(payment.payment_id, 'payment_id')}
                  className="text-source-blue hover:text-blue-300 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{payment.payment_id}</span>
                  {copiedKey === 'payment_id' ? <Check className="w-3 h-3 text-matched-green" /> : <Copy className="w-3 h-3 text-ink-700" />}
                </button>
              </div>
              <div className="flex justify-between items-center text-ink-700 font-mono text-[11px]">
                <span className="font-sans">Order ID</span>
                <span className="text-ink-900">{payment.order_id}</span>
              </div>
              <div className="flex justify-between items-center text-ink-700 font-mono text-[11px]">
                <span className="font-sans">Merchant ID</span>
                <span className="text-ink-900">{payment.merchant_id}</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-ledger-vermilion font-sans">
              No payment record found.
            </div>
          )}
        </div>

        {/* Source 2: Gateway Settlement */}
        <div className="control-panel rounded-xl p-4 space-y-3 shadow-none">
          <div className="flex items-center justify-between border-b border-rule-300 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-900 font-sans">
              <Landmark className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span>2. Gateway Settlement Feed</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-paper-1 border border-rule-300 text-ink-700 font-medium">
              {settlement?.settlement_status || 'Missing'}
            </span>
          </div>

          {settlement ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-ink-700 font-sans">
                <span>Reported Net</span>
                <AmountDisplay amount={settlement.net_settlement_amount} className="font-bold text-ink-900 font-mono" />
              </div>
              <div className="flex justify-between items-center text-ink-700 font-sans">
                <span>Deducted Fee (2%)</span>
                <AmountDisplay amount={settlement.fee_amount} className="text-ink-900 font-mono" />
              </div>
              <div className="flex justify-between items-center text-ink-700 font-sans">
                <span>GST (18%)</span>
                <AmountDisplay amount={settlement.tax_amount} className="text-ink-900 font-mono" />
              </div>
              <div className="flex justify-between items-center text-ink-700 pt-2 border-t border-rule-300 font-mono text-[11px]">
                <span className="font-sans">Settlement ID</span>
                <button
                  onClick={() => copyText(settlement.settlement_id, 'settlement_id')}
                  className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{settlement.settlement_id}</span>
                  {copiedKey === 'settlement_id' ? <Check className="w-3 h-3 text-matched-green" /> : <Copy className="w-3 h-3 text-ink-700" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-advisory-amber font-sans">
              No gateway settlement line item received.
            </div>
          )}
        </div>
      </div>

      {/* Source 3: Bank Credit Statement Feed */}
      <div className="control-panel rounded-xl p-4 space-y-3 shadow-none">
        <div className="flex items-center justify-between border-b border-rule-300 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-900 font-sans">
            <Building2 className="w-4 h-4 text-matched-green" aria-hidden="true" />
            <span>3. Bank Statement Feed</span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-paper-1 border border-rule-300 text-ink-700 font-medium">
            {bank_credits && bank_credits.length > 0 ? `${bank_credits.length} Matched Credit(s)` : 'Missing Bank Credit'}
          </span>
        </div>

        {bank_credits && bank_credits.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {bank_credits.map((bc) => (
              <div key={bc.bank_credit_id} className="py-2.5 first:pt-0 last:pb-0 space-y-2 text-xs">
                <div className="flex justify-between items-center font-sans text-ink-700">
                  <span>Credited Amount</span>
                  <AmountDisplay amount={bc.credited_amount} className="font-bold text-matched-green font-mono" />
                </div>
                <div className="flex justify-between items-center text-ink-700 font-mono text-[11px]">
                  <Tooltip content="Unique Transaction Reference (UTR) generated by the central bank for NEFT/RTGS transfers."><span tabIndex={0} className="font-sans focus-ring border-b border-dashed border-ink-300">Bank UTR</span></Tooltip>
                  <button
                    onClick={() => copyText(bc.bank_reference, bc.bank_credit_id)}
                    className="text-ink-900 hover:text-ink-900 flex items-center gap-1 font-mono"
                  >
                    <span>{bc.bank_reference}</span>
                    {copiedKey === bc.bank_credit_id ? <Check className="w-3 h-3 text-matched-green" /> : <Copy className="w-3 h-3 text-ink-700" />}
                  </button>
                </div>
                {bc.narration && (
                  <div className="text-[11px] text-ink-700 font-mono truncate">
                    Narration: {bc.narration}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-advisory-amber font-sans">
            No bank statement credit record matching settlement UTR.
          </div>
        )}
      </div>
    </div>
  );
};
