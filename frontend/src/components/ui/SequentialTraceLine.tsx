import React from 'react';

interface SequentialTraceLineProps {
  isLast?: boolean;
  active?: boolean;
}

export const SequentialTraceLine: React.FC<SequentialTraceLineProps> = ({
  isLast = false,
  active = false,
}) => {
  return (
    <div className="flex flex-col items-center mr-4 sm:mr-6 shrink-0" aria-hidden="true">
      {/* Node indicator */}
      <div
        className={`w-3 h-3 rounded-full border transition-colors ${
          active
            ? 'border-ledger-green bg-ledger-green'
            : 'border-rule-strong bg-surface'
        }`}
      />
      {/* Connecting vertical hairline */}
      {!isLast && (
        <div
          className={`w-[1px] flex-1 my-1 transition-colors ${
            active ? 'bg-ledger-green/60' : 'bg-rule'
          }`}
        />
      )}
    </div>
  );
};
