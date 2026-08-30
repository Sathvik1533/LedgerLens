import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, DollarSign, Filter, Layers, RefreshCw, Search } from 'lucide-react';
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
  { id: 'ambiguous_match', label: 'Ambiguous Match' },
];

export const ReviewQueuePage: React.FC<{ onSelectCase: (caseId: string) => void }> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<ReviewQueueItem[]>([]);
  const [totalAmountAtRisk, setTotalAmountAtRisk] = useState<string>('0.00');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredCases = cases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.payment_id.toLowerCase().includes(q) || c.case_id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4.5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Pending Review Cases</p>
            <p className="text-2xl font-bold text-white mt-1">{cases.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4.5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Amount at Risk</p>
            <div className="mt-1">
              <AmountDisplay amount={totalAmountAtRisk} className="text-2xl font-bold text-rose-400" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4.5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Reconciliation Precision</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">₹0.00 Tolerance</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Exception Filter Chips & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>Filter by Exception Type:</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Payment or Case ID..."
              className="w-full bg-slate-800 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {EXCEPTION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                selectedFilter === opt.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Data Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {error && (
          <div className="p-4 bg-rose-950/40 border-b border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <span>Loading exception review queue...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-300">No reconciliation cases pending review.</p>
            <p className="text-slate-500 mt-1">All financial records are balanced or match the active filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Exception Category</th>
                  <th className="py-3 px-4 text-right">Amount at Risk</th>
                  <th className="py-3 px-4 text-right">Discrepancy</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Opened At</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
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
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400 truncate max-w-[120px]">
                        {c.case_id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">{c.payment_id}</td>
                      <td className="py-3 px-4">
                        <ExceptionBadge type={c.exception_type} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <AmountDisplay amount={c.amount_at_risk} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <AmountDisplay amount={c.settlement_discrepancy} isDiscrepancy />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.decision_status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{dateStr}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.case_id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-medium transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
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
