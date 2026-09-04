import React from 'react';
import { Link } from 'react-router-dom';
import { LedgerTraceB } from '../../components/concepts/LedgerTraceB';

export const ConceptBLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C1B19] font-sans selection:bg-[#B94E3D] selection:text-white">
      {/* Concept Switcher Banner */}
      <div className="bg-[#EAE4D8] border-b border-[#D8D2C8] px-6 py-2 text-xs font-mono text-[#716E68] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1C1B19]" />
          <strong className="text-[#1C1B19]">CONCEPT B &bull; EDITORIAL FOLIO</strong>
          <span>| Mineral canvas, publication-grade serif dominance, bookkeeper tallies</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/concept/b/case" className="text-[#1C1B19] hover:underline font-semibold">Inspect Case Folio &rarr;</Link>
          <Link to="/concepts" className="text-[#716E68] hover:underline">All Concepts &rarr;</Link>
        </div>
      </div>

      {/* Editorial Masthead */}
      <header className="max-w-6xl mx-auto px-6 pt-10 pb-6 border-b-2 border-[#1C1B19]">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#D8D2C8]">
          <div className="flex items-baseline gap-4">
            <span className="font-editorial text-4xl font-bold tracking-tight text-[#1C1B19]">
              LedgerLens
            </span>
            <span className="font-mono text-xs text-[#716E68] uppercase tracking-widest">
              Financial Operations Review
            </span>
          </div>
          <div className="text-right font-mono text-[11px] text-[#716E68]">
            <span>FOUNDED ON DETERMINISTIC ARITHMETIC</span>
            <span className="mx-2">&bull;</span>
            <span>VOL. IV / 2026</span>
          </div>
        </div>

        <nav className="flex justify-between items-center pt-3 text-xs font-mono text-[#716E68]">
          <div className="flex gap-6">
            <Link to="/how-it-works" className="hover:text-[#1C1B19]">I. Operational Method</Link>
            <Link to="/evidence" className="hover:text-[#1C1B19]">II. Quad-Source Invariant</Link>
            <Link to="/evaluation" className="hover:text-[#1C1B19]">III. Test Benchmark</Link>
          </div>
          <Link 
            to="/concept/b/case" 
            className="text-[#1C1B19] font-semibold underline underline-offset-4 decoration-[#B94E3D] hover:text-[#B94E3D]"
          >
            Review Active Exception Docket &rarr;
          </Link>
        </nav>
      </header>

      {/* Editorial Main Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* Monograph Opening Statement */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-block border border-[#1C1B19] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#1C1B19]">
            EXPOSITION ON RECONCILIATION INTEGRITY
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl font-normal text-[#1C1B19] leading-[1.12]">
            When financial balances deviate, <span className="italic">every unverified rupee</span> must be brought into strict accountability.
          </h1>
          <p className="font-sans text-base text-[#716E68] leading-relaxed max-w-2xl">
            Modern high-volume commerce creates silent leakage between merchant carts, gateway deduction reports, customer reversals, and institutional banking statements. LedgerLens cross-examines all four streams simultaneously down to the single paisa.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              to="/concept/b/case"
              className="px-6 py-3 bg-[#1C1B19] text-[#FCFBF8] font-sans font-medium text-xs rounded-none hover:bg-[#1C1B19]/90 transition-colors shadow-sm"
            >
              Open Live Exception Folio
            </Link>
            <Link
              to="/evidence"
              className="px-5 py-3 border border-[#1C1B19] text-[#1C1B19] font-sans font-medium text-xs rounded-none hover:bg-[#EAE4D8] transition-colors"
            >
              Examine Evidence Contracts
            </Link>
          </div>
        </div>

        {/* The Signature Folio Ledger Trace */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-xs font-mono text-[#716E68] border-b border-[#D8D2C8] pb-1">
            <span>FIGURE 1.1 &mdash; QUAD-SOURCE CONTINUOUS AUDIT SLIP</span>
            <span className="text-[#B94E3D] font-bold">OXIDE-RED VARIANCE DETECTED</span>
          </div>
          <LedgerTraceB hasDiscrepancy={true} />
        </div>

        {/* Three Editorial Theses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#D8D2C8]">
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#B94E3D] font-semibold">THESIS 01</span>
            <h3 className="font-editorial text-2xl font-medium text-[#1C1B19]">Zero Floating Points</h3>
            <p className="text-xs text-[#716E68] leading-relaxed">
              Every amount is calculated with fixed-point decimal arithmetic in PostgreSQL and Python Decimal. Floating-point round-off error is legally unacceptable in corporate treasuries.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs text-[#B94E3D] font-semibold">THESIS 02</span>
            <h3 className="font-editorial text-2xl font-medium text-[#1C1B19]">Visible Proof of Invariant</h3>
            <p className="text-xs text-[#716E68] leading-relaxed">
              When an invoice or payout disagrees with contractual terms, an oxide-red bookkeeper rule marks the exact cell. No mystery error codes; only explicit mathematical deltas.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs text-[#B94E3D] font-semibold">THESIS 03</span>
            <h3 className="font-editorial text-2xl font-medium text-[#1C1B19]">Permanent Human Review</h3>
            <p className="text-xs text-[#716E68] leading-relaxed">
              Software computes the deterministic balance; human operators judge commercial intent. Every approval or rejection is sealed with a cryptographic receipt in the audit register.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptBLanding;
