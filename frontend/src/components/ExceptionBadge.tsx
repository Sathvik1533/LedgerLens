import React from 'react';
import {
  FileQuestion,
  Clock,
  Scale,
  Percent,
  Copy,
  Layers,
  Undo2,
  Split,
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
    bg: 'bg-amber-950/50',
    text: 'text-amber-300',
    border: 'border-amber-600/40',
    icon: FileQuestion,
  },
  missing_bank_credit: {
    label: 'Missing Bank Credit',
    bg: 'bg-orange-950/50',
    text: 'text-orange-300',
    border: 'border-orange-600/40',
    icon: Clock,
  },
  amount_mismatch: {
    label: 'Amount Discrepancy',
    bg: 'bg-rose-950/50',
    text: 'text-rose-300',
    border: 'border-rose-600/40',
    icon: Scale,
  },
  fee_mismatch: {
    label: 'Fee / GST Mismatch',
    bg: 'bg-purple-950/50',
    text: 'text-purple-300',
    border: 'border-purple-600/40',
    icon: Percent,
  },
  duplicate_payment: {
    label: 'Duplicate Payment',
    bg: 'bg-red-950/50',
    text: 'text-red-300',
    border: 'border-red-600/40',
    icon: Copy,
  },
  duplicate_bank_credit: {
    label: 'Double Bank Credit',
    bg: 'bg-pink-950/50',
    text: 'text-pink-300',
    border: 'border-pink-600/40',
    icon: Layers,
  },
  partial_refund_not_reflected: {
    label: 'Refund Unreflected',
    bg: 'bg-blue-950/50',
    text: 'text-blue-300',
    border: 'border-blue-600/40',
    icon: Undo2,
  },
  ambiguous_match: {
    label: 'Ambiguous Candidate',
    bg: 'bg-indigo-950/50',
    text: 'text-indigo-300',
    border: 'border-indigo-600/40',
    icon: Split,
  },
};

export const ExceptionBadge: React.FC<{ type: ExceptionType | string | null; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  if (!type) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-600/40">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        Clean Match
      </span>
    );
  }

  const config = EXCEPTION_CONFIG[type as ExceptionType] || {
    label: type.replace(/_/g, ' '),
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: FileQuestion,
  };

  const Icon = config.icon;

  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs gap-1.5' : 'px-2.5 py-0.5 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border backdrop-blur-sm shadow-sm transition-transform duration-150 ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className={size === 'md' ? 'w-3.5 h-3.5 shrink-0' : 'w-3 h-3 shrink-0'} />
      <span className="font-semibold">{config.label}</span>
    </span>
  );
};
