import React from 'react';

interface AmountDisplayProps {
  amount: string | number | null | undefined;
  currency?: string;
  className?: string;
  isDiscrepancy?: boolean;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  currency = 'INR',
  className = '',
  isDiscrepancy = false,
}) => {
  if (amount === null || amount === undefined || amount === '') {
    return <span className="text-slate-500 font-mono">-</span>;
  }

  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  const formatted = isNaN(num)
    ? String(amount)
    : new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);

  const symbol = currency === 'INR' ? '₹' : currency;

  return (
    <span
      className={`font-mono font-medium ${
        isDiscrepancy && num > 0
          ? 'text-rose-400 font-bold'
          : isDiscrepancy && num === 0
          ? 'text-emerald-400'
          : 'text-slate-200'
      } ${className}`}
    >
      {symbol} {formatted}
    </span>
  );
};
