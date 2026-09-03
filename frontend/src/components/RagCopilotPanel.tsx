import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileText,
  ShieldCheck,
  
} from 'lucide-react';
import { InvestigationResult } from '../types/api';
import { investigateCase } from '../api/client';
import { Tooltip } from './Tooltip';
import { CitationCard } from './CitationCard';

interface RagCopilotPanelProps {
  caseId: string;
  autoRun?: boolean;
}

export const RagCopilotPanel: React.FC<RagCopilotPanelProps> = ({ caseId, autoRun = true }) => {
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const runInvestigation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await investigateCase(caseId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Policy assistant failed to load guidance.');
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
    <div className="rounded-xl bg-surface border border-advisory-border overflow-hidden shadow-panel">
      {/* Accordion Trigger Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 bg-surface-alt hover:bg-surface-hover flex items-center justify-between gap-3 text-left transition focus-ring"
        aria-expanded={isExpanded}
        aria-label="Toggle policy explanation drawer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-advisory-subtle border border-advisory-border flex items-center justify-center text-advisory-light">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Policy-based explanation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border-strong text-ink-700">
                Read-Only
              </span>
            </div>
            <p className="text-[11px] text-ink-700">
              Grounded AI guidance retrieved from local financial reconciliation operating policies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <Tooltip content="Whether the advisory explanation is sufficiently supported by retrieved policy evidence.">
            <span
              tabIndex={0}
              className={`focus-ring hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                result.is_confident
                  ? 'bg-resolved-subtle text-matched-green border-resolved-border'
                  : 'bg-warning-subtle text-advisory-amber border-warning-border'
              }`}
            >
              {result.is_confident ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-matched-green" aria-hidden="true" />
                  <span>Evidence grounding</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-advisory-amber" aria-hidden="true" />
                  <span>Evidence grounding (Low)</span>
                </>
              )}
            </span>
            </Tooltip>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-ink-700" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-700" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Accordion Body */}
      <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
        <div className="p-5 space-y-4 text-xs border-t border-border-subtle bg-surface">
          {isLoading ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-ink-700">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" aria-hidden="true" />
              <span>Retrieving policy guidance and inspecting vector store...</span>
            </div>
          ) : error ? (
            <div className="p-3.5 rounded-lg bg-critical-subtle border border-critical-border text-ledger-vermilion flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
              <button
                onClick={runInvestigation}
                className="px-2.5 py-1 rounded bg-rose-900 text-white font-semibold hover:bg-rose-800"
              >
                Retry
              </button>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Summary & Root Cause */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
                  Root Cause Analysis
                </h4>
                <p className="text-ink-900 leading-relaxed bg-surface-alt border border-border-subtle rounded-lg p-3">
                  {result.root_cause_analysis || result.summary}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-matched-green">
                  Recommended Next Action
                </h4>
                <p className="text-ink-900 leading-relaxed bg-surface-alt border border-border-subtle rounded-lg p-3">
                  {result.recommended_action}
                </p>
              </div>

              {/* Policy Citations */}
              {result.citations && result.citations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-ink-700" aria-hidden="true" />
                    <span>Policy Citations ({result.citations.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {result.citations.map((c, i) => (
                      <CitationCard key={i} citation={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Read-Only Disclaimer */}
              <div className="pt-2 border-t border-border-subtle text-[11px] text-ink-700 italic">
                Policy guidance is read-only. You remain in control.
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-ink-700">
              <button
                onClick={runInvestigation}
                className="px-3.5 py-1.5 rounded-lg bg-ink-900 hover:bg-ink-700 text-white font-semibold focus-ring"
              >
                Inspect Policy Guidance
              </button>
            </div>
          )}
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
