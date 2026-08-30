import React, { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle, AlertTriangle, RefreshCw, Send } from 'lucide-react';
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
  const [actor, setActor] = useState('ops_finance_lead');
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
          'Optimistic Locking Conflict (HTTP 409): This case was updated or resolved by another reviewer concurrently.'
        );
      } else {
        setErrorMsg(err.message || 'Failed to submit review action.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResolved = evidence.decision_status === 'auto_reconciled' || evidence.decision_status === 'rejected';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Human Review Decision</h3>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          DB Version: {evidence.version}
        </span>
      </div>

      {conflictError && (
        <div className="bg-amber-950/40 border border-amber-600/50 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={onRefreshCase}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Case to Latest State
          </button>
        </div>
      )}

      {errorMsg && !conflictError && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg p-3 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isResolved ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 text-center space-y-1 text-xs">
          <p className="font-semibold text-emerald-400">Case is currently in status: {evidence.decision_status}</p>
          <p className="text-slate-400">No further human decision is pending for this reconciliation case.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reviewer Identity (Actor)</label>
              <input
                type="text"
                required
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="e.g. ops_finance_lead"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Decision Action</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('approve')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
                    action === 'approve'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
                    action === 'reject'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setAction('mark_unresolved')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
                    action === 'mark_unresolved'
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Unresolved
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Audit Rationale / Comment (Optional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              placeholder="Provide reason for approval or resolution steps taken..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Recording Decision...' : 'Submit Irreversible Decision'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
