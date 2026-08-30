import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">Razorpay AI Finance Controller</h1>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded">
              MVP Operations
            </span>
          </div>
          <p className="text-xs text-slate-400">Deterministic Multi-Source Reconciliation & Exception Review</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Connected</span>
        </div>
      </div>
    </header>
  );
};
