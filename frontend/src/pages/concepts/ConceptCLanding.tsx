import React from 'react';
import { Link } from 'react-router-dom';
import { LedgerTraceC } from '../../components/concepts/LedgerTraceC';

export const ConceptCLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F1317] text-[#E2E8F0] font-sans selection:bg-[#3D6B55] selection:text-white">
      {/* Concept Switcher Banner */}
      <div className="bg-[#1A222B] border-b border-[#2D3748] px-6 py-2 text-xs font-mono text-[#A0AEC0] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-[#48BB78]" />
          <strong className="text-[#F7FAFC]">CONCEPT C &bull; INSTRUMENT PANEL</strong>
          <span>| Restrained financial operations environment, archival rules, telemetry bus</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/concept/c/case" className="text-[#48BB78] hover:underline font-semibold">Inspect Case Terminal &rarr;</Link>
          <Link to="/concepts" className="text-[#A0AEC0] hover:underline">All Concepts &rarr;</Link>
        </div>
      </div>

      {/* Control Console Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-4 border-b border-[#2D3748] flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-editorial text-2xl font-bold text-[#F7FAFC] tracking-tight">LedgerLens</span>
          <span className="px-2 py-0.5 bg-[#1A222B] border border-[#2D3748] text-[10px] text-[#A0AEC0]">
            SYS-VER // 2.4.0-PROD
          </span>
        </div>
        <nav className="flex items-center gap-6 text-[#A0AEC0]">
          <Link to="/how-it-works" className="hover:text-white">Telemetry</Link>
          <Link to="/evidence" className="hover:text-white">Bus Specs</Link>
          <Link to="/evaluation" className="hover:text-white">Benchmarks</Link>
          <Link 
            to="/concept/c/case" 
            className="px-3 py-1.5 bg-[#2B6CB0] text-white font-medium rounded-xs hover:bg-[#2B6CB0]/90 transition-colors"
          >
            Launch Case Cockpit &rarr;
          </Link>
        </nav>
      </header>

      {/* Technical Hero */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Terminal Header Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#A0AEC0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#48BB78]" />
              <span>CONTINUOUS FOUR-WAY RECONCILIATION ENGINE</span>
              <span>&bull;</span>
              <span className="text-[#E2E8F0]">DECIMAL FLOAT-FREE PIPELINE</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-medium text-[#F7FAFC] leading-tight">
              Deterministic balance verification <br className="hidden sm:block" />
              for high-frequency financial ledgers.
            </h1>
          </div>

          <div className="lg:col-span-4 space-y-3 font-mono text-xs">
            <p className="text-[#A0AEC0] font-sans leading-relaxed">
              Real-time multi-counterparty matching across merchant payments, gateway settlements, customer returns, and institutional bank credits. Sub-penny tolerance enforcement.
            </p>
            <div className="flex gap-3 pt-1">
              <Link 
                to="/concept/c/case" 
                className="px-4 py-2.5 bg-[#E2E8F0] text-[#0F1317] font-semibold rounded-xs hover:bg-white transition-colors"
              >
                Inspect Case Terminal
              </Link>
              <Link 
                to="/evaluation" 
                className="px-4 py-2.5 border border-[#2D3748] text-[#A0AEC0] hover:text-white rounded-xs transition-colors"
              >
                Benchmark Suite
              </Link>
            </div>
          </div>
        </div>

        {/* Verification Bus Signature Component */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-[#718096]">
            <span>TELEMETRY BUS 01 // ACTIVE DATA STREAMING MONITOR</span>
            <span className="text-[#E53E3E] font-bold">FAULT INTERRUPT DETECTED AT GATE 02</span>
          </div>
          <LedgerTraceC hasDiscrepancy={true} />
        </div>

        {/* Operational Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-[#14191E] border border-[#2D3748] p-5 space-y-2 rounded-xs">
            <div className="text-[10px] text-[#718096] uppercase">METRIC 01: ENGINE THROUGHPUT</div>
            <div className="text-2xl font-bold text-[#F7FAFC] font-mono">1,200 RPS</div>
            <p className="text-[#A0AEC0] font-sans text-xs">
              Direct PostgreSQL hash joins and vectorized indexing without external pipeline latency.
            </p>
          </div>

          <div className="bg-[#14191E] border border-[#2D3748] p-5 space-y-2 rounded-xs">
            <div className="text-[10px] text-[#718096] uppercase">METRIC 02: FALSE APPROVALS</div>
            <div className="text-2xl font-bold text-[#48BB78] font-mono">0.000%</div>
            <p className="text-[#A0AEC0] font-sans text-xs">
              Mathematical invariants prevent automated approvals when candidate variance exceeds ₹0.01.
            </p>
          </div>

          <div className="bg-[#14191E] border border-[#2D3748] p-5 space-y-2 rounded-xs">
            <div className="text-[10px] text-[#718096] uppercase">METRIC 03: AUDIT LATENCY</div>
            <div className="text-2xl font-bold text-[#F7FAFC] font-mono">&lt; 12 MS</div>
            <p className="text-[#A0AEC0] font-sans text-xs">
              Optimistic concurrency and ACID append-only ledger entries written synchronously on sign-off.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConceptCLanding;
