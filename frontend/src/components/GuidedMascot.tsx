import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export type GuideInquiry = 'what' | 'next' | 'technical';

export interface GuideTopic {
  title: string;
  badge: 'Verified Match' | 'Policy Guidance' | 'Synthetic Test Data' | 'Planned';
  what: string;
  next: string;
  technical: string;
}

const LEDGERLENS_GUIDANCE: Record<string, GuideTopic> = {
  queue: {
    title: 'Review Queue',
    badge: 'Verified Match',
    what: 'This queue collects payment discrepancies that need human review, ranked by difference amount.',
    next: 'Select the case with the largest discrepancy to compare transaction records and take action.',
    technical: 'Deterministic matching runs Python Decimal math over payments, settlements, refunds, and bank credits. Clean matches bypass review; anomalies trigger one of 8 closed exception classes.'
  },
  case: {
    title: 'Payment Details & History',
    badge: 'Verified Match',
    what: 'A side-by-side view comparing customer payment, provider payout, refund, and bank statement records.',
    next: 'Check the amount difference and review policy guidance for recommended next steps.',
    technical: 'Data is loaded via read-only SQL queries. Optimistic concurrency uses a case version integer to prevent double-reviewer collisions (HTTP 409).'
  },
  rag: {
    title: 'Policy Guidance',
    badge: 'Policy Guidance',
    what: 'A helpful guide explaining approved operating rules and guidelines for this payment difference.',
    next: 'Review the policy note and verify whether the fee deduction or refund matches contracted rates.',
    technical: 'Retriever embeds local SOP markdown files using sentence-transformers (all-MiniLM-L6-v2). The LLM is strictly advisory—it never updates ledger balances or makes approvals.'
  },
  decision: {
    title: 'Reviewer Decision',
    badge: 'Verified Match',
    what: 'The review panel where a finance controller approves, rejects, or flags the discrepancy.',
    next: 'Select a resolution action, enter your explanation note, and save your decision.',
    technical: 'Submitting increments case.version in PostgreSQL and records an immutable audit trail entry with your reviewer ID and timestamp.'
  },
  audit: {
    title: 'Activity History',
    badge: 'Verified Match',
    what: 'A permanent record of all reviewer actions, automated checks, and adjustments.',
    next: 'Filter events by reviewer or case ID to trace past decisions or export records for compliance.',
    technical: 'Audit events are stored as immutable PostgreSQL records linked to case UUIDs with timestamps, actors, previous state, and rationale.'
  },
  evaluation: {
    title: 'Reconciliation Health & Accuracy',
    badge: 'Synthetic Test Data',
    what: 'Verification benchmark testing the reconciliation engine across 60 sample payment scenarios.',
    next: 'Review the benchmark report showing 100% precision, automatic match rate, and processing speed.',
    technical: 'Generated via generator_fixture.py with known ground truth seeds. Contains 100% synthetic data with zero real banking PII.'
  },
  default: {
    title: 'LedgerLens Copilot',
    badge: 'Verified Match',
    what: 'LedgerLens helps finance teams automatically verify payments and resolve discrepancies with policy-guided recommendations.',
    next: 'Go to Review Queue to resolve payment discrepancies or View Benchmark to see accuracy metrics.',
    technical: 'Built with React 18, FastAPI, PostgreSQL 15, and local vector retrieval. Financial math uses Python Decimal with 0 false approvals.'
  }
};

export const GuidedMascot: React.FC = () => {
  const location = useLocation();
  const [topicKey, setTopicKey] = useState<string>('default');
  const [inquiry, setInquiry] = useState<GuideInquiry>('what');
  const [minimized, setMinimized] = useState<boolean>(() => {
    return localStorage.getItem('ledgerlens_mascot_minimized') === 'true';
  });
  const [dismissed, setDismissed] = useState<boolean>(false);
  const lastEventTime = useRef<number>(0);

  // Update topic based on route safely
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/queue')) setTopicKey('queue');
    else if (path.includes('/case/')) setTopicKey('case');
    else if (path.includes('/audit')) setTopicKey('audit');
    else if (path.includes('/evaluation') || path.includes('/evidence')) setTopicKey('evaluation');
    else setTopicKey('default');
  }, [location.pathname]);

  // Safe semantic event listener for UI interactions (rate-limited)
  useEffect(() => {
    const handleSafeGuideEvent = (e: MouseEvent | FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const guideData = target.closest('[data-guide]')?.getAttribute('data-guide');
      if (guideData && LEDGERLENS_GUIDANCE[guideData]) {
        const now = Date.now();
        if (now - lastEventTime.current > 1500) { // rate limit to 1.5s
          lastEventTime.current = now;
          setTopicKey(guideData);
        }
      }
    };

    document.addEventListener('mouseover', handleSafeGuideEvent, { passive: true });
    document.addEventListener('focusin', handleSafeGuideEvent, { passive: true });
    return () => {
      document.removeEventListener('mouseover', handleSafeGuideEvent);
      document.removeEventListener('focusin', handleSafeGuideEvent);
    };
  }, []);

  const handleMinimize = (state: boolean) => {
    setMinimized(state);
    localStorage.setItem('ledgerlens_mascot_minimized', String(state));
  };

  if (dismissed) return null;

  const topic = LEDGERLENS_GUIDANCE[topicKey] || LEDGERLENS_GUIDANCE.default;

  return (
    <aside
      aria-label="Context-Aware Product Guide"
      className="fixed bottom-5 right-5 z-50 font-sans text-xs transition-all duration-300 pointer-events-auto"
      style={{ maxWidth: minimized ? 'auto' : '360px' }}
    >
      {minimized ? (
        <button
          onClick={() => handleMinimize(false)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 px-3.5 py-2 rounded-full shadow-xl shadow-black/40 backdrop-blur-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Expand Product Guide"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-medium tracking-wide">Guide</span>
        </button>
      ) : (
        <div
          role="region"
          aria-live="polite"
          className="bg-slate-950/95 border border-slate-800 text-slate-200 rounded-xl shadow-2xl shadow-black/60 p-4 backdrop-blur-lg flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-100 text-sm">{topic.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleMinimize(true)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800/60 focus:outline-none"
                aria-label="Minimize Guide"
                title="Minimize"
              >
                _
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800/60 focus:outline-none"
                aria-label="Dismiss Guide for Session"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded tracking-wider ${
                topic.badge === 'Verified Match'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : topic.badge === 'Policy Guidance'
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
              }`}
            >
              [{topic.badge}]
            </span>
          </div>

          {/* Content Body */}
          <div className="text-slate-300 text-xs leading-relaxed min-h-[44px]">
            {inquiry === 'what' && topic.what}
            {inquiry === 'next' && topic.next}
            {inquiry === 'technical' && topic.technical}
          </div>

          {/* 3 Inquiry Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setInquiry('what')}
              className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors text-center ${
                inquiry === 'what'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              What is this?
            </button>
            <button
              onClick={() => setInquiry('next')}
              className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors text-center ${
                inquiry === 'next'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              Next step?
            </button>
            <button
              onClick={() => setInquiry('technical')}
              className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors text-center ${
                inquiry === 'technical'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              Technical
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
