import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReviewQueueItem, ExceptionType } from '../../types/api';
import { fetchReviewQueue } from '../../api/client';
import { ExceptionBadge } from '../../components/ExceptionBadge';
import { QueueTableSkeleton } from '../../components/SkeletonLoaders';
import { RollingNumberTicker } from '../../components/ui/RollingNumberTicker';
import { CustomSelect } from '../../components/CustomSelect';

const EXCEPTION_CATEGORIES: { label: string; value: string }[] = [
  { label: 'All categories', value: 'all' },
  { label: 'Amounts do not match', value: 'amount_mismatch' },
  { label: 'Provider fee or tax is different', value: 'fee_mismatch' },
  { label: 'Missing provider payout', value: 'missing_settlement' },
  { label: 'Bank payment not received', value: 'missing_bank_credit' },
  { label: 'Customer may have paid twice', value: 'duplicate_payment' },
  { label: 'Bank payment may appear twice', value: 'duplicate_bank_credit' },
  { label: 'Refund is missing from the payout', value: 'partial_refund_not_reflected' },
  { label: 'More than one possible match', value: 'ambiguous_match' },
];

export const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven query state
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSeverity = searchParams.get('severity') || 'all';
  const sortBy = searchParams.get('sort') || 'discrepancy';
  const viewMode = (searchParams.get('view') as 'unique' | 'all') || 'unique';

  const [cases, setCases] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || (key === 'view' && value === 'unique')) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const getExposure = (c: ReviewQueueItem) => {
    const val = parseFloat(c.amount_at_risk || c.settlement_discrepancy || '0');
    return Number.isFinite(val) ? Math.abs(val) : 0;
  };

  const parseTime = (iso?: string) => {
    if (!iso) return 0;
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const loadQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReviewQueue();
      const rawCases = Array.isArray(data)
        ? data
        : Array.isArray(data?.cases)
        ? data.cases
        : [];

      const normalized: ReviewQueueItem[] = rawCases.map((c: any) => ({
        case_id: c.case_id || c.id || '',
        payment_id: c.payment_id || 'UNKNOWN',
        exception_type: c.exception_type || null,
        decision_status: c.decision_status || 'needs_review',
        confidence: c.confidence || 'medium',
        expected_net_settlement: c.expected_net_settlement ?? null,
        reported_net_settlement: c.reported_net_settlement ?? null,
        settlement_discrepancy: c.settlement_discrepancy ?? null,
        case_opened_at: c.case_opened_at || new Date().toISOString(),
        amount_at_risk: c.amount_at_risk ?? c.settlement_discrepancy ?? null,
      }));
      setCases(normalized);
    } catch (err: any) {
      setError(err?.message || 'Failed to query operational review queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Deduplicate by payment_id for unique transaction mode
  const displayCases = useMemo(() => {
    if (viewMode === 'all') {
      return cases;
    }
    const paymentMap = new Map<string, ReviewQueueItem>();
    for (const c of cases) {
      const existing = paymentMap.get(c.payment_id);
      if (!existing || parseTime(c.case_opened_at) > parseTime(existing.case_opened_at)) {
        paymentMap.set(c.payment_id, c);
      }
    }
    return Array.from(paymentMap.values());
  }, [cases, viewMode]);

  // Filter and sort
  const processedCases = useMemo(() => {
    let result = [...displayCases];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.payment_id.toLowerCase().includes(q) ||
          c.case_id.toLowerCase().includes(q) ||
          (c.exception_type && c.exception_type.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.exception_type === selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      result = result.filter((c) => {
        const isCritical =
          c.exception_type === 'amount_mismatch' || 
          c.exception_type === 'missing_bank_credit' ||
          c.exception_type === 'duplicate_bank_credit';
        return selectedSeverity === 'critical' ? isCritical : !isCritical;
      });
    }

    result.sort((a, b) => {
      const numA = getExposure(a);
      const numB = getExposure(b);
      if (sortBy === 'amount') return numB - numA;
      if (sortBy === 'age') {
        return parseTime(a.case_opened_at) - parseTime(b.case_opened_at);
      }
      return numB - numA;
    });

    return result;
  }, [displayCases, searchQuery, selectedCategory, selectedSeverity, sortBy]);

  const totalExposure = processedCases.reduce(
    (sum, item) => sum + getExposure(item),
    0
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8 font-sans">
      {/* 1. Queue Masthead & Meaningful Exposure Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-rule pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
            <span>REVIEW QUEUE</span>
            <span>&bull;</span>
            <span className="text-ink font-semibold">
              <RollingNumberTicker value={processedCases.length} /> cases waiting
            </span>
            <span>&bull;</span>
            <span className="text-[10px] text-ink-muted">
              {viewMode === 'unique' ? 'Unique payments' : 'All cases'}
            </span>
          </div>
          <h1 data-testid="queue-heading" className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
            Cases waiting for a human decision
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl font-sans leading-relaxed">
            A rule found a difference in these records. Open a case to compare the evidence, read the approved rule, and decide what should happen next.
          </p>
        </div>

        {/* Exposure summary */}
        <div className="p-4 bg-surface border border-rule rounded-xs space-y-1 min-w-[220px]">
          <span className="text-[11px] font-mono uppercase text-ink-secondary block">
            Total money to check
          </span>
          <div className="text-2xl font-medium text-critical">
            <RollingNumberTicker value={totalExposure} currency="₹" decimals={2} />
          </div>
          <span className="text-[10px] font-mono text-ink-muted block">
            Across <RollingNumberTicker value={processedCases.length} /> open cases
          </span>
        </div>
      </div>

      {/* 2. Restrained Filter Controls (URL-Persisted) */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          {/* Search */}
          <div>
            <label className="text-[10px] uppercase text-ink-secondary block mb-1">Search payment or case</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Payment or case ID..."
              className="w-full px-3 py-1.5 border border-rule bg-surface text-ink text-xs rounded-xs focus:outline-none focus:border-ink font-mono"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] uppercase text-ink-secondary block mb-1">Category</label>
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => updateParam('category', val)}
              options={EXCEPTION_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-[10px] uppercase text-ink-secondary block mb-1">Severity</label>
            <CustomSelect
              value={selectedSeverity}
              onChange={(val) => updateParam('severity', val)}
              options={[
                { value: 'all', label: 'All severities' },
                { value: 'critical', label: 'Critical (Money missing)' },
                { value: 'high', label: 'High (Difference found)' },
              ]}
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-[10px] uppercase text-ink-secondary block mb-1">Sort by</label>
            <CustomSelect
              value={sortBy}
              onChange={(val) => updateParam('sort', val)}
              options={[
                { value: 'discrepancy', label: 'Highest difference' },
                { value: 'amount', label: 'Largest payment amount' },
                { value: 'age', label: 'Oldest first' },
              ]}
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 text-xs font-mono gap-2">
          <div className="flex items-center gap-2">
            <span className="text-ink-secondary text-[11px]">Grouping:</span>
            <button
              type="button"
              onClick={() => updateParam('view', 'unique')}
              title="Shows one row per payment transaction"
              className={`px-2 py-0.5 rounded-xs border text-[11px] transition-colors ${viewMode === 'unique' ? 'bg-ink text-canvas border-ink font-medium' : 'bg-surface text-ink-secondary border-rule hover:text-ink'}`}
            >
              Unique payments ({Array.from(new Set(cases.map(c => c.payment_id))).length})
            </button>
            <button
              type="button"
              onClick={() => updateParam('view', 'all')}
              title="Shows every raw case"
              className={`px-2 py-0.5 rounded-xs border text-[11px] transition-colors ${viewMode === 'all' ? 'bg-ink text-canvas border-ink font-medium' : 'bg-surface text-ink-secondary border-rule hover:text-ink'}`}
            >
              All cases ({cases.length})
            </button>
          </div>
          {(searchQuery || selectedCategory !== 'all' || selectedSeverity !== 'all') && (
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-[11px] text-link hover:underline self-start sm:self-auto"
            >
              Reset all active filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Review Table */}
      {isLoading ? (
        <QueueTableSkeleton />
      ) : error ? (
        <div className="p-8 text-center border border-critical/40 bg-surface rounded-xs space-y-3">
          <span className="text-xs font-mono text-critical block">{error}</span>
          <button
            onClick={loadQueue}
            className="px-3 py-1.5 border border-rule bg-surface text-xs font-mono text-ink rounded-xs hover:bg-canvas"
          >
            Retry queue load
          </button>
        </div>
      ) : cases.length === 0 ? (
        <div data-testid="queue-empty-state" className="p-12 text-center border border-dashed border-rule bg-surface/50 rounded-xs space-y-3">
          <div className="w-2.5 h-2.5 rounded-full bg-brass mx-auto" />
          <span className="font-editorial text-2xl text-ink block">No reconciliation run active</span>
          <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
            The review queue is clear. No exception cases have been flagged or no reconciliation run is active.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={loadQueue}
              className="px-3.5 py-2 border border-rule bg-surface text-xs font-mono text-ink rounded-xs hover:bg-canvas transition-colors"
            >
              Refresh queue
            </button>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-4 py-2 bg-ink text-canvas text-xs font-medium rounded-xs hover:bg-ink/90 transition-colors"
            >
              Go to overview &rarr;
            </button>
          </div>
        </div>
      ) : processedCases.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-rule bg-surface/50 rounded-xs space-y-3">
          <span className="font-editorial text-xl text-ink block">No exceptions match the active filter</span>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto">
            Try loosening category or severity filters to inspect other reconciliation records.
          </p>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="mt-2 px-3 py-1.5 border border-rule bg-surface text-xs font-mono text-ink rounded-xs hover:bg-canvas"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="border border-rule rounded-xs overflow-hidden bg-surface shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-rule bg-canvas text-[11px] font-mono text-ink-secondary uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-normal">Severity</th>
                  <th className="py-2.5 px-4 font-normal">What Happened</th>
                  <th className="py-2.5 px-4 font-normal">Payment Reference</th>
                  <th className="py-2.5 px-4 font-normal text-right">Money to Check</th>
                  <th className="py-2.5 px-4 font-normal text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/70 text-xs">
                {processedCases.map((c) => {
                  const exposure = Math.abs(parseFloat(c.amount_at_risk || c.settlement_discrepancy || '0'));
                  const isCritical =
                    c.exception_type === 'amount_mismatch' ||
                    c.exception_type === 'missing_bank_credit' ||
                    c.exception_type === 'duplicate_bank_credit';

                  return (
                    <tr
                      key={c.case_id}
                      data-testid="queue-row"
                      onClick={() => navigate(`/app/case/${c.case_id}`)}
                      className="hover:bg-canvas/80 transition-colors cursor-pointer group"
                    >
                      {/* Priority Bar & Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-6 rounded-full ${
                              isCritical ? 'bg-critical' : 'bg-brass'
                            }`}
                            title={isCritical ? 'Critical' : 'High'}
                          />
                          <span
                            className={`font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-xs ${
                              isCritical
                                ? 'bg-critical/10 text-critical border border-critical/20'
                                : 'bg-brass/10 text-brass border border-brass/20'
                            }`}
                          >
                            {isCritical ? 'Critical' : 'High'}
                          </span>
                        </div>
                      </td>

                      {/* Discrepancy details */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-editorial text-sm font-medium text-ink block group-hover:text-link">
                            {c.exception_type === 'amount_mismatch' && 'Payout amount does not match expected net'}
                            {c.exception_type === 'missing_settlement' && 'Provider payout has not arrived'}
                            {c.exception_type === 'missing_bank_credit' && 'Bank payment not received'}
                            {c.exception_type === 'fee_mismatch' && 'Provider fee or tax does not match approved rule'}
                            {c.exception_type === 'duplicate_payment' && 'Customer appears to have paid twice'}
                            {c.exception_type === 'duplicate_bank_credit' && 'Bank payment appears more than once'}
                            {c.exception_type === 'partial_refund_not_reflected' && 'Refund was not deducted from provider payout'}
                            {c.exception_type === 'ambiguous_match' && 'More than one possible match found'}
                            {!c.exception_type && 'Difference needs review'}
                          </span>
                          <ExceptionBadge type={c.exception_type as ExceptionType} size="sm" />
                        </div>
                      </td>

                      {/* Payment ID & Opened Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-ink-secondary">
                        <span className="text-ink font-medium block">{c.payment_id}</span>
                        <span className="text-[10px] text-ink-muted">
                          Opened {new Date(c.case_opened_at).toLocaleDateString('en-IN')}
                        </span>
                      </td>

                      {/* Exposure Variance */}
                      <td className="py-3 px-4 text-right">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-critical text-sm tabular-nums block">
                            ₹{exposure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-mono text-ink-muted">Money to check</span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/case/${c.case_id}`);
                          }}
                          className="px-2.5 py-1 text-xs font-mono font-medium border border-rule bg-canvas hover:bg-ink hover:text-canvas text-ink rounded-xs transition-colors"
                        >
                          Review case &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueuePage;
