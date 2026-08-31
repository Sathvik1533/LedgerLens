import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  AlertCircle,
  Clock,
  ArrowUpDown,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { ReviewQueueItem } from '../types/api';
import { fetchReviewQueue } from '../api/client';
import { AmountDisplay } from '../components/AmountDisplay';
import { ExceptionBadge } from '../components/ExceptionBadge';
import { StatusBadge } from '../components/StatusBadge';
import { QueueTableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';

const EXCEPTION_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Exception Categories' },
  { id: 'missing_settlement', label: 'Missing Settlement' },
  { id: 'missing_bank_credit', label: 'Missing Bank Credit' },
  { id: 'amount_mismatch', label: 'Amount Mismatch' },
  { id: 'fee_mismatch', label: 'Fee Mismatch' },
  { id: 'duplicate_payment', label: 'Duplicate Payment' },
  { id: 'duplicate_bank_credit', label: 'Duplicate Bank Credit' },
  { id: 'partial_refund_not_reflected', label: 'Partial Refund Unreflected' },
  { id: 'ambiguous_match', label: 'Ambiguous Match' },
];

function getPlainLanguageSummary(item: ReviewQueueItem): string {
  switch (item.exception_type) {
    case 'amount_mismatch': {
      if (item.expected_net_settlement && item.reported_net_settlement) {
        return `Expected net ₹${item.expected_net_settlement}, but gateway reported ₹${item.reported_net_settlement}.`;
      }
      return 'Discrepancy detected between expected net payout and reported settlement.';
    }
    case 'missing_settlement':
      return 'Payment captured, but no gateway settlement line item was received.';
    case 'missing_bank_credit':
      return 'Settlement reported by gateway, but no matching bank statement UTR credit exists.';
    case 'fee_mismatch':
      return 'Calculated 2% gateway fee and 18% GST deviate from settlement line item.';
    case 'duplicate_payment':
      return 'Multiple captured payment entries detected for the same order reference.';
    case 'duplicate_bank_credit':
      return 'Multiple bank statement credits reference the same settlement batch ID.';
    case 'partial_refund_not_reflected':
      return 'Customer refund was captured, but net settlement payout was not adjusted.';
    case 'ambiguous_match':
      return 'Multiple settlement candidate records matched transaction criteria.';
    default:
      return 'Transaction requires manual human review before ledger clearance.';
  }
}

function getSeverity(item: ReviewQueueItem): { label: string; color: string; bg: string; border: string; icon: React.ElementType } {
  const disc = Math.abs(parseFloat(item.settlement_discrepancy || '0'));
  if (item.exception_type === 'amount_mismatch' || item.exception_type === 'duplicate_payment' || disc > 500) {
    return {
      label: 'Critical',
      color: 'text-rose-300',
      bg: 'bg-critical-subtle',
      border: 'border-critical-border',
      icon: AlertOctagon,
    };
  }
  return {
    label: 'High',
    color: 'text-amber-300',
    bg: 'bg-warning-subtle',
    border: 'border-warning-border',
    icon: AlertTriangle,
  };
}

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Recent';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Recent';
    const diffMs = Date.now() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${Math.max(1, diffMins)}m ago`;
    }
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recent';
  }
}

export const ReviewQueuePage: React.FC<{ onSelectCase: (caseId: string) => void }> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<ReviewQueueItem[]>([]);
  const [totalAmountAtRisk, setTotalAmountAtRisk] = useState<string>('0.00');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'discrepancy' | 'amount' | 'age'>('discrepancy');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReviewQueue(selectedCategory === 'all' ? undefined : selectedCategory);
      setCases(data.cases || []);
      setTotalAmountAtRisk(data.total_amount_at_risk || '0.00');
    } catch (err: any) {
      setError(err.message || 'Failed to load review queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [selectedCategory]);

  const copyToClipboard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const processedCases = useMemo(() => {
    let result = cases.filter((c) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPay = c.payment_id.toLowerCase().includes(q);
        const matchesCase = c.case_id.toLowerCase().includes(q);
        if (!matchesPay && !matchesCase) return false;
      }

      // 2. Severity Filter
      if (selectedSeverity !== 'all') {
        const sev = getSeverity(c);
        if (sev.label.toLowerCase() !== selectedSeverity) return false;
      }

      return true;
    });

    // Sort Results
    result.sort((a, b) => {
      if (sortBy === 'discrepancy') {
        const dA = Math.abs(parseFloat(a.settlement_discrepancy || '0'));
        const dB = Math.abs(parseFloat(b.settlement_discrepancy || '0'));
        return dB - dA;
      }
      if (sortBy === 'amount') {
        const aA = parseFloat(a.amount_at_risk || '0');
        const aB = parseFloat(b.amount_at_risk || '0');
        return aB - aA;
      }
      // Age (newest first)
      const tA = new Date(a.case_opened_at).getTime() || 0;
      const tB = new Date(b.case_opened_at).getTime() || 0;
      return tB - tA;
    });

    return result;
  }, [cases, searchQuery, selectedSeverity, sortBy]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Context Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Exception Control Room
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300">
              {cases.length} Needs Review
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>{cases.length} cases require human intervention</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              Total Capital at Risk: <AmountDisplay amount={totalAmountAtRisk} className="text-rose-400 font-bold" />
            </span>
          </p>
        </div>
      </div>

      {/* 2. Compact Filter Strip */}
      <div className="bg-surface border border-border-strong rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-panel">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search Payment ID / Case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-alt border border-border-strong rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus-ring"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-alt border border-border-strong rounded-lg px-3 py-1.5 text-xs text-slate-200 font-medium focus-ring"
            aria-label="Filter by exception category"
          >
            {EXCEPTION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-surface text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <div className="hidden sm:flex items-center gap-1 bg-surface-alt border border-border-strong rounded-lg p-0.5">
            {['all', 'critical', 'high'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition ${
                  selectedSeverity === sev
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span className="hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-surface-alt border border-border-strong rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus-ring"
            aria-label="Sort queue records"
          >
            <option value="discrepancy">Discrepancy (High to Low)</option>
            <option value="amount">Amount at Risk (High to Low)</option>
            <option value="age">Age (Newest First)</option>
          </select>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="bg-critical-subtle border border-critical-border rounded-xl p-4 flex items-center justify-between gap-3 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadQueue()}
            className="px-2.5 py-1 rounded bg-rose-900/50 hover:bg-rose-900 text-white font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Main Queue Table */}
      {isLoading ? (
        <QueueTableSkeleton rows={6} />
      ) : cases.length === 0 ? (
        <EmptyState
          type="empty_queue"
          actionLabel="Refresh Live Feed"
          onAction={() => loadQueue()}
        />
      ) : processedCases.length === 0 ? (
        <EmptyState
          type="filtered_empty"
          actionLabel="Reset Active Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedSeverity('all');
          }}
        />
      ) : (
        <div className="bg-surface border border-border-strong rounded-xl overflow-hidden shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Exception review queue">
              <thead>
                <tr className="bg-surface-alt border-b border-border-subtle text-[11px] uppercase tracking-wider font-mono font-bold text-slate-400">
                  <th scope="col" className="py-3 px-4 w-28">Severity</th>
                  <th scope="col" className="py-3 px-4">Anomaly Story &amp; Identifiers</th>
                  <th scope="col" className="py-3 px-4 text-right">At Risk</th>
                  <th scope="col" className="py-3 px-4 text-right">Discrepancy</th>
                  <th scope="col" className="py-3 px-4 text-center w-24">Age</th>
                  <th scope="col" className="py-3 px-4 text-center w-36">Status</th>
                  <th scope="col" className="py-3 px-4 text-right w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs">
                {processedCases.map((item) => {
                  const severity = getSeverity(item);
                  const SevIcon = severity.icon;
                  const plainStory = getPlainLanguageSummary(item);

                  return (
                    <tr
                      key={item.case_id}
                      onClick={() => onSelectCase(item.case_id)}
                      className="hover:bg-surface-hover transition duration-150 cursor-pointer group"
                    >
                      {/* 1. Severity */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${severity.bg} ${severity.color} ${severity.border}`}
                        >
                          <SevIcon className="w-3 h-3" aria-hidden="true" />
                          {severity.label}
                        </span>
                      </td>

                      {/* 2. Anomaly Story & Identifiers */}
                      <td className="py-3.5 px-4 align-top space-y-1.5 max-w-md">
                        <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition leading-snug">
                          {plainStory}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <button
                            onClick={(e) => copyToClipboard(item.payment_id, e)}
                            className="font-mono bg-surface-alt px-1.5 py-0.5 rounded border border-border-subtle hover:border-slate-500 text-slate-300 flex items-center gap-1"
                            title="Click to copy payment ID"
                          >
                            <span>{item.payment_id}</span>
                            {copiedId === item.payment_id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500" />
                            )}
                          </button>
                          <span className="text-slate-600">&bull;</span>
                          <span className="font-mono text-slate-400">{item.case_id}</span>
                          <span className="text-slate-600">&bull;</span>
                          <ExceptionBadge type={item.exception_type} size="sm" />
                        </div>
                      </td>

                      {/* 3. At Risk */}
                      <td className="py-3.5 px-4 align-top text-right font-medium">
                        <AmountDisplay amount={item.amount_at_risk} className="text-slate-200" />
                      </td>

                      {/* 4. Discrepancy */}
                      <td className="py-3.5 px-4 align-top text-right font-medium">
                        <AmountDisplay
                          amount={item.settlement_discrepancy}
                          isDiscrepancy={true}
                        />
                      </td>

                      {/* 5. Age */}
                      <td className="py-3.5 px-4 align-top text-center text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                          <span>{formatRelativeTime(item.case_opened_at)}</span>
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <StatusBadge status={item.decision_status} />
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(item.case_id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-surface-alt hover:bg-blue-600 border border-border-strong hover:border-blue-500 transition duration-150 shadow-sm focus-ring"
                          aria-label={`Inspect case ${item.case_id}`}
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-surface-alt border-t border-border-subtle px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {processedCases.length} of {cases.length} cases</span>
            <span>Deterministic 3-Stage Parity Matcher</span>
          </div>
        </div>
      )}
    </div>
  );
};
