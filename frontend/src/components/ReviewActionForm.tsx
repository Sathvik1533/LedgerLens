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
  MessageSquare,
  ShieldAlert,
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
  const [actor, setActor] = useState('finance_ops_lead');
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
          'Optimistic Locking Collision (HTTP 409): This case was modified by another reviewer concurrently.'
        );
      } else {
        setErrorMsg(err.message || 'Failed to record decision.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResolved = evidence.decision_status === 'auto_reconciled' || evidence.decision_status === 'rejected';

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 space-y-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Human Review Decision Protocol</h3>
            <p className="text-[11px] text-slate-400">Append-only audit trail sign-off & optimistic locking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-blue-300 bg-blue-950/60 border border-blue-500/40 px-2.5 py-1 rounded-md">
            Locked Version: v{evidence.version}
          </span>
        </div>
      </div>

      {/* Conflict Error Alert */}
      {conflictError && (
        <div className="rounded-xl bg-amber-950/50 border border-amber-500/50 p-4 space-y-3 shadow-lg">
          <div className="flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200">Concurrent Modification Detected</p>
              <p className="mt-0.5 text-amber-300/80">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefreshCase}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Case State & Version
          </button>
        </div>
      )}

      {errorMsg && !conflictError && (
        <div className="rounded-xl bg-rose-950/50 border border-rose-500/50 p-3.5 text-xs text-rose-300 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isResolved ? (
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-5 text-center space-y-1.5 text-xs">
          <p className="font-bold text-emerald-400 text-sm">Case Closed: {evidence.decision_status}</p>
          <p className="text-slate-400">All reconciliation discrepancies for this record have been resolved.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actor Identity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Reviewer Identity (Actor)
              </label>
              <input
                type="text"
                required
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all"
                placeholder="e.g. finance_ops_lead"
              />
            </div>

            {/* Decision Action Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Decision Action
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('approve')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    action === 'approve'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-900/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    action === 'reject'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md shadow-rose-900/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setAction('mark_unresolved')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    action === 'mark_unresolved'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md shadow-amber-900/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Unresolved
                </button>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              Audit Rationale / Explanation Note
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              placeholder="State rationale for audit compliance (e.g. 'Verified bank credit UTR statement')..."
            />
          </div>

          {/* Action Submit */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Recording Audit Event...' : 'Sign Off & Commit Review Action'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
