import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchReconciliationStats, triggerReconciliationRun } from '../api/client';
import { ReconciliationStats } from '../types/api';
import { RollingNumberTicker } from '../components/ui/RollingNumberTicker';
import { useDemoSimulation } from '../context/DemoSimulationContext';
import { DemoRunControls } from '../components/DemoRunControls';

const EXCEPTION_LABELS: Record<string, string> = {
  amount_mismatch: 'Amounts do not match',
  fee_mismatch: 'Provider fee or tax is different',
  missing_settlement: 'Missing provider payout',
  missing_bank_credit: 'Bank payment not received',
  duplicate_payment: 'Customer may have paid twice',
  duplicate_bank_credit: 'Bank payment may appear twice',
  partial_refund_not_reflected: 'Refund is missing from the payout',
  ambiguous_match: 'More than one possible match',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoMode, demoRun } = useDemoSimulation();
  const [stats, setStats] = useState<ReconciliationStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeStats: ReconciliationStats | null =
    isDemoMode && demoRun
      ? {
          total_cases: demoRun.totalRecords,
          auto_reconciled_count: demoRun.matchedCount,
          needs_review_count: demoRun.reviewCount,
          unresolved_count: demoRun.unresolvedCount,
          match_rate_percentage: demoRun.matchRate,
          total_amount_reconciled: demoRun.totalAmountReconciled,
          total_amount_at_risk: demoRun.moneyToCheck,
          total_payments_count: demoRun.paymentsCount,
          total_settlements_count: demoRun.settlementsCount,
          total_refunds_count: demoRun.refundsCount,
          total_bank_credits_count: demoRun.bankCreditsCount,
          exception_breakdown: demoRun.exceptionBreakdown,
        }
      : stats;

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
      alert(`Record comparison failed: ${err.message || 'Error executing cycle'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8 font-sans">
      {/* 1. Header with Operational Pacing */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-rule pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
            <span>FINANCIAL OPERATIONS OVERVIEW</span>
            <span>&bull;</span>
            <span className="text-ledger-green font-medium">Four Records Compared</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
            Records compared &amp; open cases
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary font-sans leading-relaxed max-w-2xl">
            Live overview of records checked across payments, provider payouts, refunds, and bank credits.
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
            <span>{isRunning ? 'Comparing...' : 'Compare the records'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Demo Simulation Controls Banner */}
      <DemoRunControls />

      {/* Loading Shell */}
      {isLoading && !activeStats && !isDemoMode && (
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
            Retry query
          </button>
        </div>
      )}

      {/* 2. Key Metrics Row */}
      {activeStats && (
        <div className="space-y-8">
          {/* Action Required Callout Banner */}
          {activeStats.needs_review_count > 0 && (
            <div className="p-4 bg-critical/5 border-l-4 border-l-critical border border-rule rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-critical animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-critical font-semibold">
                    Action Required &bull; Cases Waiting for Decision
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-ink">
                  <strong className="font-semibold">{activeStats.needs_review_count} case{activeStats.needs_review_count === 1 ? '' : 's'}</strong> needing human attention ({activeStats.total_amount_at_risk ? `₹${parseFloat(activeStats.total_amount_at_risk).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'} money in open cases).
                </p>
              </div>
              <Link
                to="/app/queue"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-critical text-canvas text-xs font-medium rounded-xs hover:bg-critical/90 transition-colors shrink-0 shadow-subtle"
              >
                <span>Review cases</span>
                <span>&rarr;</span>
              </Link>
            </div>
          )}

          {/* Zero State Notice Banner */}
          {activeStats.total_cases === 0 && (
            <div data-testid="no-run-banner" className="p-6 bg-canvas border border-dashed border-rule rounded-xs text-center space-y-3 shadow-subtle">
              <div className="w-2.5 h-2.5 rounded-full bg-brass mx-auto" />
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block">
                  Status &bull; Awaiting Record Check
                </span>
                <h2 className="font-editorial text-2xl font-medium text-ink">
                  No reconciliation run active
                </h2>
                <p className="text-xs text-ink-secondary font-sans max-w-lg mx-auto leading-relaxed">
                  No source files have been compared yet. Bring in source files or load demo data, then compare the records to see matched rates and cases needing attention.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={handleRunRecon}
                  disabled={isRunning}
                  className="px-4 py-2 bg-ink hover:bg-ink/90 text-canvas text-xs font-medium rounded-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-brass animate-ping' : 'bg-ledger-green'}`} />
                  <span>{isRunning ? 'Comparing...' : 'Compare the records'}</span>
                </button>
                <Link
                  to="/app/ingestion"
                  className="px-3.5 py-2 border border-rule bg-surface hover:bg-canvas text-ink text-xs font-medium rounded-xs transition-colors"
                >
                  Bring in source files &rarr;
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Money in open cases */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Money in open cases
              </span>
              <div className="text-3xl font-semibold text-critical">
                <RollingNumberTicker
                  value={parseFloat(activeStats.total_amount_at_risk || '0')}
                  currency="₹"
                  decimals={2}
                />
              </div>
              <Link to="/app/queue" className="text-xs text-link hover:underline block font-medium">
                <RollingNumberTicker value={activeStats.needs_review_count} /> case{activeStats.needs_review_count === 1 ? '' : 's'} waiting for decision &rarr;
              </Link>
            </div>

            {/* Records received */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Records received
              </span>
              <div className="text-3xl font-semibold text-ink">
                <RollingNumberTicker
                  value={
                    (activeStats.total_payments_count || 0) +
                    (activeStats.total_settlements_count || 0) +
                    (activeStats.total_refunds_count || 0) +
                    (activeStats.total_bank_credits_count || 0)
                  }
                />
              </div>
              <span className="text-xs text-ink-secondary block font-mono text-[11px]">
                Across all 4 source files
              </span>
            </div>

            {/* Records matched */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Records matched
              </span>
              <div className="text-3xl font-semibold text-ledger-green">
                <RollingNumberTicker
                  value={parseFloat(activeStats.total_amount_reconciled || '0')}
                  currency="₹"
                  decimals={2}
                />
              </div>
              <div className="text-xs text-ledger-green font-medium flex items-center gap-1.5">
                <span>✓</span>
                <span>
                  <RollingNumberTicker value={activeStats.auto_reconciled_count} /> of{' '}
                  <RollingNumberTicker value={activeStats.total_cases} /> matched correctly ({activeStats.match_rate_percentage}%)
                </span>
              </div>
            </div>

            {/* Cases needing attention */}
            <div className="border border-rule bg-surface p-5 space-y-2 rounded-xs shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Cases needing attention
              </span>
              <div className="text-3xl font-semibold text-ink">
                <RollingNumberTicker value={activeStats.needs_review_count} />
              </div>
              <span className="text-xs text-ink-secondary block font-mono text-[11px]">
                Awaiting human decision
              </span>
            </div>
          </div>

          {/* 3. Four-Source Intake Stream Status */}
          <div className="border border-rule bg-surface p-6 rounded-xs space-y-4">
            <span className="font-editorial text-xl font-medium text-ink block">
              Source file breakdown
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs font-mono">
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">Payment records</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{activeStats.total_payments_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">What customers paid</span>
              </div>
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">Provider payout records</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{activeStats.total_settlements_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">What provider sent</span>
              </div>
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">Refund records</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{activeStats.total_refunds_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">Returned to customers</span>
              </div>
              <div className="p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <span className="text-ink-secondary block uppercase text-[10px]">Bank credit records</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{activeStats.total_bank_credits_count || 0}</span>
                <span className="text-[10px] text-ink-muted block">Received by bank</span>
              </div>
            </div>
          </div>

          {/* 4. Exception Breakdown by Categorical Type */}
          {activeStats.exception_breakdown && Object.keys(activeStats.exception_breakdown).length > 0 ? (
            <div className="border border-rule bg-surface p-6 rounded-xs space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="font-editorial text-xl font-medium text-ink">
                  Differences found across active records
                </span>
                <Link to="/app/queue" className="text-xs font-mono text-link hover:underline">
                  Open full queue &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {Object.entries(activeStats.exception_breakdown).map(([type, count]) => {
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
          ) : (
            <div className="border border-rule bg-surface p-6 rounded-xs space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="font-editorial text-xl font-medium text-ink">
                  Differences found across active records
                </span>
                <span className="text-xs font-mono text-ink-muted">0 differences found</span>
              </div>
              <div className="p-8 text-center border border-dashed border-rule/70 bg-canvas/40 rounded-xs space-y-1">
                <span className="font-mono text-xs text-ink-secondary block font-medium">No reconciliation run active &bull; 0 differences found</span>
                <p className="text-[11px] text-ink-muted max-w-sm mx-auto">
                  Compare records after bringing in source files to see differences and open cases needing human attention.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
