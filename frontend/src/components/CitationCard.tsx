import React, { useState } from 'react';
import { BookOpen, FileText, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { Citation } from '../types/api';

export const CitationCard: React.FC<{ citation: Citation; index: number }> = ({ citation, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-900/50 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="text-xs font-mono font-semibold text-blue-300">
              Citation #{index + 1}: {citation.source_file}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            {isExpanded ? 'Hide Policy Quote' : 'View Quote'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-2 text-xs bg-slate-900/40">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-slate-300 font-sans leading-relaxed">
            <Quote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="italic text-slate-200">{citation.quote}</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-500" />
              Corpus: policy/{citation.source_file}
            </span>
            <span className="text-emerald-400/90 font-semibold">Grounded &bull; Cosine Floor Pass</span>
          </div>
        </div>
      )}
    </div>
  );
};
