import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Lock,
  Cpu,
  Receipt,
  Server,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [feeRate, setFeeRate] = useState('2.00');
  const [gstRate, setGstRate] = useState('18.00');
  const [cosineFloor, setCosineFloor] = useState('0.35');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans">
      {/* Header Strip */}
      <div className="space-y-2 border-b border-rule-300 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-source-blue bg-source-blue/10 border border-source-blue px-2.5 py-0.5 rounded-full">
            07 &mdash; SYSTEM CONFIGURATION & DATA CONTRACTS
          </span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-xs text-ink-700 font-mono">FINANCIAL RECONCILIATION ENGINE</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
            Settings & Contracts
          </h1>
          <div className="text-xs text-ink-700 font-sans flex items-center gap-2">
            <span className="text-matched-green font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> All 4 Data Contracts Validated
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contractual Formulas */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="control-panel rounded-xl p-6 space-y-5 shadow-none">
            <div className="flex items-center justify-between border-b border-rule-300 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-source-blue" />
                <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
                  Contractual Fee & Tax Formula
                </h3>
              </div>
              <span className="text-xs font-mono text-ink-700">SOP-2026-FEE-01</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-medium text-ink-900">
                  Standard Gateway Fee Rate (%)
                </label>
                <input
                  type="text"
                  value={feeRate}
                  onChange={(e) => setFeeRate(e.target.value)}
                  className="w-full bg-paper-0 border border-rule-300 focus:border-source-blue rounded p-2.5 text-ink-900 font-mono text-xs focus-ring"
                />
                <p className="text-[11px] text-ink-700">Applied to gross payment capture amount</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-medium text-ink-900">
                  GST on Processing Fee (%)
                </label>
                <input
                  type="text"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full bg-paper-0 border border-rule-300 focus:border-source-blue rounded p-2.5 text-ink-900 font-mono text-xs focus-ring"
                />
                <p className="text-[11px] text-ink-700">Statutory goods & services tax rate</p>
              </div>
            </div>

            <div className="bg-paper-0 border border-rule-300 rounded-lg p-3.5 text-xs font-mono text-ink-700 space-y-1">
              <div className="text-ink-900 font-semibold mb-1">Contractual Net Settlement Invariant:</div>
              <div>Net = Gross &minus; [Fee (2%) + GST (18% of Fee)] &minus; Customer Refunds</div>
              <div className="text-source-blue text-[11px] pt-1">&Delta; Discrepancy flagged if |Reported Net &minus; Expected Net| &gt; ₹0.01</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-xs text-matched-green font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Parameters Saved
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-ink-900 hover:bg-ink-700 text-ink-900 font-semibold text-xs rounded transition shadow-sm"
              >
                Update Contract Rates
              </button>
            </div>
          </form>

          {/* RAG Grounding Floor */}
          <div className="control-panel rounded-xl p-6 space-y-4 shadow-none">
            <div className="flex items-center justify-between border-b border-rule-300 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
                  Grounded AI Safety Guardrails
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">pgvector cosine</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-ink-900 font-medium">Policy Grounding Confidence Floor</label>
                <span className="font-mono text-ink-900 bg-paper-0 px-2 py-0.5 rounded border border-rule-300">
                  Cosine &ge; {cosineFloor}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={cosineFloor}
                onChange={(e) => setCosineFloor(e.target.value)}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[11px] text-ink-700">
                Retrieval vectors below this threshold trigger an automatic fallback to manual policy inspection to prevent hallucinated advice.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Database & Concurrency Invariants */}
        <div className="space-y-6">
          <div className="control-panel rounded-xl p-6 space-y-4 shadow-none">
            <div className="flex items-center gap-2 border-b border-rule-300 pb-3">
              <Lock className="w-4 h-4 text-matched-green" />
              <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
                Concurrency Controls
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-paper-0 border border-rule-300 rounded">
                <div className="font-semibold text-ink-900">Optimistic CAS Versioning</div>
                <div className="text-ink-700 text-[11px] mt-0.5">
                  Enforces strict lock versions (`lock_version=vN`). Concurrent modifications reject stale reviews with HTTP 409.
                </div>
              </div>

              <div className="p-3 bg-paper-0 border border-rule-300 rounded">
                <div className="font-semibold text-ink-900">Batch Idempotency Keying</div>
                <div className="text-ink-700 text-[11px] mt-0.5">
                  `X-Idempotency-Key` prevents duplicate ingestion runs across payments and gateway settlement feeds.
                </div>
              </div>

              <div className="p-3 bg-paper-0 border border-rule-300 rounded">
                <div className="font-semibold text-ink-900">Monetary Scale Precision</div>
                <div className="text-ink-700 text-[11px] mt-0.5">
                  PostgreSQL `NUMERIC(15,2)` and Python `Decimal` penny-exact math. Zero IEEE-754 floating-point drift.
                </div>
              </div>
            </div>
          </div>

          <div className="control-panel rounded-xl p-6 space-y-4 shadow-none">
            <div className="flex items-center gap-2 border-b border-rule-300 pb-3">
              <Server className="w-4 h-4 text-source-blue" />
              <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
                System Architecture & Capabilities (Static Info)
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-ink-700">
                <span>Configured Target DB:</span>
                <span className="text-matched-green font-semibold">PostgreSQL 16</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Backend Framework:</span>
                <span className="text-ink-900">FastAPI 0.115+</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Vector Extension:</span>
                <span className="text-ink-900">pgvector 0.7+</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Supported Feeds (Configured):</span>
                <span className="text-matched-green">4 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
