import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  isConfident: boolean;
  score?: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ isConfident, score }) => {
  if (isConfident) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-matched-green/10 border border-matched-green text-matched-green shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-matched-green shrink-0" />
        <span>High Confidence &bull; Grounded</span>
        {score !== undefined && <span className="font-mono text-[10px] text-matched-green/80">({(score * 100).toFixed(0)}%)</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-advisory-amber/10 border border-advisory-amber text-advisory-amber shadow-sm">
      <AlertTriangle className="w-3.5 h-3.5 text-advisory-amber shrink-0" />
      <span>Partial Evidence &bull; Review Required</span>
      {score !== undefined && <span className="font-mono text-[10px] text-advisory-amber/80">({(score * 100).toFixed(0)}%)</span>}
    </span>
  );
};
