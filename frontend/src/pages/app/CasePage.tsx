import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CaseEvidenceResponse, AuditEventItem, HumanReviewResponse } from '../../types/api';
import { fetchCaseDetail, fetchCaseAuditTrail } from '../../api/client';
import { MultiSourceCard } from '../../components/MultiSourceCard';
import { ReviewActionForm } from '../../components/ReviewActionForm';
import { AuditTimeline } from '../../components/AuditTimeline';
import { RagCopilotPanel } from '../../components/RagCopilotPanel';
import { CaseWorkspaceSkeleton } from '../../components/SkeletonLoaders';
import { LedgerTraceA } from '../../components/concepts/LedgerTraceA';

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
  const [receiptBanner, setReceiptBanner] = useState<HumanReviewResponse | null>(null);

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
      let msg = 'The requested case could not be retrieved from the ledger.';
      if (err?.message && typeof err.message === 'string' && err.message !== '[object Object]') {
        msg = err.message;
      } else if (typeof err?.detail === 'string') {
        msg = err.detail;
      } else if (Array.isArray(err?.detail)) {
        msg = err.detail.map((d: any) => d.msg || String(d)).join('; ');
      }
      setError(msg);
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

  const handleReviewSuccess = async (receipt?: HumanReviewResponse) => {
    if (receipt) {
      setReceiptBanner(receipt);
    }
    await loadCaseData();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 md:p-10">
        <CaseWorkspaceSkeleton />
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="w-full max-w-2xl mx-auto my-16 p-8 border border-critical/40 bg-surface rounded-xs text-center space-y-4 font-sans">
        <div className="w-2 h-2 rounded-full bg-critical mx-auto" />
        <h3 className="font-editorial text-2xl font-medium text-ink">
          Reconciliation record unreachable
        </h3>
        <p className="text-xs font-mono text-ink-secondary max-w-md mx-auto">
          {error || 'The case identifier does not correspond to an active ledger record.'}
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-ink text-canvas text-xs font-medium rounded-xs hover:bg-ink/90 transition-colors"
        >
          Return to review queue
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-10 space-y-8 font-sans">
      {/* 1. Case Dossier Masthead */}
      <div className="space-y-3 border-b border-rule pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
          <button
            onClick={handleBack}
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>&larr; Review queue</span>
          </button>
          <span>/</span>
          <span>Dossier</span>
          <span>/</span>
          <span className="text-ink font-semibold">{evidence.case_id}</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
              Case Investigation Dossier
            </span>
            <h1 className="font-editorial text-3xl font-medium text-ink mt-0.5">
              Payment {evidence.payment_id}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-mono text-ink-secondary">
              <button
                onClick={copyCaseId}
                className="hover:text-ink flex items-center gap-1 underline decoration-dotted"
                title="Click to copy case ID"
              >
                <span>UUID: {evidence.case_id}</span>
                {copied && <span className="text-ledger-green">✓ copied</span>}
              </button>
              <span>&bull;</span>
              <span>Ledger Version: v{evidence.version}</span>
              {evidence.case_opened_at && (
                <>
                  <span>&bull;</span>
                  <span>Opened: {new Date(evidence.case_opened_at).toLocaleDateString('en-IN')}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadCaseData}
              className="px-3 py-1.5 border border-rule bg-surface hover:bg-canvas text-xs font-mono text-ink rounded-xs transition-colors"
            >
              Refresh case records
            </button>
          </div>
        </div>
      </div>

      {/* Dated Ledger Receipt Notification */}
      {receiptBanner && (
        <div className="p-4 bg-ledger-green/10 border border-ledger-green/30 rounded-xs flex items-center justify-between gap-4 text-xs font-mono text-ink">
          <div>
            <strong className="text-ledger-green block">
              ✓ Decision permanently recorded to ledger
            </strong>
            <span className="text-ink-secondary text-[11px]">
              Receipt {receiptBanner.review_action_id} &bull; Signer: {receiptBanner.actor} &bull; Result: {receiptBanner.new_decision_status}
            </span>
          </div>
          <button
            onClick={() => setReceiptBanner(null)}
            className="text-ink-secondary hover:text-ink text-[11px] underline"
          >
            Dismiss receipt
          </button>
        </div>
      )}

      {/* 2. Asymmetric Workspace Layout: Wide Reading Column (60%) + Margin Column (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        {/* Left Column: What happened & Which records prove it (4-source evidence) */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-ink-secondary uppercase tracking-wider block">
              Continuous Trace Alignment
            </span>
            <LedgerTraceA 
              evidence={evidence}
              compact={true} 
            />
          </div>
          <MultiSourceCard evidence={evidence} />
        </div>

        {/* Right Margin Column: What rule fired, Operator decision, Audit receipt */}
        <div className="space-y-6 lg:sticky lg:top-20">
          {/* Rule Fired: Policy Margin Note */}
          <RagCopilotPanel caseId={evidence.case_id} autoRun={true} />

          {/* Operator Decision: Sign-off Note */}
          <ReviewActionForm
            evidence={evidence}
            onSuccess={handleReviewSuccess}
            onRefreshCase={loadCaseData}
          />

          {/* Recorded History: Audit Ledger */}
          <AuditTimeline events={auditEvents} />
        </div>
      </div>
    </div>
  );
};

export default CaseDetailPage;
