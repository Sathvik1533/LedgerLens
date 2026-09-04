import React from 'react';

interface LedgerTraceCProps {
  hasDiscrepancy?: boolean;
}

export const LedgerTraceC: React.FC<LedgerTraceCProps> = ({
  hasDiscrepancy = true,
}) => {
  return (
    <div className="w-full bg-[#14191E] border border-[#2D3748] p-6 sm:p-7 rounded-sm font-sans space-y-5 text-xs text-[#E2E8F0] shadow-xl">
      {/* Precision Instrument Header */}
      <div className="flex flex-wrap justify-between items-center pb-3 border-b border-[#2D3748] text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-[#3D6B55]" />
          <span className="text-[#F7FAFC] font-semibold">VERIFICATION BUS // 4-STAGE PARITY GATE</span>
        </div>
        <div className="flex items-center gap-4 text-[#A0AEC0]">
          <span>SAMPLING: 1,200 RPS</span>
          <span>CALIBRATION: ₹0.01 EXACT</span>
          <span className="text-[#F56565] font-bold">INTERRUPT: TRIPPED</span>
        </div>
      </div>

      {/* Four Discrete Logic Gates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Gate 1: Capture Invariant */}
        <div className="bg-[#1A222B] border border-[#2D3748] p-3.5 space-y-2 rounded-xs">
          <div className="flex justify-between items-center font-mono text-[10px] text-[#A0AEC0]">
            <span>GATE 01</span>
            <span className="text-[#48BB78] font-bold">PASS [0.00]</span>
          </div>
          <div className="font-semibold text-sm text-[#F7FAFC] font-mono">₹10,000.00</div>
          <div className="text-[11px] text-[#A0AEC0] font-sans leading-tight">
            Gross captured matches merchant cart total.
          </div>
          <div className="text-[9px] font-mono text-[#718096]">SRC: pay_01JNXK89201</div>
        </div>

        {/* Gate 2: Contract Formula Invariant (Trip Point) */}
        <div className={`border p-3.5 space-y-2 rounded-xs ${
          hasDiscrepancy 
            ? 'bg-[#B94E3D]/15 border-[#B94E3D]' 
            : 'bg-[#1A222B] border-[#2D3748]'
        }`}>
          <div className="flex justify-between items-center font-mono text-[10px]">
            <span className={hasDiscrepancy ? 'text-[#FC8181]' : 'text-[#A0AEC0]'}>GATE 02: FORMULA</span>
            <span className={hasDiscrepancy ? 'text-[#FC8181] font-bold' : 'text-[#48BB78]'}>
              {hasDiscrepancy ? 'FAIL [-150.00]' : 'PASS'}
            </span>
          </div>
          <div className="font-semibold text-sm font-mono text-[#F7FAFC]">
            {hasDiscrepancy ? '₹9,614.00' : '₹9,764.00'}
          </div>
          <div className="text-[11px] text-[#E2E8F0] font-sans leading-tight">
            {hasDiscrepancy ? 'Reported net deviates from contracted 2% fee + 18% GST.' : 'Net deductions verify.'}
          </div>
          <div className="text-[9px] font-mono text-[#E53E3E]">EXP: ₹9,764.00 (Δ -₹150.00)</div>
        </div>

        {/* Gate 3: Refund Adjustment Invariant */}
        <div className="bg-[#1A222B] border border-[#2D3748] p-3.5 space-y-2 rounded-xs">
          <div className="flex justify-between items-center font-mono text-[10px] text-[#A0AEC0]">
            <span>GATE 03</span>
            <span className="text-[#48BB78] font-bold">PASS [0.00]</span>
          </div>
          <div className="font-semibold text-sm text-[#F7FAFC] font-mono">₹0.00</div>
          <div className="text-[11px] text-[#A0AEC0] font-sans leading-tight">
            Customer returns verified against gateway debits.
          </div>
          <div className="text-[9px] font-mono text-[#718096]">SRC: ref_nil_zero</div>
        </div>

        {/* Gate 4: Bank Deposit Parity */}
        <div className="bg-[#1A222B] border border-[#2D3748] p-3.5 space-y-2 rounded-xs">
          <div className="flex justify-between items-center font-mono text-[10px] text-[#A0AEC0]">
            <span>GATE 04</span>
            <span className="text-[#48BB78] font-bold">PASS [0.00]</span>
          </div>
          <div className="font-semibold text-sm text-[#F7FAFC] font-mono">₹9,614.00</div>
          <div className="text-[11px] text-[#A0AEC0] font-sans leading-tight">
            HDFC statement UTR confirms credited payout.
          </div>
          <div className="text-[9px] font-mono text-[#718096]">UTR: 202604038194</div>
        </div>
      </div>

      {/* Coordinate Ruler Scale */}
      <div className="relative pt-2 pb-1 border-t border-[#2D3748] font-mono text-[9px] text-[#718096] flex justify-between">
        <span>000.00</span>
        <span>250.00</span>
        <span>500.00</span>
        <span>750.00</span>
        <span>1000.00 PARITY</span>
      </div>

      {/* Discrepancy Diagnostics Strip */}
      <div className="p-3 bg-[#1A222B] border border-[#2D3748] rounded-xs flex flex-wrap justify-between items-center gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-[#E53E3E] font-bold">&gt;&gt; FAULT DIAGNOSTIC:</span>
          <span className="text-[#E2E8F0]">AMOUNT_MISMATCH on settlement line set_01JNXK89201</span>
        </div>
        <div className="text-[#A0AEC0]">
          ACTION: Route to Human Review Queue (CAS-0921-MM)
        </div>
      </div>
    </div>
  );
};
