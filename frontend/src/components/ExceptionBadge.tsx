import React from 'react';
import { ExceptionType } from '../types/api';

export const EXCEPTION_CONFIG: Record<string, { label: string; severity: 'critical' | 'high' | 'resolved' }> = {
  missing_settlement: {
    label: 'Missing settlement',
    severity: 'high',
  },
  missing_bank_credit: {
    label: 'Missing bank credit',
    severity: 'critical',
  },
  amount_mismatch: {
    label: 'Amount mismatch',
    severity: 'critical',
  },
  fee_mismatch: {
    label: 'Fee / tax mismatch',
    severity: 'high',
  },
  duplicate_payment: {
    label: 'Duplicate payment',
    severity: 'critical',
  },
  duplicate_bank_credit: {
    label: 'Duplicate bank credit',
    severity: 'high',
  },
  partial_refund_not_reflected: {
    label: 'Partial refund unadjusted',
    severity: 'high',
  },
  ambiguous_match: {
    label: 'Ambiguous match',
    severity: 'high',
  },
};

export const ExceptionBadge: React.FC<{ type: ExceptionType | string | null; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  if (!type || type === 'clean') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[11px] font-mono font-medium bg-ledger-green/10 text-ledger-green border border-ledger-green/30">
        <span>✓</span>
        <span>Reconciled</span>
      </span>
    );
  }

  const config = EXCEPTION_CONFIG[type] || {
    label: type.replace(/_/g, ' '),
    severity: 'high' as const,
  };

  const isCritical = config.severity === 'critical';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium rounded-xs border px-2 py-0.5 ${
        isCritical
          ? 'bg-critical/10 text-critical border-critical/30'
          : 'bg-brass/10 text-brass border-brass/30'
      } ${size === 'md' ? 'text-xs px-2.5 py-1' : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-critical' : 'bg-brass'}`} />
      <span>{config.label}</span>
    </span>
  );
};
