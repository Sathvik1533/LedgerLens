import React from 'react';
import { RefreshCw, Scale } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border-subtle px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-panel">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <a href="/" className="flex items-center gap-3 focus-ring rounded-lg">
          <div className="w-9 h-9 rounded-lg bg-surface-alt border border-border-strong flex items-center justify-center p-1.5 shadow-inner">
            {/* LedgerLens Calibrated Diamond Aperture Mark */}
            <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" aria-hidden="true">
              <line x1="8" y1="12" x2="24" y2="24" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="8" y1="52" x2="24" y2="40" stroke="#0891B2" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="44" y1="12" x2="36" y2="20" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="44" y1="52" x2="36" y2="44" stroke="#0891B2" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="24,32 32,24 40,32 32,40" fill="#0F172A" stroke="#2563EB" strokeWidth="3.5" strokeLinejoin="round" />
              <polygon points="29,32 32,29 35,32 32,35" fill="#38BDF8" />
              <line x1="40" y1="32" x2="58" y2="32" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">LedgerLens</span>
              <span className="text-xs font-semibold text-blue-400 font-mono tracking-wider">CONTROL ROOM</span>
            </div>
            <p className="text-xs text-slate-400 leading-none mt-0.5">
              Financial Reconciliation Control Room
            </p>
          </div>
        </a>
      </div>

      {/* Status & Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-alt border border-border-strong text-xs text-slate-300 font-medium">
          <Scale className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
          <span>Supports 4 financial data sources</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Synchronize live reconciliation queue"
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border border-blue-500 rounded-lg shadow-sm transition duration-150 disabled:opacity-50 focus-ring"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live Queue'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
