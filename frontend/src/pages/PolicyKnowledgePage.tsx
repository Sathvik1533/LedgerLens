import React, { useState, useEffect } from 'react';
import { fetchPolicyCorpus, queryPolicyCorpus } from '../api/client';
import { PolicyCorpusResponse, PolicySearchResult, PolicyDocument } from '../types/api';

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

const getHumanDocTitle = (filename: string, fallback: string = 'Approved rule') => {
  if (filename.includes('fee')) return 'Provider fee and tax rule';
  if (filename.includes('exception')) return 'Missing payout time limit';
  if (filename.includes('settlement')) return 'Bank credit check';
  return fallback;
};

const sanitizeRuleText = (text: string): string => {
  return text
    // Remove markdown headers #, ##, ###, ####
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markdown markers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Replace raw database field names with plain English
    .replace(/\bpayment\.settlement_id\b/g, 'payment payout reference')
    .replace(/\bbank_credit\.credited_amount\b/g, 'bank credit amount')
    .replace(/\bsettlement\.net_settlement_amount\b/g, 'provider payout amount')
    .replace(/\bsettlement\.fee_amount\b/g, 'provider fee amount')
    .replace(/\bsettlement\.tax_amount\b/g, 'tax on fee amount')
    .replace(/\bsettlement\.refund_amount\b/g, 'refund deduction')
    .replace(/\bbank_credit\.bank_reference\b/g, 'bank reference number (UTR)')
    .replace(/\bsettlement_id\b/g, 'payout reference')
    .replace(/\border_id\b/g, 'order reference')
    // Replace internal exception codes with plain English
    .replace(/\bmissing_settlement\b/g, 'missing provider payout')
    .replace(/\bmissing_bank_credit\b/g, 'bank payment not received')
    .replace(/\bamount_mismatch\b/g, 'amount difference')
    .replace(/\bfee_mismatch\b/g, 'provider fee or tax difference')
    .replace(/\bduplicate_payment\b/g, 'duplicate customer payment')
    .replace(/\bduplicate_bank_credit\b/g, 'duplicate bank credit')
    .replace(/\bpartial_refund_not_reflected\b/g, 'undeducted refund')
    .replace(/\bambiguous_match\b/g, 'multiple potential matches')
    .replace(/\bneeds_review\b/g, 'requires human review')
    .replace(/\bauto_reconciled\b/g, 'matched automatically')
    // Remove metadata lines like source: ... or Version: ...
    .replace(/^source:.*$/gm, '')
    .replace(/^Version:.*$/gm, '')
    .replace(/^Status:.*$/gm, '')
    .trim();
};

export const PolicyKnowledgePage: React.FC = () => {
  const [corpusData, setCorpusData] = useState<PolicyCorpusResponse | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<PolicyDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<PolicySearchResult | null>(null);
  const [searchTimestamp, setSearchTimestamp] = useState<string | null>(null);

  const loadCorpus = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPolicyCorpus();
      setCorpusData(data);
      if (data.documents && data.documents.length > 0) {
        setSelectedDoc(data.documents[0]);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCorpus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await queryPolicyCorpus(searchQuery.trim(), 4);
      setSearchResult(res);
      setSearchTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      alert(`Policy search failed: ${err.message || 'Error'}`);
    } finally {
      setIsSearching(false);
    }
  };

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

      {/* 3. Collapsed Technical Details Section */}
      <details className="border border-rule rounded-xs bg-surface/50 text-xs font-mono text-ink-secondary">
        <summary className="cursor-pointer hover:text-ink select-none font-medium px-4 py-3 text-xs font-mono">
          Technical details
        </summary>
        <div className="p-5 pt-2 border-t border-rule space-y-6">
          {/* Policy Search Tool */}
          <div className="space-y-3">
            <span className="font-sans text-xs font-semibold text-ink block">
              Search approved rules
            </span>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule passages..."
                className="flex-1 px-3 py-1.5 border border-rule bg-canvas text-ink text-xs font-sans rounded-xs focus:outline-none focus:border-ink"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-1.5 bg-ink text-canvas text-xs font-medium rounded-xs transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResult && (
              <div className="space-y-3 pt-2">
                <div className="text-[11px] text-ink-muted">
                  Matched passages: {searchResult.matched_chunks.length} {searchTimestamp && `at ${searchTimestamp}`}
                </div>
                {searchResult.matched_chunks.map((chunk, idx) => (
                  <div key={idx} className="p-3 bg-canvas border border-rule rounded-xs space-y-1.5 text-xs font-sans">
                    <div className="font-semibold text-ink text-xs">
                      {getHumanDocTitle(chunk.source_file)}
                    </div>
                    <p className="text-ink-secondary text-xs italic">
                      &ldquo;{sanitizeRuleText(chunk.text)}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw documents corpus browser */}
          <div className="space-y-3 pt-3 border-t border-rule">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-ink block">
                Rule documents corpus
              </span>
              <button
                onClick={loadCorpus}
                disabled={isLoading}
                className="text-[11px] text-link hover:underline"
              >
                {isLoading ? 'Loading...' : 'Reload corpus'}
              </button>
            </div>

            {corpusData && corpusData.documents && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {corpusData.documents.map((doc) => (
                    <button
                      key={doc.filename}
                      onClick={() => setSelectedDoc(doc)}
                      className={`px-2.5 py-1 text-[11px] rounded-xs border transition-colors ${
                        selectedDoc?.filename === doc.filename
                          ? 'bg-ink text-canvas border-ink font-medium'
                          : 'bg-canvas text-ink-secondary border-rule hover:text-ink'
                      }`}
                    >
                      {getHumanDocTitle(doc.filename, doc.title)}
                    </button>
                  ))}
                </div>

                {selectedDoc && (
                  <div className="p-3 bg-surface-evidence border border-rule rounded-xs space-y-1 overflow-x-auto max-h-80">
                    <div className="text-[10px] text-ink-muted">Source: {selectedDoc.filename}</div>
                    <pre className="font-mono text-[11px] text-ink whitespace-pre-wrap leading-relaxed">
                      {selectedDoc.content}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Technical Retrieval Parameters */}
          <div className="space-y-1 pt-3 border-t border-rule text-[11px] text-ink-muted">
            <div>Model: Local sentence embedding index (MiniLM-L6-v2)</div>
            <div>Corpus boundary: Read-only local financial SOP repository</div>
          </div>
        </div>
      </details>
    </div>
  );
};

export default PolicyKnowledgePage;
