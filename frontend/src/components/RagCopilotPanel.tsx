import React, { useState, useEffect } from 'react';
import { InvestigationResult } from '../types/api';
import { investigateCase } from '../api/client';

interface PolicyNoteProps {
  caseId: string;
  autoRun?: boolean;
}

export const RagCopilotPanel: React.FC<PolicyNoteProps> = ({ caseId, autoRun = true }) => {
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolicyGuidance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await investigateCase(caseId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Approved policy guidance currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoRun && caseId) {
      loadPolicyGuidance();
    }
  }, [caseId, autoRun]);

  return (
    <div className="border border-rule bg-surface p-5 rounded-xs space-y-4 font-sans margin-note">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-rule/70 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brass" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-brass font-semibold">
              Policy Note
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-canvas border border-rule text-ink-secondary rounded-xs">
              Approved operating rule
            </span>
          </div>
          <span className="font-editorial text-lg font-medium text-ink block">
            What the approved rule says
          </span>
        </div>

        <button
          onClick={loadPolicyGuidance}
          disabled={isLoading}
          className="text-[11px] font-mono text-ink-secondary hover:text-ink underline disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Check again'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-4 text-xs font-mono text-ink-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brass animate-ping" />
          <span>Checking approved rules...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-xs text-critical font-mono py-2">
          {error}
        </div>
      )}

      {/* Result body */}
      {result && !isLoading && (
        <div className="space-y-3.5 text-xs text-ink leading-relaxed">
          {/* Summary / Root Cause */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-ink-secondary block">
              What the rule explains
            </span>
            <p className="text-ink font-normal">{result.summary}</p>
          </div>

          {result.recommended_action && (
            <div className="space-y-1 pt-2 border-t border-rule/50">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Recommended next step
              </span>
              <p className="text-ink font-medium">{result.recommended_action}</p>
            </div>
          )}

          {/* Citations from Policy Library */}
          {result.citations && result.citations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-rule/50">
              <span className="text-[11px] font-mono uppercase text-ink-secondary block">
                Approved rule passages ({result.citations.length})
              </span>
              <div className="space-y-2">
                {result.citations.map((cite, idx) => (
                  <div key={idx} data-testid="policy-citation" className="p-2.5 bg-canvas/60 border border-rule rounded-xs space-y-1 text-[11px]">
                    <div className="flex justify-between font-mono text-ink-secondary">
                      <span className="font-semibold text-ink">{cite.source_file}</span>
                      <span>Approved rule</span>
                    </div>
                    <p className="italic text-ink-secondary font-serif leading-normal">&ldquo;{cite.quote}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Disclosure for Technical Retrieval Metadata */}
          <details className="pt-2 text-[11px] font-mono text-ink-muted border-t border-rule/40">
            <summary className="cursor-pointer hover:text-ink">
              How this rule was found
            </summary>
            <div className="mt-2 p-2 bg-canvas/40 border border-rule/60 rounded-xs space-y-1">
              <div>Rule match confidence: {result.is_confident ? 'Matched approved library' : 'Low confidence match'}</div>
              <div>Rule library: Read-only local operating policies</div>
              <div>Reviewer guidance: A person makes the final decision</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
