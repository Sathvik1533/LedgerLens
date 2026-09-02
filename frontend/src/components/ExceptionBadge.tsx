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

const EXCEPTION_CONFIG: Record<ExceptionType, { label: string; iconColor: string; icon: React.ElementType }> = {
  missing_settlement: {
    label: 'Missing Settlement',
    iconColor: 'text-advisory-amber',
    icon: Landmark,
  },
  missing_bank_credit: {
    label: 'Missing Bank Credit',
    iconColor: 'text-advisory-amber',
    icon: Building2,
  },
  amount_mismatch: {
    label: 'Amount Mismatch',
    iconColor: 'text-ledger-vermilion',
    icon: Scale,
  },
  fee_mismatch: {
    label: 'Fee Mismatch',
    iconColor: 'text-purple-400',
    icon: Percent,
  },
  duplicate_payment: {
    label: 'Duplicate Payment',
    iconColor: 'text-ledger-vermilion',
    icon: ReceiptText,
  },
  duplicate_bank_credit: {
    label: 'Duplicate Bank Credit',
    iconColor: 'text-pink-400',
    icon: Building2,
  },
  partial_refund_not_reflected: {
    label: 'Partial Refund Unreflected',
    iconColor: 'text-cyan-400',
    icon: RotateCcw,
  },
  ambiguous_match: {
    label: 'Ambiguous Match',
    iconColor: 'text-indigo-400',
    icon: AlertTriangle,
  },
};

export const ExceptionBadge: React.FC<{ type: ExceptionType | string | null; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  if (!type || type === 'clean') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-paper-1 text-matched-green border border-matched-green">
        <CheckCircle2 className="w-2.5 h-2.5 text-matched-green" aria-hidden="true" />
        <span>Clean Match</span>
      </span>
    );
  }

  const config = EXCEPTION_CONFIG[type as ExceptionType] || {
    label: type.replace(/_/g, ' '),
    iconColor: 'text-ink-700',
    icon: AlertTriangle,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'md' ? 'px-2 py-0.5 text-xs gap-1.5' : 'px-1.5 py-0.5 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border border-rule-300 bg-paper-1 text-ink-700 ${sizeClasses}`}
    >
      <Icon className={`${size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'} shrink-0 ${config.iconColor}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
