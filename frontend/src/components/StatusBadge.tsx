import React from 'react';
import { DecisionStatus } from '../types/api';

const STATUS_CONFIG: Record<DecisionStatus, { label: string; bg: string; text: string; dot: string }> = {
  needs_review: {
    label: 'Needs Review',
    bg: 'bg-amber-950/40 border border-amber-600/40',
    text: 'text-amber-300',
    dot: 'bg-amber-400 animate-pulse',
  },
  auto_reconciled: {
    label: 'Auto Reconciled',
    bg: 'bg-emerald-950/40 border border-emerald-600/40',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-950/40 border border-rose-600/40',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
  },
  unresolved: {
    label: 'Unresolved',
    bg: 'bg-slate-800 border border-slate-700',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  },
};

export const StatusBadge: React.FC<{ status: DecisionStatus | string }> = ({ status }) => {
  const config = STATUS_CONFIG[status as DecisionStatus] || {
    label: status,
    bg: 'bg-slate-800 border border-slate-700',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
