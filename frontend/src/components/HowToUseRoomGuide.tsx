import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface GuideStep {
  step: number;
  title: string;
  badge: string;
  route: string;
  pageName: string;
  whatToLookFor: string;
  reviewerCheck: string;
  governingRule: string;
  nextButtonLabel: string;
}

const DYNAMIC_STEPS: GuideStep[] = [
  {
    step: 1,
    title: 'Overview & Batch Results',
    badge: 'Step 1 of 5 • Overview',
    route: '/app/dashboard',
    pageName: 'Records compared & open cases',
    whatToLookFor:
      'Check the overall records received across payments, provider payouts, customer refunds, and bank credits. See the matched rate and money in open cases.',
    reviewerCheck:
      'Verify that auto-reconciled records satisfy exact mathematical parity down to the paisa (≤ ₹0.01 difference).',
    governingRule: 'Rule: Four records must agree. Clean matches close automatically.',
    nextButtonLabel: 'Next: Open review queue →',
  },
  {
    step: 2,
    title: 'Review Queue & Risk Triage',
    badge: 'Step 2 of 5 • Cases to review',
    route: '/app/queue',
    pageName: 'Cases waiting for a human decision',
    whatToLookFor:
      'Inspect cases flagged by the rule engine. Exceptions are prioritized by money to check. Missing bank deposits and unreceived payouts are triaged first.',
    reviewerCheck:
      'Filter by category or click on any case (e.g. CASE-1014) to open its four-source investigation dossier.',
    governingRule: 'Rule: Unreceived cash deposits take priority over fee rate variances.',
    nextButtonLabel: 'Next: Examine case dossier →',
  },
  {
    step: 3,
    title: 'Case Investigation Dossier',
    badge: 'Step 3 of 5 • Case Dossier',
    route: '/app/case/CASE-1014',
    pageName: 'Case dossier',
    whatToLookFor:
      'Inspect the side-by-side evidence: what the customer paid, what the provider sent, what was refunded, and what reached the bank. Notice the exact difference highlighted.',
    reviewerCheck:
      'Review the approved rule guidance panel on the right. Note that AI provides policy guidance only; a human reviewer makes the decision.',
    governingRule: 'Standard: Gross captured − Fee − Tax − Refund == Bank deposit.',
    nextButtonLabel: 'Next: Read approved rules →',
  },
  {
    step: 4,
    title: 'Approved Operating Rules',
    badge: 'Step 4 of 5 • Approved rules',
    route: '/app/policies',
    pageName: 'Approved rules',
    whatToLookFor:
      'Read the three clean approved policy cards: Provider fee and tax rule (SOP-2026-FEE-01), Missing payout time limit (SOP-2026-ESC-02), and Bank credit check (SOP-2026-BNK-03).',
    reviewerCheck:
      'Each rule explains the plain meaning, what the reviewer should check, and what action to take. Guidance assists the reviewer.',
    governingRule: 'Invariant: No AI automated approvals; human authority governs money.',
    nextButtonLabel: 'Next: Check saved review history →',
  },
  {
    step: 5,
    title: 'Immutable Audit History',
    badge: 'Step 5 of 5 • Saved review history',
    route: '/app/audit',
    pageName: 'Saved review history',
    whatToLookFor:
      'See every action permanently recorded: who decided what, the exact timestamp, the previous and new status, and the mandatory justification note.',
    reviewerCheck:
      'Confirm that decisions cannot be silently altered or backdated.',
    governingRule: 'Integrity: Tamper-evident saved review history with full reviewer accountability.',
    nextButtonLabel: 'Finish tour ✓',
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
  const navigate = useNavigate();
  const location = useLocation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (isControlled && externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, externalOnClose]);

  const goToStep = useCallback(
    (stepIdx: number) => {
      const target = DYNAMIC_STEPS[stepIdx];
      if (target) {
        setCurrentStepIndex(stepIdx);
        navigate(target.route);
      }
    },
    [navigate]
  );

  const nextStep = useCallback(() => {
    if (currentStepIndex < DYNAMIC_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      handleClose();
    }
  }, [currentStepIndex, goToStep, handleClose]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, goToStep]);

  // Sync step index if user manually navigated to one of the target routes
  useEffect(() => {
    const matchedIdx = DYNAMIC_STEPS.findIndex((s) => {
      if (s.route === '/app/case/CASE-1014') {
        return location.pathname.startsWith('/app/case');
      }
      return location.pathname === s.route;
    });
    if (matchedIdx !== -1 && matchedIdx !== currentStepIndex) {
      setCurrentStepIndex(matchedIdx);
    }
  }, [location.pathname, currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        goToStep(parseInt(e.key, 10) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, nextStep, prevStep, goToStep]);

  if (!isOpen) return null;

  const currentStep = DYNAMIC_STEPS[currentStepIndex];

  return (
    <div
      role="region"
      aria-label="Interactive room guide tour"
      data-testid="how-to-use-room-guide"
      className={`fixed bottom-6 right-6 z-50 w-full max-w-md bg-canvas border border-ink/40 shadow-2xl rounded-xs overflow-hidden font-sans transition-all duration-200 ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-rule">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brass animate-pulse" />
          <span className="text-xs font-mono tracking-wider text-ink font-semibold uppercase">
            Room Guide &bull; Step {currentStep.step} of {DYNAMIC_STEPS.length}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="text-ink-secondary hover:text-ink px-1.5 py-0.5 rounded-xs"
            title={isMinimized ? 'Expand tour guide' : 'Minimize tour guide'}
          >
            {isMinimized ? '[Expand]' : '[_]'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="text-ink-secondary hover:text-ink px-1.5 py-0.5 rounded-xs"
            title="Close guided tour (Escape)"
          >
            [Esc]
          </button>
        </div>
      </div>

      {/* Step Tabs for direct navigation */}
      <div className="grid grid-cols-5 border-b border-rule bg-canvas text-center text-[10px] font-mono">
        {DYNAMIC_STEPS.map((s, idx) => (
          <button
            key={s.step}
            type="button"
            onClick={() => goToStep(idx)}
            className={`py-2 border-r last:border-r-0 border-rule transition-colors ${
              idx === currentStepIndex
                ? 'bg-surface font-semibold text-ink border-b-2 border-b-brass'
                : 'text-ink-secondary hover:bg-surface/50'
            }`}
          >
            0{s.step}
          </button>
        ))}
      </div>

      {/* Content Body (collapsible) */}
      {!isMinimized && (
        <div className="p-5 space-y-3.5 text-xs text-ink">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-ink-secondary">
              <span className="text-brass font-medium">{currentStep.badge}</span>
              <span>Active route: {currentStep.route}</span>
            </div>
            <h3 className="font-editorial text-xl font-medium text-ink leading-snug">
              {currentStep.title}
            </h3>
          </div>

          <p className="text-ink leading-relaxed">
            {currentStep.whatToLookFor}
          </p>

          <div className="p-3 bg-surface border border-rule rounded-xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-secondary block font-semibold">
              What to check here:
            </span>
            <p className="text-[11px] text-ink leading-normal">
              {currentStep.reviewerCheck}
            </p>
          </div>

          <div className="text-[10px] font-mono text-ink-muted italic border-l-2 border-brass pl-2 py-0.5">
            {currentStep.governingRule}
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-rule flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="px-2.5 py-1.5 border border-rule hover:bg-surface text-ink-secondary hover:text-ink font-mono text-xs rounded-xs disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              &larr; Prev
            </button>

            <button
              type="button"
              data-testid="guide-next-btn"
              onClick={nextStep}
              className="px-3.5 py-1.5 bg-ink text-canvas hover:bg-ink/90 font-medium text-xs rounded-xs transition-colors shadow-subtle flex items-center gap-1.5"
            >
              <span>{currentStep.nextButtonLabel}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
