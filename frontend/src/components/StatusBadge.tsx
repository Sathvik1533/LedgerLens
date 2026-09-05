import React from 'react';
import { DecisionStatus } from '../types/api';

interface StatusMeta {
  label: string;
  dotColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<string, StatusMeta> = {
  needs_review: {
    label: 'Needs a human decision',
    dotColor: 'bg-amber-400',
    textColor: 'text-high',
  },
  auto_reconciled: {
    label: 'Matched automatically',
    dotColor: 'bg-emerald-400',
    textColor: 'text-resolved',
  },
  approved: {
    label: 'Approved',
    dotColor: 'bg-emerald-400',
    textColor: 'text-resolved',
  },
  rejected: {
    label: 'Reviewer did not approve',
    dotColor: 'bg-rose-400',
    textColor: 'text-text-primary',
  },
  unresolved: {
    label: 'Still not explained',
    dotColor: 'bg-slate-400',
    textColor: 'text-text-secondary',
  },
};

export const StatusBadge: React.FC<{ status: DecisionStatus | string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, ' '),
    dotColor: 'bg-slate-400',
    textColor: 'text-text-primary',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${config.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
