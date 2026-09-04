import React, { useEffect, useState } from 'react';

interface RollingNumberTickerProps {
  value: number;
  currency?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export const RollingNumberTicker: React.FC<RollingNumberTickerProps> = ({
  value,
  currency,
  decimals = 0,
  duration = 800,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || duration <= 0) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const delta = value - startValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad: f(t) = t * (2 - t)
      const ease = progress * (2 - progress);
      const current = startValue + delta * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formattedNumber = displayValue.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`font-mono tabular-nums tracking-tight ${className}`} data-tabular="true">
      {currency ? `${currency}${formattedNumber}` : formattedNumber}
    </span>
  );
};
