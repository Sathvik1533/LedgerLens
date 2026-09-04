import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface GuideStep {
  step: number;
  title: string;
  badge: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  keyRule: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: 'Inspect Batch Parity Result',
    badge: 'Step 1 of 5 • Batch Telemetry',
    description:
      'Begin by reviewing overall throughput, processed denominator, and deterministic match rates across all four financial counterparties. Verify that clean matches satisfy strict penny-level parity (≤ ₹0.01).',
    actionLabel: 'View Evaluation Docket',
    actionLink: '/evaluation',
    keyRule: 'Formula: auto_reconciled ÷ records_processed × 100',
  },
  {
    step: 2,
    title: 'Prioritize Highest-Risk Exceptions',
    badge: 'Step 2 of 5 • Risk Triage',
    description:
      'Open the Operational Review Queue. Immediately triage direct cash risks—missing bank credits and unapproved settlement shortfalls—before analyzing secondary fee tier deviations.',
    actionLabel: 'Open Review Queue',
    actionLink: '/app/queue',
    keyRule: 'Rule: Cash exposure & missing UTRs take priority over fee variations',
  },
  {
    step: 3,
    title: 'Examine Four-Source Evidence',
    badge: 'Step 3 of 5 • Multi-Stream Audit',
    description:
      'Open the case docket to inspect side-by-side evidence: merchant gross captured, gateway fee deductions, customer refunds, and bank credits. The exact divergence is redlined down to the single paisa.',
    actionLabel: 'Inspect Sample Case',
    actionLink: '/app/case/264548b2-c896-42b7-a2a4-c0f3f0f614b9',
    keyRule: 'Standard: Gross − Fee − Tax − Refund == Net Bank Deposit',
  },
  {
    step: 4,
    title: 'Consult Policy Guidance via Grounded RAG',
    badge: 'Step 4 of 5 • Advisory AI',
    description:
      'The deterministic engine isolates the numbers; the Grounded RAG assistant retrieves the governing operational SOP (e.g. SOP-2026-FEE-01). The AI advises with direct policy citations, but has zero financial authority.',
    actionLabel: 'Browse Policy Corpus',
    actionLink: '/app/policies',
    keyRule: 'Invariant: No LLM arithmetic & zero autonomous financial approval',
  },
  {
    step: 5,
    title: 'Record Human Decision & Audit Receipt',
    badge: 'Step 5 of 5 • Operator Sign-off',
    description:
      'The human finance controller selects a resolution (Dispute Escalation, Credit Note Request, or Commercial Waiver) and signs off with a mandatory justification. An append-only audit event is permanently committed.',
    actionLabel: 'View Immutable Audit Ledger',
    actionLink: '/app/audit',
    keyRule: 'Integrity: Tamper-evident, cryptographically sequenced audit log',
  },
];

interface HowToUseRoomGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const HowToUseRoomGuide: React.FC<HowToUseRoomGuideProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (isControlled && externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, externalOnClose]);

  const handleOpen = () => {
    setInternalIsOpen(true);
  };

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev < GUIDE_STEPS.length - 1 ? prev + 1 : prev));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard navigation: Escape to close, arrows to step, numbers 1-5 to jump
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || e.key === 'n') {
        nextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        prevStep();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        setCurrentStepIndex(parseInt(e.key, 10) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, nextStep, prevStep]);

  const currentStep = GUIDE_STEPS[currentStepIndex];

  return (
    <>
      {/* Launch trigger button if uncontrolled */}
      {!isControlled && !isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Open how to use this room guide"
          className={`inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-rule hover:border-ink text-ink font-mono text-xs rounded-xs shadow-subtle hover:bg-canvas transition-colors ${className}`}
        >
          <span className="text-brass font-bold">✦</span>
          <span>How to use this room</span>
          <span className="text-[10px] text-ink-muted bg-canvas border border-rule px-1 rounded-xs">
            5 steps
          </span>
        </button>
      )}

      {/* Non-blocking, accessible guide panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="How to use LedgerLens operational guide"
          className="fixed bottom-6 right-6 z-50 w-full max-w-lg bg-[#111315] text-[#FCFBF8] border border-white/20 rounded-xs shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brass animate-pulse" />
              <span className="text-xs font-mono tracking-wider text-[#EAE4D8] uppercase">
                Operator Guide &bull; The 5-Step Workflow
              </span>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close operator guide (Escape)"
              className="text-[#A8A49C] hover:text-[#FCFBF8] text-xs font-mono px-1.5 py-0.5 border border-transparent hover:border-white/20 rounded-xs transition-colors"
            >
              Close [Esc]
            </button>
          </div>

          {/* Step Progress Indicators */}
          <div className="grid grid-cols-5 border-b border-white/10 bg-black/20 text-center text-[10px] font-mono">
            {GUIDE_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`py-2 border-r last:border-r-0 border-white/10 transition-colors ${
                  idx === currentStepIndex
                    ? 'bg-white/15 text-white font-semibold border-b-2 border-b-brass'
                    : 'text-[#A8A49C] hover:bg-white/5'
                }`}
              >
                0{s.step}
              </button>
            ))}
          </div>

          {/* Step Body */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-brass font-medium">{currentStep.badge}</span>
              <span className="text-[#A8A49C]">Press [1-5] or &larr; &rarr;</span>
            </div>

            <h3 className="font-editorial text-2xl font-medium text-[#FCFBF8] leading-snug">
              {currentStep.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#D8D2C8] leading-relaxed font-sans">
              {currentStep.description}
            </p>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xs font-mono text-[11px] text-[#EAE4D8] space-y-1">
              <div className="text-[10px] uppercase text-[#A8A49C] tracking-wider">Governing Invariant:</div>
              <div>{currentStep.keyRule}</div>
            </div>

            {/* Step Actions & Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="px-2.5 py-1.5 border border-white/20 rounded-xs text-[#D8D2C8] hover:text-white disabled:opacity-30 disabled:hover:text-[#D8D2C8] transition-colors"
                >
                  &larr; Prev
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStepIndex === GUIDE_STEPS.length - 1}
                  className="px-2.5 py-1.5 border border-white/20 rounded-xs text-[#D8D2C8] hover:text-white disabled:opacity-30 disabled:hover:text-[#D8D2C8] transition-colors"
                >
                  Next &rarr;
                </button>
              </div>

              {currentStep.actionLink && (
                <Link
                  to={currentStep.actionLink}
                  onClick={handleClose}
                  className="px-3 py-1.5 bg-[#FCFBF8] text-[#111315] hover:bg-[#EAE4D8] font-medium rounded-xs transition-colors flex items-center gap-1"
                >
                  <span>{currentStep.actionLabel}</span>
                  <span>&rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
