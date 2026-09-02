import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { CaseEvidenceResponse, AuditEventItem } from '../../types/api';
import { fetchCaseDetail, fetchCaseAuditTrail } from '../../api/client';
import { MultiSourceCard } from '../../components/MultiSourceCard';
import { ReviewActionForm } from '../../components/ReviewActionForm';
import { AuditTimeline } from '../../components/AuditTimeline';
import { RagCopilotPanel } from '../../components/RagCopilotPanel';
import { ExceptionBadge } from '../../components/ExceptionBadge';
import { AmountDisplay } from '../../components/AmountDisplay';
import { CaseWorkspaceSkeleton } from '../../components/SkeletonLoaders';

interface CaseDetailPageProps {
  caseId?: string;
  onBack?: () => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId: propCaseId, onBack: propOnBack }) => {
  const params = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const activeCaseId = propCaseId || params.caseId || '';

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate('/app/queue');
    }
  };
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
        fetchCaseDetail(activeCaseId),
        fetchCaseAuditTrail(activeCaseId),
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
    if (activeCaseId) {
      loadCaseData();
    }
  }, [activeCaseId]);

  const copyCaseId = () => {
    navigator.clipboard.writeText(activeCaseId);
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
      <div className="bg-paper-1 border border-ledger-vermilion rounded-xl p-8 text-center space-y-4 shadow-sm font-sans">
        <AlertCircle className="w-10 h-10 text-ledger-vermilion mx-auto" aria-hidden="true" />
        <h3 className="text-base font-semibold text-ink-900">Reconciliation Case Unreachable</h3>
        <p className="text-xs text-ink-900 max-w-md mx-auto">{error || 'Case records could not be retrieved from database.'}</p>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-paper-1 hover:bg-paper-0 text-ink-900 text-xs font-semibold rounded shadow transition"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Queue</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans">
      {/* 1. Context & Section Header Strip */}
      <div className="space-y-2 border-b border-rule-300 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-source-blue bg-source-blue/10 border border-source-blue px-2.5 py-0.5 rounded-full">
            03 &mdash; CASE INVESTIGATION WORKSPACE
          </span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-xs text-ink-700 font-mono">3-COLUMN RECONCILIATION TERMINAL</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 hover:text-ink-900 transition py-1.5 px-3 rounded-full bg-paper-1 hover:bg-paper-1 border border-rule-300"
              title="Return to review queue"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Queue</span>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-ink-700 font-mono">CASE:</span>
                <button
                  onClick={copyCaseId}
                  className="text-xs font-semibold text-ink-900 hover:text-ink-900 flex items-center gap-1 rounded font-mono bg-paper-1 px-2 py-0.5 border border-rule-300"
                  title="Click to copy case ID"
                >
                  <span>{evidence.case_id}</span>
                  {copied ? <Check className="w-3 h-3 text-matched-green" /> : <Copy className="w-3 h-3 text-ink-700" />}
                </button>
                <ExceptionBadge type={evidence.exception_type} size="sm" />
              </div>
              <p className="text-xs text-ink-700 mt-0.5 font-mono">
                Payment ID: {evidence.payment_id} &bull; Currency: {evidence.currency}
              </p>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-paper-1 border border-rule-300 text-ink-700 font-mono">
              <Lock className="w-3 h-3 text-source-blue" aria-hidden="true" />
              <span>Version: v{evidence.version}</span>
            </span>

            <button
              onClick={loadCaseData}
              className="p-2 rounded-full bg-paper-1 hover:bg-paper-1 border border-rule-300 text-ink-700 hover:text-ink-900 transition"
              aria-label="Refresh case data"
              title="Refresh case data"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div
          role="status"
          className="rounded-xl bg-matched-green/10 border border-matched-green p-4 flex items-center justify-between gap-3 text-matched-green text-xs shadow-none"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-matched-green shrink-0" aria-hidden="true" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs font-semibold text-matched-green hover:text-matched-green underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column Persistent Desktop Workspace */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* COLUMN 1: Case Context & Audit Timeline (w-full lg:w-[22%]) */}
        <div className="w-full lg:w-[22%] space-y-4 shrink-0">
          <div className="control-panel rounded-xl p-4 space-y-3 shadow-none">
            <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider font-sans border-b border-rule-300 pb-2">
              Case Metadata
            </h3>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-ink-700 block text-[11px] font-sans">Amount at Risk</span>
                <AmountDisplay
                  amount={evidence.payment?.amount || evidence.expected_net_settlement}
                  className="text-lg font-bold text-ink-900 font-mono"
                />
              </div>

              <div>
                <span className="text-ink-700 block text-[11px] font-sans">Calculated Discrepancy</span>
                <AmountDisplay
                  amount={evidence.settlement_discrepancy}
                  isDiscrepancy={true}
                  className="text-base font-bold font-mono text-ledger-vermilion"
                />
              </div>

              <div className="pt-2 border-t border-rule-300 space-y-2 text-xs">
                <div className="flex justify-between items-center text-ink-700">
                  <span>Exception Code</span>
                  <span className="text-ink-900 font-mono text-xs font-medium">{evidence.exception_type}</span>
                </div>
                <div className="flex justify-between items-center text-ink-700">
                  <span>Decision State</span>
                  <span className="text-ink-900 font-mono text-xs font-medium">{evidence.decision_status}</span>
                </div>
                <div className="flex justify-between items-center text-ink-700">
                  <span>Lock Version</span>
                  <span className="text-ink-900 font-mono text-xs font-medium">v{evidence.version}</span>
                </div>
              </div>
            </div>
          </div>

          <AuditTimeline events={auditEvents} />
        </div>

        {/* COLUMN 2: Evidence Comparison Grid & Policy AI Drawer (w-full lg:w-[48%]) */}
        <div className="w-full lg:w-[48%] space-y-4 flex-1">
          <MultiSourceCard evidence={evidence} />
          <RagCopilotPanel caseId={evidence.case_id} autoRun={true} />
        </div>

        {/* COLUMN 3: Sticky Human Decision Panel (w-full lg:w-[30%]) */}
        <div className="w-full lg:w-[30%] lg:sticky lg:top-14 space-y-4 shrink-0">
          <ReviewActionForm
            evidence={evidence}
            onSuccess={handleReviewSuccess}
            onRefreshCase={loadCaseData}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CaseDetailPage;
