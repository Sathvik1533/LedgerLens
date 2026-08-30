import React from 'react';
import {
  CreditCard,
  Landmark,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Building,
  Hash,
  Scale,
} from 'lucide-react';
import { CaseEvidenceResponse } from '../types/api';
import { AmountDisplay } from './AmountDisplay';
import { ExceptionBadge } from './ExceptionBadge';

export const MultiSourceCard: React.FC<{ evidence: CaseEvidenceResponse }> = ({ evidence }) => {
  const { payment, settlement, bank_credits, settlement_discrepancy, expected_net_settlement, reported_net_settlement } =
    evidence;

  const hasDiscrepancy = settlement_discrepancy && parseFloat(settlement_discrepancy) > 0;

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 space-y-6 shadow-xl backdrop-blur-md">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Multi-Source Line Item Evidence
            </h2>
            <p className="text-[11px] text-slate-400">Side-by-side reconciliation comparison across 3 financial sources</p>
          </div>
        </div>
        <ExceptionBadge type={evidence.exception_type} size="md" />
      </div>

      {/* Discrepancy Alert Banner */}
      {hasDiscrepancy ? (
        <div className="rounded-xl bg-gradient-to-r from-rose-950/50 to-slate-900/60 border border-rose-600/40 p-4 flex items-start gap-3.5 shadow-md">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-rose-300 text-sm">Discrepancy Detected:</span>
              <AmountDisplay amount={settlement_discrepancy} isDiscrepancy className="text-base" />
            </div>
            <p className="text-rose-300/80 text-[11px]">
              Expected Net Settlement: <AmountDisplay amount={expected_net_settlement} className="text-rose-200" /> &bull;
              Actual Bank Credit: <AmountDisplay amount={reported_net_settlement} className="text-rose-200" />
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-emerald-950/30 border border-emerald-600/30 p-3.5 flex items-center gap-3 text-xs text-emerald-300 shadow-sm">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-semibold">Deterministic verification confirmed: zero arithmetic difference detected.</span>
        </div>
      )}

      {/* 3-Column Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Source 1: Captured Payment */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4.5 space-y-3.5 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span>1. Captured Payment</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-600/40 text-blue-300 font-semibold">
              {payment?.status || 'N/A'}
            </span>
          </div>

          {payment ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-500" /> Payment ID:
                </span>
                <span className="font-mono text-blue-300 font-medium truncate max-w-[130px]" title={payment.payment_id}>
                  {payment.payment_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-500" /> Order ID:
                </span>
                <span className="font-mono text-slate-200">{payment.order_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-500" /> Merchant ID:
                </span>
                <span className="font-mono text-slate-300">{payment.merchant_id}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 font-semibold">
                <span className="text-slate-300">Gross Captured:</span>
                <AmountDisplay amount={payment.amount} currency={payment.currency} className="text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settlement Ref:</span>
                <span className="font-mono text-slate-300 truncate max-w-[120px]">
                  {payment.settlement_id || <span className="text-amber-400 font-semibold">None (Missing)</span>}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-amber-400 font-medium">No payment record found.</div>
          )}
        </div>

        {/* Source 2: Gateway Settlement */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4.5 space-y-3.5 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <div className="w-6 h-6 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <span>2. Gateway Settlement</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-600/40 text-purple-300 font-semibold">
              {settlement?.settlement_status || 'N/A'}
            </span>
          </div>

          {settlement ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settlement ID:</span>
                <span className="font-mono text-purple-300 font-medium truncate max-w-[130px]" title={settlement.settlement_id}>
                  {settlement.settlement_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gross Processed:</span>
                <AmountDisplay amount={settlement.gross_payment_amount} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fee (2% Base):</span>
                <AmountDisplay amount={settlement.fee_amount} className="text-slate-300" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tax (18% GST):</span>
                <AmountDisplay amount={settlement.tax_amount} className="text-slate-300" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 font-semibold">
                <span className="text-slate-200">Net Expected:</span>
                <AmountDisplay amount={settlement.net_settlement_amount} className="text-sm text-purple-300 font-bold" />
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-amber-400 font-medium">No settlement record linked.</div>
          )}
        </div>

        {/* Source 3: Bank Credit (UTR) */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4.5 space-y-3.5 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <span>3. Bank Credit (UTR)</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-semibold">
              {bank_credits.length} Credit Record{bank_credits.length === 1 ? '' : 's'}
            </span>
          </div>

          {bank_credits.length > 0 ? (
            <div className="space-y-3">
              {bank_credits.map((bc, idx) => (
                <div key={bc.bank_credit_id || idx} className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bank Entity:</span>
                    <span className="text-slate-200 font-semibold">{bc.bank_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">UTR / Ref:</span>
                    <span className="font-mono text-emerald-300 font-medium truncate max-w-[125px]" title={bc.bank_reference}>
                      {bc.bank_reference}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 font-semibold">
                    <span className="text-slate-200">Credited Amount:</span>
                    <AmountDisplay amount={bc.credited_amount} currency={bc.currency} className="text-sm text-emerald-300 font-bold" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-amber-400 font-medium">No bank credit received.</div>
          )}
        </div>
      </div>
    </div>
  );
};
