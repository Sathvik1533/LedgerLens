import React from 'react';
import { ShieldCheck, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'empty_queue' | 'filtered_empty' | 'partial_evidence' | 'error';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  if (type === 'empty_queue') {
    return (
      <div className="w-full bg-surface border border-border-strong rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-lg font-bold text-white">
            {title || 'All caught up'}
          </h3>
          <p className="text-sm text-slate-400">
            {message || 'Zero financial exceptions require attention right now. All captured transactions match across settlement and bank feeds.'}
          </p>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm focus-ring"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (type === 'filtered_empty') {
    return (
      <div className="w-full bg-surface border border-border-strong rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-surface-alt border border-border-strong flex items-center justify-center text-slate-400">
          <SlidersHorizontal className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-lg font-bold text-white">
            {title || 'No matching exceptions'}
          </h3>
          <p className="text-sm text-slate-400">
            {message || 'No exceptions match your active filter criteria. Try clearing search filters or selecting all categories.'}
          </p>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-surface-alt hover:bg-surface-hover border border-border-strong rounded-lg shadow-sm focus-ring"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  // Error or Partial Evidence
  return (
    <div className="w-full bg-surface border border-border-strong rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-bold text-white">
          {title || 'Notice'}
        </h3>
        <p className="text-xs text-slate-400">
          {message || 'An unexpected condition occurred while loading records.'}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm focus-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
