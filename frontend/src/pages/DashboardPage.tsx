import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchReconciliationStats, triggerReconciliationRun } from '../api/client';
import { ReconciliationStats } from '../types/api';
import { RollingNumberTicker } from '../components/ui/RollingNumberTicker';

const EXCEPTION_LABELS: Record<string, string> = {
  amount_mismatch: 'Amount mismatch',
  fee_mismatch: 'Fee / tax mismatch',
  missing_settlement: 'Missing settlement',
  missing_bank_credit: 'Missing bank credit',
  duplicate_payment: 'Duplicate payment',
  duplicate_bank_credit: 'Duplicate bank credit',
  partial_refund_not_reflected: 'Partial refund not reflected',
  ambiguous_match: 'Ambiguous candidate match',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReconciliationStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReconciliationStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.message || 'Reconciliation metrics currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRunRecon = async () => {
    setIsRunning(true);
    try {
      await triggerReconciliationRun();
      await loadStats();
    } catch (err: any) {
      alert(`Reconciliation run failed: ${err.message || 'Error executing cycle'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-10 font-sans">
      {/* 1. Header with Operational Pacing */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-rule pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
            <span>FINANCIAL OPERATIONS OVERVIEW</span>
            <span>&bull;</span>
            <span className="text-ledger-green font-medium">Four-Source Active Parity</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
            Reconciliation status & ledger health
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary font-sans leading-relaxed max-w-2xl">
            Live overview of transactions processed through the deterministic reconciliation engine. Inspect matched volumes and surfaced variances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="px-3.5 py-2 border border-rule bg-surface hover:bg-canvas text-ink text-xs font-medium rounded-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh status'}
          </button>
          <button
            onClick={handleRunRecon}
            disabled={isRunning}
            className="px-4 py-2 bg-ink hover:bg-ink/90 text-canvas text-xs font-medium rounded-xs transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-brass animate-ping' : 'bg-ledger-green'}`} />
            <span>{isRunning ? 'Reconciling...' : 'Reconcile new records'}</span>
          </button>
        </div>
      </div>

      {/* Loading Shell */}
      {isLoading && !stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-32 border border-rule bg-surface/50 rounded-xs" />
          <div className="h-32 border border-rule bg-surface/50 rounded-xs" />
          <div className="h-32 border border-rule bg-surface/50 rounded-xs" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 border border-critical/40 bg-surface rounded-xs text-center space-y-2">
          <span className="font-mono text-xs text-critical block">{error}</span>
          <button
            onClick={loadStats}
            className="px-3 py-1.5 bg-ink text-canvas text-xs font-medium rounded-xs hover:bg-ink/90"
          >
            Retry metrics query
          </button>
        </div>
      )}

      {/* 2. Key Metrics Row */}
      {stats && (
        <div className="space-y-8">
          {/* Action Required Callout Banner */}
          {stats.needs_review_count > 0 && (
            <div className="p-4 bg-critical/5 border-l-4 border-l-critical border border-rule rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-critical animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-critical font-semibold">
                    Action Required &bull; Review Queue
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-ink">
                  <strong className="font-semibold">{stats.needs_review_count} exception{stats.needs_review_count === 1 ? '' : 's'}</strong> awaiting human sign-off ({stats.total_amount_at_risk ? `₹${parseFloat(stats.total_amount_at_risk).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'} total exposure).
                </p>
              </div>
              <Link
                to="/app/queue"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-critical text-canvas text-xs font-medium rounded-xs hover:bg-critical/90 transition-colors shrink-0 shadow-subtle"
              >
                <span>Open highest-risk exception</span>
                <span>&rarr;</span>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Clean Match Parity */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Deterministic Parity Rate
              </span>
              <div className="text-3xl font-semibold text-ink">
                <RollingNumberTicker value={stats.match_rate_percentage} decimals={1} />%
              </div>
              <div className="text-xs text-ledger-green font-medium flex items-center gap-1.5">
                <span>✓</span>
                <span>
                  <RollingNumberTicker value={stats.auto_reconciled_count} /> of{' '}
                  <RollingNumberTicker value={stats.total_cases} /> transactions matched cleanly
                </span>
              </div>
            </div>

            {/* Reconciled Volume */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Reconciled Value
              </span>
              <div className="text-3xl font-semibold text-ledger-green">
                <RollingNumberTicker
                  value={parseFloat(stats.total_amount_reconciled || '0')}
                  currency="₹"
                  decimals={2}
                />
              </div>
              <span className="text-xs text-ink-secondary block font-mono text-[11px]">
                Four-source parity verified
              </span>
            </div>

            {/* Volume Under Review */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Exposure Under Review
              </span>
              <div className="text-3xl font-semibold text-critical">
                <RollingNumberTicker
                  value={parseFloat(stats.total_amount_at_risk || '0')}
                  currency="₹"
                  decimals={2}
                />
              </div>
              <Link to="/app/queue" className="text-xs text-link hover:underline block font-medium">
                <RollingNumberTicker value={stats.needs_review_count} /> exception{stats.needs_review_count === 1 ? '' : 's'} awaiting sign-off &rarr;
              </Link>
            </div>

            {/* Four-Source Intake Totals */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Ingested Record Intake
              </span>
              <div className="text-3xl font-semibold text-ink">
                <RollingNumberTicker
                  value={
                    (stats.total_payments_count || 0) +
                    (stats.total_settlements_count || 0) +
                    (stats.total_refunds_count || 0) +
                    (stats.total_bank_credits_count || 0)
                  }
                />
              </div>
              <span className="text-xs text-ink-secondary block font-mono text-[11px]">
                Across all 4 stream feeds
              </span>
            </div>
          </div>

          {/* 3. Four-Source Intake Stream Status */}
          <div className="border border-rule bg-surface p-6 rounded-xs space-y-4">
            <span className="font-editorial text-xl font-medium text-ink block">
              Four-source stream ingestion summary
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs font-mono">
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">1. Captured Payments</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{stats.total_payments_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">Merchant captures</span>
              </div>
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">2. Gateway Settlements</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{stats.total_settlements_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">Gateway net payouts</span>
              </div>
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">3. Customer Refunds</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{stats.total_refunds_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">Reversals & chargebacks</span>
              </div>
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">4. Bank Statement Credits</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{stats.total_bank_credits_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">Direct bank transfers</span>
              </div>
            </div>
          </div>

          {/* 4. Exception Breakdown by Categorical Type */}
          {stats.exception_breakdown && Object.keys(stats.exception_breakdown).length > 0 && (
            <div className="border border-rule bg-surface p-6 rounded-xs space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="font-editorial text-xl font-medium text-ink">
                  Exception distribution across active batches
                </span>
                <Link to="/app/queue" className="text-xs font-mono text-link hover:underline">
                  Open full queue &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {Object.entries(stats.exception_breakdown).map(([type, count]) => {
                  const label = EXCEPTION_LABELS[type] || type;
                  const isCritical = type === 'amount_mismatch' || type === 'missing_bank_credit';
                  return (
                    <div
                      key={type}
                      onClick={() => navigate(`/app/queue?category=${type}`)}
                      className="p-3 bg-canvas border border-rule hover:border-ink rounded-xs space-y-1 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-critical' : 'bg-high'}`} />
                        <span className="font-mono text-sm font-semibold text-ink tabular-nums">{count}</span>
                      </div>
                      <span className="font-sans text-xs text-ink font-medium block truncate">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
