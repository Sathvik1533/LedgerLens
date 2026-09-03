import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../components/Tooltip';
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
      <div className="space-y-2 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 border border-accent px-2.5 py-0.5 rounded-full">
            07 &mdash; SYSTEM CONFIGURATION & DATA CONTRACTS
          </span>
          <span className="text-text-secondary">&bull;</span>
          <span className="text-xs text-text-secondary font-mono">FINANCIAL RECONCILIATION ENGINE</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Settings & Contracts
          </h1>
          <div className="text-xs text-text-secondary font-sans flex items-center gap-2">
            <span className="text-resolved font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> All 4 Data Contracts Validated
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contractual Formulas */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="control-panel rounded-xl p-6 space-y-5 shadow-none">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Contractual Fee & Tax Formula
                </h3>
              </div>
              <span className="text-xs font-mono text-text-secondary">SOP-2026-FEE-01</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-medium text-text-primary">
                  Standard Gateway Fee Rate (%)
                </label>
                <input
                  type="text"
                  value={feeRate}
                  onChange={(e) => setFeeRate(e.target.value)}
                  className="w-full bg-canvas border border-border focus:border-accent rounded p-2.5 text-text-primary font-mono text-xs focus-ring"
                />
                <p className="text-[11px] text-text-secondary">Applied to gross payment capture amount</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-medium text-text-primary">
                  GST on Processing Fee (%)
                </label>
                <input
                  type="text"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full bg-canvas border border-border focus:border-accent rounded p-2.5 text-text-primary font-mono text-xs focus-ring"
                />
                <p className="text-[11px] text-text-secondary">Statutory goods & services tax rate</p>
              </div>
            </div>

            <div className="bg-canvas border border-border rounded-lg p-3.5 text-xs font-mono text-text-secondary space-y-1">
              <div className="text-text-primary font-semibold mb-1">Contractual Net Settlement Invariant:</div>
              <div>Net = Gross &minus; [Fee (2%) + GST (18% of Fee)] &minus; Customer Refunds</div>
              <div className="text-accent text-[11px] pt-1">&Delta; Discrepancy flagged if |Reported Net &minus; Expected Net| &gt; ₹0.01</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-xs text-resolved font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Parameters Saved
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-surface-raised hover:bg-ink-700 text-text-primary font-semibold focus-ring text-xs rounded transition shadow-none"
              >
                Update Contract Rates
              </button>
            </div>
          </form>

          {/* RAG Grounding Floor */}
          <div className="control-panel rounded-xl p-6 space-y-4 shadow-none">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Evidence Confidence Settings
                </h3>
              </div>
              
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-text-primary font-medium">Minimum Policy Confidence</label>
                <span className="font-mono text-text-primary bg-canvas px-2 py-0.5 rounded border border-border">
                  Score &ge; {cosineFloor}
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
              <p className="text-[11px] text-text-secondary">
                Policy matches below this confidence level trigger a fallback to manual inspection.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Database & Concurrency Invariants */}
        <div className="space-y-6">
          <div className="control-panel rounded-xl p-6 space-y-4 shadow-none">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Lock className="w-4 h-4 text-resolved" />
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                System Protections
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-canvas border border-border rounded">
                <div className="font-semibold text-text-primary">Review Overwrite Protection</div>
                <div className="text-text-secondary text-[11px] mt-0.5">
                  Prevents one reviewer from overwriting a newer decision if they both open the case at the same time.
                </div>
              </div>

              <div className="p-3 bg-canvas border border-border rounded">
                <div className="font-semibold text-text-primary">Duplicate File Prevention</div>
                <div className="text-text-secondary text-[11px] mt-0.5">
                  Ensures that uploading the same file twice does not create duplicate financial records.
                </div>
              </div>

              <div className="p-3 bg-canvas border border-border rounded">
                <div className="font-semibold text-text-primary">Mathematical Accuracy</div>
                <div className="text-text-secondary text-[11px] mt-0.5">
                  The system uses exact penny-level math for all calculations instead of approximations, preventing invisible rounding errors.
                </div>
              </div>
            </div>
          </div>

          <div className="control-panel rounded-xl p-6 space-y-4 shadow-none">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Server className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Technical Details
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-text-secondary">
                <span>Configured Target DB:</span>
                <span className="text-resolved font-semibold">PostgreSQL 16</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Backend Framework:</span>
                <span className="text-text-primary">FastAPI 0.115+</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Vector Extension:</span>
                <span className="text-text-primary">pgvector 0.7+</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Supported Feeds (Configured):</span>
                <span className="text-resolved">4 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
