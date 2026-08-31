import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  Lock,
  User,
} from 'lucide-react';
import { CaseEvidenceResponse, HumanReviewRequest } from '../types/api';
import { submitCaseReview, ApiError } from '../api/client';

interface ReviewActionFormProps {
  evidence: CaseEvidenceResponse;
  onSuccess: () => void;
  onRefreshCase: () => void;
}

export const ReviewActionForm: React.FC<ReviewActionFormProps> = ({
  evidence,
  onSuccess,
  onRefreshCase,
}) => {
  const [actor, setActor] = useState('finance_ops_reviewer');
  const [action, setAction] = useState<'approve' | 'reject' | 'mark_unresolved'>('approve');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setConflictError(false);

    try {
      const payload: HumanReviewRequest = {
        actor,
        action,
        expected_version: evidence.version,
        human_comment: comment.trim() || undefined,
      };

      await submitCaseReview(evidence.case_id, payload);
      onSuccess();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        setConflictError(true);
        setErrorMsg(
          'Another reviewer updated this case first. Your action was not saved to prevent overwriting. Please refresh to inspect the latest version.'
        );
      } else {
        setErrorMsg(err.message || 'Failed to record decision.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border-strong rounded-xl p-6 space-y-5 shadow-panel">
      {/* Header */}
      <div className="border-b border-border-subtle pb-3.5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Human Decision Panel
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-alt border border-border-strong text-slate-300">
            v{evidence.version}
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Permanent financial review state transition with audit trail logging
        </p>
      </div>

      {/* HTTP 409 Collision Alert */}
      {conflictError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg bg-critical-subtle border border-critical-border p-3.5 space-y-2 text-xs text-rose-200"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 flex-1">
              <span className="font-bold text-white">Stale Version Conflict (HTTP 409)</span>
              <p className="text-slate-300 leading-snug">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefreshCase}
            className="w-full mt-2 py-1.5 px-3 rounded-md bg-rose-900/60 hover:bg-rose-900 text-white font-semibold flex items-center justify-center gap-1.5 border border-rose-700/50 transition focus-ring"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Refresh Case Data</span>
          </button>
        </div>
      )}

      {/* Standard Error Message */}
      {errorMsg && !conflictError && (
        <div
          role="alert"
          className="rounded-lg bg-critical-subtle border border-critical-border p-3 text-xs text-rose-300 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reviewer Identifier */}
        <div className="space-y-1.5">
          <label htmlFor="reviewer-actor" className="block text-xs font-semibold text-slate-300">
            Reviewer Identity <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="reviewer-actor"
              type="text"
              required
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              className="w-full bg-surface-alt border border-border-strong rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus-ring font-mono"
              placeholder="e.g. ops_analyst_01"
            />
          </div>
        </div>

        {/* Action Radio Selector */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-slate-300 mb-1.5">
            Review Action <span className="text-rose-400">*</span>
          </legend>
          <div className="space-y-2">
            {/* Option 1: Approve */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                action === 'approve'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                  : 'bg-surface-alt border-border-strong text-slate-300 hover:bg-surface-hover'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="approve"
                checked={action === 'approve'}
                onChange={() => setAction('approve')}
                className="w-4 h-4 text-emerald-600 focus-ring"
              />
              <div className="flex items-center gap-2 flex-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs font-bold">Approve (Resolve Anomaly)</div>
                  <div className="text-[10px] text-slate-400">Accepts transaction variance and marks ledger entry resolved</div>
                </div>
              </div>
            </label>

            {/* Option 2: Reject */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                action === 'reject'
                  ? 'bg-rose-950/40 border-rose-500/50 text-white'
                  : 'bg-surface-alt border-border-strong text-slate-300 hover:bg-surface-hover'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="reject"
                checked={action === 'reject'}
                onChange={() => setAction('reject')}
                className="w-4 h-4 text-rose-600 focus-ring"
              />
              <div className="flex items-center gap-2 flex-1">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs font-bold">Reject (Flag Financial Error)</div>
                  <div className="text-[10px] text-slate-400">Rejects settlement discrepancy and requests merchant debit</div>
                </div>
              </div>
            </label>

            {/* Option 3: Mark Unresolved */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                action === 'mark_unresolved'
                  ? 'bg-amber-950/40 border-amber-500/50 text-white'
                  : 'bg-surface-alt border-border-strong text-slate-300 hover:bg-surface-hover'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="mark_unresolved"
                checked={action === 'mark_unresolved'}
                onChange={() => setAction('mark_unresolved')}
                className="w-4 h-4 text-amber-600 focus-ring"
              />
              <div className="flex items-center gap-2 flex-1">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs font-bold">Mark Unresolved (Escalate)</div>
                  <div className="text-[10px] text-slate-400">Escalate to banking operations desk for external trace</div>
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Reason / Rationale Textarea */}
        <div className="space-y-1.5">
          <label htmlFor="review-comment" className="block text-xs font-semibold text-slate-300">
            Resolution Rationale / Note <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="review-comment"
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why this decision is justified (recorded in audit history)..."
            className="w-full bg-surface-alt border border-border-strong rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus-ring"
          />
        </div>

        {/* Optimistic Locking Notice */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-blue-400" aria-hidden="true" />
            Expected Version: {evidence.version}
          </span>
          <span className="text-slate-500">Atomic CAS</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !actor.trim() || !comment.trim()}
          className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 focus-ring"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>Persisting Decision...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Submit Human Decision</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
