import React from 'react';
import { CaseEvidenceResponse } from '../../types/api';
import { calculateCaseReconciliation } from '../../utils/reconciliationMath';

interface LedgerTraceAProps {
  evidence?: CaseEvidenceResponse;
  hasDiscrepancy?: boolean;
  compact?: boolean;
}

export const LedgerTraceA: React.FC<LedgerTraceAProps> = ({
  evidence,
  hasDiscrepancy: explicitDiscrepancy,
  compact = false,
}) => {
  // If real case evidence is provided, compute mathematical reconciliation
  const summary = evidence ? calculateCaseReconciliation(evidence) : null;
  const isDiscrepant = summary ? summary.hasDiscrepancy : (explicitDiscrepancy ?? true);

  // Extract stream numbers
  const gross = evidence?.payment?.amount 
    ? parseFloat(evidence.payment.amount) 
    : 10000.00;
  const net = evidence?.settlement?.net_settlement_amount 
    ? parseFloat(evidence.settlement.net_settlement_amount) 
    : 9614.00;
  const refundTotal = evidence?.refunds 
    ? evidence.refunds.reduce((sum, r) => sum + parseFloat(r.refund_amount || '0'), 0) 
    : 0.00;
  const bankCredits = evidence?.bank_credits || [];
  const bankTotal = bankCredits.length > 0 
    ? bankCredits.reduce((sum, b) => sum + parseFloat(b.credited_amount || '0'), 0) 
    : 9614.00;

  const caseTag = evidence?.case_id 
    ? `CAS-${evidence.case_id.slice(0, 8).toUpperCase()}` 
    : (isDiscrepant ? 'SPECIMEN-0921-MM' : 'SPECIMEN-PARITY');
  
  const statusLabel = isDiscrepant ? 'EXCEPTION' : 'RECONCILED';
  const offsetBadgeText = summary?.traceOffsetLabel || 'Δ -₹150.00 OFFSET';
  const divergenceStream = summary?.divergenceStreamIndex || (isDiscrepant ? 2 : 0);

  return (
    <div className={`relative w-full rounded-sm overflow-hidden border border-white/10 bg-[#111315] shadow-2xl ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      {/* Cinematic ambient radial light */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(234, 228, 216, 0.15), transparent 80%)'
        }}
      />
      
      {/* Atmospheric coordinate marks */}
      <div className="flex justify-between items-center pb-4 border-b border-white/10 text-[10px] font-mono tracking-widest text-[#716E68]">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isDiscrepant ? 'bg-critical animate-pulse' : 'bg-ledger-green'}`} />
          <span className="text-[#EAE4D8]">
            {evidence ? 'LEDGER TRACE • LIVE RECONCILIATION' : 'LEDGER TRACE • ILLUSTRATIVE SPECIMEN'}
          </span>
        </div>
        <span className="text-[10px] text-[#A87931]">
          {summary ? summary.divergenceStreamName.toUpperCase() : 'PARITY MATRIX 4-STREAM (SPECIMEN)'}
        </span>
      </div>

      {/* SVG Canvas for Trace Streams */}
      <div className="relative my-6">
        <svg 
          viewBox="0 0 800 280" 
          className="w-full h-auto drop-shadow-md"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle grid lines */}
          <line x1="160" y1="20" x2="160" y2="260" stroke="#17212B" strokeDasharray="3 3" />
          <line x1="480" y1="20" x2="480" y2="260" stroke="#17212B" strokeDasharray="3 3" />
          <line x1="680" y1="20" x2="680" y2="260" stroke="#17212B" strokeDasharray="3 3" />

          {/* Stream 1: Merchant Payment (Top stream -> emerald green) */}
          <path 
            d="M 20 50 C 220 50, 320 100, 480 100 L 680 100" 
            stroke="#3D6B55" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          <circle cx="20" cy="50" r="4" fill="#3D6B55" />
          <circle cx="480" cy="100" r="4" fill="#3D6B55" />

          {/* Stream 2: Gateway Settlement */}
          {divergenceStream === 2 ? (
            evidence?.exception_type === 'missing_settlement' ? (
              <>
                {/* Terminating missing line */}
                <path 
                  d="M 20 110 C 140 110, 180 110, 240 110" 
                  stroke="#B94E3D" 
                  strokeWidth="2.5" 
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="110" r="4" fill="#B94E3D" />
                <line x1="236" y1="102" x2="244" y2="118" stroke="#B94E3D" strokeWidth="2.5" />
                <line x1="244" y1="102" x2="236" y2="118" stroke="#B94E3D" strokeWidth="2.5" />
                <rect x="260" y="98" width="165" height="24" rx="2" fill="#B94E3D" fillOpacity="0.15" stroke="#B94E3D" strokeWidth="1" />
                <text x="268" y="114" fill="#B94E3D" fontFamily="monospace" fontSize="10" fontWeight="bold">
                  {offsetBadgeText}
                </text>
              </>
            ) : (
              <>
                {/* Diverging offset path */}
                <path 
                  d="M 20 110 C 220 110, 340 100, 480 145 L 680 145" 
                  stroke="#B94E3D" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <circle cx="20" cy="110" r="4" fill="#EAE4D8" />
                <circle cx="480" cy="145" r="4" fill="#B94E3D" />

                {/* Redline gap bridge */}
                <line x1="480" y1="100" x2="480" y2="145" stroke="#B94E3D" strokeWidth="1.5" strokeDasharray="2 2" />
                <rect x="495" y="112" width="160" height="22" rx="2" fill="#B94E3D" fillOpacity="0.15" stroke="#B94E3D" strokeWidth="1" />
                <text x="502" y="127" fill="#B94E3D" fontFamily="monospace" fontSize="10" fontWeight="bold">
                  {offsetBadgeText}
                </text>
              </>
            )
          ) : (
            <>
              <path 
                d="M 20 110 C 220 110, 320 100, 480 100 L 680 100" 
                stroke="#3D6B55" 
                strokeWidth="2.5" 
              />
              <circle cx="20" cy="110" r="4" fill="#3D6B55" />
            </>
          )}

          {/* Stream 3: Customer Refund */}
          <path 
            d="M 20 170 C 220 170, 320 100, 480 100 L 680 100" 
            stroke="#A87931" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <circle cx="20" cy="170" r="4" fill="#A87931" />

          {/* Stream 4: Bank Statement Credit */}
          {divergenceStream === 4 ? (
            evidence?.exception_type === 'missing_bank_credit' ? (
              <>
                {/* Terminating missing bank line */}
                <path 
                  d="M 20 230 C 140 230, 180 230, 240 230" 
                  stroke="#B94E3D" 
                  strokeWidth="2.5" 
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="230" r="4" fill="#B94E3D" />
                <line x1="236" y1="222" x2="244" y2="238" stroke="#B94E3D" strokeWidth="2.5" />
                <line x1="244" y1="222" x2="236" y2="238" stroke="#B94E3D" strokeWidth="2.5" />
                <rect x="260" y="218" width="160" height="24" rx="2" fill="#B94E3D" fillOpacity="0.15" stroke="#B94E3D" strokeWidth="1" />
                <text x="268" y="234" fill="#B94E3D" fontFamily="monospace" fontSize="10" fontWeight="bold">
                  {offsetBadgeText}
                </text>
              </>
            ) : (
              <>
                {/* Normal first remittance path */}
                <path 
                  d="M 20 230 C 220 230, 320 100, 480 100 L 680 100" 
                  stroke="#385D82" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                {/* Duplicate credit branching path */}
                <path 
                  d="M 20 230 C 220 230, 340 180, 480 180 L 680 180" 
                  stroke="#B94E3D" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <circle cx="20" cy="230" r="4" fill="#B94E3D" />
                <circle cx="480" cy="180" r="4" fill="#B94E3D" />
                
                {/* Redline branch marker */}
                <line x1="480" y1="100" x2="480" y2="180" stroke="#B94E3D" strokeWidth="1.5" strokeDasharray="2 2" />
                <rect x="495" y="145" width="180" height="24" rx="2" fill="#B94E3D" fillOpacity="0.15" stroke="#B94E3D" strokeWidth="1" />
                <text x="502" y="161" fill="#B94E3D" fontFamily="monospace" fontSize="10" fontWeight="bold">
                  {offsetBadgeText}
                </text>
              </>
            )
          ) : (
            <>
              <path 
                d="M 20 230 C 220 230, 320 100, 480 100 L 680 100" 
                stroke="#385D82" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <circle cx="20" cy="230" r="4" fill="#385D82" />
            </>
          )}

          {/* Alignment Column Labels */}
          <text x="25" y="42" fill="#EAE4D8" fontFamily="sans-serif" fontSize="11" fontWeight="500">1. Merchant Payment</text>
          <text x="25" y="102" fill="#EAE4D8" fontFamily="sans-serif" fontSize="11" fontWeight="500">2. Gateway Settlement</text>
          <text x="25" y="162" fill="#EAE4D8" fontFamily="sans-serif" fontSize="11" fontWeight="500">3. Customer Refund</text>
          <text x="25" y="222" fill="#EAE4D8" fontFamily="sans-serif" fontSize="11" fontWeight="500">4. Bank Statement Credit</text>

          {/* Terminal Parity Mark */}
          <line x1="680" y1="40" x2="680" y2="200" stroke="#D8D2C8" strokeWidth="1" />
          <rect x="690" y="75" width="95" height="75" rx="3" fill="#17212B" stroke={isDiscrepant ? "#B94E3D" : "#3D6B55"} strokeWidth="1.5" />
          <text x="700" y="95" fill="#716E68" fontFamily="monospace" fontSize="9">VERDICT</text>
          <text x="700" y="115" fill={isDiscrepant ? "#B94E3D" : "#3D6B55"} fontFamily="sans-serif" fontSize="12" fontWeight="bold">
            {statusLabel}
          </text>
          <text x="700" y="135" fill="#EAE4D8" fontFamily="monospace" fontSize="9">
            {caseTag}
          </text>
        </svg>
      </div>

      {/* Narrative Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs font-mono">
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#716E68] block">STREAM 01: CAPTURE</span>
          <span className="text-[#3D6B55] font-semibold">
            ₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Gross
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#716E68] block">STREAM 02: REPORTED</span>
          <span className={`${divergenceStream === 2 ? 'text-[#B94E3D]' : 'text-[#EAE4D8]'} font-semibold`}>
            {evidence && !evidence.settlement ? 'Missing Payout' : `₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Net`}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#716E68] block">STREAM 03: REFUND</span>
          <span className="text-[#A87931] font-semibold">
            {refundTotal > 0 ? `₹${refundTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Refund` : '₹0.00 Nil'}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#716E68] block">STREAM 04: DEPOSIT</span>
          <span className={`${divergenceStream === 4 ? 'text-[#B94E3D]' : 'text-[#385D82]'} font-semibold`}>
            {bankCredits.length > 1 
              ? `₹${bankTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${bankCredits.length} Credits)`
              : bankCredits.length === 1 
              ? `₹${bankTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} HDFC`
              : (evidence && bankCredits.length === 0 ? 'Missing UTR' : `₹${bankTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} HDFC`)}
          </span>
        </div>
      </div>
    </div>
  );
};
