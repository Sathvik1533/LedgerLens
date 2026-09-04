import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LedgerTraceC } from '../../components/concepts/LedgerTraceC';

export const ConceptCCase: React.FC = () => {
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
        id: 'AUTH-RECEIPT-20260903-PANEL',
        action: decision,
        timestamp: new Date().toISOString(),
        signer: 'sys_admin_778',
        hash: 'e9b28a4f108d3c5b89a01',
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0F1317] text-[#E2E8F0] font-sans pb-20">
      {/* Concept Switcher Banner */}
      <div className="bg-[#1A222B] border-b border-[#2D3748] px-6 py-2 text-xs font-mono text-[#A0AEC0] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-[#48BB78]" />
          <strong className="text-[#F7FAFC]">CONCEPT C &bull; INSTRUMENT PANEL WORKSPACE</strong>
          <span>| High-density operations console, synchronized telemetry, fault bus</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/concept/c" className="text-[#48BB78] hover:underline font-semibold">&larr; Back to Landing</Link>
          <Link to="/concepts" className="text-[#A0AEC0] hover:underline">All Concepts &rarr;</Link>
        </div>
      </div>

      {/* Cockpit Case Status Strip */}
      <header className="border-b border-[#2D3748] bg-[#14191E] px-6 py-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[#F56565] font-bold border border-[#F56565] px-2 py-0.5 rounded-xs bg-[#F56565]/10">
              TRIPPED // AMOUNT_MISMATCH
            </span>
            <span className="text-[#F7FAFC] font-semibold text-sm">CAS-2026-0921-MM</span>
            <span className="text-[#718096]">|</span>
            <span className="text-[#A0AEC0]">ORD-99218</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <div>GROSS: <span className="text-[#F7FAFC]">₹10,000.00</span></div>
            <div>EXP NET: <span className="text-[#F7FAFC]">₹9,764.00</span></div>
            <div>ACT NET: <span className="text-[#F56565] font-bold">₹9,614.00</span></div>
            <div>DELTA: <span className="text-[#F56565] font-bold">-₹150.00</span></div>
          </div>
        </div>
      </header>

      {/* Main High-Density Console: 3 Columns */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Verification Bus & Evidence Logs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#718096] uppercase block">
              LIVE PARITY GATE INSPECTION
            </span>
            <LedgerTraceC hasDiscrepancy={true} />
          </div>

          {/* Detailed Telemetry Slips for 4 Counterparties */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-[10px] text-[#718096] uppercase block">
              INGESTED TELEMETRY LOGS (4 DATA PATHS)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Path 1: Payment */}
              <div className="p-3.5 bg-[#14191E] border border-[#2D3748] rounded-xs space-y-1.5">
                <div className="flex justify-between text-[#F7FAFC] font-semibold">
                  <span>PATH 01 // PAYMENT</span>
                  <span className="text-[#48BB78]">₹10,000.00</span>
                </div>
                <div className="text-[11px] text-[#A0AEC0] space-y-0.5">
                  <div>Ref: pay_01JNXK89201</div>
                  <div>Captured: 2026-04-03T14:22:04+05:30</div>
                  <div>Method: UPI (Verified)</div>
                </div>
              </div>

              {/* Path 2: Settlement */}
              <div className="p-3.5 bg-[#14191E] border border-[#F56565] rounded-xs space-y-1.5 bg-[#F56565]/5">
                <div className="flex justify-between text-[#F56565] font-semibold">
                  <span>PATH 02 // SETTLEMENT (FAULT)</span>
                  <span>₹9,614.00</span>
                </div>
                <div className="text-[11px] text-[#A0AEC0] space-y-0.5">
                  <div>Ref: set_01JNXK89201</div>
                  <div>Reported Fee: ₹200.00 &bull; GST: ₹36.00</div>
                  <div className="text-[#F56565] font-bold">Unmapped Debit: -₹150.00</div>
                </div>
              </div>

              {/* Path 3: Refund */}
              <div className="p-3.5 bg-[#14191E] border border-[#2D3748] rounded-xs space-y-1.5">
                <div className="flex justify-between text-[#F7FAFC] font-semibold">
                  <span>PATH 03 // REFUND</span>
                  <span className="text-[#718096]">₹0.00</span>
                </div>
                <div className="text-[11px] text-[#A0AEC0] space-y-0.5">
                  <div>Ref: ref_nil</div>
                  <div>State: No customer returns logged</div>
                </div>
              </div>

              {/* Path 4: Bank Statement */}
              <div className="p-3.5 bg-[#14191E] border border-[#2D3748] rounded-xs space-y-1.5">
                <div className="flex justify-between text-[#F7FAFC] font-semibold">
                  <span>PATH 04 // BANK STATEMENT</span>
                  <span className="text-[#F7FAFC]">₹9,614.00</span>
                </div>
                <div className="text-[11px] text-[#A0AEC0] space-y-0.5">
                  <div>UTR: 202604038194</div>
                  <div>Institution: HDFC Bank Current</div>
                  <div>State: Cleared in statement feed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Grounded Rules & Operator Terminal */}
        <div className="lg:col-span-4 space-y-6">
          {/* Policy Module */}
          <div className="bg-[#14191E] border border-[#2D3748] p-4 rounded-xs space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#718096]">
              <span>GROUNDING KNOWLEDGE BASE</span>
              <span className="text-[#48BB78]">CONFIDENCE 0.94</span>
            </div>
            <div className="text-[#F7FAFC] font-semibold text-[11px]">
              SOP-2026-FEE-01 // CLAUSE 2.1
            </div>
            <p className="text-[11px] font-sans text-[#A0AEC0] leading-relaxed">
              Gateway contractual rate is strictly 2.00% + 18.00% GST. Settlement deficit of ₹150.00 constitutes an unapproved holdback.
            </p>
          </div>

          {/* Human Review Terminal */}
          <div className="bg-[#14191E] border border-[#2D3748] p-5 rounded-xs space-y-4 font-mono text-xs">
            <div className="border-b border-[#2D3748] pb-2.5">
              <span className="text-[10px] text-[#718096] uppercase block">OPERATOR ACTION TERMINAL</span>
              <span className="text-sm font-semibold text-[#F7FAFC] block mt-0.5">Commit Case Determination</span>
            </div>

            {receipt ? (
              <div className="p-3.5 bg-[#48BB78]/10 border border-[#48BB78] rounded-xs space-y-1.5 text-[11px]">
                <div className="text-[#48BB78] font-bold">✓ DETERMINATION COMMITTED</div>
                <div className="text-[#A0AEC0] space-y-0.5 pt-1 border-t border-[#48BB78]/30">
                  <div>Receipt: {receipt.id}</div>
                  <div>Signer: {receipt.signer}</div>
                  <div>Action: {receipt.action.toUpperCase()}</div>
                  <div>Hash: {receipt.hash}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#718096] block uppercase">Command Option</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'approve', label: 'Waiver' },
                      { id: 'reject', label: 'Dispute' },
                      { id: 'escalate', label: 'Escalate' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDecision(opt.id as any)}
                        className={`py-1.5 px-2 text-center rounded-xs border text-[11px] transition-colors ${
                          decision === opt.id
                            ? 'bg-[#2B6CB0] text-white border-[#2B6CB0] font-bold'
                            : 'bg-[#1A222B] text-[#A0AEC0] border-[#2D3748] hover:border-[#4A5568]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#718096] block uppercase">Operator Audit Log</label>
                  <textarea
                    rows={3}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    required
                    placeholder="Input rationale for audit log trace..."
                    className="w-full p-2 bg-[#0F1317] border border-[#2D3748] text-[#F7FAFC] font-mono text-[11px] rounded-xs focus:outline-none focus:border-[#48BB78]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !rationale.trim()}
                  className="w-full py-2 bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 text-white font-mono text-xs font-semibold rounded-xs transition-colors disabled:opacity-40"
                >
                  {isSubmitting ? 'Writing to Ledger...' : 'Commit Signed Decision'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptCCase;
