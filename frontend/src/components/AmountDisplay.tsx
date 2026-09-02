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
    return <span className="text-ink-700 font-mono font-tabular">-</span>;
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

  let colorClass = 'text-ink-900';
  if (isDiscrepancy) {
    if (Math.abs(num) > 0.001) {
      colorClass = 'text-ledger-vermilion font-bold';
    } else {
      colorClass = 'text-matched-green font-bold';
    }
  }

  return (
    <span className={`font-mono font-tabular ${colorClass} ${className}`}>
      {isNegative ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`}
    </span>
  );
};
