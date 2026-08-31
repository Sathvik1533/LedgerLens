import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { DecisionStatus } from '../types/api';

interface StatusMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
}

const STATUS_CONFIG: Record<string, StatusMeta> = {
  needs_review: {
    label: 'Needs Review',
    bg: 'bg-warning-subtle',
    text: 'text-amber-300',
    border: 'border-warning-border',
    icon: AlertTriangle,
  },
  auto_reconciled: {
    label: 'Auto Reconciled',
    bg: 'bg-resolved-subtle',
    text: 'text-emerald-300',
    border: 'border-resolved-border',
    icon: CheckCircle2,
  },
  approved: {
    label: 'Human Approved',
    bg: 'bg-resolved-subtle',
    text: 'text-emerald-300',
    border: 'border-resolved-border',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Human Rejected',
    bg: 'bg-critical-subtle',
    text: 'text-rose-300',
    border: 'border-critical-border',
    icon: XCircle,
  },
  unresolved: {
    label: 'Unresolved',
    bg: 'bg-surface-alt',
    text: 'text-slate-300',
    border: 'border-border-strong',
    icon: HelpCircle,
  },
};

export const StatusBadge: React.FC<{ status: DecisionStatus | string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-surface-alt',
    text: 'text-slate-300',
    border: 'border-border-strong',
    icon: HelpCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
