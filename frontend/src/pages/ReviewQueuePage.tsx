import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Search,
  AlertOctagon,
  TrendingDown,
  ShieldCheck,
  CheckCheck,
  Copy,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { ReviewQueueItem } from '../types/api';
import { fetchReviewQueue } from '../api/client';
import { AmountDisplay } from '../components/AmountDisplay';
import { ExceptionBadge } from '../components/ExceptionBadge';
import { StatusBadge } from '../components/StatusBadge';

const EXCEPTION_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Exceptions' },
  { id: 'missing_settlement', label: 'Missing Settlement' },
  { id: 'missing_bank_credit', label: 'Missing Bank Credit' },
  { id: 'amount_mismatch', label: 'Amount Mismatch' },
  { id: 'fee_mismatch', label: 'Fee Mismatch' },
  { id: 'duplicate_payment', label: 'Duplicate Payment' },
  { id: 'duplicate_bank_credit', label: 'Duplicate Bank Credit' },
  { id: 'partial_refund_not_reflected', label: 'Refund Discrepancy' },
  { id: 'ambiguous_match', label: 'Ambiguous Candidate' },
];

export const ReviewQueuePage: React.FC<{ onSelectCase: (caseId: string) => void }> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<ReviewQueueItem[]>([]);
  const [totalAmountAtRisk, setTotalAmountAtRisk] = useState<string>('0.00');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadQueue = async (filter: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReviewQueue(filter === 'all' ? undefined : filter);
      setCases(data.cases || []);
      setTotalAmountAtRisk(data.total_amount_at_risk || '0.00');
    } catch (err: any) {
      setError(err.message || 'Failed to load review queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue(selectedFilter);
  }, [selectedFilter]);

  const copyToClipboard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCases = cases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.payment_id.toLowerCase().includes(q) || c.case_id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Pending Exceptions */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 p-5 shadow-lg shadow-black/40 hover:border-amber-500/40 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Review Queue Depth</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{cases.length}</span>
            <span className="text-xs font-semibold text-amber-400">Cases Pending Decision</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Requires manual human sign-off before ledger lock.</p>
        </div>

        {/* Metric 2: Total Amount at Risk */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 p-5 shadow-lg shadow-black/40 hover:border-rose-500/40 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Capital at Risk</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <AmountDisplay amount={totalAmountAtRisk} className="text-3xl font-extrabold text-rose-400" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cumulative unverified settlement balance.</p>
        </div>

        {/* Metric 3: Reconciliation Engine Precision */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 p-5 shadow-lg shadow-black/40 hover:border-emerald-500/40 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Deterministic Matcher</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">₹0.00</span>
            <span className="text-xs font-semibold text-emerald-400/90">Exact Precision Floor</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Zero AI guesswork &bull; 8 exception categories.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 space-y-4 shadow-md backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>Exception Triage Matrix</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Payment or Case ID..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/60">
          {EXCEPTION_OPTIONS.map((opt) => {
            const isSelected = selectedFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedFilter(opt.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-md">
        {error && (
          <div className="p-4 bg-rose-950/40 border-b border-rose-800/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="font-semibold text-slate-300">Streaming reconciliation exception queue...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs space-y-2">
            <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-slate-200 text-sm">No Pending Exceptions in this View</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              All multi-source transactions matching the current criteria have been reconciled or resolved.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-4">Payment Identifier</th>
                  <th className="py-3.5 px-4">Exception Category</th>
                  <th className="py-3.5 px-4 text-right">Amount at Risk</th>
                  <th className="py-3.5 px-4 text-right">Discrepancy</th>
                  <th className="py-3.5 px-4">Decision Status</th>
                  <th className="py-3.5 px-4">Opened Timestamp</th>
                  <th className="py-3.5 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-sans">
                {filteredCases.map((c) => {
                  const dateStr = new Date(c.case_opened_at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={c.case_id}
                      onClick={() => onSelectCase(c.case_id)}
                      className="hover:bg-blue-950/20 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>{c.case_id.slice(0, 8)}...</span>
                          <button
                            onClick={(e) => copyToClipboard(c.case_id, e)}
                            className="text-slate-600 hover:text-blue-400 transition-colors p-0.5 rounded"
                            title="Copy full UUID"
                          >
                            {copiedId === c.case_id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-300">{c.payment_id}</td>
                      <td className="py-3.5 px-4">
                        <ExceptionBadge type={c.exception_type} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        <AmountDisplay amount={c.amount_at_risk} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <AmountDisplay amount={c.settlement_discrepancy} isDiscrepancy />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.decision_status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{dateStr}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.case_id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white text-xs font-semibold transition-all duration-200 shadow-sm"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
