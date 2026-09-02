import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { Citation } from '../types/api';

export const CitationCard: React.FC<{ citation: Citation; index?: number }> = ({ citation, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded bg-paper-0/80 border border-rule-300 overflow-hidden transition">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between gap-3 text-left hover:bg-paper-1 transition focus-ring"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-source-blue shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono text-blue-300 truncate">
            {index !== undefined ? `#${index + 1} ` : ''}{citation.source_file}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-ink-700 shrink-0 text-[10px] font-sans">
          <span>{isExpanded ? 'Hide' : 'View Quote'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3 text-ink-700" aria-hidden="true" /> : <ChevronDown className="w-3 h-3 text-ink-700" aria-hidden="true" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-2.5 border-t border-rule-300 bg-paper-1 space-y-1.5 text-xs font-mono">
          <div className="flex items-start gap-2 text-ink-700 leading-relaxed">
            <Quote className="w-3 h-3 text-source-blue shrink-0 mt-0.5" aria-hidden="true" />
            <p className="italic text-ink-700 text-[11px] font-sans">{citation.quote}</p>
          </div>
          <div className="text-[10px] text-ink-700 font-mono">
            Source document: {citation.source_file}
          </div>
        </div>
      )}
    </div>
  );
};
