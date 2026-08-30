import React from 'react';
import { RefreshCw, Zap, Database, Cpu } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-black/20">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
          <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Zap className="w-5 h-5 text-blue-400 fill-blue-400/20" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Razorpay</span>
              <span className="text-blue-400 font-extrabold">Finance Controller</span>
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full">
              <Cpu className="w-3 h-3 text-blue-400" />
              AI Ops MVP
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>Deterministic 4-Source Reconciliation</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-emerald-400 font-mono">₹0.00 Tolerance</span>
          </p>
        </div>
      </div>

      {/* Status & Controls */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-900 border border-slate-700/80 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 hover:border-slate-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live Queue'}</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-mono shadow-inner">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">PostgreSQL Isolated</span>
        </div>
      </div>
    </header>
  );
};
