import React, { useState } from 'react';
import { CaseEvidenceResponse, HumanReviewRequest, HumanReviewResponse } from '../types/api';
import { submitCaseReview, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface ReviewActionFormProps {
  evidence: CaseEvidenceResponse;
  onSuccess: (receipt?: HumanReviewResponse) => void;
  onRefreshCase: () => void;
}

export const ReviewActionForm: React.FC<ReviewActionFormProps> = ({
  evidence,
  onSuccess,
  onRefreshCase,
}) => {
  const { user } = useAuth();
  const [action, setAction] = useState<'approve' | 'reject' | 'mark_unresolved'>('approve');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<HumanReviewResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setConflictError(false);

    const cleanComment = comment.trim();
    if (cleanComment.length < 10) {
      setErrorMsg('Please provide a clear review reason of at least 10 characters explaining your decision.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: HumanReviewRequest = {
        actor: user?.email || 'reviewer@ledgerlens.internal',
        action,
        expected_version: evidence.version,
        human_comment: cleanComment,
      };

      const response = await submitCaseReview(evidence.case_id, payload);
      setLastReceipt(response);
      onSuccess(response);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        setConflictError(true);
        setErrorMsg(
          'Another operator updated this case first. To prevent overwriting, your decision was not recorded. Refresh the case to inspect the latest state.'
        );
      } else {
        const readableError = typeof err?.message === 'string' 
          ? err.message 
          : typeof err?.detail === 'string'
          ? err.detail
          : 'Unable to record decision to ledger. Check network connectivity.';
        setErrorMsg(readableError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-rule bg-surface p-5 rounded-xs space-y-4 font-sans shadow-subtle">
      {/* Header Styled as Institutional Sign-off */}
      <div className="border-b border-rule pb-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-editorial text-lg font-medium text-ink">
            Record a review decision
          </span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 border border-rule text-ink-secondary bg-canvas rounded-xs">
            Ledger v{evidence.version}
          </span>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed">
          Sign this financial review note. Your decision, rationale, and timestamp will be permanently appended to the immutable audit ledger.
        </p>
      </div>

      {/* Conflict collision notification */}
      {conflictError && (
        <div className="p-3 bg-critical/10 border border-critical/30 rounded-xs space-y-2 text-xs text-critical font-sans">
          <div className="font-semibold">Case updated by another reviewer</div>
          <p className="text-[11px] leading-normal">{errorMsg}</p>
          <button
            onClick={onRefreshCase}
            className="px-2.5 py-1 bg-critical text-canvas text-[11px] font-medium rounded-xs hover:bg-critical/90 transition-colors"
          >
            Refresh latest case data
          </button>
        </div>
      )}

      {/* General Error banner */}
      {errorMsg && !conflictError && (
        <div className="p-2.5 bg-critical/10 border border-critical/30 rounded-xs text-xs text-critical font-mono">
          {errorMsg}
        </div>
      )}

      {/* Post-submission Dated Ledger Receipt */}
      {lastReceipt && (
        <div className="p-4 bg-ledger-green/10 border border-ledger-green/30 rounded-xs space-y-2 font-mono text-xs text-ink">
          <div className="flex items-center justify-between text-ledger-green font-semibold">
            <span>✓ Decision recorded to ledger</span>
            <span>v{lastReceipt.current_version}</span>
          </div>
          <div className="text-[11px] text-ink-secondary space-y-1 pt-1 border-t border-ledger-green/20">
            <div>Receipt ID: {lastReceipt.review_action_id}</div>
            <div>Signer: {lastReceipt.actor} ({lastReceipt.action})</div>
            <div>Recorded: {new Date(lastReceipt.actioned_at).toLocaleString('en-IN')}</div>
            <div>Audit Event: {lastReceipt.audit_event_id}</div>
          </div>
        </div>
      )}

      {/* Decision Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Verified Reviewer Identity */}
        <div className="p-2.5 bg-canvas border border-rule rounded-xs space-y-1">
          <div className="text-[11px] font-mono uppercase text-ink-secondary tracking-wider">
            Verified Reviewer Identity
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-ink font-medium">
              {user?.full_name || 'Demo Reviewer'}
            </span>
            <span className="text-ink-secondary text-[11px]">
              {user?.role === 'admin' ? 'Administrator' : 'Reviewer'} ({user?.email || 'reviewer@ledgerlens.internal'})
            </span>
          </div>
        </div>

        {/* Action Choice */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase text-ink-secondary block">
            Review Determination
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAction('approve')}
              className={`py-2 px-2 border text-center font-medium rounded-xs transition-colors ${
                action === 'approve'
                  ? 'border-ledger-green bg-ledger-green/10 text-ledger-green font-semibold'
                  : 'border-rule bg-canvas text-ink-secondary hover:border-ink hover:text-ink'
              }`}
            >
              Approve match
            </button>
            <button
              type="button"
              onClick={() => setAction('reject')}
              className={`py-2 px-2 border text-center font-medium rounded-xs transition-colors ${
                action === 'reject'
                  ? 'border-critical bg-critical/10 text-critical font-semibold'
                  : 'border-rule bg-canvas text-ink-secondary hover:border-ink hover:text-ink'
              }`}
            >
              Reject record
            </button>
            <button
              type="button"
              onClick={() => setAction('mark_unresolved')}
              className={`py-2 px-2 border text-center font-medium rounded-xs transition-colors ${
                action === 'mark_unresolved'
                  ? 'border-brass bg-brass/10 text-brass font-semibold'
                  : 'border-rule bg-canvas text-ink-secondary hover:border-ink hover:text-ink'
              }`}
            >
              Escalate
            </button>
          </div>
        </div>

        {/* Operating Rationale */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase text-ink-secondary block">
              Audit Rationale & Reference Notes
            </label>
            <span className={`text-[10px] font-mono ${comment.trim().length >= 10 ? 'text-ledger-green' : 'text-ink-secondary'}`}>
              {comment.trim().length}/10 min chars
            </span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
            minLength={10}
            className="w-full px-3 py-2 border border-rule bg-canvas text-ink font-sans text-xs rounded-xs focus:outline-none focus:border-ink"
            placeholder="Explain the commercial or operational justification for this decision (minimum 10 characters)..."
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-ink hover:bg-ink/90 text-canvas font-medium text-xs rounded-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Recording to ledger...</span>
          ) : (
            <span>Record review decision</span>
          )}
        </button>
      </form>
    </div>
  );
};
