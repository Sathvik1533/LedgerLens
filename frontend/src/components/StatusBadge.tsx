import React from 'react';
import { DecisionStatus } from '../types/api';

interface StatusMeta {
  label: string;
  dotColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<string, StatusMeta> = {
  needs_review: {
    label: 'Needs Review',
    dotColor: 'bg-amber-400',
    textColor: 'text-advisory-amber',
  },
  auto_reconciled: {
    label: 'Auto Reconciled',
    dotColor: 'bg-emerald-400',
    textColor: 'text-matched-green',
  },
  approved: {
    label: 'Approved',
    dotColor: 'bg-emerald-400',
    textColor: 'text-matched-green',
  },
  rejected: {
    label: 'Rejected',
    dotColor: 'bg-rose-400',
    textColor: 'text-ink-900',
  },
  unresolved: {
    label: 'Unresolved',
    dotColor: 'bg-slate-400',
    textColor: 'text-ink-700',
  },
};

export const StatusBadge: React.FC<{ status: DecisionStatus | string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, ' '),
    dotColor: 'bg-slate-400',
    textColor: 'text-ink-900',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${config.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
