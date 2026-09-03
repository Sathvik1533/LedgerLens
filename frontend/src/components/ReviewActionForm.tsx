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
    <div className="bg-paper-1 border border-rule-300 rounded-md p-4 space-y-4 shadow-none">
      {/* Header */}
      <div className="border-b border-rule-300 pb-3 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wider font-sans">
            Human Decision Panel
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper-1 border border-rule-300 text-ink-700">
            v{evidence.version}
          </span>
        </div>
        <p className="text-[11px] text-ink-700 font-sans">
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
          className="rounded-md bg-ledger-vermilion/10 border border-ledger-vermilion p-3 space-y-2 text-xs text-ink-900 shadow-none font-sans"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-ledger-vermilion shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 flex-1">
              <Tooltip content="Your action was not saved because someone updated this case first.">
                <span tabIndex={0} className="font-semibold text-ink-700 focus-ring">Case changed by another reviewer</span>
              </Tooltip>
              <p className="text-ink-700 leading-snug">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefreshCase}
            className="w-full mt-1.5 py-1.5 px-3 rounded bg-ledger-vermilion hover:bg-ledger-vermilion/80 text-ink-900 font-semibold flex items-center justify-center gap-1.5 border border-ledger-vermilion transition active:scale-[0.98] text-xs shadow-none"
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
          className="rounded-md bg-ledger-vermilion/10 border border-ledger-vermilion p-2.5 text-xs text-ink-900 flex items-start gap-2 font-sans"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-ledger-vermilion shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Reviewer Identifier */}
        <div className="space-y-1">
          <label htmlFor="reviewer-actor" className="block text-xs font-semibold text-ink-700 font-sans">
            Reviewer Identity <span className="text-ledger-vermilion">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-ink-700 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="reviewer-actor"
              type="text"
              required
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              className="w-full bg-paper-0 border border-rule-300 rounded pl-8 pr-3 py-1.5 text-xs text-ink-700 placeholder-ink-700/50 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 font-mono transition"
              placeholder="e.g. ops_analyst_01"
            />
          </div>
        </div>

        {/* Action Radio Selector */}
        <fieldset className="space-y-1.5">
          <legend className="text-xs font-semibold text-ink-700 mb-1 font-sans">
            Review Action <span className="text-ledger-vermilion">*</span>
          </legend>
          <div className="space-y-1.5 font-sans">
            {/* Option 1: Approve */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition ${
                action === 'approve'
                  ? 'bg-matched-green/10 border-matched-green text-ink-700'
                  : 'bg-paper-0 border-rule-300 text-ink-700 hover:bg-paper-1'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="approve"
                checked={action === 'approve'}
                onChange={() => setAction('approve')}
                className="w-3.5 h-3.5 text-matched-green focus-ring mt-0.5"
              />
              <div className="flex items-start gap-2 flex-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-matched-green shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-semibold">Approve (Resolve Anomaly)</div>
                  <div className="text-[10px] text-ink-700">Accepts transaction variance and marks ledger entry resolved</div>
                </div>
              </div>
            </label>

            {/* Option 2: Reject */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition ${
                action === 'reject'
                  ? 'bg-ledger-vermilion/10 border-ledger-vermilion text-ink-700'
                  : 'bg-paper-0 border-rule-300 text-ink-700 hover:bg-paper-1'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="reject"
                checked={action === 'reject'}
                onChange={() => setAction('reject')}
                className="w-3.5 h-3.5 text-ledger-vermilion focus-ring mt-0.5"
              />
              <div className="flex items-start gap-2 flex-1">
                <XCircle className="w-3.5 h-3.5 text-ledger-vermilion shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-semibold">Reject (Flag Financial Error)</div>
                  <div className="text-[10px] text-ink-700">Rejects settlement discrepancy and requests merchant debit</div>
                </div>
              </div>
            </label>

            {/* Option 3: Mark Unresolved */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition ${
                action === 'mark_unresolved'
                  ? 'bg-advisory-amber/10 border-advisory-amber text-ink-700'
                  : 'bg-paper-0 border-rule-300 text-ink-700 hover:bg-paper-1'
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value="mark_unresolved"
                checked={action === 'mark_unresolved'}
                onChange={() => setAction('mark_unresolved')}
                className="w-3.5 h-3.5 text-advisory-amber focus-ring mt-0.5"
              />
              <div className="flex items-start gap-2 flex-1">
                <HelpCircle className="w-3.5 h-3.5 text-advisory-amber shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-semibold">Mark Unresolved (Escalate)</div>
                  <div className="text-[10px] text-ink-700">Escalate to banking operations desk for external trace</div>
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Reason / Rationale Textarea */}
        <div className="space-y-1">
          <label htmlFor="review-comment" className="block text-xs font-semibold text-ink-700 font-sans">
            Resolution Rationale / Note <span className="text-ledger-vermilion">*</span>
          </label>
          <textarea
            id="review-comment"
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why this decision is justified (recorded in audit history)..."
            className="w-full bg-paper-0 border border-rule-300 rounded p-2.5 text-xs text-ink-700 placeholder-ink-700/50 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 font-sans transition"
          />
        </div>

        {/* Optimistic Locking Notice */}
        <div className="flex items-center justify-between text-[10px] text-ink-700 font-mono">
          <Tooltip content="The version used to prevent overwriting another reviewer's update.">
          <span tabIndex={0} className="flex items-center gap-1 focus-ring">
            <Lock className="w-3 h-3 text-source-blue" aria-hidden="true" />
            Case version: {evidence.version}
          </span>
          </Tooltip>
          <Tooltip content="Prevents one reviewer from overwriting a newer decision.">
          <span tabIndex={0} className="text-ink-700 focus-ring">Safe update protection</span>
          </Tooltip>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !actor.trim() || !comment.trim()}
          className="w-full h-9 rounded bg-paper-1 hover:bg-paper-0 active:bg-paper-1 text-ink-900 text-xs font-semibold tracking-wide transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-none active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-ink-700" aria-hidden="true" />
              <span>Persisting Decision...</span>
            </>
          ) : (
            <>
              <Send className="w-3 h-3 text-ink-700" aria-hidden="true" />
              <span>Submit Human Decision</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
