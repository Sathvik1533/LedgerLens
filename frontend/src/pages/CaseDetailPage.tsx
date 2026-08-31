import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { CaseEvidenceResponse, AuditEventItem } from '../types/api';
import { fetchCaseDetail, fetchCaseAuditTrail } from '../api/client';
import { MultiSourceCard } from '../components/MultiSourceCard';
import { ReviewActionForm } from '../components/ReviewActionForm';
import { AuditTimeline } from '../components/AuditTimeline';
import { RagCopilotPanel } from '../components/RagCopilotPanel';
import { StatusBadge } from '../components/StatusBadge';
import { ExceptionBadge } from '../components/ExceptionBadge';
import { AmountDisplay } from '../components/AmountDisplay';
import { CaseWorkspaceSkeleton } from '../components/SkeletonLoaders';

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
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

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
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReviewSuccess = async () => {
    setSuccessBanner('Human decision submitted successfully. The review action and rationale are permanently recorded in the audit trail.');
    await loadCaseData();
  };

  if (isLoading) {
    return <CaseWorkspaceSkeleton />;
  }

  if (error || !evidence) {
    return (
      <div className="bg-surface border border-critical-border rounded-xl p-8 text-center space-y-4 shadow-panel">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" aria-hidden="true" />
        <h3 className="text-base font-bold text-white">Reconciliation Case Unreachable</h3>
        <p className="text-xs text-rose-300 max-w-md mx-auto">{error || 'Case records could not be retrieved from PostgreSQL database.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition focus-ring"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Queue</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Summary Header */}
      <div className="bg-surface border border-border-strong rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-panel">
        <div className="flex flex-wrap items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-surface-alt hover:bg-surface-hover border border-border-strong text-slate-300 transition focus-ring"
            aria-label="Return to review queue"
            title="Return to review queue"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-slate-400">CASE:</span>
              <button
                onClick={copyCaseId}
                className="font-mono text-sm font-bold text-white hover:text-blue-300 flex items-center gap-1.5 focus-ring rounded"
                title="Click to copy case ID"
              >
                <span>{evidence.case_id}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              <ExceptionBadge type={evidence.exception_type} size="sm" />
              <StatusBadge status={evidence.decision_status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Payment ID: {evidence.payment_id} &bull; Currency: {evidence.currency}
            </p>
          </div>
        </div>

        {/* Right Header Badges */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-surface-alt border border-border-strong text-slate-300">
            <Lock className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            <span>Version: v{evidence.version}</span>
          </span>

          <button
            onClick={loadCaseData}
            className="p-2 rounded-lg bg-surface-alt hover:bg-surface-hover border border-border-strong text-slate-300 transition focus-ring"
            aria-label="Refresh case data"
            title="Refresh case data"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div
          role="status"
          className="rounded-xl bg-resolved-subtle border border-resolved-border p-4 flex items-center justify-between gap-3 text-emerald-200 text-xs shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column Persistent Desktop Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: Case Context & Audit Timeline (3 cols / ~25% width) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface border border-border-strong rounded-xl p-5 space-y-4 shadow-panel">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border-subtle pb-2.5">
              Financial Context
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Amount at Risk</span>
                <AmountDisplay
                  amount={evidence.payment?.amount || evidence.expected_net_settlement}
                  className="text-lg font-bold text-white"
                />
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Calculated Discrepancy</span>
                <AmountDisplay
                  amount={evidence.settlement_discrepancy}
                  isDiscrepancy={true}
                  className="text-base font-bold"
                />
              </div>

              <div className="pt-2 border-t border-border-subtle space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Exception</span>
                  <span className="font-mono text-slate-200 font-semibold">{evidence.exception_type}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Decision State</span>
                  <span className="font-mono text-slate-200 font-semibold">{evidence.decision_status}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Lock Version</span>
                  <span className="font-mono text-slate-200">v{evidence.version}</span>
                </div>
              </div>
            </div>
          </div>

          <AuditTimeline events={auditEvents} />
        </div>

        {/* COLUMN 2: Evidence Comparison Grid & AI Copilot (5 cols / ~42%) */}
        <div className="lg:col-span-5 space-y-6">
          <MultiSourceCard evidence={evidence} />
          <RagCopilotPanel caseId={evidence.case_id} autoRun={true} />
        </div>

        {/* COLUMN 3: Sticky Human Decision Panel (4 cols / ~33% width) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
          <ReviewActionForm
            evidence={evidence}
            onSuccess={handleReviewSuccess}
            onRefreshCase={loadCaseData}
          />
        </div>
      </div>
    </div>
  );
};
