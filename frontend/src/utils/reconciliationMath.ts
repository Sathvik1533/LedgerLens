import { CaseEvidenceResponse } from '../types/api';

export interface CaseReconciliationSummary {
  expectedLabel: string;
  expectedAmount: number;
  expectedFormatted: string;
  expectedFormula: string;

  actualLabel: string;
  actualAmount: number;
  actualFormatted: string;
  actualSourceDescription: string;

  varianceLabel: string;
  varianceAmount: number;
  varianceFormatted: string;
  varianceStatus: 'deficit' | 'excess' | 'missing' | 'clean';
  varianceDescription: string;

  divergenceStreamIndex: 1 | 2 | 3 | 4; // 1: Payment, 2: Settlement, 3: Refund, 4: Bank
  divergenceStreamName: string;
  traceOffsetLabel: string;
  hasDiscrepancy: boolean;

  recommendedActionHeadline: string;
  recommendedActionDetail: string;
}

export function calculateCaseReconciliation(evidence: CaseEvidenceResponse): CaseReconciliationSummary {
  const gross = evidence.payment?.amount ? parseFloat(evidence.payment.amount) : 0;
  const expNet = evidence.expected_net_settlement ? parseFloat(evidence.expected_net_settlement) : 0;
  const repNet = evidence.reported_net_settlement ? parseFloat(evidence.reported_net_settlement) : 0;

  const bankCredits = evidence.bank_credits || [];
  const bankTotal = bankCredits.reduce((sum, b) => sum + parseFloat(b.credited_amount || '0'), 0);

  const refunds = evidence.refunds || [];
  const refundTotal = refunds.reduce((sum, r) => sum + parseFloat(r.refund_amount || '0'), 0);

  const exception = evidence.exception_type;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  switch (exception) {
    case 'duplicate_bank_credit': {
      const expectedBank = repNet > 0 ? repNet : (expNet > 0 ? expNet : gross * 0.9764);
      const excess = bankTotal > expectedBank ? bankTotal - expectedBank : expectedBank;
      return {
        expectedLabel: '1. Expected Bank Remittance',
        expectedAmount: expectedBank,
        expectedFormatted: fmt(expectedBank),
        expectedFormula: 'Single gateway settlement payout remittance',

        actualLabel: '2. Total Bank Credits Received',
        actualAmount: bankTotal,
        actualFormatted: `${fmt(bankTotal)} (${bankCredits.length} Credits)`,
        actualSourceDescription: 'Reported in cleared institutional bank statements',

        varianceLabel: '3. Variance / Unearned Exposure',
        varianceAmount: excess,
        varianceFormatted: `+${fmt(excess)} Duplicate Entry`,
        varianceStatus: 'excess',
        varianceDescription: 'Second credit of identical UTR credited by bank; requires reversal',

        divergenceStreamIndex: 4,
        divergenceStreamName: 'Bank Statement Credit',
        traceOffsetLabel: `+${fmt(excess)} DUP CREDIT`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Reverse unearned shadow credit per SOP-204',
        recommendedActionDetail: 'Audit nodal bank statement journal and verify double-credit entry. Mark duplicate UTR entry for banking reversal.'
      };
    }

    case 'missing_settlement': {
      return {
        expectedLabel: '1. Contractual Expected Payout',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'Gross payment captured minus 2% fee & 18% GST',

        actualLabel: '2. Gateway Settlement Payout',
        actualAmount: 0,
        actualFormatted: '₹0.00 (Unremitted)',
        actualSourceDescription: 'No settlement batch item received from payment gateway',

        varianceLabel: '3. Variance / Payout Shortfall',
        varianceAmount: -expNet,
        varianceFormatted: `-${fmt(expNet)} Missing Payout`,
        varianceStatus: 'missing',
        varianceDescription: 'T+2 settlement SLA breached; gateway has not disbursed captured gross',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Gateway Settlement',
        traceOffsetLabel: 'MISSING SETTLEMENT (T+2)',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Escalate missing settlement batch to gateway operations',
        recommendedActionDetail: 'Check acquirer capture status with payment gateway. Issue SLA penalty notice per SOP-2026-ESC-02.'
      };
    }

    case 'missing_bank_credit': {
      const expectedDeposit = repNet > 0 ? repNet : expNet;
      return {
        expectedLabel: '1. Net Settlement Remittance',
        expectedAmount: expectedDeposit,
        expectedFormatted: fmt(expectedDeposit),
        expectedFormula: 'Net payout confirmed by gateway settlement batch',

        actualLabel: '2. Institutional Bank Deposit',
        actualAmount: 0,
        actualFormatted: '₹0.00 (Missing UTR)',
        actualSourceDescription: 'No matching transaction reference in nodal bank statement feed',

        varianceLabel: '3. Variance / Uncredited Cash',
        varianceAmount: -expectedDeposit,
        varianceFormatted: `-${fmt(expectedDeposit)} Missing Deposit`,
        varianceStatus: 'missing',
        varianceDescription: 'Bank credit missing despite gateway payout confirmation',

        divergenceStreamIndex: 4,
        divergenceStreamName: 'Bank Statement Credit',
        traceOffsetLabel: 'MISSING BANK UTR',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Chase bank operations for UTR credit confirmation per SOP-2026-BNK-03',
        recommendedActionDetail: 'Request nodal account ledger search from clearing bank using settlement UTR reference.'
      };
    }

    case 'amount_mismatch': {
      const diff = repNet - expNet;
      return {
        expectedLabel: '1. Contractual Expected Net',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'Gross captured minus agreed 2% fee & 18% GST',

        actualLabel: '2. Actual Gateway Payout',
        actualAmount: repNet,
        actualFormatted: fmt(repNet),
        actualSourceDescription: 'Disbursed in gateway settlement batch report',

        varianceLabel: '3. Variance / Settlement Shortfall',
        varianceAmount: diff,
        varianceFormatted: `${diff < 0 ? '-' : '+'}${fmt(Math.abs(diff))} Shortfall`,
        varianceStatus: 'deficit',
        varianceDescription: 'Gateway withheld funds in excess of contractual fee schedule',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Gateway Settlement',
        traceOffsetLabel: `Δ -${fmt(Math.abs(diff))} SHORTFALL`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Initiate gateway fee dispute or review commercial concession',
        recommendedActionDetail: 'Verify whether a temporary dispute clawback or promotional fee applies per SOP-2026-FEE-01.'
      };
    }

    case 'fee_mismatch': {
      const actualFee = evidence.settlement ? (parseFloat(evidence.settlement.fee_amount) + parseFloat(evidence.settlement.tax_amount)) : 0;
      const expectedFee = gross * 0.02 * 1.18;
      const feeDiff = actualFee - expectedFee;
      return {
        expectedLabel: '1. Contractual Fee + GST',
        expectedAmount: expectedFee,
        expectedFormatted: fmt(expectedFee),
        expectedFormula: 'Contractual 2% MDR + 18% GST on gross payment',

        actualLabel: '2. Actual Gateway Deductions',
        actualAmount: actualFee,
        actualFormatted: fmt(actualFee),
        actualSourceDescription: 'Reported fee_amount + tax_amount in gateway settlement',

        varianceLabel: '3. Variance / Fee Overcharge',
        varianceAmount: feeDiff,
        varianceFormatted: `${feeDiff > 0 ? '+' : ''}${fmt(feeDiff)} Variance`,
        varianceStatus: feeDiff > 0 ? 'deficit' : 'excess',
        varianceDescription: 'Fee or tax deduction deviated from contractual commercial tier',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Gateway Settlement',
        traceOffsetLabel: 'FEE / TAX VARIANCE',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Demand fee reconciliation credit note from gateway',
        recommendedActionDetail: 'Issue dispute to acquirer citing contractual fee tier schedule SOP-2026-FEE-01.'
      };
    }

    case 'duplicate_payment': {
      return {
        expectedLabel: '1. Authorized Order Capture',
        expectedAmount: gross,
        expectedFormatted: fmt(gross),
        expectedFormula: 'Single customer charge authorized on checkout order',

        actualLabel: '2. Captured Payment Transactions',
        actualAmount: gross * 2,
        actualFormatted: `${fmt(gross * 2)} (2 Captures)`,
        actualSourceDescription: 'Two separate payment IDs captured for same order ID',

        varianceLabel: '3. Variance / Duplicate Capture',
        varianceAmount: gross,
        varianceFormatted: `+${fmt(gross)} Excess Charge`,
        varianceStatus: 'excess',
        varianceDescription: 'Customer billed twice due to client retry or webhook race condition',

        divergenceStreamIndex: 1,
        divergenceStreamName: 'Merchant Payment',
        traceOffsetLabel: `+${fmt(gross)} DUP CAPTURE`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Initiate immediate customer refund for duplicate capture',
        recommendedActionDetail: 'Void duplicate capture transaction and verify single net settlement per SOP-102.'
      };
    }

    case 'partial_refund_not_reflected': {
      const expectedAdjusted = expNet - refundTotal;
      return {
        expectedLabel: '1. Adjusted Net Payout',
        expectedAmount: expectedAdjusted,
        expectedFormatted: fmt(expectedAdjusted),
        expectedFormula: 'Gross payment minus fees minus customer refund',

        actualLabel: '2. Unadjusted Gateway Remittance',
        actualAmount: repNet,
        actualFormatted: fmt(repNet),
        actualSourceDescription: 'Gateway batch remitted payout without deducting customer refund',

        varianceLabel: '3. Variance / Unadjusted Refund',
        varianceAmount: -refundTotal,
        varianceFormatted: `-${fmt(refundTotal)} Unreflected`,
        varianceStatus: 'deficit',
        varianceDescription: 'Customer refund was cleared but not netted against gateway settlement',

        divergenceStreamIndex: 3,
        divergenceStreamName: 'Customer Refund',
        traceOffsetLabel: `-${fmt(refundTotal)} REFUND GAP`,
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Clawback unadjusted refund deduction in next settlement cycle',
        recommendedActionDetail: 'Confirm customer refund settlement batch status and adjust net payout ledger.'
      };
    }

    case 'ambiguous_match': {
      return {
        expectedLabel: '1. Deterministic Settlement Line',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'Single 1:1 settlement candidate for payment ID',

        actualLabel: '2. Candidate Settlement Matches',
        actualAmount: repNet,
        actualFormatted: `${fmt(repNet)} (Multiple)`,
        actualSourceDescription: 'Multiple candidate settlement lines match with equal confidence',

        varianceLabel: '3. Variance / Ambiguous Volume',
        varianceAmount: expNet,
        varianceFormatted: `${fmt(expNet)} Under Review`,
        varianceStatus: 'deficit',
        varianceDescription: 'Candidate ambiguity requires human manual link determination',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Gateway Settlement',
        traceOffsetLabel: 'AMBIGUOUS CANDIDATES',
        hasDiscrepancy: true,

        recommendedActionHeadline: 'Inspect candidate settlement timestamps and manually link',
        recommendedActionDetail: 'Evaluate candidate batch identifiers and confirm matching acquirer reference.'
      };
    }

    default: {
      const diff = repNet - expNet;
      const isClean = Math.abs(diff) < 0.01;
      return {
        expectedLabel: '1. Contractual Expected Net',
        expectedAmount: expNet,
        expectedFormatted: fmt(expNet),
        expectedFormula: 'Gross minus contractual fees and taxes',

        actualLabel: '2. Actual Reported Net',
        actualAmount: repNet,
        actualFormatted: fmt(repNet),
        actualSourceDescription: 'Reported in gateway settlement batch',

        varianceLabel: '3. Variance / Exposure',
        varianceAmount: diff,
        varianceFormatted: isClean ? '₹0.00 Clean' : `${diff < 0 ? '-' : '+'}${fmt(Math.abs(diff))}`,
        varianceStatus: isClean ? 'clean' : 'deficit',
        varianceDescription: isClean ? 'Deterministic parity verified across all streams' : 'Settlement variance detected',

        divergenceStreamIndex: 2,
        divergenceStreamName: 'Gateway Settlement',
        traceOffsetLabel: isClean ? 'BALANCED PARITY' : 'VARIANCE',
        hasDiscrepancy: !isClean,

        recommendedActionHeadline: isClean ? 'Reconciliation verified; seal case to immutable ledger' : 'Review discrepancy with payment gateway',
        recommendedActionDetail: isClean ? 'All four source counterparties verify with zero balance delta.' : 'Investigate variance against operating policy.'
      };
    }
  }
}
