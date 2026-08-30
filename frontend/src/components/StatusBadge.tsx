import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { DecisionStatus } from '../types/api';

interface StatusMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
  dot: string;
}

const STATUS_CONFIG: Record<DecisionStatus, StatusMeta> = {
  needs_review: {
    label: 'Needs Review',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    icon: AlertTriangle,
    dot: 'bg-amber-400 animate-pulse',
  },
  auto_reconciled: {
    label: 'Auto Reconciled',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    icon: CheckCircle2,
    dot: 'bg-emerald-400',
  },
  rejected: {
    label: 'Human Rejected',
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
    icon: XCircle,
    dot: 'bg-rose-400',
  },
  unresolved: {
    label: 'Unresolved',
    bg: 'bg-slate-800/80',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: HelpCircle,
    dot: 'bg-slate-400',
  },
};

export const StatusBadge: React.FC<{ status: DecisionStatus | string }> = ({ status }) => {
  const config = STATUS_CONFIG[status as DecisionStatus] || {
    label: status,
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: HelpCircle,
    dot: 'bg-slate-400',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
