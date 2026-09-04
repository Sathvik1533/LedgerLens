import React, { useState, useEffect } from 'react';
import { fetchPolicyCorpus, queryPolicyCorpus } from '../api/client';
import { PolicyCorpusResponse, PolicySearchResult, PolicyDocument } from '../types/api';
import { CalibratedAccordion } from '../components/ui/CalibratedAccordion';

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
            <span>GOVERNANCE &amp; PRECEDENT</span>
            <span>&bull;</span>
            <span className="text-ink font-semibold">Standard Operating Procedures</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
            Approved policy library
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary font-sans max-w-2xl leading-relaxed">
            Verified operating rules, commercial fee agreements, SLA standards, and manual override conditions. Policy guidance operates on read-only authority to inform human review decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCorpus}
            disabled={isLoading}
            className="px-3.5 py-2 border border-rule bg-surface hover:bg-canvas text-ink text-xs font-medium rounded-xs transition-colors"
          >
            {isLoading ? 'Reloading...' : 'Reload library corpus'}
          </button>
        </div>
      </div>

      {/* 2. Policy Search Form */}
      <div className="border border-rule bg-surface p-6 rounded-xs space-y-4 shadow-subtle">
        <div className="border-b border-rule pb-3 space-y-0.5">
          <span className="font-editorial text-xl font-medium text-ink block">
            Search approved operating rules
          </span>
          <p className="text-xs text-ink-secondary">
            Enter a scenario or question to retrieve verified contractual passages and resolution steps.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. fee calculation, missing settlement SLA, refund clawback rules..."
              className="flex-1 px-3.5 py-2 border border-rule bg-canvas text-ink text-xs font-sans rounded-xs focus:outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-2 bg-ink hover:bg-ink/90 text-canvas text-xs font-medium rounded-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isSearching ? 'Searching rules...' : 'Search approved operating rules'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-4 pt-3 border-t border-rule">
            <div className="flex items-center justify-between text-xs font-mono text-ink-secondary">
              <span>Matched passages ({searchResult.matched_chunks.length})</span>
              {searchTimestamp && <span>Query executed at {searchTimestamp}</span>}
            </div>

            {searchResult.matched_chunks.length === 0 ? (
              <div className="p-4 bg-brass/10 border border-brass/30 rounded-xs text-xs text-ink space-y-1">
                <strong className="block text-brass">No verified passages matched with sufficient confidence</strong>
                <p className="text-ink-secondary text-[11px]">
                  The policy engine suppressed low-confidence results to prevent ungrounded interpretation. Consult the full policy documents below.
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
                      <span className="font-semibold text-ink">Citation: {chunk.source_file} (Lines {chunk.line_start}&ndash;{chunk.line_end})</span>
                      <span className="text-ledger-green font-medium px-1.5 py-0.5 bg-ledger-green/10 rounded-xs">Verified Rule</span>
                    </div>

                    {/* Exact Policy Rule */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                        Exact Contractual Clause
                      </span>
                      <p className="font-sans text-xs text-ink leading-relaxed bg-canvas p-3 border border-rule/60 rounded-xs italic">
                        &ldquo;{chunk.text}&rdquo;
                      </p>
                    </div>

                    {/* What it means for the operator */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono uppercase text-ink-secondary block">
                        Operator Guidance &amp; Recommended Action
                      </span>
                      <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                        {chunk.source_file.includes('fee') && 'Apply contractual 2.0% fee + 18% GST formula. If gateway deduction exceeds contracted net by > ₹0.01, raise a dispute or approve an authorized commercial waiver.'}
                        {chunk.source_file.includes('exception') && 'Review counterparty documentation against T+2 aging limits. Missing records require acquirer trace before manual sign-off.'}
                        {chunk.source_file.includes('settlement') && 'Verify institutional bank statement credit UTR before marking transaction as fully reconciled.'}
                        {!chunk.source_file.includes('fee') && !chunk.source_file.includes('exception') && !chunk.source_file.includes('settlement') && 'Consult governing contract terms before manual reconciliation override.'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted border-t border-rule/40 pt-2">
                      <span>Authority: Read-only governance</span>
                      <span>Immutable policy precedent</span>
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
              Policy Documents ({corpusData.documents.length})
            </span>

            <div className="space-y-1.5">
              {corpusData.documents.map((doc) => {
                const isSelected = selectedDoc?.filename === doc.filename;
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
                    <span className="truncate pr-2">{doc.title}</span>
                    <span className="font-mono text-[10px] text-ink-muted">{doc.line_count}L</span>
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
                    {selectedDoc.title}
                  </span>
                  <span className="font-mono text-xs text-ink-secondary">
                    File: {selectedDoc.filename} &bull; {selectedDoc.line_count} lines
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
                Select a policy document on the left to inspect full text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Authoritative SOP Key Provisions (Calibrated Accordion) */}
      <section className="space-y-4 pt-6 border-t border-rule">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-secondary block">
            STANDARD OPERATING PROCEDURES &bull; ACTIVE RECONCILIATION CODES
          </span>
          <h2 className="font-editorial text-2xl font-medium text-ink">
            Core contract invariants &amp; escalation thresholds
          </h2>
        </div>

        <CalibratedAccordion
          allowMultiple={false}
          items={[
            {
              id: 'sop-fee-01',
              title: 'SOP-2026-FEE-01: Commercial Gateway Fee & Tax Computation',
              subtitle: 'Mandatory contractual fee deductions on gross captured settlement',
              defaultOpen: true,
              content: (
                <div className="space-y-3">
                  <p>
                    Standard commercial agreements dictate a Merchant Discount Rate (MDR) of exactly 2.00% levied on gross captured payment amounts, plus an 18.00% Goods & Services Tax (GST) applied strictly to the fee sum:
                  </p>
                  <div className="p-3 bg-canvas border border-rule rounded-xs font-mono text-xs">
                    Fee = Gross &times; 0.02 | Tax = Fee &times; 0.18 | Expected Net = Gross - Fee - Tax - Refunds
                  </div>
                  <p>
                    Any variance exceeding ₹0.01 between reported net payout and contracted expected net constitutes a material breach requiring gateway dispute issuance.
                  </p>
                </div>
              ),
            },
            {
              id: 'sop-esc-02',
              title: 'SOP-2026-ESC-02: Unmatched Settlement Payout SLA Escalation',
              subtitle: 'Aging limits and inter-bank nodal verification timelines',
              content: (
                <div className="space-y-3">
                  <p>
                    Where a payment is marked as captured in the merchant register but lacks a corresponding gateway settlement line item after T+2 business days, the transaction must be flagged as <code>missing_settlement</code>.
                  </p>
                  <p>
                    Controllers must verify payment capture status with the primary acquirer prior to manual waiver approval. Unverified settlements older than 5 business days trigger automated nodal alert escalations.
                  </p>
                </div>
              ),
            },
            {
              id: 'sop-bank-03',
              title: 'SOP-2026-BNK-03: Bank Credit Statement & UTR Verification Protocol',
              subtitle: 'Single source of truth for institutional cash receipt',
              content: (
                <div className="space-y-3">
                  <p>
                    A settlement cannot be marked as fully reconciled without a verified Unique Transaction Reference (UTR) logged in the institutional banking feed. Duplicate bank credit entries sharing an identical settlement batch reference require nodal reconciliation reversing the shadow credit.
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
