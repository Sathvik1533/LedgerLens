import React from 'react';

interface LedgerTraceBProps {
  hasDiscrepancy?: boolean;
}

export const LedgerTraceB: React.FC<LedgerTraceBProps> = ({
  hasDiscrepancy = true,
}) => {
  return (
    <div className="w-full bg-[#FCFBF8] border border-[#D8D2C8] p-6 sm:p-8 rounded-none shadow-sm font-sans space-y-6">
      {/* Folio Header Band */}
      <div className="flex justify-between items-baseline border-b border-[#1C1B19] pb-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#716E68] block">
            FOLIO REGISTRY &bull; VOL. IV / 2026
          </span>
          <h4 className="font-editorial text-xl font-semibold text-[#1C1B19] italic mt-0.5">
            The Quad-Source Ledger Balance
          </h4>
        </div>
        <span className="font-mono text-xs text-[#716E68] border border-[#D8D2C8] px-2 py-0.5 bg-[#F4F1EA]">
          FOLIO #REC-8842
        </span>
      </div>

      {/* Bookkeeper Ledger Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-[#1C1B19] text-[11px] font-mono text-[#716E68]">
              <th className="py-2.5 font-normal">Source Counterparty</th>
              <th className="py-2.5 font-normal">Document Reference</th>
              <th className="py-2.5 font-normal text-right">Debit / Out</th>
              <th className="py-2.5 font-normal text-right">Credit / In</th>
              <th className="py-2.5 font-normal text-right">Audit Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D2C8] font-mono text-[11px]">
            {/* 1. Payment */}
            <tr className="h-10 hover:bg-[#F4F1EA]/60 transition-colors">
              <td className="py-2 font-sans font-medium text-[#1C1B19]">1. Merchant Storefront</td>
              <td className="py-2 text-[#716E68]">pay_01JNXK89201</td>
              <td className="py-2 text-right tabular-nums">—</td>
              <td className="py-2 text-right tabular-nums font-semibold text-[#3D6B55]">₹10,000.00</td>
              <td className="py-2 text-right text-[#3D6B55]">Verified Inward</td>
            </tr>

            {/* 2. Settlement (Redlined if mismatch) */}
            <tr className="h-10 bg-[#B94E3D]/5 hover:bg-[#B94E3D]/10 transition-colors">
              <td className="py-2 font-sans font-medium text-[#1C1B19]">2. Gateway Settlement</td>
              <td className="py-2 text-[#716E68]">set_01JNXK89201</td>
              <td className="py-2 text-right tabular-nums text-[#716E68]">-₹236.00 (Fee)</td>
              <td className="py-2 text-right tabular-nums font-bold relative">
                {hasDiscrepancy ? (
                  <span className="inline-block relative">
                    <span className="text-[#716E68] line-through decoration-[#B94E3D] decoration-2">₹9,764.00</span>
                    <span className="block text-[#B94E3D] font-mono font-bold">₹9,614.00 Reported</span>
                  </span>
                ) : (
                  <span className="text-[#3D6B55]">₹9,764.00</span>
                )}
              </td>
              <td className="py-2 text-right font-semibold text-[#B94E3D]">
                {hasDiscrepancy ? "Rule 03 Broken (Δ -₹150.00)" : "Matched"}
              </td>
            </tr>

            {/* 3. Refund */}
            <tr className="h-10 hover:bg-[#F4F1EA]/60 transition-colors">
              <td className="py-2 font-sans font-medium text-[#1C1B19]">3. Customer Reversals</td>
              <td className="py-2 text-[#716E68]">ref_nil_recorded</td>
              <td className="py-2 text-right tabular-nums text-[#716E68]">₹0.00</td>
              <td className="py-2 text-right tabular-nums">—</td>
              <td className="py-2 text-right text-[#716E68]">Zero Return</td>
            </tr>

            {/* 4. Bank Credit */}
            <tr className="h-10 hover:bg-[#F4F1EA]/60 transition-colors">
              <td className="py-2 font-sans font-medium text-[#1C1B19]">4. HDFC Institutional Bank</td>
              <td className="py-2 text-[#716E68]">UTR-202604038194</td>
              <td className="py-2 text-right tabular-nums">—</td>
              <td className="py-2 text-right tabular-nums font-semibold text-[#1C1B19]">₹9,614.00</td>
              <td className="py-2 text-right text-[#716E68]">Statement Cleared</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#1C1B19] font-mono font-bold">
              <td colSpan={3} className="py-3 font-editorial text-sm font-semibold text-[#1C1B19]">
                Reconciliation Balance Resolution
              </td>
              <td className="py-3 text-right text-sm text-[#B94E3D] tabular-nums">
                -₹150.00
              </td>
              <td className="py-3 text-right text-xs text-[#B94E3D] font-sans">
                Material Discrepancy Redline
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Marginal Annotation Slip */}
      <div className="border-l-2 border-[#B94E3D] pl-4 py-1 text-xs font-sans text-[#716E68] space-y-1 bg-[#F4F1EA]/40">
        <span className="font-mono text-[10px] text-[#B94E3D] uppercase font-bold tracking-wider">
          Auditor Margin Redline &bull; Section 4.2
        </span>
        <p className="leading-relaxed">
          &ldquo;Contractual fee is capped at 2.0% + 18% GST (₹236.00 total). The gateway settled ₹9,614.00, withholding an unexplained ₹150.00 surcharge not authorized by the merchant agreement.&rdquo;
        </p>
      </div>
    </div>
  );
};
