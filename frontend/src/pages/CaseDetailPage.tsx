import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
        <span>Loading case facts and audit history...</span>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="bg-rose-950/30 border border-rose-800 rounded-xl p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-semibold text-rose-200">Error Loading Case</h3>
        <p className="text-xs text-rose-300">{error || 'Case not found'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-md hover:bg-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Review Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Back to Review Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono">Case #{evidence.case_id.slice(0, 8)}</h2>
              <StatusBadge status={evidence.decision_status} />
              <ExceptionBadge type={evidence.exception_type} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Payment ID: <span className="font-mono text-slate-200">{evidence.payment_id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCaseData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh State
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
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
