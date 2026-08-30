import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import { CaseEvidenceResponse, AuditEventItem } from '../types/api';
import { fetchCaseDetail, fetchCaseAuditTrail } from '../api/client';
import { MultiSourceCard } from '../components/MultiSourceCard';
import { ReviewActionForm } from '../components/ReviewActionForm';
import { AuditTimeline } from '../components/AuditTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { ExceptionBadge } from '../components/ExceptionBadge';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack }) => {
  const [evidence, setEvidence] = useState<CaseEvidenceResponse | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadCaseData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [evData, auditData] = await Promise.all([
        fetchCaseDetail(caseId),
        fetchCaseAuditTrail(caseId),
      ]);
      setEvidence(evData);
      setAuditEvents(auditData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load case details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const copyCaseId = () => {
    navigator.clipboard.writeText(caseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="py-28 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
        <RefreshCw className="w-7 h-7 animate-spin text-blue-400" />
        <span className="font-semibold text-slate-300">Retrieving multi-source facts and audit timeline...</span>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="rounded-2xl bg-rose-950/30 border border-rose-800/60 p-8 text-center space-y-4 shadow-xl">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-rose-200">Reconciliation Case Unreachable</h3>
        <p className="text-xs text-rose-300 max-w-md mx-auto">{error || 'Case records could not be retrieved from PostgreSQL.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl shadow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 shadow-sm"
            title="Back to Review Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base font-extrabold text-white tracking-tight font-mono">
                Case #{evidence.case_id.slice(0, 8)}
              </h2>
              <button
                onClick={copyCaseId}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700/60 font-mono transition-colors"
                title="Copy Full Case UUID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'UUID'}</span>
              </button>
              <StatusBadge status={evidence.decision_status} />
              <ExceptionBadge type={evidence.exception_type} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <span>Payment ID:</span>
              <span className="text-blue-300 font-bold">{evidence.payment_id}</span>
              {evidence.case_opened_at && (
                <>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-slate-500">
                    Opened: {new Date(evidence.case_opened_at).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCaseData}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Multi-Source Comparison */}
          <MultiSourceCard evidence={evidence} />

          {/* Review Decision Form */}
          <ReviewActionForm
            evidence={evidence}
            onSuccess={loadCaseData}
            onRefreshCase={loadCaseData}
          />
        </div>

        <div className="space-y-6">
          {/* Append-Only Audit Timeline */}
          <AuditTimeline events={auditEvents} />
        </div>
      </div>
    </div>
  );
};
