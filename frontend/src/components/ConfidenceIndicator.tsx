import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  isConfident: boolean;
  score?: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ isConfident, score }) => {
  if (isConfident) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>High Confidence &bull; Grounded</span>
        {score !== undefined && <span className="font-mono text-[10px] text-emerald-400/80">({(score * 100).toFixed(0)}%)</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-300 shadow-sm">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Partial Evidence &bull; Review Required</span>
      {score !== undefined && <span className="font-mono text-[10px] text-amber-400/80">({(score * 100).toFixed(0)}%)</span>}
    </span>
  );
};
