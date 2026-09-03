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
import { Tooltip } from './Tooltip';

export const EXCEPTION_CONFIG: Record<string, { label: string; explanation: string; iconColor: string; icon: React.ElementType }> = {
  missing_settlement: {
    label: 'Settlement record is missing',
    explanation: 'A payment exists, but no corresponding settlement record was received.',
    iconColor: 'text-high',
    icon: Landmark,
  },
  missing_bank_credit: {
    label: 'Bank credit is missing',
    explanation: 'A settlement exists, but no matching bank credit was found.',
    iconColor: 'text-high',
    icon: Building2,
  },
  amount_mismatch: {
    label: 'Amount does not match',
    explanation: 'The amount recorded by one source differs from the expected amount.',
    iconColor: 'text-critical',
    icon: Scale,
  },
  fee_mismatch: {
    label: 'Fee differs from policy',
    explanation: 'The recorded fee does not match the configured fee rule.',
    iconColor: 'text-purple-400',
    icon: Percent,
  },
  duplicate_payment: {
    label: 'Possible duplicate payment',
    explanation: 'More than one payment record appears to reference the same order.',
    iconColor: 'text-critical',
    icon: ReceiptText,
  },
  duplicate_bank_credit: {
    label: 'Duplicate Bank Credit',
    explanation: 'More than one bank credit appears to match this settlement.',
    iconColor: 'text-pink-400',
    icon: Building2,
  },
  partial_refund_not_reflected: {
    label: 'Refund is incomplete',
    explanation: 'The refund amount does not fully match the expected reversal.',
    iconColor: 'text-cyan-400',
    icon: RotateCcw,
  },
  unexpected_refund: {
    label: 'Unexpected refund found',
    explanation: 'A refund was found without the expected payment relationship.',
    iconColor: 'text-indigo-400',
    icon: AlertTriangle,
  },
  orphan_settlement: {
    label: 'Settlement has no matching payment',
    explanation: 'A settlement record could not be linked to a captured payment.',
    iconColor: 'text-indigo-400',
    icon: AlertTriangle,
  },
  ambiguous_match: {
    label: 'Ambiguous Match',
    explanation: 'Multiple records match and manual resolution is required.',
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
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-surface text-resolved border border-resolved">
        <CheckCircle2 className="w-2.5 h-2.5 text-resolved" aria-hidden="true" />
        <span>Clean Match</span>
      </span>
    );
  }

  const config = EXCEPTION_CONFIG[type] || {
    label: type.replace(/_/g, ' '),
    explanation: 'An unrecognized exception occurred.',
    iconColor: 'text-text-secondary',
    icon: AlertTriangle,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'md' ? 'px-2 py-0.5 text-xs gap-1.5' : 'px-1.5 py-0.5 text-[10px] gap-1';

  return (
    <Tooltip content={
      <div className="space-y-1">
        <div className="font-mono font-semibold text-[10px] uppercase text-ink-300">{type}</div>
        <div>{config.explanation}</div>
      </div>
    }>
      <span
        tabIndex={0}
        className={`inline-flex items-center font-sans font-medium rounded border border-border bg-surface text-text-secondary hover:border-ink-700 focus-ring ${sizeClasses}`}
        aria-label={`Exception type: ${config.label}`}
      >
        <Icon className={`${size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'} shrink-0 ${config.iconColor}`} aria-hidden="true" />
        <span>{config.label}</span>
      </span>
    </Tooltip>
  );
};
