import React from 'react';
import { ExceptionType } from '../types/api';

const EXCEPTION_CONFIG: Record<ExceptionType, { label: string; bg: string; text: string; border: string }> = {
  missing_settlement: {
    label: 'Missing Settlement',
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
  },
  missing_bank_credit: {
    label: 'Missing Bank Credit',
    bg: 'bg-orange-950/60',
    text: 'text-orange-300',
    border: 'border-orange-700/50',
  },
  amount_mismatch: {
    label: 'Amount Mismatch',
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-700/50',
  },
  fee_mismatch: {
    label: 'Fee Mismatch',
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-700/50',
  },
  duplicate_payment: {
    label: 'Duplicate Payment',
    bg: 'bg-red-950/60',
    text: 'text-red-300',
    border: 'border-red-700/50',
  },
  duplicate_bank_credit: {
    label: 'Duplicate Bank Credit',
    bg: 'bg-pink-950/60',
    text: 'text-pink-300',
    border: 'border-pink-700/50',
  },
  partial_refund_not_reflected: {
    label: 'Partial Refund Discrepancy',
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-700/50',
  },
  ambiguous_match: {
    label: 'Ambiguous Match',
    bg: 'bg-indigo-950/60',
    text: 'text-indigo-300',
    border: 'border-indigo-700/50',
  },
};

export const ExceptionBadge: React.FC<{ type: ExceptionType | string | null }> = ({ type }) => {
  if (!type) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
        Clean Match
      </span>
    );
  }

  const config = EXCEPTION_CONFIG[type as ExceptionType] || {
    label: type.replace(/_/g, ' '),
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};
