import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LedgerTraceA } from '../../components/concepts/LedgerTraceA';

export const ConceptACase: React.FC = () => {
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
        id: 'REV-2026-0903-CINEMA-01',
        action: decision,
        timestamp: new Date().toISOString(),
        signer: 'operator_sarah_chen',
        version: 3,
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#111315] text-[#FCFBF8] font-sans pb-20">
      {/* Concept Switcher Banner */}
      <div className="bg-[#17212B] border-b border-white/10 px-6 py-2 text-xs font-mono text-[#D8D2C8] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3D6B55]" />
          <strong className="text-white">CONCEPT A &bull; CINEMATIC CASE WORKSPACE</strong>
          <span className="text-[#716E68]">| Warm mineral evidence slips emerging from deep ink ground</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/concept/a" className="text-[#3D6B55] hover:underline font-semibold">&larr; Back to Landing</Link>
          <Link to="/concepts" className="text-[#D8D2C8] hover:underline">All Concepts &rarr;</Link>
        </div>
      </div>

      {/* Case Header Dossier */}
      <header className="border-b border-white/10 bg-[#17212B] px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-[#716E68]">
              <span>CASE DOSSIER</span>
              <span>&bull;</span>
              <span className="text-[#EAE4D8]">CAS-2026-0921-MM</span>
              <span>&bull;</span>
              <span className="text-[#B94E3D] font-semibold">Amount Mismatch</span>
            </div>
            <h1 className="font-editorial text-3xl font-medium text-[#FCFBF8]">
              Discrepancy Investigation &bull; Order ORD-99218
            </h1>
            <p className="text-xs font-sans text-[#D8D2C8]">
              Payment captured for ₹10,000.00. Gateway settled ₹9,614.00, resulting in an uncontracted ₹150.00 deficit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs">
              <span className="text-[#716E68] block text-[10px]">EXPOSURE AT RISK</span>
              <span className="text-[#B94E3D] font-bold text-base">₹150.00</span>
            </div>
            <span className="px-2.5 py-1 bg-[#B94E3D]/15 border border-[#B94E3D] text-[#B94E3D] font-mono text-xs font-semibold rounded-xs">
              CRITICAL
            </span>
          </div>
        </div>
      </header>

      {/* Main Asymmetric Workspace: 60% Evidence, 40% Margin */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 4-Source Evidence Slips */}
        <div className="lg:col-span-7 space-y-6">
          {/* Micro Ledger Trace for this case */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#716E68] uppercase block">
              Continuous Trace Alignment
            </span>
            <LedgerTraceA hasDiscrepancy={true} compact={true} />
          </div>

          {/* Redline Discrepancy Strip */}
          <div className="border border-[#B94E3D] bg-[#B94E3D]/10 p-4 rounded-xs text-xs font-mono text-[#FCFBF8] space-y-2">
            <div className="flex justify-between items-center font-bold text-[#B94E3D]">
              <span>[SURGICAL REDLINE &bull; CONTRACT VARIANCE DETECTED]</span>
              <span>Δ -₹150.00</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-[#B94E3D]/20">
              <div>Contract Net: <strong className="text-white">₹9,764.00</strong></div>
              <div>Reported Net: <strong className="text-[#B94E3D]">₹9,614.00</strong></div>
              <div>Rule: <strong className="text-white">SOP-2026-FEE-01</strong></div>
            </div>
          </div>

          {/* 4 Authentic Evidence Slips on Warm Mineral Canvas */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono text-[#716E68] uppercase block">
              Counterparty Trace Slips (4 Traceable Sources)
            </span>

            {/* 1. Payment Slip */}
            <div className="bg-[#F4F1EA] text-[#1C1B19] p-4 rounded-xs border border-[#D8D2C8] shadow-md space-y-2">
              <div className="flex justify-between items-baseline border-b border-[#D8D2C8] pb-1.5 text-xs font-mono">
                <span className="font-semibold text-[#1C1B19]">1. Merchant Payment Capture</span>
                <span className="text-[#3D6B55] font-semibold">₹10,000.00 Gross</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-[#716E68]">
                <div>ID: <span className="text-[#1C1B19]">pay_01JNXK89201</span></div>
                <div>Status: <span className="text-[#3D6B55] font-semibold">Captured</span></div>
                <div>Method: <span className="text-[#1C1B19]">UPI</span></div>
                <div>Time: <span className="text-[#1C1B19]">14:22:04 IST</span></div>
              </div>
            </div>

            {/* 2. Settlement Slip (Redlined) */}
            <div className="bg-[#F4F1EA] text-[#1C1B19] p-4 rounded-xs border-2 border-[#B94E3D] shadow-md space-y-2 relative">
              <div className="flex justify-between items-baseline border-b border-[#D8D2C8] pb-1.5 text-xs font-mono">
                <span className="font-semibold text-[#1C1B19]">2. Gateway Settlement Payout</span>
                <span className="text-[#B94E3D] font-bold">₹9,614.00 Net (Deficit)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-[#716E68]">
                <div>ID: <span className="text-[#1C1B19]">set_01JNXK89201</span></div>
                <div>Fee (2%): <span className="text-[#1C1B19]">₹200.00</span></div>
                <div>GST (18%): <span className="text-[#1C1B19]">₹36.00</span></div>
                <div>Unknown Deduct: <span className="text-[#B94E3D] font-bold">₹150.00</span></div>
              </div>
            </div>

            {/* 3. Refund Slip */}
            <div className="bg-[#F4F1EA] text-[#1C1B19] p-4 rounded-xs border border-[#D8D2C8] shadow-md space-y-2">
              <div className="flex justify-between items-baseline border-b border-[#D8D2C8] pb-1.5 text-xs font-mono">
                <span className="font-semibold text-[#1C1B19]">3. Customer Reversals</span>
                <span className="text-[#716E68]">₹0.00 Nil</span>
              </div>
              <div className="text-[11px] font-sans text-[#716E68]">
                Zero refunds or chargeback claims logged before gateway settlement cut-off.
              </div>
            </div>

            {/* 4. Bank Statement Slip */}
            <div className="bg-[#F4F1EA] text-[#1C1B19] p-4 rounded-xs border border-[#D8D2C8] shadow-md space-y-2">
              <div className="flex justify-between items-baseline border-b border-[#D8D2C8] pb-1.5 text-xs font-mono">
                <span className="font-semibold text-[#1C1B19]">4. HDFC Bank Statement Deposit</span>
                <span className="text-[#1C1B19] font-bold">₹9,614.00 Cleared</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-[#716E68]">
                <div>UTR: <span className="text-[#1C1B19]">202604038194</span></div>
                <div>Account: <span className="text-[#1C1B19]">HDFC-**8812</span></div>
                <div>Status: <span className="text-[#3D6B55] font-semibold">Credited</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Policy Margin Note & Human Sign-off Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Policy Margin Note */}
          <div className="bg-[#17212B] border border-white/10 p-5 rounded-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/10 text-xs font-mono">
              <span className="text-[#EAE4D8] font-semibold">POLICY LIBRARY CITATION</span>
              <span className="text-[#716E68]">READ-ONLY ADVISORY</span>
            </div>
            <p className="text-xs font-sans text-[#D8D2C8] leading-relaxed">
              &ldquo;Standard commercial agreements stipulate MDR fees of 2.00% on gross captured payments plus 18.00% GST on the fee amount. Any unilateral debit above ₹236.00 constitutes an unapproved clawback requiring gateway dispute.&rdquo;
            </p>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-[#716E68]">
              <span>Ref: SOP-2026-FEE-01#L14-22</span>
              <span className="text-[#3D6B55]">Confidence: Verified</span>
            </div>
          </div>

          {/* Institutional Review Sign-Off Form */}
          <div className="bg-[#17212B] border border-white/15 p-6 rounded-xs space-y-5">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase text-[#716E68] block">HUMAN GOVERNANCE</span>
              <h3 className="font-editorial text-xl font-medium text-[#FCFBF8] mt-0.5">
                Record Review Determination
              </h3>
            </div>

            {receipt ? (
              <div className="p-4 bg-[#3D6B55]/15 border border-[#3D6B55] rounded-xs space-y-2 text-xs font-mono">
                <div className="text-[#3D6B55] font-bold flex items-center gap-1.5">
                  <span>✓</span>
                  <span>DECISION RECORDED TO PERMANENT LEDGER</span>
                </div>
                <div className="text-[11px] text-[#D8D2C8] space-y-1 pt-1 border-t border-[#3D6B55]/30">
                  <div>Receipt ID: <span className="text-white">{receipt.id}</span></div>
                  <div>Signer: <span className="text-white">{receipt.signer}</span></div>
                  <div>Action: <span className="text-white uppercase">{receipt.action}</span></div>
                  <div>Timestamp: <span className="text-white">{receipt.timestamp}</span></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#716E68] block">Determination</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'approve', label: 'Approve Waiver' },
                      { id: 'reject', label: 'Dispute Clawback' },
                      { id: 'escalate', label: 'Escalate Gateway' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDecision(opt.id as any)}
                        className={`py-2 px-2 text-center rounded-xs border font-medium transition-colors ${
                          decision === opt.id
                            ? 'bg-[#FCFBF8] text-[#111315] border-white font-semibold'
                            : 'bg-[#111315] text-[#D8D2C8] border-white/10 hover:border-white/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#716E68] block">Audit Rationale (Mandatory)</label>
                  <textarea
                    rows={3}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    required
                    placeholder="Document the commercial reason for this determination..."
                    className="w-full p-2.5 bg-[#111315] border border-white/15 text-white font-sans text-xs rounded-xs focus:outline-none focus:border-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !rationale.trim()}
                  className="w-full py-2.5 bg-[#3D6B55] hover:bg-[#3D6B55]/90 text-white font-medium text-xs rounded-xs transition-colors disabled:opacity-40"
                >
                  {isSubmitting ? 'Recording to Ledger...' : 'Sign and Record Determination'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptACase;
