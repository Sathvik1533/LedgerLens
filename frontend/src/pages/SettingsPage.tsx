import React, { useState, useEffect } from 'react';

export const SettingsPage: React.FC = () => {
  const [feeRate, setFeeRate] = useState('2.00');
  const [gstRate, setGstRate] = useState('18.00');
  const [tolerance, setTolerance] = useState('0.01');
  const [policyThreshold, setPolicyThreshold] = useState('0.35');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedFee = localStorage.getItem('ll_fee_rate');
    const savedGst = localStorage.getItem('ll_gst_rate');
    const savedTol = localStorage.getItem('ll_tolerance');
    const savedThresh = localStorage.getItem('ll_policy_threshold');
    if (savedFee) setFeeRate(savedFee);
    if (savedGst) setGstRate(savedGst);
    if (savedTol) setTolerance(savedTol);
    if (savedThresh) setPolicyThreshold(savedThresh);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ll_fee_rate', feeRate);
    localStorage.setItem('ll_gst_rate', gstRate);
    localStorage.setItem('ll_tolerance', tolerance);
    localStorage.setItem('ll_policy_threshold', policyThreshold);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-10 font-sans">
      {/* 1. Masthead */}
      <div className="space-y-1 border-b border-rule pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
          <span>OPERATIONAL GOVERNANCE</span>
          <span>&bull;</span>
          <span className="text-ink font-semibold">Contract Parameters</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-ink">
          Contract settings & reconciliation invariants
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans max-w-2xl leading-relaxed">
          Define commercial gateway fee structures, statutory tax rates, and mathematical parity thresholds applied during continuous batch reconciliation.
        </p>
      </div>

      {/* 2. Typographic Formula Centerpiece */}
      <div className="border border-rule bg-surface p-8 rounded-xs space-y-4 shadow-subtle">
        <span className="text-[11px] font-mono uppercase text-ink-secondary block tracking-wider">
          Contractual Settlement Invariant
        </span>
        <div className="font-editorial text-2xl sm:text-3xl text-ink leading-relaxed">
          Net Settlement = Gross Payment &minus; [Fee ({feeRate}%) + GST ({gstRate}% of Fee)] &minus; Customer Refunds
        </div>
        <div className="text-xs font-mono text-ink-secondary border-t border-rule/60 pt-3 flex flex-wrap justify-between items-center gap-2">
          <span>Discrepancy threshold: |Reported Net &minus; Expected Net| &gt; ₹{tolerance}</span>
          <span className="text-ledger-green font-medium">Float-Free Decimal Arithmetic Enforced</span>
        </div>
      </div>

      {/* 3. Contract Rate Parameters Form */}
      <form onSubmit={handleSave} className="border border-rule bg-surface p-8 rounded-xs space-y-6 shadow-subtle">
        <div className="border-b border-rule pb-3 flex justify-between items-center">
          <span className="font-editorial text-xl font-medium text-ink">
            Commercial agreement terms
          </span>
          <span className="text-[11px] font-mono text-ink-secondary">
            Contract Ref: SOP-2026-COMM-01
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Fee Rate */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-ink-secondary block">
              Standard Gateway Fee Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
                required
                className="w-full px-3.5 py-2 border border-rule bg-canvas text-ink font-mono text-xs rounded-xs focus:outline-none focus:border-ink"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-ink-secondary text-xs">%</span>
            </div>
            <p className="text-[11px] text-ink-secondary">
              Applied directly to merchant gross payment captured.
            </p>
          </div>

          {/* GST Rate */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-ink-secondary block">
              GST on Gateway Processing Fee (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                required
                className="w-full px-3.5 py-2 border border-rule bg-canvas text-ink font-mono text-xs rounded-xs focus:outline-none focus:border-ink"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-ink-secondary text-xs">%</span>
            </div>
            <p className="text-[11px] text-ink-secondary">
              Statutory tax levied exclusively on the processing fee amount.
            </p>
          </div>

          {/* Tolerance */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-ink-secondary block">
              Discrepancy Variance Tolerance (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                required
                className="w-full px-3.5 py-2 border border-rule bg-canvas text-ink font-mono text-xs rounded-xs focus:outline-none focus:border-ink"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-ink-secondary text-xs">₹</span>
            </div>
            <p className="text-[11px] text-ink-secondary">
              Any settlement variance exceeding this amount flags an exception case.
            </p>
          </div>

          {/* Policy Confidence Floor */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-ink-secondary block">
              Policy Match Threshold (Grounding Floor)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="0.9"
              value={policyThreshold}
              onChange={(e) => setPolicyThreshold(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-rule bg-canvas text-ink font-mono text-xs rounded-xs focus:outline-none focus:border-ink"
            />
            <p className="text-[11px] text-ink-secondary">
              Minimum semantic similarity required before policy citations are surfaced.
            </p>
          </div>
        </div>

        <div className="border-t border-rule pt-4 flex flex-wrap justify-between items-center gap-4">
          <div className="text-[11px] font-mono text-ink-secondary">
            {isSaved ? (
              <span className="text-ledger-green font-medium">✓ Contract parameters updated and stored in operator session</span>
            ) : (
              <span>Values persist across browser sessions</span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-ink hover:bg-ink/90 text-canvas font-medium text-xs rounded-xs transition-colors"
          >
            Update contract rates
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
