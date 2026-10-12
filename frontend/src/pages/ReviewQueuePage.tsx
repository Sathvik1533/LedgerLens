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
import { CustomSelect } from '../components/CustomSelect';

const EXCEPTION_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'missing_settlement', label: 'Missing provider payout' },
  { id: 'missing_bank_credit', label: 'Bank payment not received' },
  { id: 'amount_mismatch', label: 'Amounts do not match' },
  { id: 'fee_mismatch', label: 'Provider fee or tax is different' },
  { id: 'duplicate_payment', label: 'Customer may have paid twice' },
  { id: 'duplicate_bank_credit', label: 'Bank payment may appear twice' },
  { id: 'partial_refund_not_reflected', label: 'Refund is missing from the payout' },
  { id: 'ambiguous_match', label: 'More than one possible match' },
];

function getPlainLanguageSummary(item: ReviewQueueItem): string {
  switch (item.exception_type) {
    case 'amount_mismatch': {
      if (item.expected_net_settlement && item.reported_net_settlement) {
        return `Expected payout is ₹${item.expected_net_settlement}, but provider reported ₹${item.reported_net_settlement}.`;
      }
      return 'The payout amount does not match the expected net calculation.';
    }
    case 'missing_settlement':
      return 'Customer payment was received, but no provider payout arrived.';
    case 'missing_bank_credit':
      return 'Provider reported a payout, but money did not reach the bank account.';
    case 'fee_mismatch':
      return 'Provider fee or tax does not match the approved rule.';
    case 'duplicate_payment':
      return 'Customer appears to have paid twice for the same order.';
    case 'duplicate_bank_credit':
      return 'Bank payment appears more than once for this payout.';
    case 'partial_refund_not_reflected':
      return 'Refund was issued, but provider payout was not reduced.';
    case 'ambiguous_match':
      return 'More than one record matches this transaction.';
    default:
      return 'This case needs a human review.';
  }
}

function getSeverity(item: ReviewQueueItem): { label: string; color: string; bg: string; border: string; icon: React.ElementType } {
  const disc = Math.abs(parseFloat(item.settlement_discrepancy || '0'));
  if (item.exception_type === 'amount_mismatch' || item.exception_type === 'duplicate_payment' || disc > 500) {
    return {
      label: 'Critical',
      color: 'text-text-primary',
      bg: 'bg-critical-subtle',
      border: 'border-critical-border',
      icon: AlertOctagon,
    };
  }
  return {
    label: 'High',
    color: 'text-high',
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
  const [isSimulation, setIsSimulation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReviewQueue(selectedCategory === 'all' ? undefined : selectedCategory);
      setCases(data.cases || []);
      setTotalAmountAtRisk(data.total_amount_at_risk || '0.00');
      setIsSimulation(Boolean(data.is_simulation));
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
      <div className="space-y-2 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 border border-accent px-2.5 py-0.5 rounded-full">
            REVIEW QUEUE
          </span>
          <span className="text-text-secondary">&bull;</span>
          <span className="text-xs text-text-secondary font-mono">HUMAN DECISIONS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Cases waiting for a human decision
            </h1>
            <p className="text-xs text-text-secondary">
              A rule found a difference in these records. Open a case to compare the evidence, read the approved rule, and decide what should happen next.
            </p>
          </div>
          <div className="text-xs text-text-secondary font-sans flex items-center gap-2">
            <span className="text-text-primary font-medium">{cases.length} cases need review</span>
            <span>&bull;</span>
            <span className="text-critical font-medium font-mono">
              <AmountDisplay amount={totalAmountAtRisk} /> money to check
            </span>
          </div>
        </div>
      </div>

      {/* Simulation / Offline Notice */}
      {isSimulation && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start justify-between gap-3 font-sans">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>
              <strong>[Client Simulation / Demo Mode Active]:</strong> Backend / PostgreSQL is offline. Cases shown are seeded demo fixtures, and review decisions persist in browser localStorage only.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 shrink-0">
            Simulation Mode
          </span>
        </div>
      )}

      {/* 2. Unified Filter Toolbar */}
      <div className="control-panel rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-none">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by payment ID or case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border focus:border-accent rounded-lg pl-9 pr-7 py-2 text-xs text-text-primary placeholder-[#829BB8]/60 focus:outline-none font-sans transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={EXCEPTION_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label }))}
            className="w-52"
          />

          {/* Segmented Severity Filter */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-1">
            {['all', 'critical', 'high'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-md text-xs font-sans capitalize transition ${
                  selectedSeverity === sev
                    ? 'bg-blue-900/60 text-text-primary font-semibold shadow-none border border-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs text-text-secondary font-sans">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
          <span className="hidden sm:inline text-text-secondary">Sort:</span>
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={[
              { value: 'discrepancy', label: 'Difference (High to Low)' },
              { value: 'amount', label: 'Money to check (High to Low)' },
              { value: 'age', label: 'Newest first' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="bg-critical-surface border border-critical rounded-md p-3 flex items-center justify-between gap-3 text-text-primary text-xs font-sans">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-critical" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadQueue()}
            className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-text-primary font-medium transition"
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
                <tr className="bg-surface border-b border-border text-[11px] font-semibold text-text-secondary font-sans uppercase tracking-wider">
                  <th scope="col" className="py-3 px-5 w-28">Severity</th>
                  <th scope="col" className="py-3 px-5">What Happened &amp; Identifiers</th>
                  <th scope="col" className="py-3 px-5 text-right w-40">Money to Check</th>
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
                      className="hover:bg-accent/10 hover:border-l-2 hover:border-l-blue-400 transition-colors cursor-pointer group"
                    >
                      {/* 1. Severity */}
                      <td className="py-4 px-5 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold font-sans ${
                            isCrit ? 'text-critical' : 'text-high'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isCrit ? 'bg-critical shadow-none' : 'bg-high shadow-none'}`} />
                          <span>{isCrit ? 'Critical' : 'High'}</span>
                        </span>
                      </td>

                      {/* 2. What Happened & Identifiers */}
                      <td className="py-4 px-5 align-top space-y-1.5">
                        <p className="text-xs font-semibold text-text-primary group-hover:text-blue-300 transition-colors leading-snug font-sans">
                          {plainStory}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary font-mono">
                          <button
                            onClick={(e) => copyToClipboard(item.payment_id, e)}
                            className="text-text-primary hover:text-text-primary hover:underline inline-flex items-center gap-1 font-mono bg-surface px-1.5 py-0.5 rounded border border-border"
                            title="Click to copy payment ID"
                          >
                            <span>{item.payment_id}</span>
                            {copiedId === item.payment_id ? (
                              <Check className="w-2.5 h-2.5 text-resolved" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-text-secondary" />
                            )}
                          </button>
                          <span className="text-text-secondary">&bull;</span>
                          <span className="text-text-secondary font-mono text-[10px]">{item.case_id}</span>
                          <span className="text-text-secondary">&bull;</span>
                          <ExceptionBadge type={item.exception_type} size="sm" />
                          {item.is_demo && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                              [Demo Fixture]
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. At Risk */}
                      <td className="py-4 px-5 align-top text-right font-medium">
                        <AmountDisplay amount={item.amount_at_risk} className="text-text-primary font-semibold text-sm" />
                      </td>

                      {/* 4. Action (Single Affordance) */}
                      <td className="py-4 px-5 align-top text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all font-sans bg-accent/10 border border-accent px-2.5 py-1 rounded-full shadow-none">
                          <span>Review</span>
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
          <div className="bg-surface border-t border-border px-5 py-3 flex items-center justify-between text-xs text-text-secondary font-sans">
            <span>Showing {processedCases.length} of {cases.length} records</span>
            <span className="font-mono text-[11px] text-text-secondary">Four records checked &bull; Differences explained &bull; Human decisions saved</span>
          </div>
        </div>
      )}
    </div>
  );
};
