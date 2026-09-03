import React from 'react';
import { Tooltip } from './Tooltip';

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
    return <span className="text-text-secondary font-mono font-tabular">-</span>;
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

  let colorClass = 'text-text-primary';
  if (isDiscrepancy) {
    if (Math.abs(num) > 0.001) {
      colorClass = 'text-critical font-bold';
    } else {
      colorClass = 'text-resolved font-bold';
    }
  }

  const content = (
    <span tabIndex={0} className={`focus-ring inline-block font-mono font-tabular ${colorClass} ${className}`}>
      {isNegative ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`}
    </span>
  );

  if (isDiscrepancy) {
    const tooltipText = Math.abs(num) > 0.001 
      ? 'The exact mathematical difference between expected and received amounts.'
      : 'Values match exactly with zero discrepancy.';
    
    return (
      <Tooltip content={tooltipText}>
        {content}
      </Tooltip>
    );
  }

  return content;
};
