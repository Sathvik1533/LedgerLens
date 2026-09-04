import React, { useState, useId } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const sideStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <span
        aria-describedby={isVisible ? tooltipId : undefined}
        tabIndex={0}
        className="inline-flex items-center cursor-help border-b border-dotted border-ink-secondary/70 hover:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
      >
        {children}
      </span>
      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-[11px] font-sans text-[#FCFBF8] bg-[#111315] border border-white/20 rounded-xs shadow-xl pointer-events-none whitespace-normal max-w-xs text-left leading-snug animate-in fade-in zoom-in-95 duration-100 ${sideStyles}`}
        >
          {content}
        </span>
      )}
    </span>
  );
};
