import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  Search,
  BookOpen,
  RefreshCw,
  Info,
} from 'lucide-react';
import { InvestigationResult } from '../types/api';
import { investigateCase } from '../api/client';
import { CitationCard } from './CitationCard';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface RagCopilotPanelProps {
  caseId: string;
  autoRun?: boolean;
}

export const RagCopilotPanel: React.FC<RagCopilotPanelProps> = ({ caseId, autoRun = true }) => {
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runInvestigation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await investigateCase(caseId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'RAG investigation encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoRun && caseId) {
      runInvestigation();
    }
  }, [caseId, autoRun]);

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 space-y-6 shadow-xl backdrop-blur-md">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-xl blur opacity-75 animate-pulse" />
            <div className="relative w-9 h-9 rounded-xl bg-slate-900 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Grounded RAG Investigation Assistant
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full">
                Advisory Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Zero hallucination policy citations &bull; SQL discrepancy reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {result && <ConfidenceIndicator isConfident={result.is_confident} />}
          <button
            onClick={runInvestigation}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Investigating...' : 'Re-investigate'}</span>
          </button>
        </div>
      </div>

      {/* Read-Only Safeguard Banner */}
      <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-3.5 flex items-start gap-3 text-xs text-blue-300/90 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-blue-200 font-semibold">Grounded AI Advisor:</strong> Recommendations are advisory insights synthesized from verified PostgreSQL database rows and regulatory policies. Ledger state changes strictly require an explicit human reviewer sign-off.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-14 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <Bot className="w-5 h-5 text-blue-400 absolute inset-0 m-auto" />
          </div>
          <span className="font-semibold text-slate-300">
            Synthesizing multi-source database facts & querying policy corpus...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-800 p-4 text-xs text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Investigation Error</span>
          </div>
          <p className="text-rose-300/80">{error}</p>
          <button
            onClick={runInvestigation}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-rose-200 rounded-lg text-xs font-semibold mt-1"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Analysis
          </button>
        </div>
      )}

      {/* Structured Result Display */}
      {result && !isLoading && (
        <div className="space-y-5">
          {/* 1. Executive Summary */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4.5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Executive Summary</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {result.summary}
            </p>
          </div>

          {/* 2. Root Cause Analysis */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4.5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Search className="w-4 h-4 text-purple-400" />
              <span>Root Cause Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.root_cause_analysis}
            </p>
          </div>

          {/* 3. Recommended Operational Action */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950/60 border border-indigo-500/30 p-4.5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Recommended Operational Action</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {result.recommended_action}
            </p>
          </div>

          {/* 4. Grounded Policy Citations */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Grounded Policy Citations ({result.citations.length})</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Grounding Floor: &ge; 0.35 Cosine</span>
            </div>

            {result.citations.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-500 italic">
                No policy excerpts passed the cosine grounding floor for this discrepancy.
              </div>
            ) : (
              <div className="space-y-2.5">
                {result.citations.map((cite, idx) => (
                  <CitationCard key={idx} citation={cite} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
