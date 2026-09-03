import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Database,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  Play,
  CheckCircle2,
  X,
} from 'lucide-react';
import { triggerReconciliationRun } from '../api/client';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Activity },
  { path: '/exceptions', label: 'Exceptions Queue', icon: AlertTriangle },
  { path: '/ingestion', label: 'Data Feeds', icon: Database },
  { path: '/audit', label: 'Audit Trail', icon: ShieldCheck },
  { path: '/policies', label: 'Policies & SOPs', icon: BookOpen },
];

export const Navbar: React.FC<{ onRefresh?: () => void; isRefreshing?: boolean }> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRunningRecon, setIsRunningRecon] = useState(false);
  const [reconModalData, setReconModalData] = useState<any | null>(null);

  const handleRunRecon = async () => {
    setIsRunningRecon(true);
    try {
      const res = await triggerReconciliationRun();
      setReconModalData(res);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Reconciliation error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRunningRecon(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-14 bg-[#000000]/85 backdrop-blur-xl border-b border-border px-4 sm:px-8 flex items-center justify-between">
        {/* Brand & Mark */}
        <div className="flex items-center gap-8">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 text-text-primary font-semibold tracking-tight hover:opacity-95 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-surface text-text-primary p-0.5 shadow-none flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-text-primary font-sans">
                LedgerLens
              </span>
              <span className="text-[10px] font-mono text-text-secondary tracking-wider uppercase -mt-0.5">
                AI Finance Controller
              </span>
            </div>
          </NavLink>

          {/* Navigation Links with Framer Motion active pill indicator */}
          <nav className="hidden md:flex items-center gap-1 bg-surface border border-border rounded-full p-1 shadow-none">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/exceptions' && location.pathname.startsWith('/exceptions'));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                    isActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-canvas/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                  <span className="font-sans">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-full bg-surface border border-accent -z-10 shadow-none"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-3">
          {/* Feed Sync Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-text-secondary font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-none" />
            <span className="text-text-primary font-medium">4 Feeds Live</span>
          </div>

          {/* Trigger Reconciliation Loop Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRunRecon}
            disabled={isRunningRecon}
            className="h-8 px-4 rounded-full bg-surface text-text-primary hover:from-blue-500 hover:to-indigo-500 text-text-primary text-xs font-semibold flex items-center gap-1.5 shadow-none transition disabled:opacity-50"
            title="Execute 3-way deterministic reconciliation loop"
          >
            {isRunningRecon ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-text-primary" />
                <span>Reconciling...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white text-text-primary" />
                <span>Run Recon</span>
                <span className="text-text-primary/60 ml-0.5">&rarr;</span>
              </>
            )}
          </motion.button>

          {/* Global Refresh Button */}
          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 rounded-full bg-surface hover:bg-surface border border-border text-text-secondary hover:text-text-primary flex items-center justify-center transition"
              title="Refresh all data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
            </motion.button>
          )}
        </div>
      </header>

      {/* Reconciliation Output Modal */}
      {reconModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-surface border border-white/[0.1] rounded-lg shadow-none p-5 space-y-4 font-sans"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-resolved" />
                <h3 className="text-sm font-semibold text-text-secondary">
                  Reconciliation Loop Executed
                </h3>
              </div>
              <button
                onClick={() => setReconModalData(null)}
                className="text-text-secondary hover:text-text-secondary transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-canvas/80 border border-border rounded p-3 text-center">
                <span className="text-[10px] text-text-secondary uppercase">Payments</span>
                <div className="text-base font-semibold font-mono text-text-secondary">
                  {reconModalData.total_payments_processed}
                </div>
              </div>
              <div className="bg-canvas/80 border border-border rounded p-3 text-center">
                <span className="text-[10px] text-text-secondary uppercase">Auto-Reconciled</span>
                <div className="text-base font-semibold font-mono text-resolved">
                  {reconModalData.auto_reconciled_count}
                </div>
              </div>
              <div className="bg-canvas/80 border border-border rounded p-3 text-center">
                <span className="text-[10px] text-text-secondary uppercase">Flagged Exceptions</span>
                <div className="text-base font-semibold font-mono text-high">
                  {reconModalData.needs_review_count + (reconModalData.unresolved_count || 0)}
                </div>
              </div>
            </div>

            <div className="bg-canvas/60 border border-border rounded p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span className="text-text-secondary">Match Rate:</span>
                <span className="font-mono font-medium text-resolved">
                  {reconModalData.match_rate_percentage}%
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="text-text-secondary">Amount Reconciled:</span>
                <span className="font-mono font-medium text-text-secondary">
                  ₹{Number(reconModalData.total_amount_reconciled || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="text-text-secondary">Amount at Risk:</span>
                <span className="font-mono font-medium text-critical">
                  ₹{Number(reconModalData.total_amount_at_risk || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setReconModalData(null);
                  navigate('/exceptions');
                }}
                className="px-4 py-2 rounded bg-surface hover:bg-canvas text-text-primary text-xs font-semibold transition"
              >
                Inspect Exceptions Queue →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
