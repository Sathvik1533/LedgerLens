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
    return <span className="text-slate-500 font-mono font-tabular">-</span>;
  }

  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) {
    return <span className={`font-mono font-tabular ${className}`}>{String(amount)}</span>;
  }

  const isNegative = num < 0;
  const absFormatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));

  const symbol = currency === 'INR' ? '₹' : currency;

  let colorClass = 'text-white';
  if (isDiscrepancy) {
    if (Math.abs(num) > 0.001) {
      colorClass = 'text-rose-400 font-bold';
    } else {
      colorClass = 'text-emerald-400 font-bold';
    }
  }

  return (
    <span className={`font-mono font-tabular ${colorClass} ${className}`}>
      {isNegative ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`}
    </span>
  );
};
