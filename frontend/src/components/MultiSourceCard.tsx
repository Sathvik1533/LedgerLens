import React from 'react';
import { CreditCard, Landmark, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CaseEvidenceResponse } from '../types/api';
import { AmountDisplay } from './AmountDisplay';
import { ExceptionBadge } from './ExceptionBadge';

export const MultiSourceCard: React.FC<{ evidence: CaseEvidenceResponse }> = ({ evidence }) => {
  const { payment, settlement, bank_credits, settlement_discrepancy, expected_net_settlement, reported_net_settlement } = evidence;

  const hasDiscrepancy = settlement_discrepancy && parseFloat(settlement_discrepancy) > 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Receipt className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Multi-Source Line Item Evidence</h2>
        </div>
        <ExceptionBadge type={evidence.exception_type} />
      </div>

      {/* Discrepancy Alert Banner */}
      {hasDiscrepancy ? (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg p-3.5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-300">
              Discrepancy Identified: <AmountDisplay amount={settlement_discrepancy} isDiscrepancy />
            </p>
            <p className="text-rose-400/80">
              Expected Net Settlement: <AmountDisplay amount={expected_net_settlement} className="text-rose-200" /> vs.
              Reported Bank Credit: <AmountDisplay amount={reported_net_settlement} className="text-rose-200" />
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Deterministic amounts match within precision thresholds.</span>
        </div>
      )}

      {/* 3-Column Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Source 1: Payment */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>1. Captured Payment</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {payment?.status || 'N/A'}
            </span>
          </div>
          {payment ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="font-mono text-slate-200 truncate max-w-[140px]">{payment.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-slate-200">{payment.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Amount:</span>
                <AmountDisplay amount={payment.amount} currency={payment.currency} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Linked Settlement:</span>
                <span className="font-mono text-slate-300 truncate max-w-[140px]">
                  {payment.settlement_id || <span className="text-amber-400 italic">None (Missing)</span>}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-amber-400 italic">No payment record found.</div>
          )}
        </div>

        {/* Source 2: Settlement */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Receipt className="w-4 h-4 text-purple-400" />
              <span>2. Gateway Settlement</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {settlement?.settlement_status || 'N/A'}
            </span>
          </div>
          {settlement ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement ID:</span>
                <span className="font-mono text-slate-200 truncate max-w-[140px]">{settlement.settlement_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Processed:</span>
                <AmountDisplay amount={settlement.gross_payment_amount} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fee + Tax:</span>
                <span className="font-mono text-slate-300">
                  <AmountDisplay amount={settlement.fee_amount} /> + <AmountDisplay amount={settlement.tax_amount} />
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-700/50 pt-1 font-semibold">
                <span className="text-slate-300">Net Expected:</span>
                <AmountDisplay amount={settlement.net_settlement_amount} />
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-amber-400 italic">No settlement record found.</div>
          )}
        </div>

        {/* Source 3: Bank Credit */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>3. Bank Credit (UTR)</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {bank_credits.length} Credit{bank_credits.length === 1 ? '' : 's'}
            </span>
          </div>
          {bank_credits.length > 0 ? (
            <div className="space-y-3">
              {bank_credits.map((bc, idx) => (
                <div key={bc.bank_credit_id || idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank:</span>
                    <span className="text-slate-200">{bc.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">UTR / Ref:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[130px]">{bc.bank_reference}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Credited Amount:</span>
                    <AmountDisplay amount={bc.credited_amount} currency={bc.currency} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-amber-400 italic">No bank credit confirmation received.</div>
          )}
        </div>
      </div>
    </div>
  );
};
