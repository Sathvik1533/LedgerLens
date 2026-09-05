import React from 'react';
import { ExceptionType } from '../types/api';

export const EXCEPTION_CONFIG: Record<string, { label: string; severity: 'critical' | 'high' | 'resolved' }> = {
  missing_settlement: {
    label: 'Missing provider payout',
    severity: 'high',
  },
  missing_bank_credit: {
    label: 'Bank payment not received',
    severity: 'critical',
  },
  amount_mismatch: {
    label: 'Amounts do not match',
    severity: 'critical',
  },
  fee_mismatch: {
    label: 'Provider fee or tax is different',
    severity: 'high',
  },
  duplicate_payment: {
    label: 'Customer may have paid twice',
    severity: 'critical',
  },
  duplicate_bank_credit: {
    label: 'Bank payment may appear twice',
    severity: 'high',
  },
  partial_refund_not_reflected: {
    label: 'Refund is missing from the payout',
    severity: 'high',
  },
  ambiguous_match: {
    label: 'More than one possible match',
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
        <span>Matched automatically</span>
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
