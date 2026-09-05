import React, { useState, useEffect } from 'react';
import { InvestigationResult } from '../types/api';
import { investigateCase } from '../api/client';

interface PolicyNoteProps {
  caseId: string;
  autoRun?: boolean;
}

const getPolicySopCode = (filename: string = '', fallback: string = 'SOP-2026-FEE-01') => {
  if (filename.includes('fee')) return 'SOP-2026-FEE-01';
  if (filename.includes('exception')) return 'SOP-2026-ESC-02';
  if (filename.includes('settlement')) return 'SOP-2026-BNK-03';
  return fallback;
};

const getHumanRuleGuidance = (summary: string = '', exceptionType?: string) => {
  const lower = (summary + ' ' + (exceptionType || '')).toLowerCase();
  
  if (lower.includes('bank') && (lower.includes('duplicate') || lower.includes('twice') || lower.includes('shadow'))) {
    return {
      meaning: 'Bank payment may appear twice in the statement.',
      whatToCheck: 'The reviewer should compare the two bank entries and confirm whether the second payment is a duplicate.',
      nextStep: 'Next step: verify the bank statement and mark the extra entry for reversal if confirmed.',
      sopCode: 'SOP-2026-BNK-03',
    };
  }
  if (lower.includes('missing_settlement') || lower.includes('missing provider payout') || lower.includes('unremitted') || lower.includes('waiting')) {
    return {
      meaning: 'Provider payout has not arrived for this customer payment.',
      whatToCheck: 'Check whether the payment was captured with the provider and if the 2-day waiting period has passed.',
      nextStep: 'Next step: allow the waiting period to complete, or escalate to provider operations if delayed past 5 days.',
      sopCode: 'SOP-2026-ESC-02',
    };
  }
  if (lower.includes('missing_bank_credit') || lower.includes('bank payment not received') || lower.includes('deposit')) {
    return {
      meaning: 'Bank payment not received in the bank account.',
      whatToCheck: 'Check bank statement for the provider reference number (UTR) and verify deposit status.',
      nextStep: 'Next step: follow up with the bank using the provider reference number to trace the credit.',
      sopCode: 'SOP-2026-BNK-03',
    };
  }
  if (lower.includes('fee') || lower.includes('tax') || lower.includes('mdr')) {
    return {
      meaning: 'Provider fee or tax is different from the standard rate (2% fee + 18% tax).',
      whatToCheck: 'Calculate the expected 2.0% fee + 18% tax and verify if the provider deducted an extra amount.',
      nextStep: 'Next step: approve if an agreed commercial rate applies, or request a credit adjustment from the provider.',
      sopCode: 'SOP-2026-FEE-01',
    };
  }
  if (lower.includes('refund') || lower.includes('partial_refund')) {
    return {
      meaning: 'Customer refund is missing from the provider payout calculation.',
      whatToCheck: 'Verify that the customer refund was cleared and compare it against the net payout deduction.',
      nextStep: 'Next step: adjust the net payout record and reclaim the missing refund in the next provider payout cycle.',
      sopCode: 'SOP-2026-ESC-02',
    };
  }
  if (lower.includes('duplicate_payment') || lower.includes('billed twice') || lower.includes('customer paid twice')) {
    return {
      meaning: 'Customer appears to have been charged twice for the same order.',
      whatToCheck: 'Verify if two separate payment references exist for the exact same order reference.',
      nextStep: 'Next step: verify the double charge and issue an immediate refund to the customer for the extra payment.',
      sopCode: 'SOP-2026-FEE-01',
    };
  }
  if (lower.includes('ambiguous') || lower.includes('multiple matches')) {
    return {
      meaning: 'More than one provider payout matches this customer payment.',
      whatToCheck: 'Compare timestamps, payment reference numbers, and batch identifiers across candidate records.',
      nextStep: 'Next step: select and link the matching provider payout record to close the case.',
      sopCode: 'SOP-2026-FEE-01',
    };
  }

  return {
    meaning: 'The reported payout does not match the expected calculation.',
    whatToCheck: 'Review customer payment, provider payout, customer refund, and bank credit records for differences.',
    nextStep: 'Next step: verify the difference against the approved commercial policy and record your decision.',
    sopCode: 'SOP-2026-FEE-01',
  };
};

export const RagCopilotPanel: React.FC<PolicyNoteProps> = ({ caseId, autoRun = true }) => {
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolicyGuidance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await investigateCase(caseId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Approved rule guidance currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoRun && caseId) {
      loadPolicyGuidance();
    }
  }, [caseId, autoRun]);

  const guidance = getHumanRuleGuidance(result?.summary || '', (result as any)?.exception_type);
  const primarySop = result?.citations?.[0]?.source_file 
    ? getPolicySopCode(result.citations[0].source_file, guidance.sopCode)
    : guidance.sopCode;

  return (
    <div className="border border-rule bg-surface p-5 rounded-xs space-y-4 font-sans margin-note">
      {/* Header Bar */}
      <div className="flex items-start justify-between border-b border-rule/70 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brass" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-brass font-semibold">
              Approved operating rule
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-canvas border border-rule text-ink-secondary rounded-xs">
              Policy reference: {primarySop}
            </span>
          </div>
          <h3 className="font-editorial text-lg font-medium text-ink block">
            Approved rule guidance
          </h3>
        </div>

        <button
          onClick={loadPolicyGuidance}
          disabled={isLoading}
          className="text-[11px] font-mono text-ink-secondary hover:text-ink underline disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Check again'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-4 text-xs font-mono text-ink-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brass animate-ping" />
          <span>Checking approved rules...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-xs text-critical font-mono py-2">
          {error}
        </div>
      )}

      {/* Result body — clean plain-English only */}
      {!isLoading && (
        <div className="space-y-3.5 text-xs text-ink leading-relaxed">
          {/* 1. What the difference means */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block font-semibold">
              What the difference means
            </span>
            <p className="text-ink font-normal">
              {guidance.meaning}
            </p>
          </div>

          {/* 2. What the reviewer should check */}
          <div className="space-y-1 p-3 bg-canvas border border-rule rounded-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block font-semibold">
              What the reviewer should check
            </span>
            <p className="text-ink font-normal">
              {guidance.whatToCheck}
            </p>
          </div>

          {/* 3. What should happen next */}
          <div className="space-y-1 p-3 bg-surface border border-rule/70 rounded-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block font-semibold">
              What should happen next
            </span>
            <p className="text-ink font-medium">
              {guidance.nextStep}
            </p>
          </div>

          {/* Mandatory Rule Invariant Footer */}
          <div className="pt-2 border-t border-rule/60 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-ink-muted gap-1">
            <span>Policy reference: {primarySop}</span>
            <span className="text-ink-secondary font-medium">Guidance only. A human reviewer makes the final decision.</span>
          </div>
        </div>
      )}
    </div>
  );
};
