import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { Citation } from '../types/api';

export const CitationCard: React.FC<{ citation: Citation; index?: number }> = ({ citation, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-surface border border-border-strong overflow-hidden transition">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-surface-hover transition focus-ring"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono text-blue-300 truncate">
            {index !== undefined ? `#${index + 1} ` : ''}{citation.source_file}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0 text-[11px]">
          <span>{isExpanded ? 'Hide' : 'View Quote'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-border-subtle bg-surface-alt space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-300 leading-relaxed">
            <Quote className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="italic text-slate-200">{citation.quote}</p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Source document: {citation.source_file}
          </div>
        </div>
      )}
    </div>
  );
};
