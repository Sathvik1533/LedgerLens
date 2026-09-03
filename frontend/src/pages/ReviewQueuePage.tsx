import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  AlertCircle,
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
      color: 'text-ink-900',
      bg: 'bg-critical-subtle',
      border: 'border-critical-border',
      icon: AlertOctagon,
    };
  }
  return {
    label: 'High',
    color: 'text-advisory-amber',
    bg: 'bg-warning-subtle',
    border: 'border-warning-border',
    icon: AlertTriangle,
  };
}

export const ReviewQueuePage: React.FC<{ onSelectCase?: (caseId: string) => void }> = ({ onSelectCase }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('type') || 'all';

  const [cases, setCases] = useState<ReviewQueueItem[]>([]);
  const [totalAmountAtRisk, setTotalAmountAtRisk] = useState<string>('0.00');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
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

  const handleRowClick = (caseId: string) => {
    if (onSelectCase) {
      onSelectCase(caseId);
    }
    navigate(`/exceptions/${caseId}`);
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Context & Section Header Strip */}
      <div className="space-y-2 border-b border-rule-300 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-source-blue bg-source-blue/10 border border-source-blue px-2.5 py-0.5 rounded-full">
            02 &mdash; OPERATIONAL EXCEPTION QUEUE
          </span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-xs text-ink-700 font-mono">HUMAN-IN-THE-LOOP TRIAGE</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
            Exception Control Room
          </h1>
          <div className="text-xs text-ink-700 font-sans flex items-center gap-2">
            <span className="text-ink-900 font-medium">{cases.length} cases need review</span>
            <span>&bull;</span>
            <span className="text-ledger-vermilion font-medium font-mono">
              <AmountDisplay amount={totalAmountAtRisk} /> total exposure
            </span>
          </div>
        </div>
      </div>

      {/* 2. Unified Filter Toolbar */}
      <div className="control-panel rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-none">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-ink-700 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              placeholder="Filter by Payment ID or Case UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper-1 border border-rule-300 focus:border-source-blue rounded-lg pl-9 pr-7 py-2 text-xs text-ink-900 placeholder-[#829BB8]/60 focus:outline-none font-sans transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-700 hover:text-ink-900"
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
            className="bg-paper-1 border border-rule-300 focus:border-source-blue rounded-lg px-3 py-2 text-xs text-ink-900 focus:outline-none font-sans transition"
            aria-label="Filter by exception category"
          >
            {EXCEPTION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-paper-1 text-ink-900">
                {opt.label}
              </option>
            ))}
          </select>

          {/* Segmented Severity Filter */}
          <div className="flex items-center bg-paper-1 border border-rule-300 rounded-lg p-1">
            {['all', 'critical', 'high'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-md text-xs font-sans capitalize transition ${
                  selectedSeverity === sev
                    ? 'bg-blue-900/60 text-ink-900 font-semibold shadow-none border border-source-blue'
                    : 'text-ink-700 hover:text-ink-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs text-ink-700 font-sans">
          <ArrowUpDown className="w-3.5 h-3.5 text-ink-700" aria-hidden="true" />
          <span className="hidden sm:inline text-ink-700">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-paper-1 border border-rule-300 focus:border-source-blue rounded-lg px-3 py-2 text-xs text-ink-900 focus:outline-none font-sans transition"
            aria-label="Sort queue records"
          >
            <option value="discrepancy" className="bg-paper-1">Discrepancy (High to Low)</option>
            <option value="amount" className="bg-paper-1">Amount at Risk (High to Low)</option>
            <option value="age" className="bg-paper-1">Age (Newest First)</option>
          </select>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="bg-ledger-vermilion/10 border border-ledger-vermilion rounded-md p-3 flex items-center justify-between gap-3 text-ink-900 text-xs font-sans">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-ledger-vermilion" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadQueue()}
            className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-ink-900 font-medium transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Dense Operations Queue Table — EXACTLY 4 COLUMNS */}
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
        <div className="control-panel rounded-xl overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Exception review queue">
              <thead>
                <tr className="bg-paper-1 border-b border-rule-300 text-[11px] font-semibold text-ink-700 font-sans uppercase tracking-wider">
                  <th scope="col" className="py-3 px-5 w-28">Severity</th>
                  <th scope="col" className="py-3 px-5">What Happened &amp; Identifiers</th>
                  <th scope="col" className="py-3 px-5 text-right w-40">At Risk</th>
                  <th scope="col" className="py-3 px-5 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {processedCases.map((item) => {
                  const severity = getSeverity(item);
                  const isCrit = severity.label.toLowerCase() === 'critical';
                  const plainStory = getPlainLanguageSummary(item);

                  return (
                    <tr
                      key={item.case_id}
                      onClick={() => handleRowClick(item.case_id)}
                      className="hover:bg-source-blue/10 hover:border-l-2 hover:border-l-blue-400 transition-colors cursor-pointer group"
                    >
                      {/* 1. Severity */}
                      <td className="py-4 px-5 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold font-sans ${
                            isCrit ? 'text-ledger-vermilion' : 'text-advisory-amber'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isCrit ? 'bg-ledger-vermilion shadow-none' : 'bg-advisory-amber shadow-none'}`} />
                          <span>{isCrit ? 'Critical' : 'High'}</span>
                        </span>
                      </td>

                      {/* 2. What Happened & Identifiers */}
                      <td className="py-4 px-5 align-top space-y-1.5">
                        <p className="text-xs font-semibold text-ink-900 group-hover:text-blue-300 transition-colors leading-snug font-sans">
                          {plainStory}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-700 font-mono">
                          <button
                            onClick={(e) => copyToClipboard(item.payment_id, e)}
                            className="text-ink-900 hover:text-ink-900 hover:underline inline-flex items-center gap-1 font-mono bg-paper-1 px-1.5 py-0.5 rounded border border-rule-300"
                            title="Click to copy payment ID"
                          >
                            <span>{item.payment_id}</span>
                            {copiedId === item.payment_id ? (
                              <Check className="w-2.5 h-2.5 text-matched-green" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-ink-700" />
                            )}
                          </button>
                          <span className="text-ink-700">&bull;</span>
                          <span className="text-ink-700 font-mono text-[10px]">{item.case_id}</span>
                          <span className="text-ink-700">&bull;</span>
                          <ExceptionBadge type={item.exception_type} size="sm" />
                        </div>
                      </td>

                      {/* 3. At Risk */}
                      <td className="py-4 px-5 align-top text-right font-medium">
                        <AmountDisplay amount={item.amount_at_risk} className="text-ink-900 font-semibold text-sm" />
                      </td>

                      {/* 4. Action (Single Affordance) */}
                      <td className="py-4 px-5 align-top text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-source-blue group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all font-sans bg-source-blue/10 border border-source-blue px-2.5 py-1 rounded-full shadow-none">
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-paper-1 border-t border-rule-300 px-5 py-3 flex items-center justify-between text-xs text-ink-700 font-sans">
            <span>Showing {processedCases.length} of {cases.length} records</span>
            <span className="font-mono text-[11px] text-ink-700">Deterministic 3-Stage Parity Engine</span>
          </div>
        </div>
      )}
    </div>
  );
};
