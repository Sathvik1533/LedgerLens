import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  isConfident: boolean;
  score?: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ isConfident, score }) => {
  if (isConfident) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-resolved-surface border border-resolved text-resolved shadow-none">
        <CheckCircle2 className="w-3.5 h-3.5 text-resolved shrink-0" />
        <span>High Confidence &bull; Grounded</span>
        {score !== undefined && <span className="font-mono text-[10px] text-resolved/80">({(score * 100).toFixed(0)}%)</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-high-surface border border-high text-high shadow-none">
      <AlertTriangle className="w-3.5 h-3.5 text-high shrink-0" />
      <span>Partial Evidence &bull; Review Required</span>
      {score !== undefined && <span className="font-mono text-[10px] text-high/80">({(score * 100).toFixed(0)}%)</span>}
    </span>
  );
};
