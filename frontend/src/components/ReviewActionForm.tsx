import { motion, AnimatePresence } from 'framer-motion';
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
import { Tooltip } from './Tooltip';

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
    <div className="bg-surface border border-border rounded-md p-4 space-y-4 shadow-none">
      {/* Header */}
      <div className="border-b border-border pb-3 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">
            Human Decision Panel
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary">
            v{evidence.version}
          </span>
        </div>
        <p className="text-[11px] text-text-secondary font-sans">
          Permanent financial review state transition with audit trail logging
        </p>
      </div>

      {/* HTTP 409 Collision Alert */}
      <AnimatePresence>
      {conflictError && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}

          role="alert"
          aria-live="assertive"
          className="rounded-md bg-critical-surface border border-critical p-3 space-y-2 text-xs text-text-primary shadow-none font-sans"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-critical shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 flex-1">
              <Tooltip content="Your action was not saved because someone updated this case first.">
                <span tabIndex={0} className="font-semibold text-text-secondary focus-ring">Case changed by another reviewer</span>
              </Tooltip>
              <p className="text-text-secondary leading-snug">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefreshCase}
            className="w-full mt-1.5 py-1.5 px-3 rounded bg-critical hover:bg-critical text-text-primary font-semibold flex items-center justify-center gap-1.5 border border-critical transition active:scale-[0.98] text-xs shadow-none"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            <span>Refresh Case Data</span>
          </button>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Standard Error Message */}
      <AnimatePresence>
      {errorMsg && !conflictError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}

          role="alert"
          className="rounded-md bg-critical-surface border border-critical p-2.5 text-xs text-text-primary flex items-start gap-2 font-sans"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-critical shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Reviewer Identifier */}
        <div className="space-y-1">
          <label htmlFor="reviewer-actor" className="block text-xs font-semibold text-text-secondary font-sans">
            Reviewer Identity <span className="text-critical">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="reviewer-actor"
              type="text"
              required
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              className="w-full bg-canvas border border-border rounded pl-8 pr-3 py-1.5 text-xs text-text-secondary placeholder-ink-700/50 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 font-mono transition"
              placeholder="e.g. ops_analyst_01"
            />
          </div>
        </div>

        {/* Action Radio Selector */}
        <fieldset className="space-y-1.5">
          <legend className="text-xs font-semibold text-text-secondary mb-1 font-sans">
            Review Action <span className="text-critical">*</span>
          </legend>
          <div className="space-y-1.5 font-sans">
            {/* Option 1: Approve */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition ${
                action === 'approve'
                  ? 'bg-resolved-surface border-resolved text-text-secondary'
                  : 'bg-canvas border-border text-text-secondary hover:bg-surface'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="approve"
                checked={action === 'approve'}
                onChange={() => setAction('approve')}
                className="w-3.5 h-3.5 text-resolved focus-ring mt-0.5"
              />
              <div className="flex items-start gap-2 flex-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-resolved shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-semibold">Approve (Resolve Anomaly)</div>
                  <div className="text-[10px] text-text-secondary">Accepts transaction variance and marks ledger entry resolved</div>
                </div>
              </div>
            </label>

            {/* Option 2: Reject */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition ${
                action === 'reject'
                  ? 'bg-critical-surface border-critical text-text-secondary'
                  : 'bg-canvas border-border text-text-secondary hover:bg-surface'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="reject"
                checked={action === 'reject'}
                onChange={() => setAction('reject')}
                className="w-3.5 h-3.5 text-critical focus-ring mt-0.5"
              />
              <div className="flex items-start gap-2 flex-1">
                <XCircle className="w-3.5 h-3.5 text-critical shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-semibold">Reject (Flag Financial Error)</div>
                  <div className="text-[10px] text-text-secondary">Rejects settlement discrepancy and requests merchant debit</div>
                </div>
              </div>
            </label>

            {/* Option 3: Mark Unresolved */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition ${
                action === 'mark_unresolved'
                  ? 'bg-high-surface border-high text-text-secondary'
                  : 'bg-canvas border-border text-text-secondary hover:bg-surface'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="mark_unresolved"
                checked={action === 'mark_unresolved'}
                onChange={() => setAction('mark_unresolved')}
                className="w-3.5 h-3.5 text-high focus-ring mt-0.5"
              />
              <div className="flex items-start gap-2 flex-1">
                <HelpCircle className="w-3.5 h-3.5 text-high shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-semibold">Mark Unresolved (Escalate)</div>
                  <div className="text-[10px] text-text-secondary">Escalate to banking operations desk for external trace</div>
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Reason / Rationale Textarea */}
        <div className="space-y-1">
          <label htmlFor="review-comment" className="block text-xs font-semibold text-text-secondary font-sans">
            Resolution Rationale / Note <span className="text-critical">*</span>
          </label>
          <textarea
            id="review-comment"
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why this decision is justified (recorded in audit history)..."
            className="w-full bg-canvas border border-border rounded p-2.5 text-xs text-text-secondary placeholder-ink-700/50 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 font-sans transition"
          />
        </div>

        {/* Optimistic Locking Notice */}
        <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono">
          <Tooltip content="The version used to prevent overwriting another reviewer's update.">
          <span tabIndex={0} className="flex items-center gap-1 focus-ring">
            <Lock className="w-3 h-3 text-accent" aria-hidden="true" />
            Case version: {evidence.version}
          </span>
          </Tooltip>
          <Tooltip content="Prevents one reviewer from overwriting a newer decision.">
          <span tabIndex={0} className="text-text-secondary focus-ring">Safe update protection</span>
          </Tooltip>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !actor.trim() || !comment.trim()}
          className="w-full h-9 rounded bg-surface hover:bg-canvas active:bg-surface text-text-primary text-xs font-semibold tracking-wide transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-none active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-text-secondary" aria-hidden="true" />
              <span>Persisting Decision...</span>
            </>
          ) : (
            <>
              <Send className="w-3 h-3 text-text-secondary" aria-hidden="true" />
              <span>Submit Human Decision</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
