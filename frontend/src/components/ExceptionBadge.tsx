import React from 'react';
import {
  Landmark,
  Building2,
  Scale,
  Percent,
  ReceiptText,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { ExceptionType } from '../types/api';

interface ExceptionMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
}

const EXCEPTION_CONFIG: Record<ExceptionType, ExceptionMeta> = {
  missing_settlement: {
    label: 'Missing Settlement',
    bg: 'bg-warning-subtle',
    text: 'text-warning-light',
    border: 'border-warning-border',
    icon: Landmark,
  },
  missing_bank_credit: {
    label: 'Missing Bank Credit',
    bg: 'bg-warning-subtle',
    text: 'text-amber-300',
    border: 'border-warning-border',
    icon: Building2,
  },
  amount_mismatch: {
    label: 'Amount Mismatch',
    bg: 'bg-critical-subtle',
    text: 'text-rose-300',
    border: 'border-critical-border',
    icon: Scale,
  },
  fee_mismatch: {
    label: 'Fee Mismatch',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    icon: Percent,
  },
  duplicate_payment: {
    label: 'Duplicate Payment',
    bg: 'bg-critical-subtle',
    text: 'text-red-300',
    border: 'border-critical-border',
    icon: ReceiptText,
  },
  duplicate_bank_credit: {
    label: 'Duplicate Bank Credit',
    bg: 'bg-pink-950/40',
    text: 'text-pink-300',
    border: 'border-pink-500/30',
    icon: Building2,
  },
  partial_refund_not_reflected: {
    label: 'Partial Refund Unreflected',
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-300',
    border: 'border-cyan-500/30',
    icon: RotateCcw,
  },
  ambiguous_match: {
    label: 'Ambiguous Match',
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
    icon: AlertTriangle,
  },
};

export const ExceptionBadge: React.FC<{ type: ExceptionType | string | null; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  if (!type || type === 'clean') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-resolved-subtle text-emerald-300 border border-resolved-border font-mono">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
        Clean Match
      </span>
    );
  }

  const config = EXCEPTION_CONFIG[type as ExceptionType] || {
    label: type.replace(/_/g, ' '),
    bg: 'bg-surface-alt',
    text: 'text-slate-300',
    border: 'border-border-strong',
    icon: AlertTriangle,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-2 py-0.5 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border font-mono ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className={size === 'md' ? 'w-3.5 h-3.5 shrink-0' : 'w-3 h-3 shrink-0'} aria-hidden="true" />
      <span className="font-semibold">{config.label}</span>
    </span>
  );
};
