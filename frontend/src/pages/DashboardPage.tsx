import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  Building2,
  Receipt,
  Play,
  RefreshCw,
  Check,
} from 'lucide-react';
import { fetchReconciliationStats, triggerReconciliationRun } from '../api/client';
import { ReconciliationStats } from '../types/api';

const EXCEPTION_LABELS: Record<string, { label: string; severity: 'critical' | 'high'; desc: string }> = {
  amount_mismatch: {
    label: 'Amount Mismatch',
    severity: 'critical',
    desc: 'Reported gateway net payout differs from expected calculated net',
  },
  fee_mismatch: {
    label: 'Fee / Tax Mismatch',
    severity: 'high',
    desc: 'Contractual 2% fee or 18% GST calculation formula deviates',
  },
  missing_settlement: {
    label: 'Missing Settlement',
    severity: 'high',
    desc: 'Payment captured in merchant ledger without gateway settlement line',
  },
  missing_bank_credit: {
    label: 'Missing Bank Credit',
    severity: 'high',
    desc: 'Settlement confirmed by gateway with no matching bank statement UTR',
  },
  duplicate_payment: {
    label: 'Duplicate Payment',
    severity: 'critical',
    desc: 'Multiple captured payment records share identical order reference',
  },
  duplicate_bank_credit: {
    label: 'Duplicate Bank Credit',
    severity: 'high',
    desc: 'Multiple bank credit entries reference the same settlement batch ID',
  },
  partial_refund_not_reflected: {
    label: 'Partial Refund Discrepancy',
    severity: 'high',
    desc: 'Refund was processed but settlement payout was unadjusted',
  },
  ambiguous_match: {
    label: 'Ambiguous Candidate Match',
    severity: 'high',
    desc: 'Multiple settlement candidate records matched transaction criteria',
  },
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReconciliationStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReconciliationStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats', err);
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
      alert(`Reconciliation error: ${err.message || 'Failed to run loop'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"
    >
      {/* Section Header Strip with Paymentor Number Tag */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 border border-accent px-2.5 py-0.5 rounded-full">
            01 &mdash; CONTINUOUS RECONCILIATION ENGINE
          </span>
          <span className="text-text-secondary">&bull;</span>
          <span className="text-xs text-text-secondary font-mono">AUTOMATED MATCHING</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-sans">
              Finance operations that <span className="text-transparent bg-clip-text bg-surface text-text-primary">think ahead.</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary font-sans mt-1">
              Multi-source reconciliation of payments, gateway settlements, customer refunds, and bank statements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadStats}
              disabled={isLoading}
              className="h-8 px-3.5 rounded-full bg-surface hover:bg-surface border border-border text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-accent' : ''}`} />
              <span>Refresh Metrics</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRunRecon}
              disabled={isRunning}
              className="h-8 px-4 rounded-full bg-surface text-text-primary hover:from-blue-500 hover:to-indigo-500 text-text-primary text-xs font-semibold flex items-center gap-1.5 shadow-none transition"
            >
              <Play className="w-3 h-3 fill-white text-text-primary" />
              <span>{isRunning ? 'Reconciling...' : 'Execute Loop'}</span>
              <span className="text-text-primary/60">&rarr;</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Row with Paymentor Card Styling */}
      {stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Match Rate */}
          <div className="control-panel rounded-xl p-5 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium uppercase tracking-wider font-sans">Clean Parity Rate</span>
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-resolved flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-resolved" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono tracking-tight text-text-primary">
                {stats.match_rate_percentage}%
              </div>
              <div className="text-xs text-resolved font-sans flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{stats.auto_reconciled_count} of {stats.total_cases} transactions matched</span>
              </div>
            </div>
            <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border">
              <div
                className="bg-surface text-text-primary h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(stats.match_rate_percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Reconciled Volume */}
          <div className="control-panel rounded-xl p-5 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium uppercase tracking-wider font-sans">Reconciled Volume</span>
              <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono tracking-tight text-text-primary">
                ₹{Number(stats.total_amount_reconciled || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-text-secondary font-sans">
                Clean 3-way parity across merchant & gateway
              </p>
            </div>
          </div>

          {/* Card 3: Exposure at Risk */}
          <div className="control-panel rounded-xl p-5 space-y-3 relative overflow-hidden group border-critical hover:border-critical">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium uppercase tracking-wider font-sans">Exposure at Risk</span>
              <div className="w-6 h-6 rounded-full bg-critical-surface border border-critical flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-critical" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono tracking-tight text-critical">
                ₹{Number(stats.total_amount_at_risk || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-text-primary/80 font-sans">
                {stats.needs_review_count + stats.unresolved_count} anomalies awaiting human decision
              </p>
            </div>
          </div>

          {/* Card 4: Open Exceptions */}
          <div className="control-panel rounded-xl p-5 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium uppercase tracking-wider font-sans">Active Queue</span>
              <div className="w-6 h-6 rounded-full bg-high-surface border border-high flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-high" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono tracking-tight text-high">
                {stats.needs_review_count}
              </div>
              <button
                onClick={() => navigate('/app/queue')}
                className="text-xs text-accent hover:text-accent/80 font-medium font-sans flex items-center gap-1 transition"
              >
                <span>Inspect in Control Room</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Command Center Console Window — Mac Frame Styling */}
      <motion.div variants={itemVariants} className="control-panel rounded-xl overflow-hidden shadow-none border border-border">
        {/* Mac Window Header */}
        <div className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-critical" />
              <span className="w-2.5 h-2.5 rounded-full bg-high" />
              <span className="w-2.5 h-2.5 rounded-full bg-resolved" />
            </div>
            <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider ml-2">
              LEDGERLENS // RECONCILIATION COMMAND CENTER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-resolved animate-pulse" />
            <span className="text-[10px] font-mono font-medium text-resolved uppercase tracking-wider">
              Signals are live
            </span>
          </div>
        </div>

        {/* 3-Way Pipeline Diagram Nodes */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feed 1: Payments */}
            <div className="bg-surface border border-border hover:border-accent rounded-lg p-4 space-y-2 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <Receipt className="w-4 h-4 text-accent" />
                  <span>1. Captured Payments</span>
                </div>
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent px-2 py-0.5 rounded">
                  {stats?.total_payments_count || 0}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Order IDs, customer capture timestamps, gross amounts in INR, and payment status states.
              </p>
              <div className="text-[10px] font-mono text-resolved flex items-center gap-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-resolved inline-block" />
                <Tooltip content="Deterministic 3-Way Parity"><span className="border-b border-dashed border-border cursor-help">Ingested &amp; Normalized</span></Tooltip>
              </div>
            </div>

            {/* Feed 2: Settlements */}
            <div className="bg-surface border border-border hover:border-accent rounded-lg p-4 space-y-2 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <FileSpreadsheet className="w-4 h-4 text-accent" />
                  <span>2. Gateway Settlements</span>
                </div>
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
                  {stats?.total_settlements_count || 0}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Reported gross, contractual 2% fees + 18% GST formula, net payouts, and batch IDs.
              </p>
              <div className="text-[10px] font-mono text-resolved flex items-center gap-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-resolved inline-block" />
                <span>Contract Formula Verified</span>
              </div>
            </div>

            {/* Feed 3: Bank Credits */}
            <div className="bg-surface border border-border hover:border-accent rounded-lg p-4 space-y-2 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <Building2 className="w-4 h-4 text-text-primary" />
                  <span>3. Bank Statement Credits</span>
                </div>
                <span className="font-mono text-xs font-bold text-text-primary bg-surface-raised/10 border border-ink-900/20 px-2 py-0.5 rounded">
                  {stats?.total_bank_credits_count || 0}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Core banking NEFT/RTGS UTR numbers, credited ledger amounts, and bank narrations.
              </p>
              <div className="text-[10px] font-mono text-resolved flex items-center gap-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-resolved inline-block" />
                <Tooltip content="Idempotent Credit Pipeline"><span className="border-b border-dashed border-border cursor-help">Double-Credit Guarded</span></Tooltip>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 8-Exception Category Breakdown Matrix */}
      {stats && (
        <motion.div variants={itemVariants} className="control-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-high" />
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider font-sans">
                Financial Exception Categories (8 Failure Modes)
              </h2>
            </div>
            <button
              onClick={() => navigate('/app/queue')}
              className="text-xs text-accent hover:text-accent/80 font-medium font-sans flex items-center gap-1"
            >
              <span>View All in Control Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {Object.entries(EXCEPTION_LABELS).map(([typeKey, meta]) => {
              const count = stats.exception_breakdown[typeKey] || 0;
              return (
                <div
                  key={typeKey}
                  onClick={() => navigate(`/app/queue?type=${typeKey}`)}
                  className="bg-surface hover:bg-surface border border-border hover:border-accent rounded-lg p-4 space-y-2 cursor-pointer transition shadow-none group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary group-hover:text-accent/80 transition">
                      {meta.label}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        count > 0
                          ? meta.severity === 'critical'
                            ? 'bg-critical-surface text-critical border border-critical'
                            : 'bg-high-surface text-high border border-high'
                          : 'bg-surface text-text-secondary'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-snug line-clamp-2">
                    {meta.desc}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-text-secondary font-sans pt-1 border-t border-border">
                    <span className="capitalize">{meta.severity} priority</span>
                    <span className="text-accent group-hover:underline">Filter &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
