import React from 'react';

interface ApprovedRuleCard {
  id: string;
  title: string;
  sopCode: string;
  explanation: string;
  whatToCheck: string;
  nextSteps: string;
}

const APPROVED_RULES: ApprovedRuleCard[] = [
  {
    id: 'rule-payout-limit',
    title: 'Missing payout time limit',
    sopCode: 'SOP-2026-ESC-02',
    explanation:
      'When a customer payment is received, the provider payout should arrive within 2 business days. If no payout record arrives in that time, the case is flagged for attention.',
    whatToCheck:
      'Check provider records against the 2-day waiting period. Confirm whether the customer payment was captured with the provider and verify whether the payout is delayed or in transit.',
    nextSteps:
      'If the payment is captured, allow the waiting period to complete. If the payout record remains missing after 5 business days, escalate to the payment provider operations team.',
  },
  {
    id: 'rule-fee-tax',
    title: 'Provider fee and tax rule',
    sopCode: 'SOP-2026-FEE-01',
    explanation:
      'The provider fee is exactly 2.00% of the customer payment amount, plus 18.00% tax on the fee. The expected payout equals the payment minus fees, taxes, and any customer refunds.',
    whatToCheck:
      'Apply the standard 2.0% fee + 18% tax calculation. If the provider deduction differs from the expected payout by more than ₹0.01, verify the difference or escalate.',
    nextSteps:
      'If the difference matches an approved commercial tier or waiver, approve with an explanatory note. Otherwise, contact the provider to issue a credit adjustment for the overcharged amount.',
  },
  {
    id: 'rule-bank-check',
    title: 'Bank credit check',
    sopCode: 'SOP-2026-BNK-03',
    explanation:
      'A payout is only complete when the money arrives in the bank account and has a verified bank reference number. Every provider payout must correspond to exactly one bank credit.',
    whatToCheck:
      'Verify the bank reference number (UTR) and credit amount in the bank statement before marking the transaction as fully resolved.',
    nextSteps:
      'If the bank deposit has not arrived, follow up with the bank using the provider\'s reference. If the payment appears twice in the bank statement, mark the duplicate credit entry for reversal.',
  },
];

export const PolicyKnowledgePage: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-8 font-sans">
      {/* 1. Masthead */}
      <div className="space-y-1 border-b border-rule pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
          <span className="text-ink font-semibold">Standard Operating Rules</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
          Approved rules
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans max-w-2xl leading-relaxed">
          These rules explain why a case needs attention and what a reviewer should check. The guidance explains the rule. A person still makes the final decision.
        </p>
      </div>

      {/* 2. Primary View: Clean Approved Policy Cards ONLY */}
      <div className="space-y-6">
        {APPROVED_RULES.map((rule) => (
          <div
            key={rule.id}
            className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle"
          >
            {/* Card Header: Title, SOP Code, Approved Tag */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-rule pb-3 gap-2">
              <div>
                <h2 className="font-editorial text-xl font-medium text-ink">
                  {rule.title}
                </h2>
                <span className="text-[11px] font-mono text-ink-muted block mt-0.5">
                  Reference: {rule.sopCode}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-ledger-green/10 text-ledger-green border border-ledger-green/30 rounded-xs self-start sm:self-auto">
                Approved rule
              </span>
            </div>

            {/* Card Body: Explanation, What to check, What should happen next */}
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block font-semibold">
                  Rule explanation
                </span>
                <p className="text-ink leading-relaxed">
                  {rule.explanation}
                </p>
              </div>

              <div className="space-y-1 p-3.5 bg-canvas border border-rule rounded-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block font-semibold">
                  What the reviewer should check
                </span>
                <p className="text-ink leading-relaxed">
                  {rule.whatToCheck}
                </p>
              </div>

              <div className="space-y-1 p-3.5 bg-surface border border-rule/70 rounded-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block font-semibold">
                  What should happen next
                </span>
                <p className="text-ink leading-relaxed">
                  {rule.nextSteps}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted border-t border-rule/40 pt-3">
              <span>Read-only guidance</span>
              <span>A human reviewer makes the final decision</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyKnowledgePage;
