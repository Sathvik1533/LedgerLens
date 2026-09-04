import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LedgerTraceB } from '../../components/concepts/LedgerTraceB';

export const ConceptBCase: React.FC = () => {
  const [decision, setDecision] = useState<'approve' | 'reject' | 'escalate'>('approve');
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setReceipt({
        id: 'FOLIO-SEAL-2026-0903-8812',
        action: decision,
        timestamp: new Date().toISOString(),
        signer: 'Chief Financial Controller &bull; A. Patel',
        caseId: 'CAS-2026-0921-MM',
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C1B19] font-sans pb-24">
      {/* Concept Switcher Banner */}
      <div className="bg-[#EAE4D8] border-b border-[#D8D2C8] px-6 py-2 text-xs font-mono text-[#716E68] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1C1B19]" />
          <strong className="text-[#1C1B19]">CONCEPT B &bull; EDITORIAL FOLIO WORKSPACE</strong>
          <span>| Archival documentary docket, bookkeeper redline strike-throughs</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/concept/b" className="text-[#1C1B19] hover:underline font-semibold">&larr; Back to Folio Landing</Link>
          <Link to="/concepts" className="text-[#716E68] hover:underline">All Concepts &rarr;</Link>
        </div>
      </div>

      {/* Folio Docket Header */}
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-6 border-b-2 border-[#1C1B19]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B94E3D] font-bold">
              AUDIT EXCEPTION DOCKET &bull; CASE REF CAS-2026-0921-MM
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#1C1B19]">
              Reconciliation Inquest: <span className="italic">Order ORD-99218</span>
            </h1>
            <p className="text-xs font-sans text-[#716E68]">
              Docket convened for investigation of ₹150.00 fee discrepancy on standard captured checkout.
            </p>
          </div>

          <div className="border border-[#1C1B19] p-3 text-right bg-[#FCFBF8]">
            <span className="font-mono text-[10px] uppercase text-[#716E68] block">MATERIAL VARIANCE</span>
            <span className="font-mono text-xl font-bold text-[#B94E3D] tabular-nums">-₹150.00</span>
          </div>
        </div>
      </header>

      {/* Main Folio Grid */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Documentary Evidence Dossier */}
        <div className="lg:col-span-7 space-y-8">
          {/* Folio Table */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#716E68] uppercase block">
              PRIMARY LEDGER BALANCE SUMMARY
            </span>
            <LedgerTraceB hasDiscrepancy={true} />
          </div>

          {/* Evidence Slips as Documentary Folio Exhibits */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline border-b border-[#1C1B19] pb-1">
              <span className="font-editorial text-lg font-medium text-[#1C1B19]">
                Exhibits of Record (4 Traceable Instruments)
              </span>
              <span className="font-mono text-[10px] text-[#716E68]">ORIGINALS ON FILE</span>
            </div>

            {/* Exhibit 1 */}
            <div className="bg-[#FCFBF8] border border-[#D8D2C8] p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#1C1B19] font-bold border-b border-[#D8D2C8] pb-1">
                <span>EXHIBIT A &bull; Merchant Checkout Capture</span>
                <span className="text-[#3D6B55]">₹10,000.00 Gross</span>
              </div>
              <p className="font-sans text-[11px] text-[#716E68]">
                Payment reference <code className="text-[#1C1B19]">pay_01JNXK89201</code> confirmed via UPI handle at 2026-04-03 14:22:04 IST. Captured into merchant vault without exception.
              </p>
            </div>

            {/* Exhibit 2 */}
            <div className="bg-[#FCFBF8] border-2 border-[#B94E3D] p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#B94E3D] font-bold border-b border-[#B94E3D]/30 pb-1">
                <span>EXHIBIT B &bull; Gateway Settlement Report (Discrepant)</span>
                <span>₹9,614.00 Reported</span>
              </div>
              <div className="font-sans text-[11px] text-[#716E68] space-y-1">
                <p>
                  Settlement batch <code className="text-[#1C1B19]">set_01JNXK89201</code> deducted ₹200.00 MDR fee, ₹36.00 statutory GST, and an additional unexplained ₹150.00 recovery surcharge.
                </p>
                <div className="text-[#B94E3D] font-mono text-[10px] font-semibold">
                  &bull; Contract Expected: ₹9,764.00 &bull; Net Shortfall: ₹150.00
                </div>
              </div>
            </div>

            {/* Exhibit 3 */}
            <div className="bg-[#FCFBF8] border border-[#D8D2C8] p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#1C1B19] font-bold border-b border-[#D8D2C8] pb-1">
                <span>EXHIBIT C &bull; Customer Returns &amp; Reversals Register</span>
                <span className="text-[#716E68]">₹0.00 Nil</span>
              </div>
              <p className="font-sans text-[11px] text-[#716E68]">
                No credit memos, return merchandise authorizations (RMAs), or dispute notices lodged against order ORD-99218.
              </p>
            </div>

            {/* Exhibit 4 */}
            <div className="bg-[#FCFBF8] border border-[#D8D2C8] p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#1C1B19] font-bold border-b border-[#D8D2C8] pb-1">
                <span>EXHIBIT D &bull; Institutional Statement Credit</span>
                <span className="text-[#1C1B19]">₹9,614.00 Cleared</span>
              </div>
              <p className="font-sans text-[11px] text-[#716E68]">
                HDFC Current Account confirms NEFT settlement batch credit under UTR <code className="text-[#1C1B19]">202604038194</code> matching the gateway payout amount exactly.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Marginal Opinion & Sign-Off Act */}
        <div className="lg:col-span-5 space-y-8">
          {/* Regulatory Advisory */}
          <div className="border border-[#1C1B19] bg-[#FCFBF8] p-5 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#716E68] block">
              CONTRACT CLAUSE CITATION &bull; SOP-FEE-01
            </span>
            <blockquote className="font-editorial text-sm italic text-[#1C1B19] leading-relaxed border-l-2 border-[#1C1B19] pl-3">
              &ldquo;The payment service provider shall apply a fixed merchant discount rate of exactly two percent (2.0%) plus statutory GST. Under no circumstance may unauthorized manual clawbacks be withheld without forty-eight hours written notice.&rdquo;
            </blockquote>
            <div className="text-[10px] font-mono text-[#716E68] pt-2 border-t border-[#D8D2C8] flex justify-between">
              <span>Authority: Operating Agreement</span>
              <span className="text-[#3D6B55] font-semibold">Legally Binding</span>
            </div>
          </div>

          {/* Institutional Sign-Off */}
          <div className="border-2 border-[#1C1B19] bg-[#FCFBF8] p-6 space-y-5">
            <div className="border-b border-[#1C1B19] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B94E3D] block font-bold">
                MANDATORY OPERATOR ACTION
              </span>
              <h3 className="font-editorial text-2xl font-medium text-[#1C1B19] mt-0.5">
                Execute Review Decision
              </h3>
            </div>

            {receipt ? (
              <div className="p-4 border border-[#3D6B55] bg-[#3D6B55]/10 space-y-2 text-xs font-mono text-[#1C1B19]">
                <div className="text-[#3D6B55] font-bold">
                  [DATED REGISTER ENTRY SEALED]
                </div>
                <div className="text-[11px] space-y-1 pt-1 border-t border-[#3D6B55]/30">
                  <div>Seal Reference: <strong>{receipt.id}</strong></div>
                  <div>Signer: <strong>{receipt.signer}</strong></div>
                  <div>Determination: <strong className="uppercase">{receipt.action}</strong></div>
                  <div>Timestamp: <strong>{receipt.timestamp}</strong></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#716E68] block">
                    Select Adjudication Action
                  </label>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                    {[
                      { id: 'approve', label: 'Waiver' },
                      { id: 'reject', label: 'Dispute' },
                      { id: 'escalate', label: 'Escalate' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDecision(opt.id as any)}
                        className={`py-2 px-2 border text-center transition-colors ${
                          decision === opt.id
                            ? 'bg-[#1C1B19] text-[#FCFBF8] border-[#1C1B19] font-bold'
                            : 'bg-[#F4F1EA] text-[#1C1B19] border-[#D8D2C8] hover:border-[#1C1B19]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#716E68] block">
                    Formal Finding Rationale
                  </label>
                  <textarea
                    rows={3}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    required
                    placeholder="Document legal or accounting grounds for this determination..."
                    className="w-full p-2.5 bg-[#F4F1EA] border border-[#D8D2C8] text-[#1C1B19] font-sans text-xs rounded-none focus:outline-none focus:border-[#1C1B19]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !rationale.trim()}
                  className="w-full py-3 bg-[#1C1B19] text-[#FCFBF8] font-mono text-xs uppercase tracking-widest font-semibold hover:bg-[#1C1B19]/90 transition-colors disabled:opacity-40"
                >
                  {isSubmitting ? 'Recording Finding...' : 'Seal Formal Determination'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptBCase;
