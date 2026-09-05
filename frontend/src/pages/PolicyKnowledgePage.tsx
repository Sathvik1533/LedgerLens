import React, { useState, useEffect } from 'react';
import { fetchPolicyCorpus, queryPolicyCorpus } from '../api/client';
import { PolicyCorpusResponse, PolicySearchResult, PolicyDocument } from '../types/api';
import { CalibratedAccordion } from '../components/ui/CalibratedAccordion';

const getHumanDocTitle = (filename: string, fallback: string) => {
  if (filename.includes('fee')) return 'Provider fee and tax rule';
  if (filename.includes('exception')) return 'Missing payout time limit';
  if (filename.includes('settlement')) return 'Bank credit check';
  return fallback;
};

export const PolicyKnowledgePage: React.FC = () => {
  const [corpusData, setCorpusData] = useState<PolicyCorpusResponse | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<PolicyDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('What is the contractual fee formula for standard gateway settlement?');
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
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-10 font-sans">
      {/* 1. Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-rule pb-6">
        <div className="space-y-1">
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

        <div className="flex items-center gap-3">
          <button
            onClick={loadCorpus}
            disabled={isLoading}
            className="px-3.5 py-2 border border-rule bg-surface hover:bg-canvas text-ink text-xs font-medium rounded-xs transition-colors"
          >
            {isLoading ? 'Reloading...' : 'Reload rules'}
          </button>
        </div>
      </div>

      {/* 2. Policy Search Form */}
      <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle">
        <div className="border-b border-rule pb-3 space-y-0.5">
          <span className="font-editorial text-xl font-medium text-ink block">
            Search approved rules
          </span>
          <p className="text-xs text-ink-secondary">
            Enter a scenario or question to see what the rule says and what to check next.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. fee calculation, missing provider payout, refund deduction..."
              className="flex-1 px-3.5 py-2 border border-rule bg-canvas text-ink text-xs font-sans rounded-xs focus:outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-2 bg-ink hover:bg-ink/90 text-canvas text-xs font-medium rounded-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isSearching ? 'Searching rules...' : 'Search approved rules'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-4 pt-3 border-t border-rule">
            <div className="flex items-center justify-between text-xs font-mono text-ink-secondary">
              <span>Matched passages ({searchResult.matched_chunks.length})</span>
              {searchTimestamp && <span>Searched at {searchTimestamp}</span>}
            </div>

            {searchResult.matched_chunks.length === 0 ? (
              <div className="p-4 bg-brass/10 border border-brass/30 rounded-xs text-xs text-ink space-y-1">
                <strong className="block text-brass">No matching rule found</strong>
                <p className="text-ink-secondary text-[11px]">
                  No approved rule matched your query closely enough. Consult the full rule documents below.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResult.matched_chunks.map((chunk, i) => (
                  <div
                    key={i}
                    className="border border-rule bg-surface p-4 rounded-xs space-y-3 text-xs shadow-subtle"
                  >
                    <div className="flex items-center justify-between border-b border-rule/60 pb-2 font-mono text-[11px]">
                      <span className="font-semibold text-ink">Rule file: {chunk.source_file}</span>
                      <span className="text-ledger-green font-medium px-1.5 py-0.5 bg-ledger-green/10 rounded-xs">Approved rule</span>
                    </div>

                    {/* Exact Policy Rule */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                        Rule text
                      </span>
                      <p className="font-sans text-xs text-ink leading-relaxed bg-canvas p-3 border border-rule/60 rounded-xs italic">
                        &ldquo;{chunk.text}&rdquo;
                      </p>
                    </div>

                    {/* What it means for the operator */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                        Guidance for reviewer
                      </span>
                      <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                        {chunk.source_file.includes('fee') && 'Apply the standard 2.0% fee + 18% tax formula. If the provider deduction differs from the expected payout by more than ₹0.01, verify the difference or escalate.'}
                        {chunk.source_file.includes('exception') && 'Check provider records against the 2-day waiting period. If a record is still missing, trace it with the provider before signing off.'}
                        {chunk.source_file.includes('settlement') && 'Verify the bank reference number in the bank statement before marking the transaction as fully resolved.'}
                        {!chunk.source_file.includes('fee') && !chunk.source_file.includes('exception') && !chunk.source_file.includes('settlement') && 'Consult the approved rule before making a decision.'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted border-t border-rule/40 pt-2">
                      <span>Read-only guidance</span>
                      <span>A human reviewer makes the final decision</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Technical Retrieval Secondary Disclosure */}
            <details className="pt-2 text-[11px] font-mono text-ink-muted">
              <summary className="cursor-pointer hover:text-ink">
                View technical retrieval parameters
              </summary>
              <div className="mt-2 p-3 bg-canvas border border-rule rounded-xs space-y-1">
                <div>Model: Local sentence embedding index (MiniLM-L6-v2)</div>
                <div>Grounding threshold floor: &ge; {searchResult.grounding_floor} cosine similarity</div>
                <div>Corpus boundary: Read-only local financial SOP repository</div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* 3. Document Corpus Browser */}
      {corpusData && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* File index */}
          <div className="border border-rule bg-surface p-4 rounded-xs space-y-3">
            <span className="text-xs font-mono uppercase text-ink-secondary block">
              Approved rules ({corpusData.documents.length})
            </span>

            <div className="space-y-1.5">
              {corpusData.documents.map((doc) => {
                const isSelected = selectedDoc?.filename === doc.filename;
                const humanTitle = getHumanDocTitle(doc.filename, doc.title);
                return (
                  <button
                    key={doc.filename}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full p-2.5 text-left border rounded-xs text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-ink bg-canvas font-semibold text-ink'
                        : 'border-transparent hover:border-rule text-ink-secondary hover:text-ink'
                    }`}
                  >
                    <span className="truncate pr-2">{humanTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Content */}
          <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle">
            {selectedDoc ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
                  <span className="font-editorial text-xl font-medium text-ink">
                    {getHumanDocTitle(selectedDoc.filename, selectedDoc.title)}
                  </span>
                  <span className="font-mono text-xs text-ink-secondary">
                    Rule file: {selectedDoc.filename}
                  </span>
                </div>

                <div className="p-4 bg-surface-evidence border border-rule rounded-xs overflow-x-auto max-h-[500px]">
                  <pre className="font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed">
                    {selectedDoc.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-ink-secondary">
                Select an approved rule on the left to read the full text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Common Approved Rules (Calibrated Accordion) */}
      <section className="space-y-4 pt-6 border-t border-rule">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
            OPERATING RULES &bull; REFERENCE
          </span>
          <h2 className="font-editorial text-2xl font-medium text-ink">
            Common approved rules
          </h2>
        </div>

        <CalibratedAccordion
          allowMultiple={false}
          items={[
            {
              id: 'sop-fee-01',
              title: 'Provider fee and tax rule',
              subtitle: 'SOP-2026-FEE-01 • Standard fee and tax calculation',
              defaultOpen: true,
              content: (
                <div className="space-y-3">
                  <p>
                    The provider fee is exactly 2.00% of the customer payment amount, plus 18.00% tax on the fee:
                  </p>
                  <div className="p-3 bg-canvas border border-rule rounded-xs font-mono text-xs">
                    Fee = Payment &times; 2% | Tax = Fee &times; 18% | Expected Payout = Payment - Fee - Tax - Refunds
                  </div>
                  <p>
                    If the provider's reported payout differs from the expected amount by even ₹0.01, LedgerLens flags it for human review.
                  </p>
                </div>
              ),
            },
            {
              id: 'sop-esc-02',
              title: 'Missing payout time limit',
              subtitle: 'SOP-2026-ESC-02 • Waiting period and escalation',
              content: (
                <div className="space-y-3">
                  <p>
                    When a customer payment is received, the provider payout should arrive within 2 business days. If no payout record arrives in that time, the case is flagged as <strong>Missing provider payout</strong>.
                  </p>
                  <p>
                    The reviewer checks whether the payment was captured with the provider before making a decision. Cases open longer than 5 business days are escalated.
                  </p>
                </div>
              ),
            },
            {
              id: 'sop-bank-03',
              title: 'Bank credit check',
              subtitle: 'SOP-2026-BNK-03 • Checking bank statement credits',
              content: (
                <div className="space-y-3">
                  <p>
                    A payout is only complete when the money actually arrives in the bank account and has a bank reference number. If the bank record is missing or appears twice, a reviewer must verify what happened before closing the case.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
};

export default PolicyKnowledgePage;
