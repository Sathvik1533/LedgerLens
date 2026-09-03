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
      <div className="w-full bg-white border border-rule-300 rounded-xl p-16 text-center flex flex-col items-center justify-center space-y-5 shadow-none">
        <div className="w-16 h-16 rounded-full bg-matched-green/10 flex items-center justify-center text-matched-green">
          <ShieldCheck className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-display font-semibold text-ink-900">
            {title || 'All Caught Up'}
          </h3>
          <p className="text-sm text-ink-700 font-sans leading-relaxed">
            {message || 'Zero financial exceptions require attention right now. All captured transactions match across settlement and bank feeds.'}
          </p>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-4 px-6 py-2.5 text-sm font-semibold text-white bg-ink-900 hover:bg-ink-700 rounded-md shadow-none transition active:scale-95"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (type === 'filtered_empty') {
    return (
      <div className="w-full bg-white border border-rule-300 rounded-xl p-16 text-center flex flex-col items-center justify-center space-y-5 shadow-none">
        <div className="w-16 h-16 rounded-full bg-paper-1 flex items-center justify-center text-ink-700 border border-rule-300">
          <SlidersHorizontal className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-display font-semibold text-ink-900">
            {title || 'No matching exceptions'}
          </h3>
          <p className="text-sm text-ink-700 font-sans leading-relaxed">
            {message || 'No exceptions match your active filter criteria. Try clearing search filters or selecting all categories.'}
          </p>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-4 px-6 py-2.5 text-sm font-semibold text-ink-900 bg-paper-1 hover:bg-paper-0 border border-rule-300 rounded-md shadow-none transition active:scale-95"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  // Error or Partial Evidence
  return (
    <div className="w-full bg-white border border-ledger-vermilion/50 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-none">
      <div className="w-12 h-12 rounded-full bg-ledger-vermilion/10 flex items-center justify-center text-ledger-vermilion">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-display font-semibold text-ink-900">
          {title || 'Notice'}
        </h3>
        <p className="text-sm text-ink-700 font-sans">
          {message || 'An unexpected condition occurred while loading records.'}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2 text-sm font-semibold text-white bg-ledger-vermilion hover:bg-ledger-vermilion/90 rounded-md shadow-none transition active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
