import React from 'react';
import { Link } from 'react-router-dom';
import { LedgerTraceA } from '../../components/concepts/LedgerTraceA';

export const ConceptALanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#111315] text-[#FCFBF8] font-sans selection:bg-[#3D6B55] selection:text-white relative overflow-hidden">
      {/* Top Concept Banner */}
      <div className="bg-[#17212B] border-b border-white/10 px-6 py-2 text-xs font-mono text-[#D8D2C8] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3D6B55]" />
          <strong className="text-white">CONCEPT A &bull; CINEMATIC LEDGER</strong>
          <span className="text-[#716E68]">| Deep ink atmosphere, controlled physical light, illuminated trace ribbon</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/concept/a/case" className="text-[#3D6B55] hover:underline font-semibold">Inspect Case Workspace &rarr;</Link>
          <Link to="/concepts" className="text-[#D8D2C8] hover:underline">All Concepts &rarr;</Link>
        </div>
      </div>

      {/* Atmospheric Radial Lighting Effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(234, 228, 216, 0.35), transparent 70%)'
        }}
      />

      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-white/10 flex justify-between items-center relative z-10">
        <div className="flex items-baseline gap-3">
          <span className="font-editorial text-2xl font-semibold tracking-tight text-[#FCFBF8]">LedgerLens</span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#716E68]">Continuous Reconciliation</span>
        </div>
        <nav className="flex items-center gap-6 text-xs text-[#D8D2C8]">
          <Link to="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link to="/evidence" className="hover:text-white transition-colors">Evidence model</Link>
          <Link to="/concept/a/case" className="px-4 py-2 bg-[#FCFBF8] text-[#111315] font-medium rounded-xs hover:bg-[#EAE4D8] transition-colors">
            Open live case dossier
          </Link>
        </nav>
      </header>

      {/* Main Hero */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16 relative z-10">
        {/* Asymmetric Headline & Editorial Premise */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs border border-white/15 bg-white/5 text-[11px] font-mono text-[#EAE4D8]">
              <span>AUTHENTIC FOUR-SOURCE RECONCILIATION</span>
              <span>&bull;</span>
              <span className="text-[#3D6B55] font-semibold">1,200 RPS Engine</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#FCFBF8] leading-[1.08]">
              When the numbers disagree, <br className="hidden sm:block" />
              <span className="italic text-[#EAE4D8]">LedgerLens</span> shows you where.
            </h1>
          </div>

          <div className="lg:col-span-4 space-y-4 pb-2">
            <p className="text-sm sm:text-base text-[#D8D2C8] leading-relaxed">
              Every captured payment, settlement payout, customer reversal, and bank deposit enters one unified trace. Discrepancies are redlined in real time; human decisions are permanently recorded.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link 
                to="/concept/a/case" 
                className="px-6 py-3 bg-[#FCFBF8] text-[#111315] font-medium text-xs rounded-xs hover:bg-[#EAE4D8] transition-colors shadow-lg"
              >
                Review live exception case &rarr;
              </Link>
              <Link 
                to="/how-it-works" 
                className="px-4 py-3 border border-white/20 text-[#D8D2C8] hover:text-white text-xs rounded-xs transition-colors"
              >
                Methodology
              </Link>
            </div>
          </div>
        </div>

        {/* Signature Ledger Trace Visual */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-xs font-mono text-[#716E68]">
            <span>FIG 1.0 &mdash; THE LEDGER TRACE (FOUR STREAMS TO ONE PARITY VERDICT)</span>
            <span className="text-[#B94E3D]">UNRESOLVED VARIANCE DETECTED</span>
          </div>
          <LedgerTraceA hasDiscrepancy={true} />
        </div>

        {/* Real Discrepancy Evidence Composition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 bg-[#17212B] border border-white/10 rounded-xs space-y-3">
            <span className="text-[10px] font-mono uppercase text-[#716E68] block">01 / CAPTURE FIDELITY</span>
            <h3 className="font-editorial text-xl font-medium text-[#FCFBF8]">Four-Source Evidence Slips</h3>
            <p className="text-xs text-[#D8D2C8] leading-relaxed">
              We never guess reconciliation against internal databases alone. Every transaction cross-examines merchant orders, gateway payout batches, refund logs, and bank statement UTRs.
            </p>
          </div>

          <div className="p-6 bg-[#17212B] border border-white/10 rounded-xs space-y-3">
            <span className="text-[10px] font-mono uppercase text-[#716E68] block">02 / SURGICAL ISOLATION</span>
            <h3 className="font-editorial text-xl font-medium text-[#FCFBF8]">Oxide-Red Discrepancy Lines</h3>
            <p className="text-xs text-[#D8D2C8] leading-relaxed">
              When gateway fees exceed the contractual 2.0% threshold or unadjusted refunds occur, a redline rule marks the exact delta without noise or false alarms.
            </p>
          </div>

          <div className="p-6 bg-[#17212B] border border-white/10 rounded-xs space-y-3">
            <span className="text-[10px] font-mono uppercase text-[#716E68] block">03 / PERMANENCE</span>
            <h3 className="font-editorial text-xl font-medium text-[#FCFBF8]">Accountable Ledger Sign-Off</h3>
            <p className="text-xs text-[#D8D2C8] leading-relaxed">
              Software computes deterministic parity; human operators sign off on waivers or clawbacks. Every approval writes an immutable, dated receipt to the audit ledger.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptALanding;
